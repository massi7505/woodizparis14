/**
 * Shared data-fetching and serialization helpers for menu pages.
 * Used by both /menu (FR only) and /[locale]/menu (all locales).
 */
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

// ── Serialization helpers ──────────────────────────────────────────────────

export function pickBestTranslation(translations: any[], locale: string) {
  const priority = (loc: string) =>
    loc === locale ? 0 : loc === 'fr' ? 1 : loc === 'en' ? 2 : loc === 'it' ? 3 : loc === 'es' ? 4 : 5;
  const seen = new Set<string>();
  const uniq = translations.filter(t => {
    if (seen.has(t.locale)) return false;
    seen.add(t.locale);
    return true;
  });
  return uniq.sort((a, b) => priority(a.locale) - priority(b.locale));
}

export function serializeCategories(categories: any[], locale: string) {
  return categories.map(cat => {
    const seenIds = new Set<number>();
    const uniqueProducts = (cat.products as any[]).filter(p => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });
    return {
      ...cat,
      createdAt: cat.createdAt?.toISOString() ?? null,
      updatedAt: cat.updatedAt?.toISOString() ?? null,
      translations: pickBestTranslation(cat.translations || [], locale),
      products: uniqueProducts.map((p: any) => ({
        ...p,
        price: parseFloat(p.price?.toString() ?? '0'),
        comparePrice: p.comparePrice ? parseFloat(p.comparePrice.toString()) : null,
        createdAt: p.createdAt?.toISOString() ?? null,
        updatedAt: p.updatedAt?.toISOString() ?? null,
        translations: pickBestTranslation(p.translations || [], locale),
      })),
    };
  });
}

export function serializePromos(promos: any[], locale = 'fr') {
  return promos.map(p => ({
    ...p,
    promoPrice: p.promoPrice ? parseFloat(p.promoPrice.toString()) : null,
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice.toString()) : null,
    createdAt: p.createdAt?.toISOString() ?? null,
    updatedAt: p.updatedAt?.toISOString() ?? null,
    startsAt: p.startsAt?.toISOString() ?? null,
    endsAt: p.endsAt?.toISOString() ?? null,
    translations: pickBestTranslation(p.translations || [], locale),
  }));
}

export function serializeReviews(reviews: any[]) {
  return reviews.map(r => ({
    ...r,
    date: r.date?.toISOString() ?? null,
    createdAt: r.createdAt?.toISOString() ?? null,
    updatedAt: r.updatedAt?.toISOString() ?? null,
  }));
}

export function serializeSite(site: any) {
  if (!site) return null;
  return {
    ...site,
    createdAt: site.createdAt?.toISOString() ?? null,
    updatedAt: site.updatedAt?.toISOString() ?? null,
  };
}

// ── Data-fetching helpers ──────────────────────────────────────────────────

/** Core menu data: categories, promos, reviews, FAQs, notif bar, site settings. */
async function _fetchMenuCoreData(locale: string) {
  const [categoriesRes, promosRes, reviewsRes, faqsRes, notifRes, siteRes] = await Promise.allSettled([
    prisma.menuCategory.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale: { in: [...new Set([locale, 'fr'])] } } },
        products: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: { translations: { where: { locale: { in: [...new Set([locale, 'fr'])] } } } },
        },
      },
    }),
    prisma.promotion.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: { in: [...new Set([locale, 'fr'])] } } } },
    }),
    prisma.review.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.fAQ.findMany({
      where: { isVisible: true, showOnMenu: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale } } },
    }),
    prisma.notificationBar.findFirst({ where: { id: 1 }, include: { translations: true } }),
    prisma.siteSettings.findFirst(),
  ]);

  const rawCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
  return {
    categories: serializeCategories(rawCategories.filter((c: any) => c.products.length > 0), locale),
    promos: serializePromos(promosRes.status === 'fulfilled' ? promosRes.value : [], locale),
    reviews: serializeReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value : []),
    faqs: (faqsRes.status === 'fulfilled' ? faqsRes.value : []) as any[],
    notifBar: notifRes.status === 'fulfilled' ? notifRes.value : null,
    site: serializeSite(siteRes.status === 'fulfilled' ? siteRes.value : null),
  };
}

export const fetchMenuCoreData = unstable_cache(
  _fetchMenuCoreData,
  ['menu-core'],
  { revalidate: 30, tags: ['menu'] }
);

