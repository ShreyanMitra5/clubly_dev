import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/(.*)'  // Allow all API routes for now
]);

export default clerkMiddleware(async (auth, req) => {
  // If the browser already holds a Clerk dev-browser JWT, just continue –
  // skipping another handshake prevents the cookie from ballooning.
  if (req.cookies.get('__clerk_db_jwt') || req.cookies.get('__session')) {
    return NextResponse.next();
  }

  // For development, allow all routes to pass through
  // This prevents authentication blocking during development
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};