import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rateLimit";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "usta@bursalioto.com" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials, req) {
        const ip = req.headers?.['x-forwarded-for'] || '127.0.0.1';
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
          tenantId: user.tenants.length > 0 ? user.tenants[0].tenantId : null
        };
      }
    }),
    CredentialsProvider({
      id: "customer-login",
      name: "Müşteri Portalı",
      credentials: {
        phone: { label: "Telefon Numarası", type: "text", placeholder: "05XXXXXXXXX" },
        plate: { label: "Plaka", type: "text", placeholder: "34 ABC 123" }
      },
      async authorize(credentials, req) {
        const ip = req.headers?.['x-forwarded-for'] || '127.0.0.1';
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
          email: customer.email || `${customer.phone}@bursalioto.customer`, // Dummy email since NextAuth prefers one
          name: customer.firstName,
          role: "CUSTOMER",
          tenantId: customer.tenantId
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
  secret: process.env.NEXTAUTH_SECRET || 'BursaliOtoSecretKey2026',
};

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('Warning: NEXTAUTH_SECRET env variable is missing. Using fallback for build purposes.');
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
