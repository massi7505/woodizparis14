'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OrderLink { label: string; url: string; }
interface FooterLink { label: string; url: string; }
interface FooterCol  { title: string; items: FooterLink[] }
interface Props { site: any; locale: string; orderLinks?: OrderLink[]; emporterLinks?: OrderLink[]; livraisonLinks?: OrderLink[]; footerSettings?: any; }

function parseCol(raw: string | null | undefined, fallback: FooterCol): FooterCol {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function ensureUrl(url: string): string {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const FOOTER_COLS: Record<string, {
  menu: string; order: string; follow: string; subscribe: string;
  placeholder: string; subscribeBtn: string; subscribing: string;
  subscribeOk: string; subscribeErr: string;
}> = {
  fr: { menu: 'Notre Carte', order: 'Commander', follow: 'Nous suivre', subscribe: 'Newsletter', placeholder: 'Votre email', subscribeBtn: "S'abonner", subscribing: 'Envoi…', subscribeOk: 'Merci ! 🎉', subscribeErr: 'Erreur, réessayez.' },
  en: { menu: 'Our Menu', order: 'Order', follow: 'Follow us', subscribe: 'Newsletter', placeholder: 'Your email', subscribeBtn: 'Subscribe', subscribing: 'Sending…', subscribeOk: 'Thanks! 🎉', subscribeErr: 'Error, try again.' },
  it: { menu: 'Il Menu', order: 'Ordinare', follow: 'Seguici', subscribe: 'Newsletter', placeholder: 'La tua email', subscribeBtn: 'Iscriviti', subscribing: 'Invio…', subscribeOk: 'Grazie! 🎉', subscribeErr: 'Errore, riprova.' },
  es: { menu: 'Nuestra Carta', order: 'Pedir', follow: 'Síguenos', subscribe: 'Newsletter', placeholder: 'Tu email', subscribeBtn: 'Suscribirse', subscribing: 'Enviando…', subscribeOk: '¡Gracias! 🎉', subscribeErr: 'Error, inténtalo de nuevo.' },
};

function darken(hex: string, amount = 0.18): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#0a0a0a';
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function footerBg(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#0f172a';
  const lum = (parseInt(h.slice(0,2),16)*0.299 + parseInt(h.slice(2,4),16)*0.587 + parseInt(h.slice(4,6),16)*0.114) / 255;
  return lum > 0.4 ? '#0f172a' : darken(hex, 0.15);
}

export default function MenuFooter({ site, locale, orderLinks = [], emporterLinks = [], livraisonLinks = [], footerSettings }: Props) {
  const L = FOOTER_COLS[locale] || FOOTER_COLS.fr;
  const name = site?.siteName || 'Woodiz';
  const year = new Date().getFullYear();
  const primary = footerSettings?.accentColor || site?.primaryColor || '#F59E0B';
  const bg = footerBg(footerSettings?.bgColor || site?.backgroundColor || '#111827');
  const borderStyle = `1px solid ${primary}18`;

  // Footer columns from DB settings (with fallbacks)
  const col1 = parseCol(footerSettings?.col1Json, {
    title: L.menu,
    items: [
      { label: 'Base Tomate', url: locale === 'fr' ? '/menu' : `/${locale}/menu` },
      { label: 'Base Crème',  url: locale === 'fr' ? '/menu' : `/${locale}/menu` },
      { label: 'Boissons',    url: locale === 'fr' ? '/menu' : `/${locale}/menu` },
      { label: 'Notre Histoire', url: '/notre-histoire' },
    ],
  });
  const col2Raw = parseCol(footerSettings?.col2Json, { title: L.order, items: [] });
  // Fallback chain: col2Json items → emporterLinks + livraisonLinks → orderLinks
  const allOrderLinks = [...emporterLinks, ...livraisonLinks].filter(l => l.url);
  const col2FallbackItems = allOrderLinks.length > 0 ? allOrderLinks : orderLinks;
  const col2 = {
    ...col2Raw,
    title: col2Raw.title || L.order,
    items: col2Raw.items.length > 0 ? col2Raw.items : col2FallbackItems.map(l => ({ label: l.label, url: l.url })),
  };
  const col3 = parseCol(footerSettings?.col3Json, { title: '', items: [] });
  const copyright = (footerSettings?.copyright || `© ${year} ${name}. Tous droits réservés.`)
    .replace('{year}', String(year))
    .replace('{name}', name);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      setEmail('');
    } catch {
      setStatus('err');
    }
  }

  return (
    <footer style={{ backgroundColor: bg }} className="text-gray-400">
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* ── Brand ── */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              {site?.logoUrl ? (
                <Image src={site.logoUrl} alt={name} width={40} height={40} className="rounded-xl object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-900 font-black text-lg"
                  style={{ backgroundColor: primary }}>
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-black text-white text-sm">{name}</p>
                {site?.siteSlogan && <p className="text-xs text-gray-500 leading-tight">{site.siteSlogan}</p>}
              </div>
            </div>
            {site?.address && (
              <p className="text-xs leading-relaxed text-gray-500 mt-2">{site.address}</p>
            )}
            {site?.phoneNumber && (
              <a href={`tel:${site.phoneNumber}`}
                className="text-xs mt-2 block font-semibold hover:opacity-80 transition-opacity"
                style={{ color: primary }}>
                {site.phoneNumber}
              </a>
            )}

            {/* Social links */}
            <div className="flex gap-3 mt-4">
              {site?.instagramUrl && (
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {site?.googleMapsUrl && (
                <a href={site.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Google Maps"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EA4335"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── Column 1 (navigation) ── */}
          {(col1.items.length > 0 || col1.title) && (
            <div>
              {col1.title && <h3 className="text-white font-bold text-sm mb-4">{col1.title}</h3>}
              <div className="space-y-2 text-xs text-gray-500">
                {col1.items.map((link, i) => (
                  <a key={i} href={ensureUrl(link.url)} className="block hover:text-white transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Column 2 (liens personnalisés footer uniquement) ── */}
          {(col2.items.length > 0 || col2.title) && (
            <div>
              {col2.title && <h3 className="text-white font-bold text-sm mb-4">{col2.title}</h3>}
              <div className="space-y-2 text-xs text-gray-500">
                {col2.items.map((link, i) => (
                  <a key={`c2-${i}`} href={ensureUrl(link.url)} target="_blank" rel="noopener noreferrer"
                    className="block hover:text-white transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Column 3 (optional extra column) ── */}
          {(col3.items.length > 0 || col3.title) && (
            <div>
              {col3.title && <h3 className="text-white font-bold text-sm mb-4">{col3.title}</h3>}
              <div className="space-y-2 text-xs text-gray-500">
                {col3.items.map((link, i) => (
                  <a key={i} href={ensureUrl(link.url)} className="block hover:text-white transition-colors">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Subscribe ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">
              {parseCol(footerSettings?.col4Json, { title: L.subscribe, items: [] }).title || L.subscribe}
            </h3>
            {status === 'ok' ? (
              <p className="text-sm font-semibold" style={{ color: primary }}>{L.subscribeOk}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (status === 'err') setStatus('idle'); }}
                  placeholder={L.placeholder}
                  required
                  className="w-full px-4 py-2.5 rounded-full text-sm text-white bg-white/8 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    '--tw-ring-color': primary,
                  } as React.CSSProperties}
                />
                {status === 'err' && (
                  <p className="text-xs text-red-400">{L.subscribeErr}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: primary, color: '#111827' }}
                >
                  {status === 'loading' ? L.subscribing : L.subscribeBtn}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 space-y-3" style={{ borderTop: borderStyle }}>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-gray-600">
            <a href="/legal/mentions-legales" className="hover:text-gray-400 transition-colors">Mentions légales</a>
            <a href="/legal/politique-confidentialite" className="hover:text-gray-400 transition-colors">Politique de confidentialité</a>
            <a href="/legal/politique-cookies" className="hover:text-gray-400 transition-colors">Politique de cookies</a>
            <a href="/legal/allergenes" className="hover:text-gray-400 transition-colors">Tableau des allergènes</a>
            <button
              type="button"
              onClick={() => (window as any).openAxeptioCookies?.()}
              className="hover:text-gray-400 transition-colors cursor-pointer"
            >
              🍪 Gérer les cookies
            </button>
          </div>
          <p className="text-center text-xs text-gray-600">
            Pour votre santé, évitez de grignoter entre les repas.{' '}
            <a href="https://www.mangerbouger.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500 transition-colors">
              www.mangerbouger.fr
            </a>
          </p>
          <p className="text-center text-xs text-gray-600">
            {copyright} · Développé par{' '}
            <a href="/" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: primary }}>AdsBooster</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
