import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'product';

    if (type === 'category') {
      const category = await prisma.menuCategory.findUnique({
        where: { id: numId },
        include: { translations: true },
      });
      if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(category);
    }

    const product = await prisma.menuItem.findUnique({
      where: { id: numId },
      include: { translations: true, category: { include: { translations: true } } },
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'product';
    const body = await req.json();
    const { translations, id: _bodyId, createdAt: _ca, updatedAt: _ua, products: _p, _category: _cat, ...data } = body;

    if (type === 'category') {
      const { slug, iconEmoji, iconUrl, bgColor, isVisible, sortOrder } = data;
      const categoryData: any = {};
      if (slug !== undefined) categoryData.slug = slug;
      if (iconEmoji !== undefined) categoryData.iconEmoji = iconEmoji;
      if (iconUrl !== undefined) categoryData.iconUrl = iconUrl;
      if (bgColor !== undefined) categoryData.bgColor = bgColor;
      if (isVisible !== undefined) categoryData.isVisible = isVisible;
      if (sortOrder !== undefined) categoryData.sortOrder = sortOrder;

      const category = await prisma.menuCategory.update({
        where: { id: numId },
        data: {
          ...categoryData,
          updatedAt: new Date(),
          ...(translations ? {
            translations: {
              deleteMany: {},
              create: translations.map(({ id: _i, categoryId: _c, ...t }: any) => t),
            },
          } : {}),
        },
        include: { translations: true },
      });
      revalidatePath('/', 'layout');
      return NextResponse.json(category);
    }

    const { slug, imageUrl, price, comparePrice, allergens, badges, isVisible, isOutOfStock, isFeatured, isWeekSpecial, sortOrder, categoryId } = data;
    const productData: any = {};
    if (slug !== undefined) productData.slug = slug;
    if (imageUrl !== undefined) productData.imageUrl = imageUrl;
    if (price !== undefined) productData.price = parseFloat(price);
    if (comparePrice !== undefined) productData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
    if (allergens !== undefined) productData.allergens = allergens;
    if (badges !== undefined) productData.badges = badges;
    if (isVisible !== undefined) productData.isVisible = isVisible;
    if (isOutOfStock !== undefined) productData.isOutOfStock = isOutOfStock;
    if (isFeatured !== undefined) productData.isFeatured = isFeatured;
    if (isWeekSpecial !== undefined) productData.isWeekSpecial = isWeekSpecial;
    if (sortOrder !== undefined) productData.sortOrder = sortOrder;
    if (categoryId !== undefined) productData.categoryId = categoryId;

    const product = await prisma.menuItem.update({
      where: { id: numId },
      data: {
        ...productData,
        updatedAt: new Date(),
        ...(translations ? {
          translations: {
            deleteMany: {},
            create: translations.map(({ id: _i, itemId: _it, ...t }: any) => t),
          },
        } : {}),
      },
      include: { translations: true },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const delId = parseInt(id, 10);
    if (isNaN(delId) || delId <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'product';

    if (type === 'category') {
      await prisma.menuCategory.delete({ where: { id: delId } });
    } else {
      await prisma.menuItem.delete({ where: { id: delId } });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
