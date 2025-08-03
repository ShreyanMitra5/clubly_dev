import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Clerk's default middleware once
const clerk = clerkMiddleware();

export default function middleware(req: NextRequest) {
  // If the browser already holds a Clerk dev-browser JWT, just continue –
  // skipping another handshake prevents the cookie from ballooning.
  if (req.cookies.get('__clerk_db_jwt') || req.cookies.get('__session')) {
    return NextResponse.next();
  }

  // Otherwise let Clerk handle the (initial) handshake / auth
  return clerk(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 