'use client';

import { useState, useEffect } from 'react';

interface HourSlot { open: string; close: string; }
interface HourRow {
  id: number; dayOfWeek: number; dayName: string; isOpen: boolean; slots: string;
}
interface Props { hours: HourRow[]; locale: string; }

const DAY_NAMES: Record<string, Record<number, string>> = {
  fr: { 0: 'Lundi', 1: 'Mardi', 2: 'Mercredi', 3: 'Jeudi', 4: 'Vendredi', 5: 'Samedi', 6: 'Dimanche' },
  en: { 0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday' },
  it: { 0: 'Lunedì', 1: 'Martedì', 2: 'Mercoledì', 3: 'Giovedì', 4: 'Venerdì', 5: 'Sabato', 6: 'Domenica' },
  es: { 0: 'Lunes', 1: 'Martes', 2: 'Miércoles', 3: 'Jueves', 4: 'Viernes', 5: 'Sábado', 6: 'Domingo' },
};

const LABELS: Record<string, Record<string, string>> = {
  fr: { title: "Horaires d'ouverture", closed: 'Fermé', open: 'Ouvert maintenant', closedNow: 'Fermé maintenant', until: "Jusqu'à", opensAt: 'Ouvre', opensToday: 'Ouvre tout à l\'heure à', nextOpen: 'Prochaine ouverture' },
  en: { title: 'Opening Hours', closed: 'Closed', open: 'Open now', closedNow: 'Closed now', until: 'Until', opensAt: 'Opens', opensToday: 'Opens later at', nextOpen: 'Next opening' },
  it: { title: 'Orari di apertura', closed: 'Chiuso', open: 'Aperto adesso', closedNow: 'Chiuso adesso', until: 'Fino alle', opensAt: 'Apre', opensToday: 'Apre più tardi alle', nextOpen: 'Prossima apertura' },
  es: { title: 'Horario de apertura', closed: 'Cerrado', open: 'Abierto ahora', closedNow: 'Cerrado ahora', until: 'Hasta las', opensAt: 'Abre', opensToday: 'Abre luego a las', nextOpen: 'Próxima apertura' },
};

function getCurrentDayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatSlots(slotsJson: string): string {
  try {
    return (JSON.parse(slotsJson) as HourSlot[]).map(s => `${s.open} – ${s.close}`).join(' | ');
  } catch { return slotsJson; }
}

interface StatusResult {
  isOpenNow: boolean;
  badge: string;
  closeTime?: string;
  nextOpenDay?: string;    // day name
  nextOpenTime?: string;   // "12:00"
  openLaterToday?: string; // next slot opens today
}

function computeStatus(hours: HourRow[], L: Record<string, string>, dayNames: Record<number, string>): StatusResult {
  const today = getCurrentDayOfWeek();
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  // Check if we are still inside a midnight-crossing slot from YESTERDAY
  const prevDay = (today + 6) % 7;
  const prevRow = hours.find(r => r.dayOfWeek === prevDay);
  if (prevRow?.isOpen) {
    try {
      const prevSlots: HourSlot[] = JSON.parse(prevRow.slots);
      for (const slot of prevSlots) {
        const open = parseTime(slot.open);
        const close = parseTime(slot.close);
        if (close < open && currentMin < close) {
          return { isOpenNow: true, badge: L.open, closeTime: slot.close };
        }
      }
    } catch { /* noop */ }
  }

  const row = hours.find(r => r.dayOfWeek === today);

  // Check if open now
  if (row?.isOpen) {
    try {
      const slots: HourSlot[] = JSON.parse(row.slots);
      for (const slot of slots) {
        const open = parseTime(slot.open);
        let close = parseTime(slot.close);
        if (close < open) close += 24 * 60;
        if (currentMin >= open && currentMin < close) {
          return { isOpenNow: true, badge: L.open, closeTime: slot.close };
        }
      }
      // Not open now — check if opens later today
      for (const slot of slots) {
        const open = parseTime(slot.open);
        if (open > currentMin) {
          return { isOpenNow: false, badge: L.closedNow, openLaterToday: slot.open };
        }
      }
    } catch { /* noop */ }
  }

  // Find next opening day (up to 7 days ahead)
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (today + offset) % 7;
    const nextRow = hours.find(r => r.dayOfWeek === nextDay);
    if (nextRow?.isOpen) {
      try {
        const slots: HourSlot[] = JSON.parse(nextRow.slots);
        if (slots.length > 0) {
          return {
            isOpenNow: false,
            badge: L.closedNow,
            nextOpenDay: dayNames[nextDay],
            nextOpenTime: slots[0].open,
          };
        }
      } catch { /* noop */ }
    }
  }

  return { isOpenNow: false, badge: L.closedNow };
}

export default function LinktreeHours({ hours, locale }: Props) {
  // Hydration-safe: compute status only on client after mount
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<StatusResult>({ isOpenNow: false, badge: '' });

  const dayNames = DAY_NAMES[locale] || DAY_NAMES.fr;
  const L = LABELS[locale] || LABELS.fr;
  const today = getCurrentDayOfWeek();

  useEffect(() => {
    setMounted(true);
    setStatus(computeStatus(hours, L, dayNames));
    const t = setInterval(() => setStatus(computeStatus(hours, L, dayNames)), 60_000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours, locale]);

  return (
    <div className="mx-4 mt-4">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🕐</span>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide leading-none">{L.title}</p>
              {mounted && (
                <div className="text-[11px] mt-0.5 leading-none">
                  {status.isOpenNow && status.closeTime && (
                    <span style={{ color: '#4ade80' }}>{status.badge} · {L.until} {status.closeTime}</span>
                  )}
                  {!status.isOpenNow && status.openLaterToday && (
                    <span className="text-amber-400">{L.opensToday} {status.openLaterToday}</span>
                  )}
                  {!status.isOpenNow && !status.openLaterToday && status.nextOpenDay && (
                    <span className="text-amber-400">{L.nextOpen} : {status.nextOpenDay} {L.opensAt} {status.nextOpenTime}</span>
                  )}
                  {!status.isOpenNow && !status.openLaterToday && !status.nextOpenDay && (
                    <span style={{ color: '#f87171' }}>{status.badge}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Live badge */}
          {mounted && status.isOpenNow && (
            <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {L.open}
            </span>
          )}
          {mounted && !status.isOpenNow && (
            <span className="bg-red-500/20 text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-500/30">
              {L.closedNow}
            </span>
          )}
        </div>

        {/* Days list */}
        <div className="divide-y divide-white/5">
          {hours.map((row) => {
            const isToday = row.dayOfWeek === today;
            const dayLabel = dayNames[row.dayOfWeek] || row.dayName;
            return (
              <div key={row.id}
                className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isToday ? 'bg-amber-500/10' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                  <span className={`text-sm ${isToday ? 'font-bold text-amber-300' : 'text-white/50'}`}>
                    {dayLabel}
                  </span>
                </div>
                <span className={`text-sm text-right tabular-nums ${isToday ? 'font-semibold text-white' : 'text-white/40'}`}>
                  {row.isOpen ? formatSlots(row.slots) : L.closed}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
