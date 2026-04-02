'use client';

import { useState } from 'react';

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

const LABELS: Record<string, { emporter: string; livraison: string }> = {
  fr: { emporter: 'À emporter', livraison: 'En livraison' },
  en: { emporter: 'Takeaway', livraison: 'Delivery' },
  it: { emporter: 'Da asporto', livraison: 'Consegna' },
  es: { emporter: 'Para llevar', livraison: 'Entrega' },
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

function LinkButton({ link, size }: { link: OrderLink; size: 'sm' | 'lg' }) {
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
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all hover:opacity-85 active:scale-95"
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

  // sm: inline pill for desktop
  return (
    <a
      href={link.url}
      target={isPhone ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-85 active:scale-95 whitespace-nowrap"
      style={{ backgroundColor: bg, color: text, height: '28px' }}
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

/** Mobile version — standalone bar with white bg + shadow */
export function OrderModeBarMobile({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const [mode, setMode] = useState<'emporter' | 'livraison'>('emporter');
  const L = LABELS[locale] || LABELS.fr;
  const links = mode === 'emporter' ? emporterLinks : livraisonLinks;
  const cols = links.length <= 2 ? 2 : 3;

  return (
    <div className="bg-white shadow-sm border-b border-gray-100 p-3">
      {/* Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-3">
        <button
          onClick={() => setMode('emporter')}
          className="flex-1 py-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
          style={mode === 'emporter'
            ? { backgroundColor: primaryColor, color: '#fff' }
            : { backgroundColor: '#fff', color: '#6B7280' }}
        >
          🥡 {L.emporter}
        </button>
        <button
          onClick={() => setMode('livraison')}
          className="flex-1 py-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
          style={mode === 'livraison'
            ? { backgroundColor: primaryColor, color: '#fff' }
            : { backgroundColor: '#fff', color: '#6B7280' }}
        >
          🛵 {L.livraison}
        </button>
      </div>

      {/* Button grid */}
      {links.length === 0 ? (
        <p className="text-center text-xs text-gray-400 italic py-1">— Aucun lien —</p>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {links.map((link, i) => (
            <LinkButton key={i} link={link} size="lg" />
          ))}
        </div>
      )}
    </div>
  );
}

/** Desktop version — transparent, compact, inline for header */
export function OrderModeBarDesktop({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const [mode, setMode] = useState<'emporter' | 'livraison'>('emporter');
  const L = LABELS[locale] || LABELS.fr;
  const links = mode === 'emporter' ? emporterLinks : livraisonLinks;

  return (
    <div className="flex items-center gap-2">
      {/* Toggle pill */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
        <button
          onClick={() => setMode('emporter')}
          className="px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1"
          style={mode === 'emporter'
            ? { backgroundColor: primaryColor, color: '#fff' }
            : { backgroundColor: '#fff', color: '#6B7280' }}
        >
          🥡 {L.emporter}
        </button>
        <button
          onClick={() => setMode('livraison')}
          className="px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1"
          style={mode === 'livraison'
            ? { backgroundColor: primaryColor, color: '#fff' }
            : { backgroundColor: '#fff', color: '#6B7280' }}
        >
          🛵 {L.livraison}
        </button>
      </div>

      {/* Divider */}
      {links.length > 0 && <div className="w-px h-5 bg-gray-200 flex-shrink-0" />}

      {/* Link pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {links.length === 0 ? (
          <span className="text-xs text-gray-400 italic">—</span>
        ) : (
          links.map((link, i) => (
            <LinkButton key={i} link={link} size="sm" />
          ))
        )}
      </div>
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
