import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');
    const featured = searchParams.get('featured') === 'true';
    const weekSpecial = searchParams.get('weekSpecial') === 'true';

    const visibleOnly = searchParams.get('visible') !== 'false';

    const categories = await prisma.menuCategory.findMany({
      where: visibleOnly ? { isVisible: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: locale ? { where: { locale } } : true,
        products: {
          where: visibleOnly
            ? {
                isVisible: true,
                ...(featured ? { isFeatured: true } : {}),
                ...(weekSpecial ? { isWeekSpecial: true } : {}),
              }
            : undefined,
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: locale ? { where: { locale } } : true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, translations, ...data } = body;

    // Sanitize slug: only allow lowercase alphanumeric and hyphens
    if (data.slug !== undefined) {
      data.slug = String(data.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!data.slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    if (type === 'category') {
      const category = await prisma.menuCategory.create({
        data: {
          ...data,
          translations: {
            create: translations || [],
          },
        },
        include: { translations: true },
      });
      revalidatePath('/', 'layout');
      revalidateTag('menu');
      return NextResponse.json(category, { status: 201 });
    }

    if (type === 'product') {
      const product = await prisma.menuItem.create({
        data: {
          ...data,
          price: parseFloat(data.price),
          comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
          translations: {
            create: translations || [],
          },
        },
        include: { translations: true },
      });
      revalidatePath('/', 'layout');
      revalidateTag('menu');
      return NextResponse.json(product, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
