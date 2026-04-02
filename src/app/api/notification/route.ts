import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');

    const bar = await prisma.notificationBar.findFirst({
      where: { id: 1 },
      include: { translations: locale ? { where: { locale } } : true },
    });
    return NextResponse.json(bar);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notification bar' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { translations, id, createdAt, updatedAt, ...data } = body;

    const cleanTranslations = (translations || []).map(({ locale, text }: { locale: string; text: string }) => ({ locale, text }));

    const bar = await prisma.notificationBar.upsert({
      where: { id: 1 },
      update: {
        ...data,
        updatedAt: new Date(),
        ...(translations ? { translations: { deleteMany: {}, create: cleanTranslations } } : {}),
      },
      create: {
        id: 1,
        ...data,
        translations: { create: cleanTranslations },
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(bar);
  } catch {
    return NextResponse.json({ error: 'Failed to save notification bar' }, { status: 500 });
  }
}
