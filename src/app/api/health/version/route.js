import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Railway provides RAILWAY_GIT_COMMIT_SHA automatically
  const commitSha = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
  const deployId = process.env.RAILWAY_DEPLOYMENT_ID || 'unknown';
  
  return NextResponse.json(
    { 
      status: 'healthy',
      version: {
        commit: commitSha,
        deployment: deployId,
        environment: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
