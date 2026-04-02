'use client';

import { useState, useEffect, useRef } from 'react';

interface OrderLink {
  label: string;
  url: string;
  icon?: string | null;
  iconUrl?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
}

interface Props {
  emporterLinks: OrderLink[];
  livraisonLinks: OrderLink[];
  primaryColor: string;
  locale: string;
}

const LABELS: Record<string, { emporter: string; livraison: string; headline: string }> = {
  fr: { emporter: 'À emporter', livraison: 'Livraison', headline: 'Commandez en ligne' },
  en: { emporter: 'Takeaway', livraison: 'Delivery', headline: 'Order online' },
  it: { emporter: 'Da asporto', livraison: 'Consegna', headline: 'Ordina online' },
  es: { emporter: 'Para llevar', livraison: 'Entrega', headline: 'Pedir online' },
};

function platformStyle(label: string, url: string) {
  const key = (label + url).toLowerCase();
  if (key.includes('ubereats') || (key.includes('uber') && key.includes('eat'))) return { emoji: '🖤', bg: '#000000', text: '#ffffff' };
  if (key.includes('deliveroo')) return { emoji: '🛵', bg: '#00CCBC', text: '#ffffff' };
  if (key.includes('delicity')) return { emoji: '📱', bg: '#6366F1', text: '#ffffff' };
  if (key.includes('tel:') || key.includes('téléphone') || key.includes('telephone')) return { emoji: '📞', bg: '#22C55E', text: '#ffffff' };
  if (key.includes('itin') || key.includes('maps') || key.includes('adresse')) return { emoji: '📍', bg: '#EF4444', text: '#ffffff' };
  if (key.includes('glovo')) return { emoji: '🟡', bg: '#FFC244', text: '#111827' };
  return { emoji: '🔗', bg: '#374151', text: '#ffffff' };
}

function LinkButton({ link, size, onClick }: { link: OrderLink; size: 'sm' | 'lg'; onClick?: () => void }) {
  const ps = platformStyle(link.label, link.url);
  const bg = link.bgColor || ps.bg;
  const text = link.textColor || ps.text;
  const isPhone = link.url.startsWith('tel:');

  if (size === 'lg') {
    return (
      <a
        href={link.url}
        target={isPhone ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={() => onClick?.()}
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all hover:opacity-85 active:scale-95 select-none"
        style={{ backgroundColor: bg, color: text }}
      >
        {link.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.iconUrl} alt={link.label} className="w-8 h-8 object-contain rounded" />
        ) : (
          <span className="text-2xl leading-none">{ps.emoji}</span>
        )}
        <span className="text-xs font-semibold text-center leading-tight">{link.label}</span>
      </a>
    );
  }

  return (
    <a
      href={link.url}
      target={isPhone ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={() => onClick?.()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-85 active:scale-95 whitespace-nowrap select-none"
      style={{ backgroundColor: bg, color: text }}
    >
      {link.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.iconUrl} alt="" className="w-4 h-4 object-contain rounded-sm flex-shrink-0" />
      ) : (
        <span className="text-sm leading-none">{ps.emoji}</span>
      )}
      {link.label}
    </a>
  );
}

/** Shared logic: handles open/close, direct link if only 1 option */
function useModeDropdown(links: OrderLink[]) {
  const [open, setOpen] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (links.length === 0) return;
    if (links.length === 1) {
      // Navigate directly — don't open a dropdown
      const isPhone = links[0].url.startsWith('tel:');
      if (isPhone) { window.location.href = links[0].url; }
      else { window.open(links[0].url, '_blank', 'noopener,noreferrer'); }
      return;
    }
    e.stopPropagation();
    setOpen(prev => !prev);
  }

  function closeAfterLink() {
    setTimeout(() => setOpen(false), 150);
  }

  return { open, setOpen, handleClick, closeAfterLink };
}

/* ─────────────────────────────────────────────────────────────
   MOBILE version — full-width bar matching the reference design
   ───────────────────────────────────────────────────────────── */
