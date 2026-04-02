import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET() {
  try {
    const p = prisma as any;
    const [settings, slides, featureCards] = await Promise.all([
      p.heroSettings.findFirst(),
      p.heroSlide.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        include: { buttons: { orderBy: { sortOrder: 'asc' } } },
      }),
      p.heroFeatureCard.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
    return NextResponse.json({ settings, slides, featureCards });
  } catch (error) {
    console.error('[hero GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'settings') {
      const allowed = [
        'isVisible','autoplay','autoplayDelay','showDots','showArrows',
        'ratingCount','ratingTextJson','showRating','showFeatureCards','accentColor',
      ];
      const settingsData: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in data) settingsData[key] = data[key];
      }
      const p2 = prisma as any;
      const settings = await p2.heroSettings.upsert({
        where: { id: 1 },
        update: settingsData,
        create: { id: 1, ...settingsData },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(settings);
    }

    const p3 = prisma as any;

    // Ensure hero_settings row id=1 exists before creating child records
    await p3.heroSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    if (type === 'slide') {
      const { id: _id, createdAt: _ca, updatedAt: _ua, buttons: _btns, ...slideData } = data;
      const slide = await p3.heroSlide.create({
        data: { ...slideData, settingsId: 1 },
        include: { buttons: true },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(slide, { status: 201 });
    }

    if (type === 'button') {
      const { id: _id, bgType: _bt, ...btnData } = data;
      const button = await p3.heroSlideButton.create({ data: btnData });
      revalidatePath('/', 'layout');
      return NextResponse.json(button, { status: 201 });
    }

    if (type === 'card') {
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...cardData } = data;
      const card = await p3.heroFeatureCard.create({
        data: { ...cardData, settingsId: 1 },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(card, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('[hero POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
