'use client';

import { useState } from 'react';

interface OrderLink { label: string; url: string; icon?: string | null }

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

const PLATFORM_CONFIG: Record<string, { icon: string; bg: string; text: string }> = {
  ubereats:   { icon: '🖤', bg: '#000000', text: '#ffffff' },
  uber:       { icon: '🖤', bg: '#000000', text: '#ffffff' },
  deliveroo:  { icon: '🟦', bg: '#00CCBC', text: '#ffffff' },
  delicity:   { icon: '📱', bg: '#6366F1', text: '#ffffff' },
  phone:      { icon: '📞', bg: '#22C55E', text: '#ffffff' },
  téléphone:  { icon: '📞', bg: '#22C55E', text: '#ffffff' },
  telephone:  { icon: '📞', bg: '#22C55E', text: '#ffffff' },
  itinéraire: { icon: '📍', bg: '#EF4444', text: '#ffffff' },
  itineraire: { icon: '📍', bg: '#EF4444', text: '#ffffff' },
  maps:       { icon: '📍', bg: '#EF4444', text: '#ffffff' },
  glovo:      { icon: '🟡', bg: '#FFC244', text: '#111827' },
  justeat:    { icon: '🍽️', bg: '#FF8000', text: '#ffffff' },
  'just eat': { icon: '🍽️', bg: '#FF8000', text: '#ffffff' },
};

function getPlatformStyle(label: string): { icon: string; bg: string; text: string } {
  const key = label.toLowerCase().replace(/\s+/g, '');
  for (const [k, v] of Object.entries(PLATFORM_CONFIG)) {
    if (key.includes(k.replace(/\s+/g, ''))) return v;
  }
  return { icon: '🔗', bg: '#374151', text: '#ffffff' };
}

export default function OrderModeBar({ emporterLinks, livraisonLinks, primaryColor, locale }: Props) {
  const [mode, setMode] = useState<'emporter' | 'livraison'>('emporter');
  const L = LABELS[locale] || LABELS.fr;
  const links = mode === 'emporter' ? emporterLinks : livraisonLinks;

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">

          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 flex-shrink-0" style={{ fontSize: '0.75rem' }}>
            <button
              onClick={() => setMode('emporter')}
              className="px-3 py-1.5 font-semibold transition-all flex items-center gap-1.5"
              style={mode === 'emporter'
                ? { backgroundColor: primaryColor, color: '#fff' }
                : { backgroundColor: '#fff', color: '#6B7280' }}
            >
              🥡 {L.emporter}
            </button>
            <button
              onClick={() => setMode('livraison')}
              className="px-3 py-1.5 font-semibold transition-all flex items-center gap-1.5"
              style={mode === 'livraison'
                ? { backgroundColor: primaryColor, color: '#fff' }
                : { backgroundColor: '#fff', color: '#6B7280' }}
            >
              🛵 {L.livraison}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-1.5">
            {links.length === 0 ? (
              <span className="text-xs text-gray-400 italic py-1.5">—</span>
            ) : links.map((link, i) => {
              const style = getPlatformStyle(link.label);
              const isPhone = link.url.startsWith('tel:');
              const isMaps = link.url.startsWith('http') && (link.label.toLowerCase().includes('itin') || link.label.toLowerCase().includes('maps'));
              return (
                <a
                  key={i}
                  href={link.url}
                  target={isPhone ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-85 active:scale-95"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  <span>{link.icon || style.icon}</span>
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
