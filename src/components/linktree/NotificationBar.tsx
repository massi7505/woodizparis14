'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NotificationBannerData {
  id: number;
  isVisible: boolean;
  bgColor: string;
  textColor: string;
  icon?: string | null;
  link?: string | null;
  linkLabel?: string | null;
  priority: number;
  displayDuration: number;
  animType: string;   // slide | fade | bounce
  type: string;       // custom | closed | open
  scheduleEnabled: boolean;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  scheduleDays: string;
  sortOrder: number;
  translations: { locale: string; text: string }[];
}

export interface OpeningHoursData {
  dayOfWeek: number; // 0=Mon…6=Sun (schema)
  isOpen: boolean;
  slots: string; // JSON [{"open":"11:30","close":"14:30"}]
}

interface Props {
  banners: NotificationBannerData[];
  openingHours?: OpeningHoursData[];
  locale: string;
}

interface LegacyProps {
  bar: {
    isVisible?: boolean;
    bgColor: string;
    textColor: string;
    icon?: string | null;
    link?: string | null;
    linkLabel?: string | null;
    translations: { locale: string; text: string }[];
  };
  locale: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const LOCALES_ORDER = ['fr', 'en', 'it', 'es'];

function parseHHMM(hhmm: string): number {
  const [h, m] = (hhmm || '').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function schemaDay(jsDay: number): number {
  return (jsDay + 6) % 7; // JS 0=Sun → Schema 0=Mon
}

function getT(translations: { locale: string; text: string }[], locale: string): string {
  return (
    translations.find(x => x.locale === locale && x.text)?.text ||
    translations.find(x => x.locale === 'fr' && x.text)?.text ||
    translations.find(x => x.text)?.text ||
    ''
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function getRestaurantStatus(hours: OpeningHoursData[], now: Date) {
  const day = schemaDay(now.getDay());
  const min = now.getHours() * 60 + now.getMinutes();

  // Check if we are still inside a midnight-crossing slot from YESTERDAY
  // e.g. Friday slot 18:00→02:00, and it's now Saturday 01:00
  const prevDay = (day + 6) % 7;
  const prevHours = hours.find(h => h.dayOfWeek === prevDay);
  if (prevHours?.isOpen) {
    let prevSlots: { open: string; close: string }[] = [];
    try { prevSlots = JSON.parse(prevHours.slots); } catch { prevSlots = []; }
    for (const s of prevSlots) {
      const open = parseHHMM(s.open);
      const close = parseHHMM(s.close);
      if (close < open && min < close) {
        // Past midnight, still within yesterday's slot
        return { isOpen: true, minutesUntilOpen: null as number | null, nextOpenHHMM: null as string | null, nextOpenDaysAhead: 0 };
      }
    }
  }

  const todayHours = hours.find(h => h.dayOfWeek === day);
  if (todayHours?.isOpen) {
    let slots: { open: string; close: string }[] = [];
    try { slots = JSON.parse(todayHours.slots); } catch { slots = []; }
    for (const s of slots) {
      const open = parseHHMM(s.open);
      let close = parseHHMM(s.close);
      if (close < open) close += 24 * 60; // handle midnight-crossing slots
      if (min >= open && min < close)
        return { isOpen: true, minutesUntilOpen: null as number | null, nextOpenHHMM: null as string | null, nextOpenDaysAhead: 0 };
    }
    // Later slot today? (sorted to get the earliest upcoming slot)
    const later = slots.filter(s => parseHHMM(s.open) > min).sort((a, b) => parseHHMM(a.open) - parseHHMM(b.open));
    if (later.length) {
      const next = later[0];
      return { isOpen: false, minutesUntilOpen: parseHHMM(next.open) - min, nextOpenHHMM: next.open, nextOpenDaysAhead: 0 };
    }
  }

  // Next opening in coming 7 days
  for (let d = 1; d <= 7; d++) {
    const nextDay = (day + d) % 7;
    const nh = hours.find(h => h.dayOfWeek === nextDay);
    if (nh?.isOpen) {
      let slots: { open: string; close: string }[] = [];
      try { slots = JSON.parse(nh.slots); } catch { slots = []; }
      if (slots.length) {
        const first = [...slots].sort((a, b) => parseHHMM(a.open) - parseHHMM(b.open))[0];
        return { isOpen: false, minutesUntilOpen: (24 * 60 - min) + (d - 1) * 24 * 60 + parseHHMM(first.open), nextOpenHHMM: first.open, nextOpenDaysAhead: d };
      }
    }
  }
  return { isOpen: false, minutesUntilOpen: null as number | null, nextOpenHHMM: null as string | null, nextOpenDaysAhead: 0 };
}

function getActiveBanners(banners: NotificationBannerData[], now: Date): NotificationBannerData[] {
  const day = schemaDay(now.getDay());
  const min = now.getHours() * 60 + now.getMinutes();

  return banners
    .filter(b => {
      if (!b.isVisible) return false;
      // closed/open are driven by restaurant status — skip manual schedule
      if (b.type === 'closed' || b.type === 'open') return true;
      if (!b.scheduleEnabled) return true;
      let days: number[] = [];
      try { days = JSON.parse(b.scheduleDays); } catch { days = [0,1,2,3,4,5,6]; }
      if (!days.includes(day)) return false;
      if (b.scheduleStart && b.scheduleEnd) {
        const start = parseHHMM(b.scheduleStart);
        const end = parseHHMM(b.scheduleEnd);
        if (min < start || min >= end) return false;
      }
      return true;
    })
    .sort((a, b) => b.priority - a.priority || a.sortOrder - b.sortOrder);
}

function buildAutoClosedText(status: { minutesUntilOpen: number | null; nextOpenHHMM: string | null; nextOpenDaysAhead: number }): Record<string, string> {
  const t = status.nextOpenHHMM ? timeLabel(status.nextOpenHHMM) : null;
  if (!t) {
    return {
      fr: 'Restaurant fermé · Réouverture bientôt',
      en: 'Closed · Reopening soon',
      it: 'Chiuso · Riapertura presto',
      es: 'Cerrado · Reapertura pronto',
    };
  }
  if (status.nextOpenDaysAhead === 0) {
    return {
      fr: `Restaurant fermé · Réouverture à ${t}`,
      en: `Closed · Reopening at ${t}`,
      it: `Chiuso · Riapertura alle ${t}`,
      es: `Cerrado · Reapertura a las ${t}`,
    };
  }
  if (status.nextOpenDaysAhead === 1) {
    return {
      fr: `Restaurant fermé · Demain à ${t}`,
      en: `Closed · Tomorrow at ${t}`,
      it: `Chiuso · Domani alle ${t}`,
      es: `Cerrado · Mañana a las ${t}`,
    };
  }
  const dur = status.minutesUntilOpen != null ? formatMinutes(status.minutesUntilOpen) : null;
  return {
    fr: dur ? `Restaurant fermé · Réouverture dans ${dur}` : 'Restaurant fermé',
    en: dur ? `Closed · Reopening in ${dur}` : 'Closed',
    it: dur ? `Chiuso · Riapertura tra ${dur}` : 'Chiuso',
    es: dur ? `Cerrado · Reapertura en ${dur}` : 'Cerrado',
  };
}

// ── Animation enter classes ───────────────────────────────────────────────────
const ANIM_IN: Record<string, string> = {
  slide: 'notif-slide-in',
  fade: 'notif-fade-in',
  bounce: 'notif-bounce-in',
};

// ── Smart multi-banner component ──────────────────────────────────────────────
export function SmartNotificationBar({ banners, openingHours = [], locale }: Props) {
  // Initialize to null to avoid SSR/client mismatch (new Date() differs between server and client)
  const [now, setNow] = useState<Date | null>(null);
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Set time only on client after hydration, then refresh every 30s
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const status = useMemo(
    () => now ? getRestaurantStatus(openingHours, now) : { isOpen: true, minutesUntilOpen: null as number | null, nextOpenHHMM: null as string | null, nextOpenDaysAhead: 0 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openingHours, now?.getMinutes(), now?.getHours()]
  );

  // Build the final display list (memoized) — empty during SSR (now is null)
  const display = useMemo<NotificationBannerData[]>(() => {
    if (!now) return [];
    const active = getActiveBanners(banners, now).filter(b => {
      if (b.type === 'closed' && status.isOpen) return false;
      if (b.type === 'open' && !status.isOpen) return false;
      return true;
    });

    // Inject auto-text into closed banners with empty translations
    const autoText = buildAutoClosedText(status);
    const withText = active.map(b => {
      if (b.type !== 'closed') return b;
      return {
        ...b,
        translations: LOCALES_ORDER.map(l => {
          const existing = b.translations.find(t => t.locale === l);
          const text = existing?.text
            ? existing.text.replace('{time}', status.minutesUntilOpen != null ? formatMinutes(status.minutesUntilOpen) : '?')
            : autoText[l] || autoText.fr;
          return { locale: l, text };
        }),
      };
    });

    // Add synthetic closed banner if no user-defined closed banner exists
    const hasClosed = withText.some(b => b.type === 'closed');
    if (!status.isOpen && !hasClosed && openingHours.length > 0) {
      const synthetic: NotificationBannerData = {
        id: -1, isVisible: true,
        bgColor: '#1a1a1a', textColor: '#f59e0b',
        icon: '🕐', link: null, linkLabel: null,
        priority: 999, displayDuration: 10_000,
        animType: 'slide', type: 'closed',
        scheduleEnabled: false, scheduleStart: null, scheduleEnd: null,
        scheduleDays: '[0,1,2,3,4,5,6]', sortOrder: 0,
        translations: LOCALES_ORDER.map(l => ({ locale: l, text: autoText[l] || autoText.fr })),
      };
      return [synthetic, ...withText];
    }
    return withText;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners, status, openingHours, now]);

  const total = display.length;

  // Reset to first banner when list changes
  useEffect(() => {
    setIdx(0);
    setAnimKey(k => k + 1);
    setDismissed(false);
  }, [total]);

  // Auto-cycle: schedule next advance after current banner's displayDuration
  useEffect(() => {
    if (dismissed || total <= 1) return;
    clearTimeout(timerRef.current);
    const dur = display[idx % total]?.displayDuration ?? 8_000;
    timerRef.current = setTimeout(() => {
      setIdx(i => (i + 1) % total);
      setAnimKey(k => k + 1);
    }, dur);
    return () => clearTimeout(timerRef.current);
  }, [idx, total, dismissed, display]);

  if (dismissed || total === 0) return null;

  const banner = display[idx % total];
  const text = getT(banner.translations, locale);
  if (!text) return null;

  const animClass = ANIM_IN[banner.animType] || ANIM_IN.slide;

  const inner = (
    <div
      key={animKey}
      className={`relative flex items-center justify-center gap-2 px-10 py-2 text-sm font-medium w-full ${animClass}`}
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearTimeout(timerRef.current); setIdx(i); setAnimKey(k => k + 1); }}
              aria-label={`Message ${i + 1}`}
              style={{ padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span
                className="rounded-full transition-all block"
                style={{
                  width: i === idx % total ? '12px' : '5px',
                  height: '5px',
                  background: i === idx % total ? banner.textColor : `${banner.textColor}50`,
                }}
              />
            </button>
          ))}
        </div>
      )}

