import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { translations, id: _id, createdAt, updatedAt, ...data } = body;

    const p = prisma as any;
    const banner = await p.notificationBanner.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedAt: new Date(),
        ...(translations
          ? { translations: { deleteMany: {}, create: translations.map(({ locale, text }: any) => ({ locale, text })) } }
          : {}),
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(banner);
  } catch (e) {
    console.error('[banner PUT]', e);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const p = prisma as any;
    await p.notificationBanner.delete({ where: { id: parseInt(id) } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[banner DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
