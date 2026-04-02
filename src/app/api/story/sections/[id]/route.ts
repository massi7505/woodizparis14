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
    const { id: _id, createdAt: _ca, updatedAt: _ua, page: _p, ...data } = body;
    const p = prisma as any;
    const section = await p.storySection.update({ where: { id: parseInt(id) }, data: { ...data, updatedAt: new Date() } });
    revalidatePath('/', 'layout');
    return NextResponse.json(section);
  } catch (e) {
    console.error('[story section PATCH]', e);
    return NextResponse.json({ error: 'Failed to update story section' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const p = prisma as any;
    await p.storySection.delete({ where: { id: parseInt(id) } });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[story section DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete story section' }, { status: 500 });
  }
}
