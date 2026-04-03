import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');
    const visible = searchParams.get('visible') !== 'false';
    const target = searchParams.get('target'); // 'linktree' | 'menu' | null

    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: {
        ...(visible ? { isVisible: true } : {}),
        ...(target === 'linktree' ? { showOnLinktree: true } : {}),
        ...(target === 'menu' ? { showOnMenu: true } : {}),
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: locale ? { where: { locale } } : true,
      },
    });
    return NextResponse.json(promos);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { translations } = body;

    const cleanTranslations = (translations || []).map(({ id: _id, promotionId: _pid, ...t }: any) => ({
      locale: t.locale,
      title: t.title || '',
      description: t.description || null,
      note: t.note || null,
      cta: t.cta || null,
      ctaUrl: t.ctaUrl || null,
      imageUrl: t.imageUrl || null,
    }));

    const promo = await prisma.promotion.create({
      data: {
        type: body.type ?? '',
        bgType: body.bgType ?? 'color',
        bgColor: body.bgColor ?? '#F59E0B',
        bgGradient: body.bgGradient ?? null,
        bgImageUrl: body.bgImageUrl ?? null,
        textColor: body.textColor ?? '#FFFFFF',
        badgeText: body.badgeText ?? null,
        badgeColor: body.badgeColor ?? '#EF4444',
        promoPrice: body.promoPrice ? parseFloat(body.promoPrice) : null,
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        titleSize: body.titleSize ?? null,
        descSize: body.descSize ?? null,
        priceSize: body.priceSize ?? null,
        badgeSize: body.badgeSize ?? null,
        ctaSize: body.ctaSize ?? null,
        photoOnly: body.photoOnly ?? false,
        availFrom: body.availFrom || null,
        availTo: body.availTo || null,
        isVisible: body.isVisible ?? true,
        showOnLinktree: body.showOnLinktree ?? true,
        showOnMenu: body.showOnMenu ?? true,
        sortOrder: body.sortOrder ?? 0,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        translations: { create: cleanTranslations },
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json(promo, { status: 201 });
  } catch (e) {
    console.error('[POST /api/promotions]', e);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
