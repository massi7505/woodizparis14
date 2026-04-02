'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  locale: string;
  options: { code: string; href: string }[];
}

export default function LanguageSwitcher({ locale, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const others = options.filter(o => o.code !== locale);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-800 bg-white text-[11px] font-bold text-gray-900 hover:bg-gray-50 transition-colors select-none"
      >
        {locale.toUpperCase()}
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && others.length > 0 && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50 min-w-[56px]"
        >
          {others.map(({ code, href }) => (
            <a
              key={code}
              href={href}
              role="option"
              aria-selected={false}
              className="block px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              {code.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
