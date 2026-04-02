'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

const LABELS: Record<string, { emporter: string; livraison: string; headline: string; cta: string }> = {
  fr: { emporter: 'À emporter', livraison: 'Livraison', headline: 'Commandez en ligne', cta: 'Commander →' },
  en: { emporter: 'Takeaway', livraison: 'Delivery', headline: 'Order online', cta: 'Order →' },
  it: { emporter: 'Da asporto', livraison: 'Consegna', headline: 'Ordina online', cta: 'Ordina →' },
  es: { emporter: 'Para llevar', livraison: 'Entrega', headline: 'Pedir online', cta: 'Pedir →' },
};

function platformStyle(label: string, url: string) {
  const key = (label + url).toLowerCase();
  if (key.includes('ubereats') || (key.includes('uber') && key.includes('eat')))
    return { emoji: '🛍️', bg: '#000000', text: '#ffffff', accent: '#1a1a1a' };
  if (key.includes('deliveroo'))
    return { emoji: '🛵', bg: '#00CCBC', text: '#ffffff', accent: '#00b3a4' };
  if (key.includes('delicity'))
    return { emoji: '📱', bg: '#6366F1', text: '#ffffff', accent: '#4f46e5' };
  if (key.includes('tel:') || key.includes('téléphone') || key.includes('telephone'))
    return { emoji: '📞', bg: '#16A34A', text: '#ffffff', accent: '#15803d' };
  if (key.includes('itin') || key.includes('maps') || key.includes('adresse'))
    return { emoji: '📍', bg: '#DC2626', text: '#ffffff', accent: '#b91c1c' };
  if (key.includes('glovo'))
    return { emoji: '⚡', bg: '#FFC244', text: '#111827', accent: '#f5a700' };
  if (key.includes('just') && key.includes('eat'))
    return { emoji: '🍔', bg: '#FF8000', text: '#ffffff', accent: '#e07000' };
  return { emoji: '🔗', bg: '#374151', text: '#ffffff', accent: '#1f2937' };
}

/** Shared hook: handles open/close + direct navigation if only 1 link */
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

