import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Enterprise Validation Middleware for Next.js App Router
 * Safely parses and validates req.body, req.nextUrl.searchParams, headers, and params.
 * 
 * @param {Object} schemas - { body?, query?, params?, headers?, cookies? }
 * @param {Function} handler - The actual route controller
 * @returns {Function} - Wrapped Next.js API route handler
 */
export function validate(schemas, handler) {
  return async (req, context) => {
    try {
      const validatedData = {};

      // 1. Validate Body (if expected and request has a body)
      if (schemas.body && req.method !== 'GET' && req.method !== 'HEAD') {
        let body;
        try {
          body = await req.json();
        } catch (e) {
          return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
        }
        validatedData.body = schemas.body.parse(body);
      }

      // 2. Validate Query Parameters
      if (schemas.query) {
        const { searchParams } = req.nextUrl;
        const queryObj = Object.fromEntries(searchParams.entries());
        validatedData.query = schemas.query.parse(queryObj);
      }

      // 3. Validate Dynamic Params (e.g., [id])
      if (schemas.params && context?.params) {
        // Await context.params in Next.js 15
        const params = await context.params;
        validatedData.params = schemas.params.parse(params);
      }

      // 4. Validate Headers
      if (schemas.headers) {
        const headersObj = Object.fromEntries(req.headers.entries());
        validatedData.headers = schemas.headers.parse(headersObj);
      }

      // Inject validated data into the request object for the controller to use safely
      req.valid = validatedData;

      // Proceed to the actual handler
      return await handler(req, context);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }

      // Unhandled validation error
      console.error('Validation Middleware Error:', error);
      return NextResponse.json({ error: 'Internal Server Error during validation' }, { status: 500 });
    }
  };
}
