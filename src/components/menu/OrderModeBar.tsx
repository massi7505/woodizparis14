'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { autoTextColor } from '@/lib/color';

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
  livraisonModeIconUrl?: string | null;
  emporterModeIconUrl?: string | null;
}

const LABELS: Record<string, { emporter: string; livraison: string; headline: string }> = {
  fr: { emporter: 'À emporter', livraison: 'Livraison', headline: 'Commandez en ligne' },
  en: { emporter: 'Takeaway', livraison: 'Delivery', headline: 'Order online' },
  it: { emporter: 'Da asporto', livraison: 'Consegna', headline: 'Ordina online' },
  es: { emporter: 'Para llevar', livraison: 'Entrega', headline: 'Pedir online' },
};

function platformStyle(label: string, url: string) {
  const key = (label + url).toLowerCase();
  if (key.includes('ubereats') || (key.includes('uber') && key.includes('eat')))
    return { emoji: '🛍️', bg: '#000000', text: '#ffffff' };
  if (key.includes('deliveroo'))
    return { emoji: '🛵', bg: '#00CCBC', text: '#ffffff' };
  if (key.includes('delicity'))
    return { emoji: '📱', bg: '#6366F1', text: '#ffffff' };
  if (key.includes('tel:') || key.includes('téléphone') || key.includes('telephone'))
    return { emoji: '📞', bg: '#16A34A', text: '#ffffff' };
  if (key.includes('itin') || key.includes('maps') || key.includes('adresse'))
    return { emoji: '📍', bg: '#DC2626', text: '#ffffff' };
  if (key.includes('glovo'))
    return { emoji: '⚡', bg: '#FFC244', text: '#111827' };
  if (key.includes('just') && key.includes('eat'))
    return { emoji: '🍔', bg: '#FF8000', text: '#ffffff' };
  return { emoji: '🔗', bg: '#374151', text: '#ffffff' };
}

function useModeDropdown(links: OrderLink[]) {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (links.length === 0) return;
    if (links.length === 1) {
      const isPhone = links[0].url.startsWith('tel:');
      if (isPhone) { window.location.href = links[0].url; }
      else { window.open(links[0].url, '_blank', 'noopener,noreferrer'); }
      return;
    }
    e.stopPropagation();
    setOpen(prev => !prev);
  }, [links]);

  const closeAfterLink = useCallback(() => {
    setTimeout(() => setOpen(false), 180);
  }, []);

  return { open, setOpen, handleClick, closeAfterLink };
}

