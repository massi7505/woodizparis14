'use client';

import { useState, useEffect } from 'react';

interface HourSlot { open: string; close: string; }
interface HourRow { id: number; dayOfWeek: number; isOpen: boolean; slots: string; }

interface Props {
  settings: any;
  site: any;
  hours?: HourRow[];
  locale?: string;
}

const STATUS_LABELS: Record<string, { open: string; closed: string; until: string }> = {
  fr: { open: 'Ouvert maintenant', closed: 'Fermé maintenant', until: "Jusqu'à" },
  en: { open: 'Open now', closed: 'Closed now', until: 'Until' },
  it: { open: 'Aperto adesso', closed: 'Chiuso adesso', until: 'Fino alle' },
  es: { open: 'Abierto ahora', closed: 'Cerrado ahora', until: 'Hasta las' },
};

function getCurrentDayOfWeek() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function getTodayStatus(hours: HourRow[]) {
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
          return { isOpen: true, closeTime: slot.close };
        }
      }
    } catch { /* noop */ }
  }

  const row = hours.find(r => r.dayOfWeek === today);
  if (!row || !row.isOpen) return null;
  try {
    const slots: HourSlot[] = JSON.parse(row.slots);
    for (const slot of slots) {
      const open = parseTime(slot.open);
      let close = parseTime(slot.close);
      if (close < open) close += 24 * 60;
      if (currentMin >= open && currentMin < close) {
        return { isOpen: true, closeTime: slot.close };
      }
    }
  } catch { /* noop */ }
  return { isOpen: false, closeTime: null };
}

export default function LinktreeProfile({ settings, site, hours = [], locale = 'fr' }: Props) {
  // null initial state avoids SSR/hydration mismatch (date depends on client timezone)
  const [status, setStatus] = useState<ReturnType<typeof getTodayStatus> | null>(null);
  const name = settings?.profileName || site?.siteName || 'Woodiz Paris 15';
  const subtitle = settings?.profileSubtitle || site?.siteSlogan || '';
  const L = STATUS_LABELS[locale] || STATUS_LABELS.fr;

  useEffect(() => {
    if (!hours.length) return;
    setStatus(getTodayStatus(hours));
    const t = setInterval(() => setStatus(getTodayStatus(hours)), 60_000);
    return () => clearInterval(t);
  }, [hours]);

  return (
    <div className="flex flex-col items-center px-6 pt-16 pb-2">
      {/* Name */}
      <h1 className="font-display text-2xl font-bold text-white text-center leading-tight">
        {name}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-white/50 text-sm mt-1 text-center">{subtitle}</p>
      )}

      {/* Opening status */}
      {status !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          {status.isOpen ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-green-400 text-xs font-semibold">
                {L.open}
                {status.closeTime && (
                  <span className="text-white/40 font-normal"> · {L.until} {status.closeTime}</span>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              <span className="text-red-400 text-xs font-semibold">{L.closed}</span>
            </>
          )}
        </div>
      )}

      {/* Notice */}
      {settings?.noticeText && (
        <div className="mt-5 w-full rounded-2xl p-4 flex gap-3 items-start border border-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
          {settings.noticeIcon && (
            <span className="text-xl flex-shrink-0 mt-0.5">{settings.noticeIcon}</span>
          )}
          <p className="text-white/70 text-sm leading-relaxed">{settings.noticeText}</p>
        </div>
      )}
    </div>
  );
}
