'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/ui/icons';

interface FAQ {
  id: number;
  translations: { question: string; answer: string }[];
}

interface Props {
  faqs: FAQ[];
  locale: string;
}

const LABELS: Record<string, string> = {
  fr: 'Questions Fréquentes',
  en: 'Frequently Asked Questions',
  it: 'Domande Frequenti',
  es: 'Preguntas Frecuentes',
};

export default function LinktreeFAQs({ faqs, locale }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="mx-5 mt-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
        <span className="flex-1 h-px bg-gray-700" />
        {LABELS[locale] || LABELS.fr}
        <span className="flex-1 h-px bg-gray-700" />
      </p>

      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden divide-y divide-gray-700">
        {faqs.map((faq) => {
          const t = faq.translations[0];
          if (!t) return null;
          const isOpen = openId === faq.id;

          return (
            <div key={faq.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium text-white">{t.question}</span>
                <ChevronDownIcon className={`w-4 h-4 text-amber-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? '300px' : '0px' }}
              >
                <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{t.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
