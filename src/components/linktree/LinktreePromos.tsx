'use client';

import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';

interface Promo {
  id: number;
  type: string;
  bgType: string;
  bgColor: string;
  bgGradient?: string | null;
  bgImageUrl?: string | null;
  textColor: string;
  badgeText?: string | null;
  badgeColor: string;
  originalPrice?: any;
  promoPrice: any;
  startsAt?: string | null;
  endsAt?: string | null;
  translations: { title: string; description?: string | null; cta?: string | null; ctaUrl?: string | null }[];
}

interface Props {
  promos: Promo[];
  locale: string;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  fr: { delivery: '🛵 Livraison', takeaway: '🥡 À emporter', onsite: '🪑 Sur place', all: '🎉 Toutes offres' },
  en: { delivery: '🛵 Delivery', takeaway: '🥡 Takeaway', onsite: '🪑 On Site', all: '🎉 All offers' },
  it: { delivery: '🛵 Consegna', takeaway: '🥡 Asporto', onsite: '🪑 In loco', all: '🎉 Tutte le offerte' },
  es: { delivery: '🛵 Entrega', takeaway: '🥡 Para llevar', onsite: '🪑 En el local', all: '🎉 Todas las ofertas' },
};

const SECTION_LABELS: Record<string, string> = {
  fr: 'Promotions du Moment',
  en: 'Current Promotions',
  it: 'Promozioni del Momento',
  es: 'Promociones del Momento',
};

const EXPIRY_LABELS: Record<string, (d: number) => string> = {
  fr: d => d === 0 ? '🔥 Expire aujourd\'hui !' : `⏳ Expire dans ${d}j`,
  en: d => d === 0 ? '🔥 Expires today!' : `⏳ Expires in ${d}d`,
  it: d => d === 0 ? '🔥 Scade oggi!' : `⏳ Scade in ${d}g`,
  es: d => d === 0 ? '🔥 ¡Expira hoy!' : `⏳ Expira en ${d}d`,
};

function daysUntilExpiry(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  end.setHours(23, 59, 59, 999);
  const diff = Math.floor((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function isPromoActive(promo: Promo): boolean {
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

function getBestTranslation(promo: Promo, locale: string) {
  if (!promo.translations?.length) return null;
  return (
    promo.translations.find(t => (t as any).locale === locale) ||
    promo.translations.find(t => (t as any).locale === 'fr') ||
    promo.translations[0]
  );
}

export default function LinktreePromos({ promos, locale }: Props) {
  // Date filtering on client only (avoids SSR/hydration mismatch)
  const [active, setActive] = useState<Promo[]>(promos);
  useEffect(() => {
    setActive(promos.filter(isPromoActive));
  }, [promos]);

  if (active.length === 0) return null;

  const labels = TYPE_LABELS[locale] || TYPE_LABELS.fr;
  const expiryFn = EXPIRY_LABELS[locale] || EXPIRY_LABELS.fr;

  return (
    <div className="mx-5 mt-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
        <span className="flex-1 h-px bg-gray-700" />
        {SECTION_LABELS[locale] || SECTION_LABELS.fr}
        <span className="flex-1 h-px bg-gray-700" />
      </p>

      <div className="space-y-3">
        {active.map((promo) => {
          const t = getBestTranslation(promo, locale);
          if (!t) return null;

          const days = daysUntilExpiry(promo.endsAt);
          const showExpiry = days !== null && days <= 6 && days >= 0;
          const promoP = safePrice(promo.promoPrice);
          const origP = safePrice(promo.originalPrice);

          const bgStyle =
            promo.bgType === 'image' && promo.bgImageUrl
              ? { backgroundImage: `url(${promo.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : promo.bgType === 'gradient' && promo.bgGradient
              ? { background: promo.bgGradient }
              : { backgroundColor: promo.bgColor };

          return (
            <div key={promo.id} className="promo-card relative overflow-hidden rounded-2xl" style={bgStyle}>
              {promo.bgType === 'image' && (
                <div className="absolute inset-0 bg-black/50" />
              )}

              {/* Expiry ribbon */}
              {showExpiry && (
                <div className="absolute top-0 right-0 z-20 bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg tracking-wide">
                  {expiryFn(days!)}
                </div>
              )}

              <div className="relative z-10 p-4" style={{ color: promo.textColor }}>
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {(() => { try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || null; } catch { return promo.badgeText || null; } })() && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: promo.badgeColor }}>
                      {(() => { try { const b = JSON.parse(promo.badgeText || '{}'); return b[locale] || b.fr || promo.badgeText; } catch { return promo.badgeText; } })()}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md bg-white/20">
                    {labels[promo.type] || promo.type}
                  </span>
                </div>

                <h3 className="font-bold text-base leading-tight">{t.title}</h3>
                {t.description && (
                  <p className="text-sm opacity-80 mt-0.5 leading-snug">{t.description}</p>
                )}

                <div className="flex items-center justify-between mt-3 gap-2">
                  {/* Price */}
                  {promoP && (
                    <div className="flex items-baseline gap-1.5">
                      {origP && (
                        <span className="text-sm line-through opacity-50">{origP}€</span>
                      )}
                      <span className="text-2xl font-black leading-none">{promoP}€</span>
                    </div>
                  )}
                  {/* CTA */}
                  {t.ctaUrl && t.cta && (
                    <a href={t.ctaUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 flex-shrink-0">
                      {t.cta}
                      <ArrowRightIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
