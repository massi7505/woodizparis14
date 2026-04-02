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

    const days = period === 'all' ? 30 : parseInt(period);

    // Build date boundaries for the chart (one DB query per day is too many;
    // instead we fetch aggregated data with groupBy via raw query approach —
    // but Prisma groupBy on DateTime truncated to day requires raw SQL on PG).
    // We fetch only the minimal fields needed and limit to 10k rows max to
    // avoid OOM while still supporting realistic traffic volumes.
    const [totalVisits, sampledVisits, todayVisits, weekVisits, recentVisits] = await Promise.all([
      // Total in period
      prisma.visit.count({ where: whereClause }),
      // Sampled visits for chart + unique count — capped to prevent OOM
      prisma.visit.findMany({
        where: whereClause,
        select: { visitorId: true, createdAt: true, page: true },
        orderBy: { createdAt: 'asc' },
        take: 10_000,
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

    // Unique visitors in period (based on sample)
    const uniqueVisitors = new Set(sampledVisits.map(v => v.visitorId)).size;

    // Build daily chart data — O(n) with pre-bucketed map
    const buckets = new Map<string, number>();
    for (const v of sampledVisits) {
      const dateStr = v.createdAt.toISOString().split('T')[0];
      buckets.set(dateStr, (buckets.get(dateStr) ?? 0) + 1);
    }
    const chartDays: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      chartDays.push({ date: dateStr, count: buckets.get(dateStr) ?? 0 });
    }

    // Page breakdown
    const pageBreakdown: Record<string, number> = {};
    for (const v of sampledVisits) {
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
    return NextResponse.json({ error: 'Failed to fetch visit stats' }, { status: 500 });
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
    return NextResponse.json({ error: 'Failed to delete visits' }, { status: 500 });
  }
}
