import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const buttons = await prisma.linktreeButton.findMany({
      where: { section: { in: ['emporter', 'livraison'] } },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json(buttons);
  } catch (error) {
    console.error('[order-modes GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { label, url, iconUrl, bgColor, textColor, section, isVisible, sortOrder } = body;

    const button = await prisma.linktreeButton.create({
      data: {
        label: label ?? '',
        url: url ?? '',
        iconUrl: iconUrl ?? null,
        bgColor: bgColor ?? '#111827',
        textColor: textColor ?? '#ffffff',
        section: section ?? 'emporter',
        isVisible: isVisible ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(button, { status: 201 });
  } catch (error) {
    console.error('[order-modes POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
