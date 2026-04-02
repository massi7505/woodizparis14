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
      const { slug, categorySlug, categoryId, price, comparePrice, translations: translationsArr, ...rest } = item;
      if (!slug || !price) continue;

      // Find category: prefer categorySlug, fallback to categoryId
      let category: any = null;
      if (categorySlug) {
        category = await prisma.menuCategory.findUnique({ where: { slug: categorySlug } });
      } else if (categoryId) {
        category = await prisma.menuCategory.findUnique({ where: { id: Number(categoryId) } });
      }
      if (!category) continue;

      // Build translations: support both flat (fr_name) and array ({ locale, name, description })
      let translations: { locale: string; name: string; description?: string | null }[];
      if (Array.isArray(translationsArr) && translationsArr.length > 0) {
        translations = translationsArr.map((t: any) => ({
          locale: t.locale,
          name: t.name || '',
          description: t.description ?? null,
        }));
      } else {
        translations = ['fr', 'en', 'it', 'es']
          .filter(l => rest[`${l}_name`])
          .map(l => ({
            locale: l,
            name: rest[`${l}_name`] || '',
            description: rest[`${l}_description`] || null,
          }));
      }

      await prisma.menuItem.upsert({
        where: { slug },
        update: {
          categoryId: category.id,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          isVisible: item.isVisible ?? true,
          isOutOfStock: item.isOutOfStock ?? false,
          isFeatured: item.isFeatured ?? false,
          isWeekSpecial: item.isWeekSpecial ?? false,
          allergens: item.allergens ?? '[]',
          badges: item.badges ?? '[]',
          updatedAt: new Date(),
          translations: { deleteMany: {}, create: translations },
        },
        create: {
          slug,
          categoryId: category.id,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          isVisible: item.isVisible ?? true,
          isOutOfStock: item.isOutOfStock ?? false,
          isFeatured: item.isFeatured ?? false,
          isWeekSpecial: item.isWeekSpecial ?? false,
          allergens: item.allergens ?? '[]',
          badges: item.badges ?? '[]',
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
