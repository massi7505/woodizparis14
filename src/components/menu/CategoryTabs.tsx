'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { darkenToContrast } from '@/lib/color';

interface Category {
  id: number;
  iconEmoji?: string | null;
  iconUrl?: string | null;
  translations: { name: string }[];
}

interface Props {
  categories: Category[];
  active: number | null;
  onSelect: (id: number) => void;
  locale: string;
  primaryColor: string;
}

export default function CategoryTabs({ categories, active, onSelect, locale, primaryColor }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasImages = categories.some(c => c.iconUrl);

  // Auto-scroll active tab into view when IntersectionObserver updates it
  useEffect(() => {
    if (active == null || !scrollRef.current) return;
    const btn = scrollRef.current.querySelector<HTMLElement>(`[data-tab-id="${active}"]`);
    if (!btn) return;
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  if (hasImages) {
    return (
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide px-1">
        {categories.map(cat => {
          const isActive = active === cat.id;
          const name = cat.translations[0]?.name || '—';
          return (
            <button
              key={cat.id}
              data-tab-id={cat.id}
              onClick={() => {
                onSelect(cat.id);
                const el = document.getElementById(`cat-${cat.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              {/* Image — rounded-2xl, no ring; active = scale up + colored glow */}
              <div
                className="relative w-14 h-14 rounded-2xl overflow-hidden transition-all duration-250"
                style={{
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isActive
                    ? `0 4px 14px ${primaryColor}55, 0 2px 6px rgba(0,0,0,0.08)`
                    : '0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                {cat.iconUrl ? (
                  <Image
                    src={cat.iconUrl}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">
                    {cat.iconEmoji || '🍽️'}
                  </div>
                )}
              </div>

              {/* Name */}
              <span
                className="text-[11px] font-semibold text-center leading-tight max-w-[70px] break-words transition-colors duration-200"
                style={{ color: isActive ? darkenToContrast(primaryColor) : '#374151' }}
              >
                {name}
              </span>

              {/* Animated indicator bar — expands when active */}
              <div
                style={{
                  height: '2.5px',
                  width: '20px',
                  borderRadius: '9999px',
                  backgroundColor: primaryColor,
                  opacity: isActive ? 1 : 0,
                  transform: `scaleX(${isActive ? 1 : 0.2})`,
                  transformOrigin: 'center',
                  transition: 'transform 300ms, opacity 300ms',
                }}
              />
            </button>
          );
        })}
      </div>
    );
  }

  // Fallback: pill style (no images)
  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map(cat => (
        <button
          key={cat.id}
          data-tab-id={cat.id}
          onClick={() => {
            onSelect(cat.id);
            const el = document.getElementById(`cat-${cat.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className={`category-pill flex-shrink-0 ${active === cat.id ? 'active' : 'inactive'}`}
          style={active === cat.id ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#111' } : {}}
        >
          {cat.iconEmoji && <span className="flex-shrink-0">{cat.iconEmoji}</span>}
          {cat.translations[0]?.name || '—'}
        </button>
      ))}
    </div>
  );
}
