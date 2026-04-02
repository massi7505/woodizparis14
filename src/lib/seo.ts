import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import type { Metadata } from 'next';

export const getCachedSeoSettings = unstable_cache(
  () => prisma.siteSettings.findFirst(),
  ['seo-settings'],
  { revalidate: 60, tags: ['site-settings'] },
);

export interface SeoBase {
  baseUrl: string;
  siteName: string;
  title: string;
  description: string;
  keywords: string;
  image: string | null;
  ogTitle: string;
  ogDescription: string;
}

export function buildSeoBase(settings: any): SeoBase {
  const baseUrl = settings?.canonicalUrl?.replace(/\/$/, '') || 'https://woodiz.fr';
  const siteName = settings?.siteName || 'Woodiz';
  const title = settings?.metaTitle || `${siteName} — Pizzeria artisanale Paris 15`;
  const description =
    settings?.metaDescription ||
    settings?.siteSlogan ||
    'Pizzeria artisanale au feu de bois à Paris 15. Pâte fraîche maison, ingrédients frais du marché. Livraison et à emporter.';
  const keywords =
    settings?.metaKeywords ||
    'pizza, pizzeria, paris 15, artisanale, feu de bois, livraison pizza, pizza paris';
  const image = settings?.metaImageUrl || null;
  const ogTitle = settings?.ogTitle || title;
  const ogDescription = settings?.ogDescription || description;
  return { baseUrl, siteName, title, description, keywords, image, ogTitle, ogDescription };
}

/** Builds shared OpenGraph + Twitter + robots blocks */
export function buildSharedMeta(seo: SeoBase, pageUrl: string): Partial<Metadata> {
  return {
    description: seo.description,
    keywords: seo.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: pageUrl,
      title: seo.ogTitle,
      description: seo.ogDescription,
      siteName: seo.siteName,
      ...(seo.image && { images: [{ url: seo.image, width: 1200, height: 630, alt: seo.ogTitle }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
      ...(seo.image && { images: [seo.image] }),
    },
  };
}
