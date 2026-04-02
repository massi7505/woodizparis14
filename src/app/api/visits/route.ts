import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // "7" | "30" | "all"

    const now = new Date();
    const startDate = period === 'all' ? undefined : new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    const whereClause = startDate ? { createdAt: { gte: startDate } } : {};

    const [totalVisits, allVisits, todayVisits, weekVisits, recentVisits] = await Promise.all([
      // Total in period
      prisma.visit.count({ where: whereClause }),
      // All visits in period (for chart + unique count)
      prisma.visit.findMany({
        where: whereClause,
        select: { visitorId: true, createdAt: true, page: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Today
      prisma.visit.count({
        where: { createdAt: { gte: new Date(now.toISOString().split('T')[0]) } },
      }),
      // This week
      prisma.visit.count({
        where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      // Last 20 visits for table
      prisma.visit.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, ip: true, userAgent: true, page: true, createdAt: true },
      }),
    ]);

    // Unique visitors in period
    const uniqueVisitors = new Set(allVisits.map(v => v.visitorId)).size;

    // Build daily chart data for the period
    const days = period === 'all' ? 30 : parseInt(period);
    const chartDays: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = allVisits.filter(v => v.createdAt.toISOString().split('T')[0] === dateStr).length;
      chartDays.push({ date: dateStr, count });
    }

    // Page breakdown
    const pageBreakdown: Record<string, number> = {};
    for (const v of allVisits) {
      pageBreakdown[v.page] = (pageBreakdown[v.page] || 0) + 1;
    }

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      todayVisits,
      weekVisits,
      chartDays,
      pageBreakdown,
      recentVisits: recentVisits.map(v => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[visits GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.visit.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[visits DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
