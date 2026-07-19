import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Chat Service API v1 Placeholder", status: "Not Implemented" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Chat Service API v1 Placeholder", status: "Not Implemented" }, { status: 501 });
}
