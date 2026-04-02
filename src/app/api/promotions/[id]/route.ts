import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
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

    const promo = await prisma.promotion.update({
      where: { id: parseInt(id) },
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
        updatedAt: new Date(),
        ...(translations != null ? {
          translations: { deleteMany: {}, create: cleanTranslations },
        } : {}),
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(promo);
  } catch (e) {
    console.error('[PATCH /api/promotions/[id]]', e);
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await prisma.promotion.delete({ where: { id: parseInt(id) } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
