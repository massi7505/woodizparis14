'use client';

import Image from 'next/image';

interface Props {
  promos: any[];
  locale: string;
  primaryColor: string;
  orderLinks?: { label: string; url: string }[];
}

const CTA_LABELS: Record<string, string> = {
  fr: 'Commander',
  en: 'Order Now',
  it: 'Ordina',
  es: 'Pedir',
};

export default function FeatureBannerCards({ promos, locale, primaryColor, orderLinks = [] }: Props) {
  const cards = promos.filter(p => p.bgImageUrl || p.bgColor || p.bgGradient).slice(0, 2);
  if (cards.length === 0) return null;

  const orderUrl = orderLinks[0]?.url;
  const ctaDefault = CTA_LABELS[locale] || CTA_LABELS.fr;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10">
      <div className={`grid gap-4 ${cards.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {cards.map((promo, i) => {
          const tr = promo.translations?.[0];
          const isImageBg = promo.bgType === 'image' && promo.bgImageUrl;
          const bgStyle = isImageBg
            ? {}
            : promo.bgType === 'gradient' && promo.bgGradient
            ? { background: promo.bgGradient }
            : { backgroundColor: promo.bgColor || primaryColor };

          return (
            <div
              key={promo.id}
              className="relative rounded-2xl overflow-hidden"
              style={{ ...bgStyle, minHeight: '200px' }}
            >
              {isImageBg && (
                <>
                  <Image
                    src={promo.bgImageUrl}
                    alt=""
                    fill
                    sizes="(max-width:640px) 100vw, 50vw"
                    quality={75}
                    priority={i === 0}
                    className="object-cover object-right"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 60%, transparent 100%)',
                    }}
                  />
                </>
              )}

              <div
                className="relative z-10 p-6 flex flex-col justify-between"
                style={{ minHeight: '200px', color: promo.textColor || '#fff' }}
              >
                <div>
                  {tr?.title && (
                    <p
                      className="font-black text-2xl leading-tight mb-2"
                      style={{ textShadow: isImageBg ? '0 2px 10px rgba(0,0,0,0.6)' : 'none' }}
                    >
                      {tr.title}
                    </p>
                  )}
                  {tr?.description && (
                    <p className="text-sm opacity-80 mb-4 max-w-xs leading-relaxed">
                      {tr.description}
                    </p>
                  )}
                </div>

                <a
                  href={tr?.ctaUrl || orderUrl || '#'}
                  target={tr?.ctaUrl ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all hover:scale-105 hover:shadow-xl w-fit"
                  style={{ backgroundColor: primaryColor, color: '#111827' }}
                >
                  {tr?.cta || ctaDefault}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