function PlatformCard({ link, onClick }: { link: OrderLink; onClick: () => void }) {
  const ps = platformStyle(link.label, link.url);
  const bg = link.bgColor || ps.bg;
  const text = link.textColor || ps.text;
  const isPhone = link.url.startsWith('tel:');

  return (
    <a
      href={link.url}
      target={isPhone ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] select-none group"
      style={{ backgroundColor: bg }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
        {link.iconUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={link.iconUrl} alt={link.label} className="w-7 h-7 object-contain" />
          : <span className="text-xl leading-none">{ps.emoji}</span>
        }
      </div>
      <span className="flex-1 font-semibold text-sm tracking-wide" style={{ color: text }}>
        {link.label}
      </span>
      <svg className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:translate-x-0.5 transition-transform"
        style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

/* ═══════════════════════════════════
   MOBILE
═══════════════════════════════════ */
export function OrderModeBarMobile({
  emporterLinks, livraisonLinks, primaryColor, locale,
  livraisonModeIconUrl, emporterModeIconUrl,
}: Props) {
  const L = LABELS[locale] || LABELS.fr;
  // DESIGN IMPROVEMENT: use primaryColor instead of hardcoded black
  const livraisonColor = primaryColor;
  const emporterColor = primaryColor;

  const livraison = useModeDropdown(livraisonLinks);
  const emporter  = useModeDropdown(emporterLinks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!livraison.open && !emporter.open) return;
    const setL = livraison.setOpen;
    const setE = emporter.setOpen;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setL(false); setE(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside as any);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside as any);
    };
  }, [livraison.open, emporter.open, livraison.setOpen, emporter.setOpen]);

  const activeLinks = livraison.open ? livraisonLinks : emporter.open ? emporterLinks : [];
  const activeClose = livraison.open ? livraison.closeAfterLink : emporter.closeAfterLink;

  return (
    <div ref={containerRef} className="relative bg-white border-b border-gray-100 shadow-sm">

      {/* ── Headline ── */}
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 pt-2 pb-0">
        {L.headline}
      </p>

      {/* ── Mode buttons ── */}
      <div className="flex items-center gap-2 px-3 py-2">

        {/* Livraison */}
        <button
          onClick={e => { emporter.setOpen(false); livraison.handleClick(e); }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 select-none"
          style={{
            background: `linear-gradient(135deg, ${livraisonColor}, ${livraisonColor}cc)`,
            color: autoTextColor(livraisonColor),
            boxShadow: livraison.open ? `0 4px 16px ${livraisonColor}55` : `0 2px 8px ${livraisonColor}33`,
          }}
        >
          {livraisonModeIconUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={livraisonModeIconUrl} alt="" className="w-5 h-5 object-contain" />
            : <span className="text-base">🛵</span>
          }
          <span>{L.livraison}</span>
          {livraisonLinks.length > 1 && (
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${livraison.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* OU badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500 bg-white"
          style={{ border: '2px solid #e5e7eb' }}>
          OU
        </div>

        {/* À emporter */}
        <button
          onClick={e => { livraison.setOpen(false); emporter.handleClick(e); }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 select-none"
          style={{
            background: `linear-gradient(135deg, ${emporterColor}, ${emporterColor}cc)`,
            color: autoTextColor(emporterColor),
            boxShadow: emporter.open ? `0 4px 16px ${emporterColor}55` : `0 2px 8px ${emporterColor}33`,
          }}
        >
          {emporterModeIconUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={emporterModeIconUrl} alt="" className="w-5 h-5 object-contain" />
            : <span className="text-base">🥡</span>
          }
          <span>{L.emporter}</span>
          {emporterLinks.length > 1 && (
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${emporter.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Dropdown ── */}
      {(livraison.open || emporter.open) && activeLinks.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border-t border-gray-100 px-3 pb-3 pt-2"
          style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.12)', animation: 'omSlideDown 0.18s ease-out' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2 px-1">
            {livraison.open ? L.livraison : L.emporter}
          </p>
          <div className="flex flex-col gap-2">
            {activeLinks.map((link, i) => (
              <PlatformCard key={i} link={link} onClick={activeClose} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes omSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════
   DESKTOP
═══════════════════════════════════ */
export function OrderModeBarDesktop({
  emporterLinks, livraisonLinks, primaryColor, locale,
  livraisonModeIconUrl, emporterModeIconUrl,
}: Props) {
  const L = LABELS[locale] || LABELS.fr;
  // DESIGN IMPROVEMENT: use primaryColor instead of hardcoded black
  const livraisonColor = primaryColor;
  const emporterColor = primaryColor;

  const livraison = useModeDropdown(livraisonLinks);
  const emporter  = useModeDropdown(emporterLinks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!livraison.open && !emporter.open) return;
    const setL = livraison.setOpen;
    const setE = emporter.setOpen;
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setL(false); setE(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [livraison.open, emporter.open, livraison.setOpen, emporter.setOpen]);

  const activeLinks = livraison.open ? livraisonLinks : emporter.open ? emporterLinks : [];
  const activeClose = livraison.open ? livraison.closeAfterLink : emporter.closeAfterLink;

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {/* Headline */}
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 whitespace-nowrap hidden lg:block">
        {L.headline}
      </span>

      {/* Combined pill */}
      <div className="flex items-stretch rounded-xl overflow-hidden shadow-sm border border-gray-200" style={{ height: '32px' }}>
        {/* Livraison */}
        <button
          onClick={e => { emporter.setOpen(false); livraison.handleClick(e); }}
          className="flex items-center gap-1.5 px-3 text-xs font-bold tracking-wide transition-all hover:brightness-110 active:brightness-90 select-none whitespace-nowrap"
          style={{ background: `linear-gradient(135deg, ${livraisonColor}, ${livraisonColor}dd)`, color: autoTextColor(livraisonColor) }}
        >
          {livraisonModeIconUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={livraisonModeIconUrl} alt="" className="w-4 h-4 object-contain" />
            : <span>🛵</span>
          }
          {' '}{L.livraison}
          {livraisonLinks.length > 1 && (
            <svg className={`w-3 h-3 transition-transform ${livraison.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* OU */}
        <div className="flex items-center justify-center px-2 text-[9px] font-black text-gray-400 bg-gray-50 border-x border-gray-200">
          OU
        </div>

        {/* À emporter */}
        <button
          onClick={e => { livraison.setOpen(false); emporter.handleClick(e); }}
          className="flex items-center gap-1.5 px-3 text-xs font-bold tracking-wide transition-all hover:brightness-110 active:brightness-90 select-none whitespace-nowrap"
          style={{ background: `linear-gradient(135deg, ${emporterColor}, ${emporterColor}dd)`, color: autoTextColor(emporterColor) }}
        >
          {emporterModeIconUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={emporterModeIconUrl} alt="" className="w-4 h-4 object-contain" />
            : <span>🥡</span>
          }
          {' '}{L.emporter}
          {emporterLinks.length > 1 && (
            <svg className={`w-3 h-3 transition-transform ${emporter.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Dropdown */}
      {(livraison.open || emporter.open) && activeLinks.length > 0 && (
        <div className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-xl min-w-[220px]"
          style={{ animation: 'omSlideDown 0.15s ease-out' }}>
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-400 px-3 pt-3 pb-1">
            {livraison.open ? L.livraison : L.emporter}
          </p>
          <div className="flex flex-col gap-1.5 p-2 pt-0">
            {activeLinks.map((link, i) => (
              <PlatformCard key={i} link={link} onClick={activeClose} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderModeBar(props: Props) {
  return (
    <>
      <div className="sm:hidden"><OrderModeBarMobile {...props} /></div>
      <div className="hidden sm:flex"><OrderModeBarDesktop {...props} /></div>
    </>
  );
}
