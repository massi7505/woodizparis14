'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { autoTextColor, darkenToContrast } from '@/lib/color';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
  onActiveCount?: (n: number) => void;
}

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
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible">
      {activePromos.map((promo, i) => {
        const tr = getBestTranslation(promo, locale);
        const days = promoDays[promo.id] ?? null;
        const showExpiry = days !== null && days <= 6 && days >= 0;
        const promoP = safePrice(promo.promoPrice);
        const origP = safePrice(promo.originalPrice);
        const isPriority = i < 2;

        const displayImageUrl = tr?.imageUrl || promo.bgImageUrl;
        const isImageBg = promo.bgType === 'image' && displayImageUrl;
        const accentColor = promo.bgColor || primaryColor;
        const accentOnWhite = darkenToContrast(accentColor, '#FFFFFF');
        const bgStyle = promo.bgType === 'gradient' && promo.bgGradient
          ? { background: promo.bgGradient }
          : { backgroundColor: accentColor };

        const discountPct =
          promoP && origP ? Math.round((1 - parseFloat(promoP) / parseFloat(origP)) * 100) : null;

        const badgeText = (() => {
          try {
            const b = JSON.parse(promo.badgeText || '{}');
            return typeof b === 'object' && b !== null ? (b[locale] || b.fr || null) : promo.badgeText || null;
          } catch { return promo.badgeText || null; }
        })();

        return (
          <div
            key={promo.id}
            className="flex-shrink-0 w-[72vw] sm:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
          >
            {/* Image or color band */}
            {isImageBg ? (
              <div className="relative w-full aspect-[16/9] flex-shrink-0">
                <Image
                  src={displayImageUrl!}
                  alt={tr?.title || ''}
                  fill
                  sizes="(max-width: 640px) 72vw, 320px"
                  quality={80}
                  priority={isPriority}
                  className="object-cover"
                />
                {discountPct !== null && discountPct > 0 && (
                  <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                    -{discountPct}%
                  </span>
                )}
                {showExpiry && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                    {expiryFn(days!)}
                  </span>
                )}
              </div>
            ) : (
              /* Color / gradient band with price */
              <div
                className="relative w-full h-24 flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={bgStyle}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }} />
                {promoP && (
                  <div className="text-center relative z-10 px-3">
                    {origP && <p className="text-xs line-through font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{origP}€</p>}
                    <p className="font-display text-3xl font-black leading-none" style={{ color: autoTextColor(accentColor) }}>{promoP}€</p>
                  </div>
                )}
                {discountPct !== null && discountPct > 0 && (
                  <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                    -{discountPct}%
                  </span>
                )}
                {showExpiry && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                    {expiryFn(days!)}
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              {/* Badge row */}
              <div className="flex items-center justify-between gap-1">
                {badgeText ? (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${accentOnWhite}18`, color: accentOnWhite }}
                  >
                    {badgeText}
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: `${darkenToContrast(primaryColor, '#FFFFFF')}b0` }}
                  >
                    Offre
                  </span>
                )}
                {isImageBg && showExpiry && (
                  <span className="text-[10px] font-semibold text-red-500 flex-shrink-0">
                    {expiryFn(days!)}
                  </span>
                )}
                {isImageBg && discountPct !== null && discountPct > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    -{discountPct}%
                  </span>
                )}
              </div>

              {/* Title */}
              {tr?.title && (
                <p className="font-display font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                  {tr.title}
                </p>
              )}

              {/* Description */}
              {tr?.description && (
                <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                  {tr.description}
                </p>
              )}

              {/* Price + CTA */}
              <div className="flex items-center justify-between gap-2 mt-auto pt-1.5">
                {(promoP || origP) && (
                  <div className="flex items-baseline gap-1.5">
                    {origP && <span className="text-xs text-gray-400 line-through">{origP}€</span>}
                    {promoP && (
                      <span className="text-base font-black" style={{ color: accentOnWhite }}>
                        {promoP}€
                      </span>
                    )}
                  </div>
                )}
                {tr?.ctaUrl && tr?.cta && (
                  <a
                    href={tr.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90 active:scale-95 ml-auto flex-shrink-0"
                    style={{ backgroundColor: accentColor, color: autoTextColor(accentColor) }}
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
