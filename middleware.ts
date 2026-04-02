import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a strict CSP using nonce + strict-dynamic.
 * - script-src: nonce required (no unsafe-inline, no unsafe-eval, no wildcards)
 *   → passes Lighthouse "Effective CSP against XSS"
 * - style-src: unsafe-inline allowed (inline styles used throughout the app)
 * - img/media/connect: https: allowed (Vercel Blob, external images)
 * - object-src 'none' + base-uri 'self': required by Lighthouse
 */
function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    // nonce + strict-dynamic: inline scripts require the nonce; trusted scripts
    // may load further scripts without an explicit allowlist.
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src https://www.google.com https://maps.google.com https://www.youtube.com",
    "base-uri 'self'",
    "form-action 'self' https:",
    "upgrade-insecure-requests",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CSP nonce generation ──────────────────────────────────────────────────
  // Next.js 15 reads 'x-nonce' from request headers and injects the nonce
  // attribute into every <script> tag it generates (hydration, RSC payload…)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCSP(nonce);

  // Attach CSP to a response (redirect or next)
  function applyCSP(response: NextResponse): NextResponse {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

  // ── Admin route protection ────────────────────────────────────────────────
  // /admin/login → redirect to /admin (login merged into /admin page)
  if (pathname.startsWith('/admin/login')) {
    return applyCSP(NextResponse.redirect(new URL('/admin', request.url)));
  }

  // /admin sub-routes (/admin/:path+) require a valid JWT cookie
  if (/^\/admin\/.+/.test(pathname)) {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return applyCSP(NextResponse.redirect(new URL('/admin', request.url)));
    }
  }

  // ── Pass nonce to Next.js + apply CSP on all other routes ────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return applyCSP(response);
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals and static asset files
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)).*)',
  ],
};
