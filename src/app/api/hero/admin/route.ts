import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const p = prisma as any;
    const [settings, slides, featureCards] = await Promise.all([
      p.heroSettings.findFirst(),
      p.heroSlide.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { buttons: { orderBy: { sortOrder: 'asc' } } },
      }),
      p.heroFeatureCard.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
    return NextResponse.json({ settings, slides, featureCards });
  } catch (error) {
    console.error('[hero admin GET]', error);
    return NextResponse.json({ error: 'Failed to fetch hero admin data' }, { status: 500 });
  }
}
