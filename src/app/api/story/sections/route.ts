import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    const p = prisma as any;
    const sections = await p.storySection.findMany({ where: { pageId: 1 }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(sections);
  } catch (e) {
    console.error('[story sections GET]', e);
    return NextResponse.json({ error: 'Failed to fetch story sections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...data } = body;
    const p = prisma as any;
    const section = await p.storySection.create({ data: { ...data, pageId: 1 } });
    revalidatePath('/', 'layout');
    return NextResponse.json(section, { status: 201 });
  } catch (e) {
    console.error('[story sections POST]', e);
    return NextResponse.json({ error: 'Failed to create story section' }, { status: 500 });
  }
}
