import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rateLimit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "usta@bursalioto.com" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials, req) {
        const ip = req?.headers?.get?.('x-forwarded-for') || '127.0.0.1';
        const { allowed } = await rateLimit(ip, 5, 60); 
        
        if (!allowed) throw new Error("Too many login attempts. Please try again later.");
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
          tokenVersion: user.tokenVersion
        };
      }
    }),
    CredentialsProvider({
      id: "customer-login",
      name: "Müşteri Portalı (Plaka ile)",
      credentials: {
        phone: { label: "Telefon Numarası", type: "text", placeholder: "05XXXXXXXXX" },
        plate: { label: "Plaka", type: "text", placeholder: "34 ABC 123" }
      },
      async authorize(credentials, req) {
        const ip = req?.headers?.get?.('x-forwarded-for') || '127.0.0.1';
        const { allowed } = await rateLimit(`cust_${ip}`, 5, 60); 
        if (!allowed) throw new Error("Çok fazla deneme yaptınız. Lütfen bekleyin.");

        if (!credentials?.phone || !credentials?.plate) {
          throw new Error("Lütfen telefon ve plaka giriniz.");
        }

        const customer = await prisma.customer.findFirst({
          where: { phone: credentials.phone },
          include: { vehicles: true }
        });

        if (!customer) throw new Error("Kayıtlı müşteri bulunamadı.");
        
        const vehicle = customer.vehicles.find(v => v.plate.replace(/\s/g, '').toLowerCase() === credentials.plate.replace(/\s/g, '').toLowerCase());
        
        if (!vehicle) throw new Error("Bu telefon numarasına ait belirtilen plaka bulunamadı.");

        return {
          id: customer.id,
          email: customer.email || `${customer.phone}@bursalioto.customer`,
          name: customer.firstName,
          role: "CUSTOMER",
          tenantId: customer.tenantId,
          tokenVersion: 0 // Müşteriler için varsayılan
        };
      }
    }),
    CredentialsProvider({
      id: "otp-login",
      name: "SMS ile Giriş (Phase 4)",
      credentials: {
        phone: { label: "Telefon Numarası", type: "text", placeholder: "05XXXXXXXXX" },
        otp: { label: "SMS Kodu", type: "text", placeholder: "123456" }
      },
      async authorize(credentials, req) {
        const ip = req?.headers?.get?.('x-forwarded-for') || '127.0.0.1';
        const { allowed } = await rateLimit(`otp_${ip}`, 5, 60); 
        if (!allowed) throw new Error("Çok fazla deneme yaptınız.");

        if (!credentials?.phone || !credentials?.otp) throw new Error("Lütfen bilgileri giriniz.");

        if (credentials.otp !== "123456") {
          throw new Error("Hatalı SMS kodu.");
        }

        let customer = await prisma.customer.findFirst({
          where: { phone: credentials.phone }
        });

        if (!customer) {
          const defaultTenant = await prisma.tenant.findFirst();
          if (!defaultTenant) throw new Error("Sistem hatası: Tenant bulunamadı.");
          
          customer = await prisma.customer.create({
            data: {
              phone: credentials.phone,
              firstName: "Misafir",
              tenantId: defaultTenant.id
            }
          });
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
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tokenVersion = user.tokenVersion;
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
        session.user.id = token.sub || token.id; // V5 token.sub
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
    maxAge: 30 * 24 * 60 * 60, // 30 Gün
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026',
});
