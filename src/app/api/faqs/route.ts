import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');
    const target = searchParams.get('target');

    const visibleOnly = searchParams.get('visible') !== 'false';

    const faqs = await prisma.fAQ.findMany({
      where: {
        ...(visibleOnly ? { isVisible: true } : {}),
        ...(target === 'linktree' ? { showOnLinktree: true } : {}),
        ...(target === 'menu' ? { showOnMenu: true } : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: { translations: locale ? { where: { locale } } : true },
    });
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { translations, ...data } = body;
    const faq = await prisma.fAQ.create({
      data: { ...data, translations: { create: translations || [] } },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(faq, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}
