import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    const p = prisma as any;
    let settings = await p.popupSettings.findFirst({ where: { id: 1 } });
    if (!settings) {
      settings = await p.popupSettings.create({ data: { id: 1 } });
    }
    return NextResponse.json(settings);
  } catch (e) {
    console.error('[popup-settings GET]', e);
    return NextResponse.json({ error: 'Failed to fetch popup settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id: _id, updatedAt: _ua, ...data } = body;

    const p = prisma as any;
    const settings = await p.popupSettings.upsert({
      where: { id: 1 },
      update: { ...data },
      create: { id: 1, ...data },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(settings);
  } catch (e) {
    console.error('[popup-settings PATCH]', e);
    return NextResponse.json({ error: 'Failed to update popup settings' }, { status: 500 });
  }
}
