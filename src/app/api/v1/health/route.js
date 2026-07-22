import { NextResponse } from 'next/server';

export async function GET(request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';
  return NextResponse.redirect(`${baseUrl}/api/health/ready`, 301);
}