      {banner.icon && <span className="flex-shrink-0">{banner.icon}</span>}
      <span className="text-center leading-snug">{text}</span>
      {banner.linkLabel && (
        <span className="font-bold underline ml-1 opacity-90 flex-shrink-0 whitespace-nowrap">
          {banner.linkLabel} →
        </span>
      )}

      {/* Progress bar */}
      {total > 1 && (
        <span
          key={`prog-${animKey}`}
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{
            backgroundColor: banner.textColor,
            transformOrigin: 'left center',
            animation: `notif-progress ${banner.displayDuration}ms linear forwards`,
          }}
        />
      )}

      {/* Dismiss */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setDismissed(true); clearTimeout(timerRef.current); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity p-1"
        aria-label="Fermer"
      >
        <X className="w-3.5 h-3.5" style={{ color: banner.textColor }} />
      </button>
    </div>
  );

  if (banner.link) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

// ── Legacy single-bar export ──────────────────────────────────────────────────
export function NotificationBarComponent({ bar, locale }: LegacyProps) {
  const t =
    bar.translations.find(x => x.locale === locale && x.text) ||
    bar.translations.find(x => x.locale === 'fr' && x.text) ||
    bar.translations.find(x => x.text);

  if (!t?.text) return null;

  const inner = (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-center w-full"
      style={{ backgroundColor: bar.bgColor, color: bar.textColor }}
    >
      {bar.icon && <span>{bar.icon}</span>}
      <span>{t.text}</span>
      {bar.link && bar.linkLabel && (
        <span className="font-bold underline ml-1 opacity-90">{bar.linkLabel} →</span>
      )}
    </div>
  );

  if (bar.link) {
    return <a href={bar.link} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>;
  }
  return inner;
}

export default NotificationBarComponent;
