import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache';

export async function GET(request) {
  // Only allow internal calls with strict env key
  const apiKey = request.headers.get('x-internal-api-key');
  const validKey = process.env.INTERNAL_API_KEY;
  
  if (!validKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized: Internal API Key Invalid' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cache in Redis for 5 minutes (300 seconds)
    const redisKey = `auth:tokenVer:${userId}`;
    await redis.setex(redisKey, 300, user.tokenVersion);

    return NextResponse.json({ version: user.tokenVersion });
  } catch (error) {
    console.error('Token version sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

