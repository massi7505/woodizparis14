import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = 'https://woodiz.fr';
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.canonicalUrl) baseUrl = settings.canonicalUrl.replace(/\/$/, '');
  } catch {}

  const now = new Date();
  const locales = ['en', 'it', 'es'];

  const pages = [
    { path: '/linktree',       priority: 1.0, changeFreq: 'daily'   as const },
    { path: '/menu',           priority: 0.9, changeFreq: 'weekly'  as const },
    { path: '/notre-histoire', priority: 0.6, changeFreq: 'monthly' as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    const allLocales = ['fr', ...locales];
    const alternates = {
      languages: Object.fromEntries(
        allLocales.map(l => [l, l === 'fr' ? `${baseUrl}${page.path}` : `${baseUrl}/${l}${page.path}`])
      ) as Record<string, string>,
    };

    // French (default, no locale prefix)
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFreq,
      priority: page.priority,
      alternates,
    });
    // Other locales
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFreq,
        priority: Math.round(page.priority * 0.85 * 100) / 100,
        alternates,
      });
    }
  }

  // Individual product pages
  try {
    const products = await prisma.menuItem.findMany({
      where: { isVisible: true },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
        translations: { where: { locale: 'fr' }, select: { name: true } },
      },
    });

    for (const product of products) {
      const catSlug = product.category.slug;
      const prodSlug = product.slug;
      const allLocales = ['fr', ...locales];
      const alternates = {
        languages: Object.fromEntries(
          allLocales.map(l => [
            l,
            l === 'fr'
              ? `${baseUrl}/menu/${catSlug}/${prodSlug}`
              : `${baseUrl}/${l}/menu/${catSlug}/${prodSlug}`,
          ])
        ) as Record<string, string>,
      };

      entries.push({
        url: `${baseUrl}/menu/${catSlug}/${prodSlug}`,
        lastModified: product.updatedAt ?? now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates,
      });

      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/menu/${catSlug}/${prodSlug}`,
          lastModified: product.updatedAt ?? now,
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates,
        });
      }
    }
  } catch {
    // Sitemap product pages generation failed silently
  }

  return entries;
}
