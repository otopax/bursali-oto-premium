import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rateLimit";
import { redis } from "@/lib/cache";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'bursali-oto-production-fallback-secret-key-2026-auth';
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "usta@bursalioto.com" },
        password: { label: "Şifre", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" }
      },
      async authorize(credentials, req) {
        const ip = req?.headers?.get?.('x-forwarded-for') || '127.0.0.1';
        const { allowed } = await rateLimit(ip, 5, 60); 
        
        if (!allowed) throw new Error("Too many login attempts. Please try again later.");
        
        // Turnstile Doğrulama
        if (process.env.NODE_ENV === 'production' || credentials?.turnstileToken) {
          if (!credentials?.turnstileToken) throw new Error("Güvenlik doğrulaması başarısız.");
          const turnstileData = new FormData();
          turnstileData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
          turnstileData.append('response', credentials.turnstileToken);
          
          try {
            const tRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: turnstileData
            });
            const tOutcome = await tRes.json();
            if (!tOutcome.success) {
              throw new Error("Bot tespiti: Güvenlik doğrulaması geçilemedi.");
            }
          } catch (e) {
             throw new Error("Güvenlik servisine ulaşılamadı.");
          }
        }
        
        if (!credentials?.email || !credentials?.password) throw new Error("Lütfen email ve şifre giriniz.");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenants: true }
        });

        if (!user || !user.passwordHash) throw new Error("Kullanıcı bulunamadı veya şifre hatalı.");
        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Şifre hatalı.");

        return {
          id: user.id,
          email: user.email,
          role: user.globalRole,
          tenantId: user.tenants.length > 0 ? user.tenants[0].tenantId : null,
          tokenVersion: user.tokenVersion || 0
        };
      }
    }),
    CredentialsProvider({
      id: "otp-login",
      name: "SMS ile Giriş",
      credentials: {
        phone: { label: "Telefon Numarası", type: "text", placeholder: "05XXXXXXXXX" },
        otp: { label: "SMS Kodu", type: "text", placeholder: "6 Haneli Kod" }
      },
      async authorize(credentials, req) {
        const ip = req?.headers?.get?.('x-forwarded-for') || '127.0.0.1';
        const { allowed } = await rateLimit(`otp_${ip}`, 5, 60); 
        if (!allowed) throw new Error("Çok fazla deneme yaptınız.");

        if (!credentials?.phone || !credentials?.otp) throw new Error("Lütfen telefon ve SMS kodunu giriniz.");

        const cleanPhone = credentials.phone.replace(/\s+/g, '');
        const otpKey = `otp:code:${cleanPhone}`;

        // OTP verification via Redis session
        let isValidOtp = false;
        try {
          const storedOtp = await redis.get(otpKey);
          if (storedOtp && storedOtp.toString() === credentials.otp.toString()) {
            isValidOtp = true;
            // One-time use: consume OTP immediately
            await redis.del(otpKey);
          }
        } catch (e) {
          console.error('[OTP Auth Error]', e.message);
        }

        if (!isValidOtp) {
          throw new Error("Geçersiz veya süresi dolmuş SMS kodu.");
        }

        // Strict customer lookup - NO auto-provisioning via findFirst tenant
        const customer = await prisma.customer.findFirst({
          where: { phone: cleanPhone }
        });

        if (!customer) {
          throw new Error("Kayıtlı müşteri bulunamadı. Lütfen önce servisle iletişime geçiniz.");
        }

        return {
          id: customer.id,
          email: customer.email || `${customer.phone}@bursalioto.customer`,
          name: customer.firstName,
          role: "CUSTOMER",
          tenantId: customer.tenantId,
          tokenVersion: 0
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tokenVersion = user.tokenVersion ?? 0;
        token.permissionVersion = 0;
        token.sessionId = crypto.randomUUID();
      }
      if (!token.jti) {
        token.jti = crypto.randomUUID();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tokenVersion = token.tokenVersion;
        session.user.permissionVersion = token.permissionVersion;
        session.user.sessionId = token.sessionId;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  secret: authSecret || "build-phase-dummy-secret-key-1234567890",
});

