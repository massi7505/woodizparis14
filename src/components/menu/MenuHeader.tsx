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

const AUTH_LABELS: Record<string, { login: string; register: string }> = {
  fr: { login: 'Se connecter', register: "S'inscrire" },
  en: { login: 'Log in', register: 'Sign up' },
  it: { login: 'Accedi', register: 'Registrati' },
  es: { login: 'Iniciar sesión', register: 'Registrarse' },
};

const ALL_LOCALES = ['fr', 'en', 'it', 'es'];

export default function MenuHeader({ site, locale, search, onSearch, L, primaryColor, emporterLinks = [], livraisonLinks = [], livraisonModeIconUrl, emporterModeIconUrl }: Props) {
  const enabledLocales: string[] = (() => {
    try { return JSON.parse(site?.enabledLocales || '["fr","en","it","es"]'); } catch { return ALL_LOCALES; }
  })();
  const visibleLocales = ALL_LOCALES.filter(l => enabledLocales.includes(l));

  const orderEnabled = site?.orderButtonEnabled === true;
  const orderLabel = site?.orderButtonLabel || 'Commander';
  const orderUrl = site?.orderButtonUrl || '#';

  const loginEnabled = site?.loginButtonEnabled === true;
  const loginUrl = site?.loginButtonUrl || 'https://app.woodiz14.fr/login';
  const registerEnabled = site?.registerButtonEnabled === true;
  const registerUrl = site?.registerButtonUrl || 'https://app.woodiz14.fr/register';
  const AL = AUTH_LABELS[locale] || AUTH_LABELS.fr;

  // DESIGN IMPROVEMENT: glassmorphism léger, cohérent avec les tabs sticky
  return (
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

        {/* Auth buttons — desktop */}
        {(loginEnabled || registerEnabled) && (
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            {loginEnabled && (
              <a
                href={loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:opacity-80 active:scale-95 whitespace-nowrap"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                {AL.login}
              </a>
            )}
            {registerEnabled && (
              <a
                href={registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                {AL.register}
              </a>
            )}
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

      {/* Mobile: order + auth buttons */}
      {(orderEnabled || loginEnabled || registerEnabled) && (
        <div className="sm:hidden px-4 pb-2.5 flex flex-col gap-2">
          {orderEnabled && orderUrl && orderUrl !== '#' && (
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
          )}
          {(loginEnabled || registerEnabled) && (
            <div className="flex gap-2">
              {loginEnabled && (
                <a
                  href={loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  {AL.login}
                </a>
              )}
              {registerEnabled && (
                <a
                  href={registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  {AL.register}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
