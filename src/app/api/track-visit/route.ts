import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

function anonymizeIp(ip: string): string {
  // IPv4: keep first 3 octets → 192.168.1.0
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  // IPv6: keep first 4 groups
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':0:0:0:0';
  }
  return ip;
}

function hashVisitor(ip: string, ua: string): string {
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    // Check tracking is enabled
    const settings = await prisma.siteSettings.findFirst({ select: { trackingEnabled: true } });
    if (settings && settings.trackingEnabled === false) {
      return NextResponse.json({ skipped: true });
    }

    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';
    const ua = req.headers.get('user-agent') || '';
    const body = await req.json().catch(() => ({}));
    const page = (body.page as string) || 'menu';

    const ip = anonymizeIp(rawIp);
    const visitorId = hashVisitor(rawIp, ua);

    // Anti-spam: skip if same visitor in the last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await prisma.visit.findFirst({
      where: { visitorId, createdAt: { gte: thirtyMinsAgo } },
      select: { id: true },
    });

    if (recent) {
      return NextResponse.json({ skipped: true });
    }

    await prisma.visit.create({
      data: { visitorId, ip, userAgent: ua.slice(0, 300), page },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Non-critical — silently skip tracking if DB is unavailable
    return NextResponse.json({ skipped: true });
  }
}
