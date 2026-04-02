'use client';

import { useState } from 'react';
import { autoTextColor } from '@/lib/color';

// ===== REVIEWS SECTION =====
interface Review {
  id: number; authorName: string; authorInitial?: string | null;
  avatarColor: string; rating: number; text: string; source: string; date: any;
}

interface ReviewsProps {
  reviews: Review[];
  site: any;
  locale: string;
  L: Record<string, string>;
  primaryColor: string;
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={s <= rating ? color : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ensureUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function ReviewsSection({ reviews, site, locale, L, primaryColor }: ReviewsProps) {
  const calcAvg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const displayRating = site?.googleRating ?? (reviews.length ? calcAvg : 0);
  const displayCount = site?.googleReviewCount ?? reviews.length;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{L.reviews}</h2>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(displayRating)} color={primaryColor} />
            <span className="text-sm font-bold text-gray-700">{displayRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({displayCount} avis)</span>
          </div>
        </div>
        {site?.googleReviewsUrl && (
          <a
            href={ensureUrl(site.googleReviewsUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {L.viewGoogle}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: review.avatarColor }}
              >
                {review.authorInitial || review.authorName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{review.authorName}</p>
                {/* suppressHydrationWarning: toLocaleDateString ICU differs between Node.js and Chrome */}
                <p className="text-xs text-gray-500" suppressHydrationWarning>
                  {new Date(review.date).toLocaleDateString(locale, { year: 'numeric', month: 'short' })}
                </p>
              </div>
              {review.source === 'google' && (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </div>
            <StarRating rating={review.rating} color={primaryColor} />
            <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-4">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== FAQ SECTION =====
const FAQ_TITLES: Record<string, { title: string; subtitle: string }> = {
  fr: { title: 'Des Questions ?', subtitle: 'Trouvez les réponses à vos questions les plus fréquentes.' },
  en: { title: 'Got Questions?', subtitle: 'Find answers to your most frequently asked questions.' },
  it: { title: 'Domande?', subtitle: 'Trova le risposte alle domande più frequenti.' },
  es: { title: '¿Preguntas?', subtitle: 'Encuentra respuestas a tus preguntas más frecuentes.' },
};

interface FAQProps {
  faqs: any[];
  locale: string;
  L: Record<string, string>;
  primaryColor?: string;
}

export function FAQSection({ faqs, locale, L, primaryColor = '#111827' }: FAQProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const titles = FAQ_TITLES[locale] || FAQ_TITLES.fr;

  return (
    <section className="mt-16 mb-4">
      {/* Centered heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{titles.title}</h2>
        <p className="text-gray-500 text-base max-w-md mx-auto">{titles.subtitle}</p>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map(faq => {
          const t = faq.translations[0];
          if (!t) return null;
          const isOpen = openId === faq.id;
          const openTextColor = autoTextColor(primaryColor);
          const openTextMuted = openTextColor === '#000000' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.72)';
          const openIconBg = openTextColor === '#000000' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';
          return (
            <div
              key={faq.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: isOpen ? primaryColor : '#fff',
                boxShadow: isOpen
                  ? `0 4px 24px ${primaryColor}40`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                border: isOpen ? 'none' : '1px solid #f0f0f0',
              }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 transition-colors"
              >
                <span
                  className="text-sm font-bold leading-snug"
                  style={{ color: isOpen ? openTextColor : '#111827' }}
                >
                  {t.question}
                </span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: isOpen ? openIconBg : '#f3f4f6',
                  }}
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke={isOpen ? openTextColor : '#6b7280'}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: openTextMuted }}>
                    {t.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ReviewsSection;
