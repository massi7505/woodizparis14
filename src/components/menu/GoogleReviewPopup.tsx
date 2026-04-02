'use client';

import { useState, useEffect } from 'react';

/* ── i18n ───────────────────────────────────────────────────────────────────── */
const LABELS = {
  fr: {
    eyebrow: 'Votre avis compte',
    title: 'Vous avez aimé ?',
    subtitle: 'Laissez-nous un avis Google —\nça nous aide énormément !',
    cta: 'Laisser un avis Google',
    later: 'Peut-être plus tard',
    badge: 'avis',
  },
  en: {
    eyebrow: 'Your opinion matters',
    title: 'Did you enjoy it?',
    subtitle: 'Leave us a Google review —\nit helps us more than you know!',
    cta: 'Leave a Google review',
    later: 'Maybe later',
    badge: 'reviews',
  },
  it: {
    eyebrow: 'La tua opinione conta',
    title: 'Vi è piaciuto?',
    subtitle: 'Lasciateci una recensione su Google —\nci aiuta tantissimo!',
    cta: 'Lascia una recensione',
    later: 'Forse più tardi',
    badge: 'recensioni',
  },
  es: {
    eyebrow: 'Tu opinión importa',
    title: '¿Te gustó?',
    subtitle: '¡Déjanos una reseña en Google —\nnos ayuda muchísimo!',
    cta: 'Dejar una reseña en Google',
    later: 'Quizás más tarde',
    badge: 'reseñas',
  },
} as const;

/* ── localStorage keys ──────────────────────────────────────────────────────── */
const KEY_CLICKED   = 'woodiz_review_clicked';
const KEY_DISMISSED = 'woodiz_review_dismissed';

/* ── Animations injected once into <head> ───────────────────────────────────── */
const POPUP_CSS = `
@keyframes grp-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes grp-card-in {
  0%   { opacity: 0; transform: translateY(52px) scale(0.88); }
  55%  { transform: translateY(-10px) scale(1.025); }
  75%  { transform: translateY(5px)  scale(0.99); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes grp-card-out {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(36px) scale(0.92); }
}
@keyframes grp-star-pop {
  0%   { opacity: 0; transform: scale(0) rotate(-30deg); }
  60%  { transform: scale(1.40) rotate(8deg); }
  80%  { transform: scale(0.90) rotate(-3deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes grp-star-pulse {
  0%,100% { filter: drop-shadow(0 0 3px rgba(251,191,36,0.45)); }
  50%     { filter: drop-shadow(0 0 11px rgba(251,191,36,0.95)) drop-shadow(0 0 22px rgba(251,191,36,0.30)); }
}
@keyframes grp-float {
  0%   { opacity: 0.85; transform: translateY(0) rotate(0deg) scale(1); }
  100% { opacity: 0;    transform: translateY(-56px) rotate(25deg) scale(0.45); }
}
@keyframes grp-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes grp-badge-in {
  from { opacity: 0; transform: scale(0.82) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
@keyframes grp-cta-lift {
  0%,100% { transform: translateY(0); box-shadow: 0 4px 20px rgba(245,158,11,0.40); }
  50%     { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(245,158,11,0.55); }
}
@keyframes grp-halo-pulse {
  0%,100% { opacity: 0.18; transform: translate(-50%,-50%) scale(1); }
  50%     { opacity: 0.32; transform: translate(-50%,-50%) scale(1.15); }
}

.grp-card-enter { animation: grp-card-in  0.54s cubic-bezier(0.34,1.30,0.64,1) both; }
.grp-card-leave { animation: grp-card-out 0.32s ease-in both; }

.grp-s1 { animation: grp-star-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.08s both, grp-star-pulse 2.6s ease-in-out 0.95s infinite; }
.grp-s2 { animation: grp-star-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.18s both, grp-star-pulse 2.6s ease-in-out 1.05s infinite; }
.grp-s3 { animation: grp-star-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.28s both, grp-star-pulse 2.6s ease-in-out 1.15s infinite; }
.grp-s4 { animation: grp-star-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.38s both, grp-star-pulse 2.6s ease-in-out 1.25s infinite; }
.grp-s5 { animation: grp-star-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) 0.48s both, grp-star-pulse 2.6s ease-in-out 1.35s infinite; }

.grp-f1 { animation: grp-float 2.1s ease-out 0.50s both; }
.grp-f2 { animation: grp-float 2.6s ease-out 0.80s both; }
.grp-f3 { animation: grp-float 1.9s ease-out 1.05s both; }
.grp-f4 { animation: grp-float 2.8s ease-out 0.38s both; }
.grp-f5 { animation: grp-float 2.3s ease-out 1.20s both; }
.grp-f6 { animation: grp-float 2.0s ease-out 0.65s both; }

.grp-shimmer-bar {
  background: linear-gradient(90deg,#F59E0B 0%,#FDE68A 40%,#FBBF24 50%,#FDE68A 60%,#F59E0B 100%);
  background-size: 200% auto;
  animation: grp-shimmer 2.4s linear infinite;
}
.grp-badge-in { animation: grp-badge-in 0.44s cubic-bezier(0.34,1.56,0.64,1) 0.70s both; }
.grp-cta-idle { animation: grp-cta-lift 2.8s ease-in-out 1.1s infinite; }
.grp-halo     { animation: grp-halo-pulse 3s ease-in-out infinite; }
`;

