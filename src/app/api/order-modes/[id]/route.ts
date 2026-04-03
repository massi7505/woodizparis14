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
    // Strip read-only fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt, updatedAt, ...updateData } = body;

    const button = await prisma.linktreeButton.update({
      where: { id: parseInt(id) },
      data: { ...updateData, updatedAt: new Date() },
    });
    revalidatePath('/', 'layout');
    revalidatePath('/menu');
    revalidateTag('menu');
    return NextResponse.json(button);
  } catch (error) {
    console.error('[order-modes PATCH]', error);
    return NextResponse.json({ error: 'Failed to update order mode' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.linktreeButton.delete({ where: { id: parseInt(id) } });
    revalidatePath('/', 'layout');
    revalidatePath('/menu');
    revalidateTag('menu');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[order-modes DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete order mode' }, { status: 500 });
  }
}
