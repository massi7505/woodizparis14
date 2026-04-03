'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { CloseIcon } from '@/components/ui/icons';

interface Props {
  product: any;
  category: any;
  locale: string;
  onClose: () => void;
  primaryColor: string;
}

const ALLERGEN_LABELS: Record<string, Record<string, string>> = {
  fr: { gluten: 'Gluten', lactose: 'Lactose', eggs: 'Œufs', fish: 'Poisson', shellfish: 'Crustacés', peanuts: 'Arachides', nuts: 'Fruits à coque', celery: 'Céleri', mustard: 'Moutarde', sesame: 'Sésame', sulfites: 'Sulfites', lupin: 'Lupin', molluscs: 'Mollusques', soya: 'Soja', soy: 'Soja' },
  en: { gluten: 'Gluten', lactose: 'Lactose', eggs: 'Eggs', fish: 'Fish', shellfish: 'Shellfish', peanuts: 'Peanuts', nuts: 'Tree Nuts', celery: 'Celery', mustard: 'Mustard', sesame: 'Sesame', sulfites: 'Sulphites', lupin: 'Lupin', molluscs: 'Molluscs', soya: 'Soya', soy: 'Soya' },
  it: { gluten: 'Glutine', lactose: 'Lattosio', eggs: 'Uova', fish: 'Pesce', shellfish: 'Crostacei', peanuts: 'Arachidi', nuts: 'Frutta a guscio', celery: 'Sedano', mustard: 'Senape', sesame: 'Sesamo', sulfites: 'Solfiti', lupin: 'Lupini', molluscs: 'Molluschi', soya: 'Soia', soy: 'Soia' },
  es: { gluten: 'Gluten', lactose: 'Lactosa', eggs: 'Huevos', fish: 'Pescado', shellfish: 'Mariscos', peanuts: 'Cacahuetes', nuts: 'Frutos secos', celery: 'Apio', mustard: 'Mostaza', sesame: 'Sésamo', sulfites: 'Sulfitos', lupin: 'Altramuz', molluscs: 'Moluscos', soya: 'Soja', soy: 'Soja' },
};

const MODAL_LABELS: Record<string, Record<string, string>> = {
  fr: { allergens: 'Contient', close: 'Fermer', outOfStock: 'Rupture de stock' },
  en: { allergens: 'Contains', close: 'Close', outOfStock: 'Out of stock' },
  it: { allergens: 'Contiene', close: 'Chiudi', outOfStock: 'Esaurito' },
  es: { allergens: 'Contiene', close: 'Cerrar', outOfStock: 'Agotado' },
};

export default function ProductModal({ product, category, locale, onClose, primaryColor }: Props) {
  const t = product.translations[0];
  const catT = category.translations[0];
  const allergens: string[] = (() => {
    if (!product.allergens) return [];
    try { return JSON.parse(product.allergens); } catch { return []; }
  })();
  const L = MODAL_LABELS[locale] || MODAL_LABELS.fr;
  const allergenLabels = ALLERGEN_LABELS[locale] || ALLERGEN_LABELS.fr;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={t?.name || ''} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-amber-50 to-orange-100">
              🍕
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <CloseIcon className="w-5 h-5 text-white" />
          </button>

          {/* Category badge */}
          {catT && (
            <div className="absolute bottom-3 left-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-700">
                {catT.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-xl font-black text-gray-900">{t?.name}</h2>
          {t?.description && (
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">{t.description}</p>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mt-4">
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {parseFloat(product.comparePrice).toFixed(2)}€
              </span>
            )}
            <span
              className="text-3xl font-black"
              style={{ color: product.isOutOfStock ? '#9CA3AF' : primaryColor }}
            >
              {parseFloat(product.price).toFixed(2)}€
            </span>
            {product.isOutOfStock && (
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {L.outOfStock}
              </span>
            )}
          </div>

          {/* Allergens — texte uniquement, visible dans le modal */}
          {allergens.length > 0 && (
            <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1.5">{L.allergens}</p>
              <p className="text-sm text-amber-900 leading-relaxed">
                {allergens.map(a => allergenLabels[a] || a).join(', ')}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {L.close}
          </button>
        </div>
      </div>
    </div>
  );
}