/** Single platform card — clean, modern, list-item style */
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
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
        style={{ backgroundColor: `rgba(255,255,255,0.15)` }}
      >
        {link.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.iconUrl} alt={link.label} className="w-7 h-7 object-contain" />
        ) : (
          <span className="text-xl leading-none">{ps.emoji}</span>
        )}
      </div>

      {/* Label */}
      <span
        className="flex-1 font-semibold text-sm tracking-wide"
        style={{ color: text }}
      >
        {link.label}
      </span>

      {/* Arrow */}
      <svg
        className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform"
        style={{ color: text }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOBILE
   ═══════════════════════════════════════════════════════════ */
export function OrderModeBarMobile({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const L = LABELS[locale] || LABELS.fr;
  const livraisonColor = primaryColor;
  const emporterColor = '#EF4444';

  const livraison = useModeDropdown(livraisonLinks);
  const emporter = useModeDropdown(emporterLinks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!livraison.open && !emporter.open) return;
    const setLivraisonOpen = livraison.setOpen;
    const setEmporterOpen = emporter.setOpen;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLivraisonOpen(false);
        setEmporterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside as any);
    };
  }, [livraison.open, emporter.open, livraison.setOpen, emporter.setOpen]);

  const activeLinks = livraison.open ? livraisonLinks : emporter.open ? emporterLinks : [];
  const activeClose = livraison.open ? livraison.closeAfterLink : emporter.closeAfterLink;

  return (
    <div ref={containerRef} className="relative" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>

      {/* ── Top bar ── */}
      <div className="px-4 pt-2.5 pb-0.5">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {L.headline}
        </p>
      </div>

      {/* ── Mode buttons ── */}
      <div className="flex gap-2.5 px-4 pb-3 pt-2">

        {/* Livraison */}
        <button
          onClick={e => { emporter.setOpen(false); livraison.handleClick(e); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-lg select-none"
          style={{
            background: livraison.open
              ? `linear-gradient(135deg, ${livraisonColor}, ${livraisonColor}cc)`
              : `linear-gradient(135deg, ${livraisonColor}ee, ${livraisonColor}bb)`,
            color: '#fff',
            boxShadow: livraison.open ? `0 4px 20px ${livraisonColor}66` : `0 2px 8px ${livraisonColor}44`,
          }}
        >
          <span className="text-base">🛵</span>
          <span>{L.livraison}</span>
          {livraisonLinks.length > 1 && (
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${livraison.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* OU */}
        <div className="flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            OU
          </div>
        </div>

        {/* À emporter */}
        <button
          onClick={e => { livraison.setOpen(false); emporter.handleClick(e); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-lg select-none"
          style={{
            background: emporter.open
              ? `linear-gradient(135deg, ${emporterColor}, ${emporterColor}cc)`
              : `linear-gradient(135deg, ${emporterColor}ee, ${emporterColor}bb)`,
            color: '#fff',
            boxShadow: emporter.open ? `0 4px 20px ${emporterColor}66` : `0 2px 8px ${emporterColor}44`,
          }}
        >
          <span className="text-base">🥡</span>
          <span>{L.emporter}</span>
          {emporterLinks.length > 1 && (
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${emporter.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Dropdown panel ── */}
      {(livraison.open || emporter.open) && activeLinks.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 px-4 pb-4 pt-2"
          style={{
            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            animation: 'slideDown 0.18s ease-out',
          }}
        >
          {/* Header of dropdown */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-2.5 px-1">
            {livraison.open ? `Choisir pour la ${L.livraison.toLowerCase()}` : `Choisir pour ${L.emporter.toLowerCase()}`}
          </p>

          {/* Platform cards */}
          <div className="flex flex-col gap-2">
            {activeLinks.map((link, i) => (
              <PlatformCard key={i} link={link} onClick={activeClose} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP
   ═══════════════════════════════════════════════════════════ */
export function OrderModeBarDesktop({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const L = LABELS[locale] || LABELS.fr;
  const livraisonColor = primaryColor;
  const emporterColor = '#EF4444';

  const livraison = useModeDropdown(livraisonLinks);
  const emporter = useModeDropdown(emporterLinks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!livraison.open && !emporter.open) return;
    const setLivraisonOpen = livraison.setOpen;
    const setEmporterOpen = emporter.setOpen;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLivraisonOpen(false);
        setEmporterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [livraison.open, emporter.open, livraison.setOpen, emporter.setOpen]);

  const activeLinks = livraison.open ? livraisonLinks : emporter.open ? emporterLinks : [];
  const activeClose = livraison.open ? livraison.closeAfterLink : emporter.closeAfterLink;

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">

      {/* Headline */}
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 whitespace-nowrap hidden lg:block">
        {L.headline}
      </span>

      {/* Combined pill */}
      <div className="flex items-stretch rounded-xl overflow-hidden shadow-md" style={{ height: '32px' }}>
        {/* Livraison */}
        <button
          onClick={e => { emporter.setOpen(false); livraison.handleClick(e); }}
          className="flex items-center gap-1.5 px-3 text-xs font-bold tracking-wide transition-all hover:brightness-110 active:brightness-90 select-none whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${livraisonColor}, ${livraisonColor}dd)`,
            color: '#fff',
          }}
        >
          🛵 {L.livraison}
          {livraisonLinks.length > 1 && (
            <svg className={`w-3 h-3 transition-transform ${livraison.open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* OU */}
        <div className="flex items-center justify-center px-2 text-[9px] font-black text-slate-400"
          style={{ background: '#1E293B' }}>
          OU
        </div>

        {/* À emporter */}
        <button
          onClick={e => { livraison.setOpen(false); emporter.handleClick(e); }}
          className="flex items-center gap-1.5 px-3 text-xs font-bold tracking-wide transition-all hover:brightness-110 active:brightness-90 select-none whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, ${emporterColor}, ${emporterColor}dd)`,
            color: '#fff',
          }}
        >
          🥡 {L.emporter}
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
        <div
          className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 min-w-[220px]"
          style={{
            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            animation: 'slideDown 0.15s ease-out',
          }}
        >
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500 px-3 pt-3 pb-1.5">
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
      <div className="sm:hidden">
        <OrderModeBarMobile {...props} />
      </div>
      <div className="hidden sm:flex">
        <OrderModeBarDesktop {...props} />
      </div>
    </>
  );
}
