import { NextResponse } from 'next/server';

export function middleware(request) {
  // 🚀 V4.0 OBSERVABILITY: Enterprise Request Tracing (Correlation ID)
  // crypto.randomUUID() is natively available in the Edge runtime.
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach Trace ID to the response for E2E debugging from Client to Server
  response.headers.set('x-correlation-id', correlationId);

  return response;
}

export const config = {
  // Apply this tracing middleware to all API routes
  matcher: '/api/:path*',
};
