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

    // Pre-load all categories for fallback mapping
    const allCategories = await prisma.menuCategory.findMany({ orderBy: { id: 'asc' } });
    const categoryBySlug = new Map(allCategories.map(c => [c.slug, c]));
    const categoryById = new Map(allCategories.map(c => [c.id, c]));

    // Build relative-index map: sort unique categoryIds from file → map to sorted DB categories
    const uniqueImportIds = [...new Set(
      items.map((i: any) => Number(i.categoryId)).filter(n => !isNaN(n) && n > 0)
    )].sort((a, b) => a - b);
    const sortedDbCategories = [...allCategories].sort((a, b) => a.sortOrder - b.sortOrder);
    const relativeIndexMap = new Map(
      uniqueImportIds.map((id, idx) => [id, sortedDbCategories[idx]])
    );

    let created = 0;
    let skipped = 0;

    for (const item of items) {
      const { slug, categorySlug, categoryId, price, comparePrice, translations: translationsArr, ...rest } = item;
      if (!slug || !price) { skipped++; continue; }

      // Resolve category: slug > exact ID > relative index mapping
      let category: any = null;
      if (categorySlug) {
        category = categoryBySlug.get(categorySlug) ?? null;
      }
      if (!category && categoryId) {
        category = categoryById.get(Number(categoryId)) ?? null;
      }
      if (!category && categoryId) {
        category = relativeIndexMap.get(Number(categoryId)) ?? null;
      }
      if (!category) { skipped++; continue; }

      // Build translations: support array format and flat fr_name/en_name format
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

      if (translations.length === 0) { skipped++; continue; }

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

    return NextResponse.json({ created, skipped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
