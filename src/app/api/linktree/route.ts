import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

// GET all linktree data (buttons + settings)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visibleOnly = searchParams.get('visible') !== 'false';

    const [settings, buttons] = await Promise.all([
      prisma.linktreeSettings.findFirst(),
      prisma.linktreeButton.findMany({
        where: visibleOnly ? { isVisible: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({ settings, buttons });
  } catch (error) {
    console.error('[linktree GET]', error);
    return NextResponse.json({ error: 'Failed to fetch linktree data' }, { status: 500 });
  }
}

// POST new button
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'settings') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...rawSettings } = data;
      // Keep only known LinktreeSettings fields
      const settingsData: Record<string, any> = {};
      const allowed = [
        'coverType','coverColor','coverImageUrl','coverVideoUrl',
        'bgColor','bgImageUrl','profileName','profileSubtitle',
        'profileImageUrl','noticeText','noticeIcon',
        'showHours','showFaqs','showPromos','showNotif',
      ];
      for (const key of allowed) {
        if (key in rawSettings) settingsData[key] = rawSettings[key];
      }
      const settings = await prisma.linktreeSettings.upsert({
        where: { id: 1 },
        update: settingsData,
        create: { id: 1, ...settingsData },
      });
      revalidatePath('/', 'layout');
      revalidateTag('menu');
      return NextResponse.json(settings);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bgType, id: _id, createdAt: _ca, updatedAt: _ua, ...buttonData } = data;
    const button = await prisma.linktreeButton.create({ data: buttonData });
    revalidatePath('/', 'layout');
    revalidateTag('menu');
    return NextResponse.json(button, { status: 201 });
  } catch (error) {
    console.error('[linktree POST]', error);
    return NextResponse.json({ error: 'Failed to save linktree data' }, { status: 500 });
  }
}