export function OrderModeBarMobile({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const L = LABELS[locale] || LABELS.fr;
  const livraisonColor = primaryColor;
  const emporterColor = '#EF4444';

  const livraison = useModeDropdown(livraisonLinks);
  const emporter = useModeDropdown(emporterLinks);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close both dropdowns on outside click
  useEffect(() => {
    if (!livraison.open && !emporter.open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        livraison.setOpen(false);
        emporter.setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside as any);
    };
  }, [livraison, emporter]);

  const cols = (links: OrderLink[]) => links.length <= 2 ? 2 : links.length <= 4 ? 2 : 3;

  return (
    <div ref={containerRef} className="relative" style={{ backgroundColor: '#111827' }}>
      {/* Headline + two mode buttons */}
      <div className="px-3 py-2 flex flex-col gap-2">
        {/* Headline */}
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {L.headline}
        </p>

        {/* Two mode buttons */}
        <div className="flex items-stretch gap-0 rounded-xl overflow-hidden" style={{ minHeight: '48px' }}>
          {/* Livraison */}
          <button
            onClick={e => { emporter.setOpen(false); livraison.handleClick(e); }}
            className="flex-1 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide transition-all active:brightness-90 select-none"
            style={{ backgroundColor: livraisonColor, color: '#fff' }}
          >
            <span className="text-lg">🛵</span>
            {L.livraison}
            {livraisonLinks.length > 1 && (
              <span className="text-[10px] opacity-70">{livraison.open ? '▲' : '▼'}</span>
            )}
          </button>

          {/* OU badge */}
          <div
            className="flex-shrink-0 flex items-center justify-center text-xs font-black z-10"
            style={{ width: '30px', backgroundColor: '#1F2937', color: '#9CA3AF' }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ backgroundColor: '#374151', color: '#D1D5DB', border: '2px solid #4B5563' }}
            >
              OU
            </span>
          </div>

          {/* Emporter */}
          <button
            onClick={e => { livraison.setOpen(false); emporter.handleClick(e); }}
            className="flex-1 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide transition-all active:brightness-90 select-none"
            style={{ backgroundColor: emporterColor, color: '#fff' }}
          >
            <span className="text-lg">🥡</span>
            {L.emporter}
            {emporterLinks.length > 1 && (
              <span className="text-[10px] opacity-70">{emporter.open ? '▲' : '▼'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Livraison dropdown */}
      {livraison.open && livraisonLinks.length > 1 && (
        <div className="absolute top-full left-0 right-0 z-50 shadow-2xl border-t border-gray-700" style={{ backgroundColor: '#111827' }}>
          <div
            className="grid gap-2 p-3"
            style={{ gridTemplateColumns: `repeat(${cols(livraisonLinks)}, 1fr)` }}
          >
            {livraisonLinks.map((link, i) => (
              <LinkButton key={i} link={link} size="lg" onClick={livraison.closeAfterLink} />
            ))}
          </div>
        </div>
      )}

      {/* Emporter dropdown */}
      {emporter.open && emporterLinks.length > 1 && (
        <div className="absolute top-full left-0 right-0 z-50 shadow-2xl border-t border-gray-700" style={{ backgroundColor: '#111827' }}>
          <div
            className="grid gap-2 p-3"
            style={{ gridTemplateColumns: `repeat(${cols(emporterLinks)}, 1fr)` }}
          >
            {emporterLinks.map((link, i) => (
              <LinkButton key={i} link={link} size="lg" onClick={emporter.closeAfterLink} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DESKTOP version — compact inline bar in the header
   ───────────────────────────────────────────────────────────── */
export function OrderModeBarDesktop({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const L = LABELS[locale] || LABELS.fr;
  const livraisonColor = primaryColor;
  const emporterColor = '#EF4444';

  const livraison = useModeDropdown(livraisonLinks);
  const emporter = useModeDropdown(emporterLinks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!livraison.open && !emporter.open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        livraison.setOpen(false);
        emporter.setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [livraison, emporter]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Headline */}
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mr-2 whitespace-nowrap hidden lg:block">
        {L.headline}
      </span>

      {/* Combined pill */}
      <div className="flex items-stretch rounded-lg overflow-hidden" style={{ height: '30px' }}>
        {/* Livraison */}
        <button
          onClick={e => { emporter.setOpen(false); livraison.handleClick(e); }}
          className="flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wide transition-all hover:brightness-110 active:brightness-90 select-none whitespace-nowrap"
          style={{ backgroundColor: livraisonColor, color: '#fff' }}
        >
          🛵 {L.livraison}
          {livraisonLinks.length > 1 && (
            <span className="text-[9px] opacity-70 ml-0.5">{livraison.open ? '▲' : '▼'}</span>
          )}
        </button>

        {/* OU badge */}
        <div
          className="flex items-center justify-center text-[9px] font-black px-1"
          style={{ backgroundColor: '#1F2937', color: '#6B7280' }}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black"
            style={{ backgroundColor: '#374151', color: '#D1D5DB' }}
          >
            OU
          </span>
        </div>

        {/* Emporter */}
        <button
          onClick={e => { livraison.setOpen(false); emporter.handleClick(e); }}
          className="flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wide transition-all hover:brightness-110 active:brightness-90 select-none whitespace-nowrap"
          style={{ backgroundColor: emporterColor, color: '#fff' }}
        >
          🥡 {L.emporter}
          {emporterLinks.length > 1 && (
            <span className="text-[9px] opacity-70 ml-0.5">{emporter.open ? '▲' : '▼'}</span>
          )}
        </button>
      </div>

      {/* Livraison dropdown */}
      {livraison.open && livraisonLinks.length > 1 && (
        <div
          className="absolute top-full mt-1 right-0 z-50 rounded-xl shadow-2xl border border-gray-700 p-2 min-w-[200px]"
          style={{ backgroundColor: '#111827' }}
        >
          <div className="flex flex-col gap-1.5">
            {livraisonLinks.map((link, i) => (
              <LinkButton key={i} link={link} size="sm" onClick={livraison.closeAfterLink} />
            ))}
          </div>
        </div>
      )}

      {/* Emporter dropdown */}
      {emporter.open && emporterLinks.length > 1 && (
        <div
          className="absolute top-full mt-1 right-0 z-50 rounded-xl shadow-2xl border border-gray-700 p-2 min-w-[200px]"
          style={{ backgroundColor: '#111827' }}
        >
          <div className="flex flex-col gap-1.5">
            {emporterLinks.map((link, i) => (
              <LinkButton key={i} link={link} size="sm" onClick={emporter.closeAfterLink} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Default export: renders both with appropriate breakpoint classes */
export default function OrderModeBar(props: Props) {
  return (
    <>
      <div className="sm:hidden">
        <OrderModeBarMobile {...props} />
      </div>
      <div className="hidden sm:flex">
        <OrderModeBarDesktop {...props} />
      </div>
    </>
  );
}
