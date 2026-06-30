import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rateLimit";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "usta@bursalioto.com" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials, req) {
        // IP tabanlı Rate Limiting (Brute Force koruması)
        const ip = req.headers?.['x-forwarded-for'] || '127.0.0.1';
        const { allowed } = await rateLimit(ip, 5, 60); // 1 dakikada max 5 hatalı/doğru giriş denemesi
        
        if (!allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Lütfen email ve şifre giriniz.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenants: true } // V5.0 Multi-tenant support
        });

        if (!user || !user.passwordHash) {
          throw new Error("Kullanıcı bulunamadı veya şifre hatalı.");
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Şifre hatalı.");
        }

        // Başarılı giriş, JWT içine gömülecek veriler
        return {
          id: user.id,
          email: user.email,
          role: user.globalRole,
          // İlk tenant ID'sini alıyoruz (İleride çoklu tenant seçici eklenebilir)
          tenantId: user.tenants.length > 0 ? user.tenants[0].tenantId : null
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Gün
  },
  secret: process.env.NEXTAUTH_SECRET || "BursaliOtoEnterpriseSecretKey2026",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
