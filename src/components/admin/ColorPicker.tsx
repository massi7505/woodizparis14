'use client';

import { useState, useRef, useEffect } from 'react';

const PRESETS = [
  '#F59E0B','#EF4444','#10B981','#3B82F6','#8B5CF6','#EC4899',
  '#F97316','#06B6D4','#14B8A6','#84CC16','#06C167','#00CCBC',
  '#7C3AED','#1F2937','#111827','#FFFFFF','#000000','#6B7280',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-9 h-9 rounded-xl border-2 border-gray-600 hover:border-gray-400 transition-colors flex-shrink-0 shadow-inner"
          style={{ backgroundColor: value }}
          title="Choisir une couleur prédéfinie"
        />
        <input
          type="text" value={value}
          onChange={e => onChange(e.target.value)}
          className="admin-input font-mono text-sm flex-1 max-w-[110px]"
          maxLength={9}
          placeholder="#000000"
        />
        <input
          type="color" value={value.startsWith('#') && value.length === 7 ? value : '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-xl cursor-pointer border border-gray-600 bg-transparent p-0.5"
          title="Sélecteur de couleur natif"
        />
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-2xl p-3 shadow-2xl">
          <div className="grid grid-cols-9 gap-1.5">
            {PRESETS.map(c => (
              <button
                key={c} type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className="w-6 h-6 rounded-lg border-2 hover:scale-125 transition-transform"
                style={{ backgroundColor: c, borderColor: c === value ? '#F59E0B' : 'transparent' }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
