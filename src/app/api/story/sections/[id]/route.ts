import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { id: _id, createdAt: _ca, updatedAt: _ua, page: _p, ...data } = body;
  const p = prisma as any;
  const section = await p.storySection.update({ where: { id: parseInt(id) }, data: { ...data, updatedAt: new Date() } });
  revalidatePath('/', 'layout');
  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const p = prisma as any;
  await p.storySection.delete({ where: { id: parseInt(id) } });
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
