'use client';

import Image from 'next/image';
import Link from 'next/link';

interface StorySection {
  id: number;
  type: string;
  titleJson?: string | null;
  textJson?: string | null;
  imageUrl?: string | null;
  bgColor: string;
  textColor: string;
  accentColor: string;
  itemsJson?: string | null;
}

interface StoryPage {
  heroTitleJson?: string | null;
  heroSubtitleJson?: string | null;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  heroColor: string;
  sections: StorySection[];
}

interface Props {
  page: StoryPage;
  locale: string;
  site: any;
}

function tJson(json: string | null | undefined, locale: string, fb = ''): string {
  if (!json) return fb;
  try { const o = JSON.parse(json); return o[locale] || o.fr || fb; } catch { return fb; }
}

const LOCALE_NAV: Record<string, string> = {
  fr: '← Retour au menu', en: '← Back to menu', it: '← Torna al menu', es: '← Volver al menú',
};
const LOCALE_MENU: Record<string, string> = {
  fr: '/menu', en: '/en/menu', it: '/it/menu', es: '/es/menu',
};

export default function StoryPageView({ page, locale, site }: Props) {
  const primaryColor = site?.primaryColor || '#F59E0B';
  const siteName = site?.siteName || 'Woodiz';
  const heroTitle = tJson(page.heroTitleJson, locale, siteName);
  const heroSub = tJson(page.heroSubtitleJson, locale, '');

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav bar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={LOCALE_MENU[locale] || '/menu'} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            {LOCALE_NAV[locale] || LOCALE_NAV.fr}
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: primaryColor }}>
              {siteName.charAt(0)}
            </div>
            <span className="font-black text-gray-900 text-sm hidden sm:block">{siteName}</span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative h-[55vh] md:h-[70vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: page.heroColor }}>
        {page.heroVideoUrl ? (
          <video src={page.heroVideoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : page.heroImageUrl ? (
          <Image src={page.heroImageUrl} alt={heroTitle} fill className="object-cover" priority />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: `${primaryColor}30`, color: primaryColor, border: `1px solid ${primaryColor}50` }}>
            {siteName}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-lg">
            {heroTitle}
          </h1>
          {heroSub && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {heroSub}
            </p>
          )}
          {/* Scroll indicator */}
          <div className="mt-10 flex justify-center">
            <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-white/70 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTIONS ── */}
      {page.sections.map((section) => {
        const title = tJson(section.titleJson, locale);
        const text = tJson(section.textJson, locale);
        const items = (() => { try { return JSON.parse(section.itemsJson || '[]'); } catch { return []; } })();

        if (section.type === 'text-image' || section.type === 'image-text') {
          const isImageRight = section.type === 'text-image';
          return (
            <section key={section.id} className="py-16 md:py-24" style={{ backgroundColor: section.bgColor, color: section.textColor }}>
              <div className="max-w-6xl mx-auto px-6">
                <div className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${!isImageRight ? 'md:[&>*:first-child]:order-2' : ''}`}>
                  {/* Text */}
                  <div>
                    {title && (
                      <div className="mb-6">
                        <div className="w-12 h-1 rounded-full mb-4" style={{ backgroundColor: section.accentColor }} />
                        <h2 className="text-3xl md:text-4xl font-black leading-tight" style={{ color: section.textColor }}>
                          {title}
                        </h2>
                      </div>
                    )}
                    {text && (
                      <p className="text-base md:text-lg leading-relaxed opacity-80" style={{ whiteSpace: 'pre-wrap' }}>
                        {text}
                      </p>
                    )}
                  </div>
                  {/* Image */}
                  <div className="relative">
                    {section.imageUrl ? (
                      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                        <Image src={section.imageUrl} alt={title || ''} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-3xl flex items-center justify-center text-6xl" style={{ background: `${section.accentColor}15` }}>
                        🍕
                      </div>
                    )}
                    {/* Decorative dot grid */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle, ${section.accentColor} 1px, transparent 1px)`,
                      backgroundSize: '8px 8px',
                    }} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section.type === 'full-text') {
          return (
            <section key={section.id} className="py-16 md:py-24" style={{ backgroundColor: section.bgColor, color: section.textColor }}>
              <div className="max-w-3xl mx-auto px-6 text-center">
                {title && (
                  <div className="mb-6">
                    <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: section.accentColor }} />
                    <h2 className="text-3xl md:text-4xl font-black leading-tight">{title}</h2>
                  </div>
                )}
                {text && <p className="text-base md:text-lg leading-relaxed opacity-80" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>}
              </div>
            </section>
          );
        }

        if (section.type === 'values') {
          return (
            <section key={section.id} className="py-16 md:py-24" style={{ backgroundColor: section.bgColor, color: section.textColor }}>
              <div className="max-w-6xl mx-auto px-6">
                {title && (
                  <div className="text-center mb-12">
                    <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: section.accentColor }} />
                    <h2 className="text-3xl md:text-4xl font-black">{title}</h2>
                    {text && <p className="mt-3 text-base opacity-70 max-w-xl mx-auto">{text}</p>}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="rounded-2xl p-6 transition-transform hover:-translate-y-1"
                      style={{ background: item.color ? `${item.color}15` : `${section.accentColor}10`, border: `1px solid ${item.color || section.accentColor}25` }}>
                      {item.icon && <div className="text-3xl mb-3">{item.icon}</div>}
                      {item.titleJson && <h3 className="font-black text-lg mb-2">{tJson(item.titleJson, locale)}</h3>}
                      {item.descJson && <p className="text-sm opacity-70 leading-relaxed">{tJson(item.descJson, locale)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === 'stats') {
          return (
            <section key={section.id} className="py-16 md:py-20" style={{ backgroundColor: section.bgColor, color: section.textColor }}>
              <div className="max-w-6xl mx-auto px-6">
                {title && (
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black">{title}</h2>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="text-center">
                      <div className="text-4xl md:text-5xl font-black mb-1" style={{ color: section.accentColor }}>
                        {item.value}
                      </div>
                      <div className="text-sm opacity-60 font-medium">{tJson(item.labelJson, locale)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* ── Footer CTA ── */}
      <div className="py-20 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}>
        <div className="max-w-xl mx-auto px-6">
          <div className="text-5xl mb-4">🍕</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{siteName}</h2>
          <p className="text-gray-500 mb-6 text-sm">
            {locale === 'fr' ? 'Découvrez notre carte' : locale === 'en' ? 'Discover our menu' : locale === 'it' ? 'Scopri il menu' : 'Descubre nuestra carta'}
          </p>
          <Link href={LOCALE_MENU[locale] || '/menu'}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}>
            {locale === 'fr' ? 'Voir le menu' : locale === 'en' ? 'View menu' : locale === 'it' ? 'Vedi il menu' : 'Ver el menú'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
