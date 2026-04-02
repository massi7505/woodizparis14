'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import MenuHeader from './MenuHeader';
import { OrderModeBarMobile } from './OrderModeBar';
import PromoSlider from './PromoSlider';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import HeroSection from '@/components/linktree/HeroSection';
import { SmartNotificationBar } from '@/components/linktree/NotificationBar';
import type { NotificationBannerData, OpeningHoursData } from '@/components/linktree/NotificationBar';

const ProductModal = dynamic(() => import('./ProductModal'), { ssr: false, loading: () => null });
const GoogleReviewPopup = dynamic(() => import('./GoogleReviewPopup'), { ssr: false, loading: () => null });
const LeadsPopup = dynamic(() => import('./LeadsPopup'), { ssr: false, loading: () => null });
const ReviewsSection = dynamic(() => import('./ReviewsSection').then(m => ({ default: m.ReviewsSection })), { ssr: false, loading: () => <div className="h-48 skeleton mx-4 rounded-2xl" /> });
const FAQSection = dynamic(() => import('./ReviewsSection').then(m => ({ default: m.FAQSection })), { ssr: false, loading: () => <div className="h-32 skeleton mx-4 rounded-2xl" /> });
const MenuFooter = dynamic(() => import('./MenuFooter'), { ssr: false, loading: () => null });

interface Translation { locale: string; name: string; description?: string | null }
interface Product {
  id: number; slug: string; imageUrl?: string | null; price: any; comparePrice?: any;
  allergens?: string | null; badges?: string | null; isOutOfStock: boolean;
  isFeatured: boolean; isWeekSpecial: boolean; sortOrder: number;
  translations: Translation[];
}
interface Category {
  id: number; slug: string; iconUrl?: string | null; iconEmoji?: string | null;
  bgColor?: string | null; sortOrder: number;
  translations: Translation[];
  products: Product[];
}

interface Props {
  categories: Category[];
  promos: any[];
  reviews: any[];
  faqs: any[];
  site: any;
  locale: string;
  heroData?: { settings: any; slides: any[]; featureCards: any[] } | null;
  notifBar?: any; // legacy, kept for compat
  banners?: NotificationBannerData[];
  openingHours?: OpeningHoursData[];
  orderLinks?: { label: string; url: string }[];
  emporterLinks?: { label: string; url: string; icon?: string | null }[];
  livraisonLinks?: { label: string; url: string; icon?: string | null }[];
  footerSettings?: any;
  popupSettings?: any;
}

const LABELS: Record<string, Record<string, string>> = {
  fr: { search: 'Rechercher une pizza...', featured: '⭐ Produits en Vedette', week: '🔥 Produit de la Semaine', menu: '🍕 Notre Carte', noResults: 'Aucun résultat pour', promos: 'Promotions du Moment', reviews: 'Ce que nos clients disent', faqs: 'Questions Fréquentes', viewGoogle: 'Voir tous les avis Google', backTop: 'Haut de page', results: 'résultat', resultsPlural: 'résultats', resultsFor: 'pour', tryCategories: 'Parcourez nos catégories', outOfStock: 'épuisé', available: 'dispo' },
  en: { search: 'Search a pizza...', featured: '⭐ Featured Products', week: '🔥 Product of the Week', menu: '🍕 Our Menu', noResults: 'No results for', promos: 'Current Promotions', reviews: "What our customers say", faqs: 'Frequently Asked Questions', viewGoogle: 'See all Google reviews', backTop: 'Back to top', results: 'result', resultsPlural: 'results', resultsFor: 'for', tryCategories: 'Browse our categories', outOfStock: 'out of stock', available: 'available' },
  it: { search: 'Cerca una pizza...', featured: '⭐ Prodotti in Evidenza', week: '🔥 Prodotto della Settimana', menu: '🍕 Il Nostro Menu', noResults: 'Nessun risultato per', promos: 'Promozioni del Momento', reviews: 'Cosa dicono i nostri clienti', faqs: 'Domande Frequenti', viewGoogle: 'Vedi tutte le recensioni Google', backTop: 'Torna in alto', results: 'risultato', resultsPlural: 'risultati', resultsFor: 'per', tryCategories: 'Sfoglia le categorie', outOfStock: 'esaurito', available: 'disp.' },
  es: { search: 'Buscar una pizza...', featured: '⭐ Productos Destacados', week: '🔥 Producto de la Semana', menu: '🍕 Nuestra Carta', noResults: 'Sin resultados para', promos: 'Promociones del Momento', reviews: 'Lo que dicen nuestros clientes', faqs: 'Preguntas Frecuentes', viewGoogle: 'Ver todas las reseñas de Google', backTop: 'Arriba', results: 'resultado', resultsPlural: 'resultados', resultsFor: 'para', tryCategories: 'Explora nuestras categorías', outOfStock: 'agotado', available: 'disp.' },
};

