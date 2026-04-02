import { NextRequest, NextResponse } from 'next/server';
import { decodeProxySrc, isAllowedOrigin } from '@/lib/image-proxy';

export const runtime = 'edge';

// 30 days in seconds
const CACHE_MAX_AGE = 2_592_000;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('src');
  if (!token) {
    return new NextResponse('Missing src', { status: 400 });
  }

  const originalUrl = decodeProxySrc(token);
  if (!originalUrl || !isAllowedOrigin(originalUrl)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const upstream = await fetch(originalUrl, {
      headers: { 'User-Agent': 'woodiz-proxy/1.0' },
    });

    if (!upstream.ok) {
      return NextResponse.redirect(originalUrl, { status: 302 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=86400`,
        'X-Robots-Tag': 'noindex',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    // Network error — redirect to the real URL as fallback
    return NextResponse.redirect(originalUrl, { status: 302 });
  }
}
