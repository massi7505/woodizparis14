'use client';

import Image from 'next/image';
import { SearchIcon, CloseIcon } from '@/components/ui/icons';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { OrderModeBarDesktop } from '@/components/menu/OrderModeBar';

interface Props {
  site: any;
  locale: string;
  search: string;
  onSearch: (v: string) => void;
  L: Record<string, string>;
  primaryColor: string;
  emporterLinks?: any[];
  livraisonLinks?: any[];
  livraisonModeIconUrl?: string | null;
  emporterModeIconUrl?: string | null;
}

const ALL_LOCALES = ['fr', 'en', 'it', 'es'];

export default function MenuHeader({ site, locale, search, onSearch, L, primaryColor, emporterLinks = [], livraisonLinks = [], livraisonModeIconUrl, emporterModeIconUrl }: Props) {
  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ALL_LOCALES; }
  })();
  const visibleLocales = ALL_LOCALES.filter(l => enabledLocales.includes(l));

  const orderEnabled = site?.orderButtonEnabled === true;
  const orderLabel = site?.orderButtonLabel || 'Commander';
  const orderUrl = site?.orderButtonUrl || '#';

  return (
    // DESIGN IMPROVEMENT: glassmorphism léger, cohérent avec les tabs sticky
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {site?.logoUrl ? (
            <Image src={site.logoUrl} alt="" width={36} height={36} className="rounded-lg object-contain" aria-hidden="true" />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-900 font-black text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              W
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="font-black text-gray-900 text-sm leading-none">{site?.siteName || 'Woodiz'}</h1>
            {site?.siteSlogan && (
              <p className="text-xs text-gray-400 leading-none mt-0.5">{site.siteSlogan}</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {/* DESIGN IMPROVEMENT: rounded-full moderne, cohérent app-native */}
          <input
            type="search"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder={L.search}
            aria-label={L.search}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Order CTA button — admin-configurable */}
        {orderEnabled && orderUrl && orderUrl !== '#' && (
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryColor, color: '#fff' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {orderLabel}
          </a>
        )}

        {/* Order mode bar — desktop only, inline */}
        {(emporterLinks.length > 0 || livraisonLinks.length > 0) && (
          <div className="hidden sm:flex flex-shrink-0">
            <OrderModeBarDesktop
              emporterLinks={emporterLinks}
              livraisonLinks={livraisonLinks}
              primaryColor={primaryColor}
              locale={locale}
              livraisonModeIconUrl={livraisonModeIconUrl}
              emporterModeIconUrl={emporterModeIconUrl}
            />
          </div>
        )}

        {/* Language Switcher */}
        {visibleLocales.length > 1 && (
          <LanguageSwitcher
            locale={locale}
            options={visibleLocales.map(l => ({
              code: l,
              href: l === 'fr' ? '/menu' : `/${l}/menu`,
            }))}
          />
        )}
      </div>

      {/* Mobile order button — shown below header on small screens */}
      {orderEnabled && orderUrl && orderUrl !== '#' && (
        <div className="sm:hidden px-4 pb-2.5">
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, color: '#fff' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {orderLabel}
          </a>
        </div>
      )}
    </header>
  );
}
