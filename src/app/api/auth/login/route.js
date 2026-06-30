import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken, comparePassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunludur' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !comparePassword(password, user.password)) {
      // Log failed attempt without userId
      await logAudit({
        action: 'FAILED_LOGIN',
        entity: 'User',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent'),
        newData: { emailAttempt: email }
      });

      return NextResponse.json({ error: 'Hatalı e-posta veya şifre' }, { status: 401 });
    }

    // Generate JWT
    const token = await createToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    // Log successful login
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent')
    });

    // Set cookie
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Giriş sırasında hata oluştu' }, { status: 500 });
  }
}
