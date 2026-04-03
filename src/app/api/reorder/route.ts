import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, items } = await req.json();
    // items: [{id, sortOrder}]

    const updates = items.map(({ id, sortOrder }: { id: number; sortOrder: number }) => {
      switch (type) {
        case 'button':
          return prisma.linktreeButton.update({ where: { id }, data: { sortOrder } });
        case 'category':
          return prisma.menuCategory.update({ where: { id }, data: { sortOrder } });
        case 'product':
          return prisma.menuItem.update({ where: { id }, data: { sortOrder } });
        case 'promotion':
          return prisma.promotion.update({ where: { id }, data: { sortOrder } });
        case 'faq':
          return prisma.fAQ.update({ where: { id }, data: { sortOrder } });
        case 'review':
          return prisma.review.update({ where: { id }, data: { sortOrder } });
        case 'heroSlide':
          return prisma.heroSlide.update({ where: { id }, data: { sortOrder } });
        case 'heroCard':
          return prisma.heroFeatureCard.update({ where: { id }, data: { sortOrder } });
        case 'storySection': {
          const p = prisma as any;
          return p.storySection.update({ where: { id }, data: { sortOrder } });
        }
        default:
          return null;
      }
    }).filter(Boolean);

    await prisma.$transaction(updates);
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
