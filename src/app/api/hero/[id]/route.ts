import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const numId = parseInt(id);
    const body = await req.json();
    const { type, id: _id, createdAt: _ca, updatedAt: _ua, sortOrder: _so, buttons: _btns, settings: _s, ...updateData } = body;

    const p = prisma as any;
    if (type === 'slide') {
      const slide = await p.heroSlide.update({
        where: { id: numId },
        data: { ...updateData, updatedAt: new Date() },
        include: { buttons: { orderBy: { sortOrder: 'asc' } } },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(slide);
    }

    if (type === 'button') {
      const button = await p.heroSlideButton.update({
        where: { id: numId },
        data: { ...updateData },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(button);
    }

    if (type === 'card') {
      const card = await p.heroFeatureCard.update({
        where: { id: numId },
        data: { ...updateData, updatedAt: new Date() },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(card);
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('[hero PATCH]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const numId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const p2 = prisma as any;
    if (type === 'slide') {
      await p2.heroSlide.delete({ where: { id: numId } });
    } else if (type === 'button') {
      await p2.heroSlideButton.delete({ where: { id: numId } });
    } else if (type === 'card') {
      await p2.heroFeatureCard.delete({ where: { id: numId } });
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[hero DELETE]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
