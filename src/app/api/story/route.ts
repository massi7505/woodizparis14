import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    const p = prisma as any;
    await p.storyPage.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    const page = await p.storyPage.findFirst({
      include: { sections: { where: { isVisible: true }, orderBy: { sortOrder: 'asc' } } },
    });
    return NextResponse.json(page);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { sections: _s, createdAt: _ca, updatedAt: _ua, ...data } = body;
    const p = prisma as any;
    const page = await p.storyPage.upsert({
      where: { id: 1 },
      update: { ...data, updatedAt: new Date() },
      create: { id: 1, ...data },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(page);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
