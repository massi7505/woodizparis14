'use client';

import Image from 'next/image';
import { darkenToContrast, autoTextColor } from '@/lib/color';


interface Product {
  id: number;
  imageUrl?: string | null;
  price: any;
  comparePrice?: any;
  allergens?: string | null;
  badges?: string | null;
  isOutOfStock: boolean;
  translations: { name: string; description?: string | null }[];
}

interface Props {
  product: Product;
  locale: string;
  onClick: () => void;
  compact?: boolean;
  primaryColor: string;
  priority?: boolean;
}

const BADGE_STYLES: Record<string, { bg: string; label: Record<string, string>; icon?: string }> = {
  bestseller: { bg: '#92400E', label: { fr: 'Bestseller', en: 'Bestseller', it: 'Bestseller', es: 'Más vendido' }, icon: '⭐' },
  nouveau:    { bg: '#065F46', label: { fr: 'Nouveau', en: 'New', it: 'Nuovo', es: 'Nuevo' }, icon: '✨' },
  veggie:     { bg: '#065F46', label: { fr: 'Végétarien', en: 'Veggie', it: 'Vegetariano', es: 'Vegetariano' }, icon: '🌿' },
  piment:     { bg: '#991B1B', label: { fr: 'Pimenté', en: 'Spicy', it: 'Piccante', es: 'Picante' }, icon: '🌶️' },
  halal:      { bg: '#14532D', label: { fr: 'Halal', en: 'Halal', it: 'Halal', es: 'Halal' }, icon: '☪️' },
  chef:       { bg: '#5B21B6', label: { fr: "Chef's Choice", en: "Chef's Choice", it: 'Scelta Chef', es: 'Elección Chef' }, icon: '👨‍🍳' },
  classique:  { bg: '#1D4ED8', label: { fr: 'Classique', en: 'Classic', it: 'Classico', es: 'Clásico' } },
  partage:    { bg: '#C2410C', label: { fr: 'Partagé', en: 'Shared', it: 'Condiviso', es: 'Compartido' } },
};

const OUT_OF_STOCK: Record<string, string> = {
  fr: 'Rupture de stock', en: 'Out of stock', it: 'Esaurito', es: 'Agotado',
};

export default function ProductCard({ product, locale, onClick, compact = false, primaryColor, priority = false }: Props) {
  const t = product.translations[0];
  // FIX[BUG]: JSON.parse(product.badges) sans try/catch → crash si la valeur DB est un JSON invalide ou corrompu
  const badges: string[] = (() => {
    if (!product.badges) return [];
    try { return JSON.parse(product.badges); } catch { return []; }
  })();
  const firstBadge = badges[0];
  const badgeStyle = firstBadge ? BADGE_STYLES[firstBadge] : null;

  if (compact) {
    return (
      <button onClick={onClick} className="menu-card w-full text-left" disabled={product.isOutOfStock}>
        <div className="relative aspect-square">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={t?.name || ''} fill sizes="(max-width: 640px) calc(50vw - 12px), (max-width: 1024px) calc(33vw - 16px), 300px" quality={65} priority={priority} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl">🍕</div>
          )}
          {product.isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">{OUT_OF_STOCK[locale]}</span>
            </div>
          )}
          {badgeStyle && (
            <span
              className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: badgeStyle.bg, color: autoTextColor(badgeStyle.bg) }}
            >
              {badgeStyle.label[locale] || badgeStyle.label.fr}
            </span>
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{t?.name}</p>
          <p className="text-sm font-black text-gray-900 mt-1" style={{ color: darkenToContrast(primaryColor) }}>
            {parseFloat(product.price).toFixed(2)}€
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="menu-card w-full text-left group h-full flex flex-col"
      disabled={product.isOutOfStock}
    >
      {/* Image */}
      <div className="relative aspect-square">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={t?.name || ''}
            fill
            sizes="(max-width: 640px) calc(50vw - 12px), (max-width: 1024px) calc(33vw - 16px), 300px"
            quality={65}
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-4xl">
            🍕
          </div>
        )}

        {/* Out of stock */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {OUT_OF_STOCK[locale]}
            </span>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.slice(0, 2).map((badge: string) => {
              const bs = BADGE_STYLES[badge];
              if (!bs) return null;
              return (
                <span
                  key={badge}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow flex items-center gap-0.5"
                  style={{ backgroundColor: bs.bg, color: autoTextColor(bs.bg) }}
                >
                  {bs.icon && <span className="text-[11px]">{bs.icon}</span>}
                  {bs.label[locale] || bs.label.fr}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{t?.name}</h3>
        {t?.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{t.description}</p>
        )}


        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-2">
          {product.comparePrice && (
            <span className="text-xs text-gray-500 line-through">
              {parseFloat(product.comparePrice).toFixed(2)}€
            </span>
          )}
          <span className="text-base font-black" style={{ color: darkenToContrast(primaryColor) }}>
            {parseFloat(product.price).toFixed(2)}€
          </span>
        </div>
      </div>
    </button>
  );
}
