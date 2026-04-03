import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { translations, ...data } = body;
    const faq = await prisma.fAQ.update({
      where: { id: parseInt(id) },
      data: {
        ...data, updatedAt: new Date(),
        ...(translations ? { translations: { deleteMany: {}, create: translations } } : {}),
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json(faq);
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await prisma.fAQ.delete({ where: { id: parseInt(id) } });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
