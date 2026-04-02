'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

function safePrice(val: any): string | null {
  if (val == null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n.toFixed(2);
}

export default function PromoBannerSlider({ promos, locale, primaryColor, orderLinks = [] }: Props) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ctaDefault = CTA_LABELS[locale] || CTA_LABELS.fr;
  const orderUrl = orderLinks[0]?.url;

  const activePromos = promos.filter(p =>
    p.bgImageUrl || p.bgColor || p.bgGradient
  );

  const advance = useCallback((dir: 1 | -1 = 1) => {
    setCurrent(c => (c + dir + activePromos.length) % activePromos.length);
    setAnimKey(k => k + 1);
  }, [activePromos.length]);

  // Auto-advance
  useEffect(() => {
    if (activePromos.length <= 1) return;
    timerRef.current = setTimeout(() => advance(1), 5000);
    return () => clearTimeout(timerRef.current);
  }, [current, advance, activePromos.length]);

  if (activePromos.length === 0) return null;

  const promo = activePromos[current];
  const tr = promo.translations?.find((t: any) => t.locale === locale)
    || promo.translations?.find((t: any) => t.locale === 'fr')
    || promo.translations?.[0];
  const displayImageUrl = tr?.imageUrl || promo.bgImageUrl;
  const isImageBg = promo.bgType === 'image' && displayImageUrl;
  const bgStyle = isImageBg
    ? {}
    : promo.bgType === 'gradient' && promo.bgGradient
    ? { background: promo.bgGradient }
    : { backgroundColor: promo.bgColor || primaryColor };

  const promoP = safePrice(promo.promoPrice);
  const origP = safePrice(promo.originalPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-10">
      <div
        className="relative w-full rounded-2xl overflow-hidden select-none"
        style={{ ...bgStyle, minHeight: '280px' }}
      >
        {/* Background image */}
        {isImageBg && (
          <div key={`bg-${animKey}`} className="absolute inset-0 hero-anim-overlay">
            <Image
              src={displayImageUrl!}
              alt=""
              fill
              sizes="(max-width:640px) 100vw, (max-width:1280px) 90vw, 1200px"
              quality={80}
              priority
              className="object-cover object-center hero-ken-burns"
            />
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background: isImageBg
              ? 'linear-gradient(105deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.10) 100%)'
              : 'linear-gradient(105deg, rgba(0,0,0,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          key={`content-${animKey}`}
          className="relative z-10 flex flex-col justify-center p-8 sm:p-12"
          style={{ minHeight: '280px', color: promo.textColor || '#fff' }}
        >
          <div className="max-w-lg hero-anim-0">
            {tr?.title && (
              <h2
                className="font-black text-2xl sm:text-3xl md:text-4xl leading-tight mb-3"
                style={{ textShadow: isImageBg ? '0 2px 12px rgba(0,0,0,0.6)' : 'none' }}
              >
                {tr.title}
              </h2>
            )}

            {tr?.description && (
              <p className="hero-anim-1 text-sm sm:text-base opacity-80 mb-5 leading-relaxed max-w-sm">
                {tr.description}
              </p>
            )}

            {/* Price */}
            {promoP && (
              <div className="hero-anim-2 flex items-baseline gap-2 mb-5">
                {origP && <span className="text-sm line-through opacity-50">{origP}€</span>}
                <span className="text-3xl font-black"
                  style={{ textShadow: isImageBg ? '0 2px 12px rgba(0,0,0,0.5)' : 'none' }}>
                  {promoP}€
                </span>
              </div>
            )}

            <div className="hero-anim-3">
              <a
                href={tr?.ctaUrl || orderUrl || '#'}
                target={tr?.ctaUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-black text-sm transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
                style={{ backgroundColor: primaryColor, color: '#111827' }}
              >
                {tr?.cta || ctaDefault}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Arrow navigation (>1 slides) */}
        {activePromos.length > 1 && (
          <>
            <button
              onClick={() => advance(-1)}
              aria-label="Précédent"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => advance(1)}
              aria-label="Suivant"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {activePromos.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activePromos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setAnimKey(k => k + 1); }}
                aria-label={`Slide ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? '24px' : '7px',
                  height: '7px',
                  backgroundColor: i === current ? primaryColor : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}

        {/* Progress bar */}
        {activePromos.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              key={`progress-${current}-${animKey}`}
              className="h-full origin-left"
              style={{
                backgroundColor: primaryColor,
                animation: 'hero-progress 5s linear both',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
