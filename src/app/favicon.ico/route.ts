import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: { faviconUrl: true },
    });
    if (settings?.faviconUrl) {
      return NextResponse.redirect(settings.faviconUrl);
    }
  } catch {}
  return new NextResponse(null, { status: 404 });
}