/** Strip diacritics + lowercase for accent-insensitive search */
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Sort products: available first, out-of-stock last, keep sortOrder within each group */
function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.isOutOfStock !== b.isOutOfStock) return Number(a.isOutOfStock) - Number(b.isOutOfStock);
    return a.sortOrder - b.sortOrder;
  });
}

export default function MenuClient({ categories, promos, reviews, faqs, site, locale, heroData, notifBar, banners = [], openingHours = [], orderLinks = [], emporterLinks = [], livraisonLinks = [], footerSettings, popupSettings }: Props) {
  const [search, setSearch] = useState('');
  const [activePromoCount, setActivePromoCount] = useState(promos.length);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(() => {
    if (site?.defaultCategoryId) return site.defaultCategoryId;
    return categories[0]?.id ?? null;
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategoryForModal] = useState<Category | null>(null);
  const [showBackTop, setShowBackTop] = useState(false);
  const [notifBarH, setNotifBarH] = useState(0);
  const notifBarRef = useRef<HTMLDivElement>(null);

  const L = LABELS[locale] || LABELS.fr;
  const primaryColor = site?.primaryColor || '#F59E0B';

  // Custom section titles from site settings
  const featuredTitle = (() => {
    try { return JSON.parse(site?.featuredTitles || '{}')[locale] || L.featured; } catch { return L.featured; }
  })();
  const weekTitle = (() => {
    try { return JSON.parse(site?.weekTitles || '{}')[locale] || L.week; } catch { return L.week; }
  })();
  const showFeatured = site?.showFeatured !== false;
  const showWeekSpecial = site?.showWeekSpecial !== false;

  const featuredProducts = useMemo(() =>
    categories.flatMap(c => c.products.filter(p => p.isFeatured && !p.isOutOfStock)),
    [categories]
  );
  const weekSpecials = useMemo(() =>
    categories.flatMap(c => c.products.filter(p => p.isWeekSpecial && !p.isOutOfStock)),
    [categories]
  );

  // Accent-insensitive filtered categories, out-of-stock sorted last
  // Les produits vedette/semaine restent AUSSI dans leur catégorie d'origine (v2)
  const filteredCategories = useMemo(() => {
    const q = normalize(search);

    if (q) {
      return categories
        .map(cat => ({
          ...cat,
          products: sortProducts(
            cat.products.filter(p => {
              const t = p.translations[0];
              return normalize(t?.name || '').includes(q) || normalize(t?.description || '').includes(q);
            })
          ),
        }))
        .filter(cat => cat.products.length > 0);
    }

    if (activeCategoryId !== null) {
      return categories
        .filter(c => c.id === activeCategoryId)
        .map(cat => ({ ...cat, products: sortProducts(cat.products) }));
    }
    return categories.map(cat => ({ ...cat, products: sortProducts(cat.products) }));
  }, [categories, search, activeCategoryId]);

  const totalResults = useMemo(
    () => filteredCategories.reduce((s, c) => s + c.products.length, 0),
    [filteredCategories]
  );

  // ── IntersectionObserver: sync active tab while scrolling ──────────────────
  const programmaticScroll = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (search.trim()) return; // disable during search mode

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScroll.current) return;
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length === 0) return;
        const best = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = parseInt(best.target.id.replace('cat-', ''));
        if (!isNaN(id)) setActiveCategoryId(id);
      },
      { threshold: 0.15, rootMargin: '-110px 0px -45% 0px' }
    );

    categories.forEach(cat => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories, search]);

  // ── Measure notification bar height ───────────────────────────────────────
  useEffect(() => {
    const el = notifBarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNotifBarH(el.offsetHeight));
    ro.observe(el);
    setNotifBarH(el.offsetHeight);
    return () => ro.disconnect();
  }, [notifBar]);

  // ── Back to top visibility ─────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCategorySelect = useCallback((id: number) => {
    programmaticScroll.current = true;
    setActiveCategoryId(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => { programmaticScroll.current = false; }, 1200);
  }, []);

  const handleProductClick = useCallback((product: Product, category: Category) => {
    setSelectedProduct(product);
    setSelectedCategoryForModal(category);
  }, []);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    // Reset active category when clearing search
    if (!v) setActiveCategoryId(site?.defaultCategoryId || categories[0]?.id || null);
  }, [categories, site]);

  const headerTop = notifBarH;
  const spacerH = notifBarH + 60;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ===== NOTIFICATION BAR (fixed, above header) ===== */}
      {(banners.length > 0 || notifBar?.isVisible || openingHours.length > 0) && (
        <div ref={notifBarRef} className="fixed top-0 left-0 right-0 z-50">
          {banners.length > 0 ? (
            <SmartNotificationBar banners={banners} openingHours={openingHours} locale={locale} />
          ) : notifBar?.isVisible ? (
            <SmartNotificationBar
              banners={[{
                id: 0, isVisible: true,
                bgColor: notifBar.bgColor, textColor: notifBar.textColor,
                icon: notifBar.icon, link: notifBar.link, linkLabel: notifBar.linkLabel,
                priority: 0, displayDuration: 8000, animType: 'slide', type: 'custom',
                scheduleEnabled: false, scheduleStart: null, scheduleEnd: null,
                scheduleDays: '[0,1,2,3,4,5,6]', sortOrder: 0,
                translations: notifBar.translations || [],
              }]}
              openingHours={openingHours}
              locale={locale}
            />
          ) : (
            <SmartNotificationBar banners={[]} openingHours={openingHours} locale={locale} />
          )}
        </div>
      )}

      {/* ===== HEADER + ORDER BAR MOBILE (fixed, below notification bar) ===== */}
      <div style={{ position: 'fixed', top: headerTop, left: 0, right: 0, zIndex: 40 }}>
        <MenuHeader
          site={site}
          locale={locale}
          search={search}
          onSearch={handleSearch}
          L={L}
          primaryColor={primaryColor}
          emporterLinks={emporterLinks}
          livraisonLinks={livraisonLinks}
        />
        {/* Mobile-only: order mode bar below header */}
        <div className="sm:hidden">
          <OrderModeBarMobile
            emporterLinks={emporterLinks}
            livraisonLinks={livraisonLinks}
            primaryColor={primaryColor}
            locale={locale}
          />
        </div>
      </div>
      {/* Spacer: desktop = spacerH, mobile = spacerH + 82 (headline + two mode buttons, links are a dropdown overlay) */}
      <div style={{ height: spacerH }} className="hidden sm:block" />
      <div style={{ height: spacerH + 82 }} className="sm:hidden" />

      <main id="main-content">

      {/* ===== HERO SECTION ===== */}
      {heroData?.slides && heroData.slides.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <HeroSection
            settings={heroData.settings}
            slides={heroData.slides}
            featureCards={heroData.featureCards}
            locale={locale}
            primaryColor={primaryColor}
          />
        </div>
      )}

      {/* ===== PROMO SLIDER ===== */}
      {promos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">{L.promos}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Offres disponibles en ce moment</p>
            </div>
            {activePromoCount > 0 && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {activePromoCount} offre{activePromoCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <PromoSlider promos={promos} locale={locale} primaryColor={primaryColor} onActiveCount={setActivePromoCount} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* ===== FEATURED ===== */}
        {showFeatured && featuredProducts.length > 0 && !search && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{featuredTitle}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:pb-0 lg:grid-cols-6 xl:grid-cols-8">
              {featuredProducts.slice(0, 8).map(p => {
                const cat = categories.find(c => c.products.some(cp => cp.id === p.id));
                return (
                  <div key={p.id} className="w-28 flex-shrink-0 md:w-auto">
                    <ProductCard product={p} locale={locale} onClick={() => cat && handleProductClick(p, cat)} primaryColor={primaryColor} compact />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== WEEK SPECIALS ===== */}
        {showWeekSpecial && weekSpecials.length > 0 && !search && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{weekTitle}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:pb-0 lg:grid-cols-6 xl:grid-cols-8">
              {weekSpecials.slice(0, 8).map(p => {
                const cat = categories.find(c => c.products.some(cp => cp.id === p.id));
                return (
                  <div key={p.id} className="w-28 flex-shrink-0 md:w-auto">
                    <ProductCard product={p} locale={locale} onClick={() => cat && handleProductClick(p, cat)} primaryColor={primaryColor} compact />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== CATEGORY SECTION TITLE + TABS ===== */}
        {!search && (
          <>
            <div className="mt-8 mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{L.menu}</h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="sticky bg-gray-50 z-30 pt-3 pb-2 -mx-4 px-4" style={{ top: spacerH }}>
              <CategoryTabs
                categories={categories}
                active={activeCategoryId}
                onSelect={handleCategorySelect}
                locale={locale}
                primaryColor={primaryColor}
              />
            </div>
          </>
        )}

        {/* ===== SEARCH RESULTS COUNT ===== */}
        {search && totalResults > 0 && (
          <p className="text-sm text-gray-500 mt-4 mb-3">
            <span className="font-semibold" style={{ color: primaryColor }}>{totalResults}</span>{' '}
            {totalResults === 1 ? L.results : L.resultsPlural}{' '}
            {L.resultsFor} &ldquo;<span className="font-medium text-gray-900">{search}</span>&rdquo;
          </p>
        )}

        {/* ===== EMPTY SEARCH STATE ===== */}
        {search && totalResults === 0 && (
          <div className="mt-8 text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-bold text-gray-800 text-base">{L.noResults} &ldquo;{search}&rdquo;</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">{L.tryCategories}</p>
            <div className="flex flex-wrap justify-center gap-2 px-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { handleSearch(''); handleCategorySelect(cat.id); }}
                  className="px-3 py-1.5 rounded-full text-sm bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all flex items-center gap-1.5"
                >
                  {cat.iconEmoji && <span>{cat.iconEmoji}</span>}
                  {cat.translations[0]?.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== PRODUCTS GRID ===== */}
        {filteredCategories.map(cat => {
          const availableCount = cat.products.filter(p => !p.isOutOfStock).length;
          const totalCount = cat.products.length;
          const hasOutOfStock = availableCount < totalCount;

          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="mt-6 scroll-mt-28">
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                {cat.iconUrl ? (
                  <Image src={cat.iconUrl} alt="" width={28} height={28} className="rounded-full object-cover flex-shrink-0" />
                ) : cat.iconEmoji ? (
                  <span className="text-2xl">{cat.iconEmoji}</span>
                ) : null}
                <h3 className="text-base font-bold text-gray-900">
                  {cat.translations[0]?.name || cat.slug}
                </h3>
                {hasOutOfStock ? (
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    ({availableCount} {L.available})
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium ml-1">({totalCount})</span>
                )}
              </div>

              {cat.products.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">—</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                  {cat.products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      onClick={() => handleProductClick(product, cat)}
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {/* ===== REVIEWS ===== */}
        {reviews.length > 0 && (
          <ReviewsSection reviews={reviews} site={site} locale={locale} L={L} primaryColor={primaryColor} />
        )}

        {/* ===== FAQS ===== */}
        {faqs.length > 0 && (
          <FAQSection faqs={faqs} locale={locale} L={L} primaryColor={primaryColor} />
        )}
      </div>

      </main>

      {/* ===== FOOTER ===== */}
      <MenuFooter site={site} locale={locale} orderLinks={orderLinks} footerSettings={footerSettings} />

      {/* ===== LEADS POPUP ===== */}
      {popupSettings?.enabled && (
        <LeadsPopup settings={popupSettings} locale={locale} primaryColor={primaryColor} />
      )}

      {/* ===== GOOGLE REVIEW POPUP ===== */}
      {site?.reviewPopupEnabled && site?.googleReviewsUrl && (
        <GoogleReviewPopup
          googleReviewsUrl={site.googleReviewsUrl}
          delay={site.reviewPopupDelay ?? 5}
          frequency={site.reviewPopupFrequency ?? 'repeat'}
          repeatDays={site.reviewPopupRepeatDays ?? 7}
          locale={locale}
          primaryColor={primaryColor}
          googleRating={site.googleRating ?? undefined}
          googleReviewCount={site.googleReviewCount ?? undefined}
        />
      )}

      {/* ===== PRODUCT MODAL ===== */}
      {selectedProduct && selectedCategory && (
        <ProductModal
          product={selectedProduct}
          category={selectedCategory}
          locale={locale}
          onClose={() => setSelectedProduct(null)}
          primaryColor={primaryColor}
        />
      )}

      {/* ===== BACK TO TOP ===== */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={L.backTop}
          className="fixed bottom-6 right-4 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
