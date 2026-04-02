import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: 1 } });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = body;
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { ...data, updatedAt: new Date() },
      create: { id: 1, ...data },
    });
    revalidatePath('/', 'layout');
    revalidateTag('site-settings');
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[PATCH /api/settings]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
