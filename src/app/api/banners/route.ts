import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    const p = prisma as any;
    const banners = await p.notificationBanner.findMany({
      orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
      include: { translations: true },
    });
    return NextResponse.json(banners ?? []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { translations, ...data } = body;

    const p = prisma as any;
    const banner = await p.notificationBanner.create({
      data: {
        ...data,
        translations: translations?.length
          ? { create: translations.map(({ locale, text }: any) => ({ locale, text })) }
          : undefined,
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json(banner);
  } catch (e) {
    console.error('[banners POST]', e);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
