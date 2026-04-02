import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getCachedSeoSettings } from '@/lib/seo';

export const revalidate = 60;

const LOCALE = 'fr';

const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten', lactose: 'Lactose', eggs: 'Œufs', fish: 'Poisson',
  shellfish: 'Crustacés', peanuts: 'Arachides', nuts: 'Fruits à coque',
  celery: 'Céleri', mustard: 'Moutarde', sesame: 'Sésame', sulfites: 'Sulfites',
  lupin: 'Lupin', molluscs: 'Mollusques', soya: 'Soja', soy: 'Soja',
};

const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
  bestseller: { bg: '#92400E', label: 'Bestseller' },
  nouveau:    { bg: '#065F46', label: 'Nouveau' },
  veggie:     { bg: '#065F46', label: 'Végétarien' },
  piment:     { bg: '#991B1B', label: 'Pimenté' },
  halal:      { bg: '#14532D', label: 'Halal' },
  chef:       { bg: '#5B21B6', label: "Chef's Choice" },
  classique:  { bg: '#1D4ED8', label: 'Classique' },
  partage:    { bg: '#C2410C', label: 'Partagé' },
};

async function getProductData(categorySlug: string, productSlug: string) {
  const [category, product, site] = await Promise.all([
    prisma.menuCategory.findFirst({
      where: { slug: categorySlug, isVisible: true },
      include: { translations: { where: { locale: LOCALE } } },
    }),
    prisma.menuItem.findFirst({
      where: { slug: productSlug, isVisible: true },
      include: { translations: { where: { locale: { in: [LOCALE, 'fr'] } } } },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  if (!category || !product || product.categoryId !== category.id) return null;
  return { category, product, site };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, product: productSlug } = await params;
  const data = await getProductData(categorySlug, productSlug);
  if (!data) return { title: 'Produit introuvable' };

  const { product, category, site } = data;
  const t = product.translations[0];
  const catT = category.translations[0];
  const settings = await getCachedSeoSettings();
  const baseUrl = settings?.canonicalUrl?.replace(/\/$/, '') || 'https://woodiz.fr';
  const pageUrl = `${baseUrl}/menu/${categorySlug}/${productSlug}`;
  const price = parseFloat(product.price?.toString() ?? '0').toFixed(2);

  const title = `${t?.name || productSlug} — ${catT?.name || categorySlug} | ${site?.siteName || 'Woodiz'}`;
  const description = t?.description
    ? `${t.description.slice(0, 140)} — ${price}€`
    : `Découvrez ${t?.name || productSlug} dans notre carte ${catT?.name || ''} chez ${site?.siteName || 'Woodiz'}. À partir de ${price}€.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      ...(product.imageUrl ? { images: [{ url: product.imageUrl, width: 800, height: 800, alt: t?.name || '' }] } : {}),
    },
    alternates: { canonical: pageUrl },
  };
}

export async function generateStaticParams() {
  try {
    const products = await prisma.menuItem.findMany({
      where: { isVisible: true },
      include: { category: { select: { slug: true } } },
      select: { slug: true, category: true },
    });
    return products.map(p => ({ category: p.category.slug, product: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const { category: categorySlug, product: productSlug } = await params;
  const data = await getProductData(categorySlug, productSlug);
  if (!data) notFound();

  const { product, category, site } = data;
  const t = product.translations[0];
  const catT = category.translations[0];
  const price = parseFloat(product.price?.toString() ?? '0').toFixed(2);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice.toString()).toFixed(2) : null;
  const primaryColor = site?.primaryColor || '#F59E0B';
  const baseUrl = (site as any)?.canonicalUrl?.replace(/\/$/, '') || 'https://woodiz.fr';

  const allergens: string[] = (() => {
    try { return JSON.parse(product.allergens || '[]'); } catch { return []; }
  })();
  const badges: string[] = (() => {
    try { return JSON.parse(product.badges || '[]'); } catch { return []; }
  })();

  const schemaProduct = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: t?.name || productSlug,
    description: t?.description || undefined,
    image: product.imageUrl || undefined,
    url: `${baseUrl}/menu/${categorySlug}/${productSlug}`,
    offers: {
      '@type': 'Offer',
      price: parseFloat(product.price?.toString() ?? '0'),
      priceCurrency: 'EUR',
      availability: product.isOutOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
    },
    suitableForDiet: badges.includes('veggie') ? 'https://schema.org/VegetarianDiet' : undefined,
    menuAddOn: allergens.length ? allergens.map(a => ({ '@type': 'MenuItem', name: ALLERGEN_LABELS[a] || a })) : undefined,
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Menu', item: `${baseUrl}/menu` },
      { '@type': 'ListItem', position: 2, name: catT?.name || categorySlug, item: `${baseUrl}/menu#cat-${category.id}` },
      { '@type': 'ListItem', position: 3, name: t?.name || productSlug, item: `${baseUrl}/menu/${categorySlug}/${productSlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaProduct) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              href="/menu"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Notre carte
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">{catT?.name || categorySlug}</span>
          </div>
        </div>

        <main className="max-w-2xl mx-auto pb-12">
          {/* Product image */}
          <div className="relative aspect-square bg-gray-100 md:rounded-2xl md:mt-4 md:mx-4 overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={t?.name || productSlug}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-amber-50 to-orange-100">
                🍕
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {badges.slice(0, 2).map(badge => {
                  const bs = BADGE_STYLES[badge];
                  if (!bs) return null;
                  return (
                    <span
                      key={badge}
                      className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow"
                      style={{ backgroundColor: bs.bg, color: '#fff' }}
                    >
                      {bs.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Out of stock */}
            {product.isOutOfStock && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-500 bg-gray-200 px-4 py-2 rounded-full">
                  Rupture de stock
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="px-4 md:px-8 pt-5">
            {/* Category tag */}
            <div className="mb-2">
              <Link
                href={`/menu#cat-${category.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-colors"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                {category.iconEmoji && <span>{category.iconEmoji}</span>}
                {catT?.name || categorySlug}
              </Link>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {t?.name || productSlug}
            </h1>

            {/* Description */}
            {t?.description && (
              <p className="text-gray-600 mt-2 leading-relaxed text-sm">{t.description}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-black" style={{ color: primaryColor }}>
                {price}€
              </span>
              {comparePrice && (
                <span className="text-lg text-gray-400 line-through">{comparePrice}€</span>
              )}
            </div>

            {/* Order CTA */}
            {(site as any)?.orderButtonEnabled && (site as any)?.orderButtonUrl && (site as any)?.orderButtonUrl !== '#' && (
              <a
                href={(site as any).orderButtonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {(site as any).orderButtonLabel || 'Commander en ligne'}
              </a>
            )}

            {/* Allergens */}
            {allergens.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                  Allergènes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allergens.map(a => (
                    <span key={a} className="text-xs bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded-full border border-amber-200">
                      {ALLERGEN_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Back to full menu */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                href="/menu"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 font-semibold text-gray-700 transition-colors hover:border-gray-400"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Voir toute la carte
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
