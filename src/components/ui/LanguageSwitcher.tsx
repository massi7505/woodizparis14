'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  locale: string;
  options: { code: string; href: string }[];
}

export default function LanguageSwitcher({ locale, options }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const updatePos = () => {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  const others = options.filter(o => o.code !== locale);

  return (
    <div ref={wrapRef} className="relative flex-shrink-0">
      <button
        ref={btnRef}
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

      {mounted && open && others.length > 0 && pos && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 2147483647 }}
          className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden min-w-[56px]"
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
        </div>,
        document.body
      )}
    </div>
  );
}
