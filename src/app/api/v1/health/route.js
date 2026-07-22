import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = request.nextUrl.clone();
  url.pathname = '/api/health/ready';
  return NextResponse.redirect(url, 301);
}
