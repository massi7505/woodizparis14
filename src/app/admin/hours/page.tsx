'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, CloseIcon } from '@/components/ui/icons';

const DAYS = [
  { day: 0, fr: 'Lundi', en: 'Monday' },
  { day: 1, fr: 'Mardi', en: 'Tuesday' },
  { day: 2, fr: 'Mercredi', en: 'Wednesday' },
  { day: 3, fr: 'Jeudi', en: 'Thursday' },
  { day: 4, fr: 'Vendredi', en: 'Friday' },
  { day: 5, fr: 'Samedi', en: 'Saturday' },
  { day: 6, fr: 'Dimanche', en: 'Sunday' },
];

type Slot = { open: string; close: string };
type DayData = { dayOfWeek: number; dayName: string; isOpen: boolean; slots: Slot[]; sortOrder: number };

function defaultDays(): DayData[] {
  return DAYS.map(d => ({
    dayOfWeek: d.day, dayName: d.fr, isOpen: true,
    slots: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }],
    sortOrder: d.day,
  }));
}

export default function AdminHoursPage() {
  const [days, setDays] = useState<DayData[]>(defaultDays());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  useEffect(() => {
    fetch('/api/hours').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const merged = DAYS.map(d => {
          const found = data.find((x: any) => x.dayOfWeek === d.day);
          if (found) {
            let slots: Slot[];
            try { slots = JSON.parse(found.slots); } catch { slots = [{ open: '11:30', close: '23:00' }]; }
            return { dayOfWeek: d.day, dayName: d.fr, isOpen: found.isOpen, slots, sortOrder: d.day };
          }
          return { dayOfWeek: d.day, dayName: d.fr, isOpen: true, slots: [{ open: '11:30', close: '23:00' }], sortOrder: d.day };
        });
        setDays(merged);
      }
    });
  }, []);

  function setDayField(i: number, field: keyof DayData, val: any) {
    setDays(ds => ds.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  }

  function setSlot(dayIdx: number, slotIdx: number, field: 'open' | 'close', val: string) {
    setDays(ds => ds.map((d, i) => i !== dayIdx ? d : {
      ...d, slots: d.slots.map((s, j) => j === slotIdx ? { ...s, [field]: val } : s),
    }));
  }

  function addSlot(dayIdx: number) {
    setDays(ds => ds.map((d, i) => i !== dayIdx ? d : {
      ...d, slots: [...d.slots, { open: '18:00', close: '22:00' }],
    }));
  }

  function removeSlot(dayIdx: number, slotIdx: number) {
    setDays(ds => ds.map((d, i) => i !== dayIdx ? d : {
      ...d, slots: d.slots.filter((_, j) => j !== slotIdx),
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = days.map(d => ({ ...d, slots: JSON.stringify(d.slots) }));
      const res = await fetch('/api/hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      showToast('✅ Horaires sauvegardés');
    } catch { showToast('❌ Erreur lors de la sauvegarde'); }
    setSaving(false);
  }

  // Quick fill buttons
  function applyToAll(isOpen: boolean, slots: Slot[]) {
    setDays(ds => ds.map(d => ({ ...d, isOpen, slots: JSON.parse(JSON.stringify(slots)) })));
  }

  const QUICK_FILLS = [
    { label: 'Midi + Soir', isOpen: true, slots: [{ open: '11:30', close: '14:30' }, { open: '18:00', close: '23:00' }] },
    { label: 'Soir uniquement', isOpen: true, slots: [{ open: '18:00', close: '23:00' }] },
    { label: 'Non-stop', isOpen: true, slots: [{ open: '11:30', close: '23:00' }] },
    { label: 'Fermé', isOpen: false, slots: [] },
  ];

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">🕐 Horaires d'ouverture</h1>
          <p className="dcm-page-subtitle">Configurez les créneaux horaires de chaque jour</p>
        </div>
        <button onClick={save} disabled={saving} className="admin-btn-primary disabled:opacity-50">
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
      </div>

      {/* Quick fill */}
      <div className="admin-card mb-5">
        <p className="text-sm font-semibold text-white mb-3">Application rapide à tous les jours :</p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_FILLS.map(({ label, isOpen, slots }) => (
            <button key={label} onClick={() => applyToAll(isOpen, slots)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold rounded-lg transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {days.map((day, i) => {
          const dayInfo = DAYS.find(d => d.day === day.dayOfWeek);
          return (
            <div key={day.dayOfWeek} className={`admin-card transition-opacity ${!day.isOpen ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setDayField(i, 'isOpen', !day.isOpen)}
                    className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${day.isOpen ? 'bg-amber-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.isOpen ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{dayInfo?.fr}</p>
                    <p className="text-xs text-gray-500">{dayInfo?.en}</p>
                  </div>
                </div>
                {day.isOpen && (
                  <button onClick={() => addSlot(i)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                    <PlusIcon className="w-3.5 h-3.5" />
                    Ajouter un créneau
                  </button>
                )}
              </div>

              {!day.isOpen ? (
                <p className="text-sm text-gray-600 italic ml-[52px]">Fermé ce jour</p>
              ) : day.slots.length === 0 ? (
                <div className="ml-[52px]">
                  <p className="text-sm text-gray-600 italic mb-2">Aucun créneau — ajouter un horaire :</p>
                  <button onClick={() => addSlot(i)} className="text-xs admin-btn-ghost py-1.5 px-3">+ Ajouter un créneau</button>
                </div>
              ) : (
                <div className="space-y-2 ml-[52px]">
                  {day.slots.map((slot, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={slot.open} onChange={e => setSlot(i, j, 'open', e.target.value)}
                          className="admin-input text-sm flex-1 min-w-0" />
                        <span className="text-gray-500 text-sm flex-shrink-0">→</span>
                        <input type="time" value={slot.close} onChange={e => setSlot(i, j, 'close', e.target.value)}
                          className="admin-input text-sm flex-1 min-w-0" />
                      </div>
                      {day.slots.length > 1 && (
                        <button onClick={() => removeSlot(i, j)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="w-full admin-btn-primary py-3 text-base disabled:opacity-50">
          {saving ? 'Sauvegarde en cours...' : '💾 Sauvegarder les horaires'}
        </button>
      </div>
    </div>
  );
}
