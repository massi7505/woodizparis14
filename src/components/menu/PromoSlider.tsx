'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { autoTextColor } from '@/lib/color';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
  onActiveCount?: (n: number) => void;
}

const AVAIL_LABEL: Record<string, (from: string, to: string) => string> = {
  fr: (f, t) => `Disponible de ${f} à ${t}`,
  en: (f, t) => `Available ${f}–${t}`,
  it: (f, t) => `Dalle ${f} alle ${t}`,
  es: (f, t) => `De ${f} a ${t}`,
};

const EXPIRY_LABELS: Record<string, (d: number) => string> = {
  fr: d => d === 0 ? 'Expire aujourd\'hui' : `Expire dans ${d}j`,
  en: d => d === 0 ? 'Expires today' : `Expires in ${d}d`,
  it: d => d === 0 ? 'Scade oggi' : `Scade in ${d}g`,
  es: d => d === 0 ? 'Expira hoy' : `Expira en ${d}d`,
};

function daysUntilExpiry(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  end.setHours(23, 59, 59, 999);
  return Math.floor((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function isPromoActive(promo: any): boolean {
  const now = Date.now();
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return false;
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now - 86_400_000) return false;
  return true;
}

function safePrice(val: any): string | null {
  if (val == null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n.toFixed(2);
}

function getBestTranslation(promo: any, locale: string) {
  if (!promo.translations?.length) return null;
  return (
    promo.translations.find((t: any) => t.locale === locale) ||
    promo.translations.find((t: any) => t.locale === 'fr') ||
    promo.translations[0]
  );
}

export default function PromoSlider({ promos, locale, primaryColor, onActiveCount }: Props) {
  const [activePromos, setActivePromos] = useState<any[]>([]);
  const [promoDays, setPromoDays] = useState<Record<number, number | null>>({});

  const filterPromos = useCallback(() => {
    const filtered = promos.filter(isPromoActive);
    setActivePromos(filtered);
    const days: Record<number, number | null> = {};
    filtered.forEach(p => { days[p.id] = daysUntilExpiry(p.endsAt); });
    setPromoDays(days);
    onActiveCount?.(filtered.length);
  }, [promos, onActiveCount]);

  useEffect(() => { filterPromos(); }, [filterPromos]);

  if (activePromos.length === 0) return null;

  const expiryFn = EXPIRY_LABELS[locale] || EXPIRY_LABELS.fr;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible">
      {activePromos.map((promo, i) => {
        const tr = getBestTranslation(promo, locale);
        const days = promoDays[promo.id] ?? null;
        const showExpiry = days !== null && days <= 6 && days >= 0;
        const promoP = safePrice(promo.promoPrice);
        const origP = safePrice(promo.originalPrice);
        const isPriority = i < 2;

        const displayImageUrl = tr?.imageUrl || promo.bgImageUrl;
        const isImageBg = promo.bgType === 'image' && displayImageUrl;
        const bgStyle = isImageBg
          ? undefined
          : promo.bgType === 'gradient' && promo.bgGradient
          ? { background: promo.bgGradient }
          : { backgroundColor: promo.bgColor || '#F59E0B' };

        const badgeText = (() => {
          try {
            const b = JSON.parse(promo.badgeText || '{}');
            return typeof b === 'object' && b !== null ? (b[locale] || b.fr || null) : promo.badgeText || null;
          } catch { return promo.badgeText || null; }
        })();

        const discountPct =
          promoP && origP ? Math.round((1 - parseFloat(promoP) / parseFloat(origP)) * 100) : null;

        // ── Photo-only card ──
        if (promo.photoOnly && displayImageUrl) {
          return (
            <div
              key={promo.id}
              className="relative flex-shrink-0 w-[72vw] sm:w-auto rounded-2xl overflow-hidden aspect-[4/3] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Image src={displayImageUrl} alt={tr?.title || ''} fill sizes="(max-width: 640px) 72vw, 320px" quality={85} priority={isPriority} className="object-cover" />
            </div>
          );
        }

        // ── Standard card: horizontal layout (image left + content right) ──
        return (
          <div
            key={promo.id}
            className="group flex-shrink-0 w-[80vw] sm:w-auto flex rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Left: image or color band */}
            <div className="relative w-28 sm:w-32 flex-shrink-0">
              {isImageBg ? (
                <>
                  <Image
                    src={displayImageUrl!}
                    alt={tr?.title || ''}
                    fill
                    sizes="128px"
                    quality={85}
                    priority={isPriority}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 70%, rgba(255,255,255,0.15) 100%)' }} />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={bgStyle}>
                  {/* subtle decorative circles */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                  <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />
                  {/* Price display in the color band */}
                  {promoP && (
                    <div className="text-center relative z-10 px-2">
                      {origP && (
                        <p className="text-xs line-through leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{origP}€</p>
                      )}
                      <p className="text-2xl font-black leading-none" style={{ color: bgStyle ? autoTextColor((bgStyle as any).backgroundColor || '#F59E0B') : '#fff' }}>
                        {promoP}€
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Discount badge */}
              {discountPct !== null && discountPct > 0 && (
                <span className="absolute top-2 left-2 z-10 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm leading-none">
                  -{discountPct}%
                </span>
              )}
            </div>

            {/* Right: content */}
            <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
              <div>
                {/* Top row: type badge + expiry */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  {badgeText ? (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full leading-none"
                      style={{ backgroundColor: `${promo.badgeColor || primaryColor}18`, color: promo.badgeColor || primaryColor }}
                    >
                      {badgeText}
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider leading-none"
                      style={{ color: `${primaryColor}80` }}
                    >
                      Offre
                    </span>
                  )}
                  {showExpiry && (
                    <span className="text-[10px] font-semibold text-red-500 leading-none flex-shrink-0">
                      {expiryFn(days!)}
                    </span>
                  )}
                </div>

                {/* Title */}
                {tr?.title && (
                  <p className="font-bold text-gray-900 leading-snug line-clamp-2 text-sm">
                    {tr.title}
                  </p>
                )}

                {/* Description */}
                {tr?.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">
                    {tr.description}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                {/* Price (if image bg — color bg shows price in band) */}
                {isImageBg && promoP && (
                  <div className="flex items-baseline gap-1">
                    {origP && <span className="text-xs text-gray-400 line-through">{origP}€</span>}
                    <span className="text-base font-black" style={{ color: primaryColor }}>{promoP}€</span>
                  </div>
                )}

                {/* Availability */}
                {promo.availFrom && promo.availTo && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-0.5 leading-none ml-auto">
                    <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                    </svg>
                    {(AVAIL_LABEL[locale] || AVAIL_LABEL.fr)(promo.availFrom, promo.availTo)}
                  </p>
                )}

                {/* CTA */}
                {tr?.ctaUrl && tr?.cta && (
                  <a
                    href={tr.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95 ml-auto"
                    style={{ backgroundColor: primaryColor, color: autoTextColor(primaryColor) }}
                  >
                    {tr.cta}
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