/** Secondary menu data: banners, opening hours, order links, footer settings — run after core. */
async function _fetchMenuSecondaryData() {
  const p = prisma as any;
  const [bannersRaw, openingHoursRaw, orderLinksRaw, emporterRaw, livraisonRaw, footerRaw, modeIconsRaw] = await Promise.all([
    p.notificationBanner?.findMany?.({
      where: { isVisible: true },
      orderBy: [{ priority: 'desc' }, { sortOrder: 'asc' }],
      include: { translations: true },
    }).catch(() => []) ?? [],
    prisma.openingHours.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.linktreeButton
      .findMany({ where: { isVisible: true, section: { in: ['commander', 'contact'] } }, orderBy: { sortOrder: 'asc' } })
      .catch(() => []),
    prisma.linktreeButton
      .findMany({ where: { isVisible: true, section: 'emporter' }, orderBy: { sortOrder: 'asc' } })
      .catch(() => []),
    prisma.linktreeButton
      .findMany({ where: { isVisible: true, section: 'livraison' }, orderBy: { sortOrder: 'asc' } })
      .catch(() => []),
    p.footerSettings?.findFirst?.().catch(() => null) ?? null,
    prisma.linktreeButton
      .findMany({ where: { section: { in: ['mode-livraison', 'mode-emporter'] } }, take: 2 })
      .catch(() => []),
  ]);

  // fix: include iconUrl, bgColor, textColor so admin customizations are passed through
  const toLink = (b: any) => ({ label: b.label, url: b.url, icon: b.icon ?? null, iconUrl: b.iconUrl ?? null, bgColor: b.bgColor ?? null, textColor: b.textColor ?? null });

  return {
    banners: (bannersRaw ?? []) as any[],
    openingHours: (openingHoursRaw ?? []) as any[],
    orderLinks: ((orderLinksRaw ?? []) as any[])
      .filter((b: any) => b.url && !b.url.startsWith('/') && !b.url.startsWith('tel:') && !b.url.startsWith('mailto:'))
      .map((b: any) => ({ label: b.label, url: b.url })),
    emporterLinks: ((emporterRaw ?? []) as any[]).map(toLink),
    livraisonLinks: ((livraisonRaw ?? []) as any[]).map(toLink),
    footerSettings: footerRaw ?? null,
    livraisonModeIconUrl: ((modeIconsRaw ?? []) as any[]).find((b: any) => b.section === 'mode-livraison')?.iconUrl ?? null,
    emporterModeIconUrl:  ((modeIconsRaw ?? []) as any[]).find((b: any) => b.section === 'mode-emporter')?.iconUrl  ?? null,
  };
}

export const fetchMenuSecondaryData = unstable_cache(
  _fetchMenuSecondaryData,
  ['menu-secondary'],
  { revalidate: 60, tags: ['menu'] }
);

/** Hero section data (heroSettings, slides, feature cards). */
async function _fetchHeroData() {
  try {
    const p = prisma as any;
    const DEFAULT_SETTINGS = {
      isVisible: true, autoplay: true, autoplayDelay: 5000,
      showDots: true, showArrows: true, showFeatureCards: true, accentColor: '#F59E0B',
    };
    const [heroSettings, heroSlides, heroCards] = await Promise.all([
      p.heroSettings?.findFirst?.().catch(() => null) ?? null,
      p.heroSlide?.findMany?.({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        include: { buttons: { orderBy: { sortOrder: 'asc' } } },
      }).catch(() => []) ?? [],
      p.heroFeatureCard?.findMany?.({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []) ?? [],
    ]);
    return {
      settings: heroSettings ?? DEFAULT_SETTINGS,
      slides: (heroSlides ?? []) as any[],
      featureCards: (heroCards ?? []) as any[],
    };
  } catch (e) {
    console.error('[hero fetch error]', e);
    return null;
  }
}

export const fetchHeroData = unstable_cache(
  _fetchHeroData,
  ['menu-hero'],
  { revalidate: 120, tags: ['menu'] }
);

/** Popup/lead-capture settings. */
async function _fetchPopupSettings() {
  try {
    const p = prisma as any;
    return await p.popupSettings?.findFirst?.({ where: { id: 1 } }).catch(() => null) ?? null;
  } catch {
    return null;
  }
}

export const fetchPopupSettings = unstable_cache(
  _fetchPopupSettings,
  ['menu-popup'],
  { revalidate: 120, tags: ['menu'] }
);
