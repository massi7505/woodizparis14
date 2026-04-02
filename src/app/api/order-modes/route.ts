import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const buttons = await prisma.linktreeButton.findMany({
      where: { section: { in: ['emporter', 'livraison', 'mode-livraison', 'mode-emporter'] } },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json(buttons);
  } catch (error) {
    console.error('[order-modes GET]', error);
    return NextResponse.json({ error: 'Failed to fetch order modes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { label, url, iconUrl, bgColor, textColor, section, isVisible, sortOrder } = body;

    const trimmedLabel = typeof label === 'string' ? label.trim() : '';
    if (!trimmedLabel) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 });
    }
    const trimmedUrl = typeof url === 'string' ? url.trim() : '';
    if (!trimmedUrl) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    const validSections = ['emporter', 'livraison', 'mode-livraison', 'mode-emporter'];
    const trimmedSection = typeof section === 'string' ? section.trim() : '';
    if (trimmedSection && !validSections.includes(trimmedSection)) {
      return NextResponse.json({ error: "section invalide" }, { status: 400 });
    }
    // mode-* entries: skip URL validation (url is '#' placeholder)
    const isModeSection = trimmedSection.startsWith('mode-');
    if (!isModeSection) {
      try { new URL(trimmedUrl); } catch {
        return NextResponse.json({ error: 'url must be a valid URL' }, { status: 400 });
      }
    }

    const button = await prisma.linktreeButton.create({
      data: {
        label: trimmedLabel,
        url: trimmedUrl,
        iconUrl: iconUrl ?? null,
        bgColor: bgColor ?? '#111827',
        textColor: textColor ?? '#ffffff',
        section: trimmedSection || 'emporter',
        isVisible: isVisible ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(button, { status: 201 });
  } catch (error) {
    console.error('[order-modes POST]', error);
    return NextResponse.json({ error: 'Failed to create order mode' }, { status: 500 });
  }
}
