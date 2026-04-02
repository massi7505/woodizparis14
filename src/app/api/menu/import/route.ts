import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromReq } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items must be an array' }, { status: 400 });
    }

    let created = 0;
    for (const item of items) {
      const { slug, categorySlug, price, comparePrice, ...rest } = item;
      if (!slug || !categorySlug || !price) continue;

      // Find category by slug
      const category = await prisma.menuCategory.findUnique({ where: { slug: categorySlug } });
      if (!category) continue;

      // Build translations from fr_name, en_name, etc.
      const translations = ['fr', 'en', 'it', 'es']
        .filter(l => rest[`${l}_name`])
        .map(l => ({
          locale: l,
          name: rest[`${l}_name`] || '',
          description: rest[`${l}_description`] || null,
        }));

      await prisma.menuItem.upsert({
        where: { slug },
        update: {
          categoryId: category.id,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          updatedAt: new Date(),
          translations: {
            deleteMany: {},
            create: translations,
          },
        },
        create: {
          slug,
          categoryId: category.id,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          translations: { create: translations },
        },
      });
      created++;
    }

    return NextResponse.json({ created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