/* ── Props ──────────────────────────────────────────────────────────────────── */
interface Props {
  googleReviewsUrl: string;
  delay: number;
  frequency: string;
  repeatDays: number;
  locale: string;
  primaryColor?: string;
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function GoogleReviewPopup({
  googleReviewsUrl,
  delay,
  frequency,
  repeatDays,
  locale,
  primaryColor = '#F59E0B',
  googleRating,
  googleReviewCount,
}: Props) {
  const [visible,    setVisible]    = useState(false);
  const [closing,    setClosing]    = useState(false);
  const [starsReady, setStarsReady] = useState(false);

  /* Inject CSS once */
  useEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-grp', '1');
    el.textContent = POPUP_CSS;
    if (!document.querySelector('[data-grp]')) document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);

  /* Visibility logic (unchanged) */
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY_CLICKED)) return;
      if (frequency === 'once' && localStorage.getItem(KEY_DISMISSED)) return;
      if (frequency === 'repeat') {
        const d = localStorage.getItem(KEY_DISMISSED);
        if (d && Date.now() - parseInt(d) < repeatDays * 86_400_000) return;
      }
    } catch {}
    const t = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setStarsReady(true), 300);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [delay, frequency, repeatDays]);

  function dismiss() {
    setClosing(true);
    try {
      if (frequency !== 'always') localStorage.setItem(KEY_DISMISSED, Date.now().toString());
    } catch {}
    setTimeout(() => setVisible(false), 340);
  }

  function openReview() {
    try { localStorage.setItem(KEY_CLICKED, '1'); } catch {}
    const url = /^https?:\/\//i.test(googleReviewsUrl) ? googleReviewsUrl : `https://${googleReviewsUrl}`;
    window.open(url, '_blank', 'noopener');
    setClosing(true);
    setTimeout(() => setVisible(false), 340);
  }

  if (!visible) return null;

  const L    = LABELS[(locale as keyof typeof LABELS)] ?? LABELS.fr;
  const hasR = !!(googleRating && googleReviewCount && googleReviewCount > 0);

  /* Floating sparkle positions */
  const floats = [
    { cls: 'grp-f1', style: { left: '2%',  top: '30%',  fontSize: 12 } },
    { cls: 'grp-f2', style: { right: '4%', top: '15%',  fontSize: 10 } },
    { cls: 'grp-f3', style: { left: '20%', top: '-12%', fontSize: 8  } },
    { cls: 'grp-f4', style: { right:'18%', top: '-8%',  fontSize: 11 } },
    { cls: 'grp-f5', style: { left: '46%', top: '-18%', fontSize: 7  } },
    { cls: 'grp-f6', style: { right:'32%', top: '5%',   fontSize: 9  } },
  ];

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────────── */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 199,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          animation: 'grp-backdrop-in 0.3s ease both',
          opacity: closing ? 0 : undefined,
          transition: closing ? 'opacity 0.32s' : undefined,
        }}
      />

      {/* ── Card wrapper ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 16px 28px',
        pointerEvents: 'none',
      }}>
        <div
          className={closing ? 'grp-card-leave' : 'grp-card-enter'}
          style={{ width: '100%', maxWidth: 368, pointerEvents: 'auto' }}
        >
          {/* ── Card ───────────────────────────────────────────────────────── */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 30,
            overflow: 'hidden',
            boxShadow: '0 36px 90px rgba(0,0,0,0.26), 0 10px 28px rgba(0,0,0,0.12)',
            position: 'relative',
          }}>

            {/* Shimmer top strip */}
            <div className="grp-shimmer-bar" style={{ height: 5 }} />

            {/* Close ✕ */}
            <button
              onClick={dismiss}
              aria-label="Fermer"
              style={{
                position: 'absolute', top: 15, right: 15, zIndex: 3,
                width: 30, height: 30, borderRadius: '50%',
                background: '#F3F4F6', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#9CA3AF', fontWeight: 800,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#E5E7EB', color: '#4B5563' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#F3F4F6', color: '#9CA3AF' })}
            >✕</button>

            <div style={{ padding: '30px 28px 26px' }}>

              {/* ── Stars zone ─────────────────────────────────────────────── */}
              <div style={{ position: 'relative', textAlign: 'center', marginBottom: 22 }}>

                {/* Radial glow halo */}
                <div
                  className="grp-halo"
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 180, height: 80,
                    transform: 'translate(-50%,-50%)',
                    background: 'radial-gradient(ellipse, rgba(251,191,36,0.24) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                  }}
                />

                {/* Floating mini sparkles */}
                {starsReady && (
                  <div style={{ position: 'absolute', inset: '-10px -24px', overflow: 'visible', pointerEvents: 'none' }}>
                    {floats.map(({ cls, style }) => (
                      <span key={cls} className={cls} style={{ position: 'absolute', color: '#FCD34D', lineHeight: 1, ...style }}>★</span>
                    ))}
                  </div>
                )}

                {/* ★ ★ ★ ★ ★ */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, position: 'relative' }}>
                  {([1, 2, 3, 4, 5] as const).map(i => (
                    <span
                      key={i}
                      className={starsReady ? `grp-s${i}` : ''}
                      style={{
                        fontSize: 42,
                        lineHeight: 1,
                        display: 'inline-block',
                        color: '#F59E0B',
                        opacity: starsReady ? 1 : 0,
                      }}
                    >★</span>
                  ))}
                </div>
              </div>

              {/* Eyebrow */}
              <p style={{
                textAlign: 'center', marginBottom: 5,
                fontSize: 11, fontWeight: 700,
                letterSpacing: '0.11em', textTransform: 'uppercase',
                color: primaryColor,
              }}>{L.eyebrow}</p>

              {/* Title */}
              <h3 style={{
                textAlign: 'center', margin: '0 0 10px',
                fontSize: 22, fontWeight: 900, color: '#111',
                letterSpacing: '-0.4px', lineHeight: 1.15,
              }}>{L.title}</h3>

              {/* Subtitle */}
              <p style={{
                textAlign: 'center', margin: '0 0 20px',
                fontSize: 14.5, color: '#6B7280',
                lineHeight: 1.65, whiteSpace: 'pre-line',
              }}>{L.subtitle}</p>

              {/* Rating badge */}
              {hasR && (
                <div
                  className="grp-badge-in"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    background: 'rgba(251,191,36,0.09)',
                    border: '1px solid rgba(251,191,36,0.30)',
                    borderRadius: 14, padding: '9px 18px', marginBottom: 18,
                  }}
                >
                  <span style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} style={{ fontSize: 12, color: (googleRating as number) >= i ? '#F59E0B' : '#D1D5DB' }}>★</span>
                    ))}
                  </span>
                  <span style={{ fontWeight: 800, color: '#92400E', fontSize: 14 }}>
                    {(googleRating as number).toFixed(1)}
                  </span>
                  <span style={{ color: '#D1D5DB', fontSize: 12 }}>·</span>
                  <span style={{ color: '#6B7280', fontSize: 13 }}>
                    {(googleReviewCount as number).toLocaleString('fr-FR')} {L.badge}
                  </span>
                </div>
              )}

              {/* CTA button */}
              <button
                onClick={openReview}
                className={starsReady ? 'grp-cta-idle' : ''}
                style={{
                  width: '100%', padding: '15px 20px', borderRadius: 18,
                  border: 'none', cursor: 'pointer',
                  background: `linear-gradient(110deg, ${primaryColor} 30%, color-mix(in srgb,${primaryColor} 65%,#fff 35%) 50%, ${primaryColor} 70%)`,
                  backgroundSize: '200% auto',
                  animation: starsReady
                    ? `grp-shimmer 2.6s linear infinite, grp-cta-lift 2.8s ease-in-out 1.1s infinite`
                    : 'grp-shimmer 2.6s linear infinite',
                  fontSize: 15, fontWeight: 800, color: '#fff',
                  letterSpacing: '-0.2px',
                  boxShadow: `0 4px 20px ${primaryColor}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.animation = 'grp-shimmer 2.6s linear infinite';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 28px ${primaryColor}77`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.animation = starsReady
                    ? `grp-shimmer 2.6s linear infinite, grp-cta-lift 2.8s ease-in-out 1.1s infinite`
                    : 'grp-shimmer 2.6s linear infinite';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${primaryColor}55`;
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.animation = 'grp-shimmer 2.6s linear infinite'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>⭐</span>
                {L.cta}
              </button>

              {/* Later */}
              <button
                onClick={dismiss}
                style={{
                  width: '100%', padding: '11px', marginTop: 7,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#B0B7C0', fontWeight: 500,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#6B7280'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#B0B7C0'; }}
              >{L.later}</button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
