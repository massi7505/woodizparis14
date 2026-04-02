'use client';

import { useMemo } from 'react';

/* ─────────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────────── */
interface Props {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  metaImageUrl: string;
  siteName?: string;
}

/* ─────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────── */
type CriterionStatus = 'ok' | 'warn' | 'error';

interface Criterion {
  id: string;
  label: string;
  detail: string;
  status: CriterionStatus;
  points: number;
  earned: number;
}

/* ─────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────── */
const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS; // 238.76

/* ─────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────── */
function scoreColor(s: number) {
  if (s >= 90) return '#22C55E';
  if (s >= 75) return '#84CC16';
  if (s >= 50) return '#F97316';
  return '#EF4444';
}

function scoreBgColor(s: number) {
  if (s >= 90) return 'rgba(34,197,94,0.12)';
  if (s >= 75) return 'rgba(132,204,22,0.12)';
  if (s >= 50) return 'rgba(249,115,22,0.12)';
  return 'rgba(239,68,68,0.12)';
}

function scoreLabel(s: number) {
  if (s >= 90) return 'Excellent';
  if (s >= 75) return 'Bon';
  if (s >= 50) return 'Moyen';
  return 'Insuffisant';
}

function criterionColor(status: CriterionStatus) {
  if (status === 'ok') return '#86EFAC';
  if (status === 'warn') return '#FCD34D';
  return '#FCA5A5';
}

function criterionIcon(status: CriterionStatus) {
  if (status === 'ok') return '✅';
  if (status === 'warn') return '⚠️';
  return '❌';
}

/* ─────────────────────────────────────────────────────────────────────
   Character progress bar
───────────────────────────────────────────────────────────────────── */
function CharBar({
  value,
  minOk,
  maxOk,
  hardMax,
  label,
}: {
  value: number;
  minOk: number;
  maxOk: number;
  hardMax: number;
  label: string;
}) {
  const ceiling = hardMax + Math.round(hardMax * 0.25); // visual ceiling
  const pct = Math.min(100, (value / ceiling) * 100);
  const minPct = (minOk / ceiling) * 100;
  const maxPct = (maxOk / ceiling) * 100;

  const color =
    value === 0 ? '#4B5563'
    : value < minOk ? '#EF4444'
    : value <= maxOk ? '#22C55E'
    : value <= hardMax ? '#F97316'
    : '#EF4444';

  const hint =
    value === 0 ? `0 car. — non renseigné`
    : value < minOk ? `${value} car. — trop court (min ${minOk})`
    : value <= maxOk ? `${value} car. — idéal ✓`
    : value <= hardMax ? `${value} car. — acceptable`
    : `${value} car. — trop long (max ${maxOk})`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--admin-text-muted)' }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color }}>{hint}</span>
      </div>

      {/* Bar track */}
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {/* Ideal zone highlight */}
        <div
          className="absolute top-0 bottom-0 rounded-full opacity-20"
          style={{
            left: `${minPct}%`,
            width: `${maxPct - minPct}%`,
            backgroundColor: '#22C55E',
          }}
        />
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Scale labels */}
      <div className="relative h-3.5 mt-0.5">
        <span
          className="absolute text-[9px] font-medium"
          style={{ left: `${minPct}%`, transform: 'translateX(-50%)', color: '#4B5563' }}
        >
          {minOk}
        </span>
        <span
          className="absolute text-[9px] font-medium"
          style={{ left: `${maxPct}%`, transform: 'translateX(-50%)', color: '#4B5563' }}
        >
          {maxOk}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────── */
export default function SeoScoreWidget({
  title,
  description,
  keywords,
  canonicalUrl,
  metaImageUrl,
  siteName = '',
}: Props) {
  /* ── Parse keywords ── */
  const kws = useMemo(
    () => keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean),
    [keywords],
  );
  const mainKw = kws[0] ?? '';

  const titleLen = title.length;
  const descLen = description.length;
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  /* ── Build criteria ── */
  const criteria = useMemo((): Criterion[] => {
    // 1. Title length (max 15 pts)
    const titleIdeal = titleLen >= 50 && titleLen <= 60;
    const titleWarn  = (!titleIdeal) && ((titleLen >= 30 && titleLen < 50) || (titleLen > 60 && titleLen <= 70));
    const titlePts   = titleLen === 0 ? 0 : titleIdeal ? 15 : titleWarn ? 8 : 0;
    const titleStatus: CriterionStatus =
      titleLen === 0 ? 'error' : titleIdeal ? 'ok' : titleWarn ? 'warn' : 'error';

    // 2. Description length (max 15 pts)
    const descIdeal  = descLen >= 140 && descLen <= 160;
    const descWarn   = (!descIdeal) && ((descLen >= 80 && descLen < 140) || (descLen > 160 && descLen <= 180));
    const descPts    = descLen === 0 ? 0 : descIdeal ? 15 : descWarn ? 8 : 0;
    const descStatus: CriterionStatus =
      descLen === 0 ? 'error' : descIdeal ? 'ok' : descWarn ? 'warn' : 'error';

    // 3. Main keyword in title (max 12 pts)
    const kwInTitle    = !!mainKw && titleLower.includes(mainKw);
    const kwTitlePts   = !mainKw ? 0 : kwInTitle ? 12 : 0;
    const kwTitleSt: CriterionStatus = !mainKw ? 'warn' : kwInTitle ? 'ok' : 'error';

    // 4. Main keyword in description (max 10 pts)
    const kwInDesc     = !!mainKw && descLower.includes(mainKw);
    const kwDescPts    = !mainKw ? 0 : kwInDesc ? 10 : 0;
    const kwDescSt: CriterionStatus = !mainKw ? 'warn' : kwInDesc ? 'ok' : 'error';

    // 5. Canonical URL (max 10 pts)
    const hasCanonical = canonicalUrl.trim().length > 0;

    // 6. OG image (max 12 pts)
    const hasOg        = metaImageUrl.trim().length > 0;

    // 7. ≥3 keywords (max 8 pts)
    const kwCount      = kws.length;
    const kwEnough     = kwCount >= 3;
    const kwPts        = kwEnough ? 8 : kwCount >= 1 ? 4 : 0;
    const kwSt: CriterionStatus = kwEnough ? 'ok' : kwCount >= 1 ? 'warn' : 'error';

    return [
      {
        id: 'title-len',
        label: 'Titre SEO',
        detail: titleLen === 0
          ? 'Non renseigné — requis'
          : `${titleLen} car. — idéal 50–60`,
        status: titleStatus,
        points: 15,
        earned: titlePts,
      },
      {
        id: 'desc-len',
        label: 'Meta description',
        detail: descLen === 0
          ? 'Non renseignée — impacte le CTR'
          : `${descLen} car. — idéal 140–160`,
        status: descStatus,
        points: 15,
        earned: descPts,
      },
      {
        id: 'kw-title',
        label: 'Mot-clé principal dans le titre',
        detail: !mainKw
          ? 'Aucun mot-clé défini'
          : kwInTitle
          ? `"${mainKw}" détecté ✓`
          : `"${mainKw}" absent du titre`,
        status: kwTitleSt,
        points: 12,
        earned: kwTitlePts,
      },
      {
        id: 'kw-desc',
        label: 'Mot-clé principal dans la description',
        detail: !mainKw
          ? 'Aucun mot-clé défini'
          : kwInDesc
          ? `"${mainKw}" détecté ✓`
          : `"${mainKw}" absent de la description`,
        status: kwDescSt,
        points: 10,
        earned: kwDescPts,
      },
      {
        id: 'canonical',
        label: 'URL canonique définie',
        detail: hasCanonical
          ? canonicalUrl.replace(/\/$/, '')
          : 'Non définie — risque de contenu dupliqué',
        status: hasCanonical ? 'ok' : 'error',
        points: 10,
        earned: hasCanonical ? 10 : 0,
      },
      {
        id: 'og-image',
        label: 'Image Open Graph (1200×630 px)',
        detail: hasOg
          ? 'Image de partage définie ✓'
          : 'Manquante — réduit la visibilité sur les réseaux',
        status: hasOg ? 'ok' : 'error',
        points: 12,
        earned: hasOg ? 12 : 0,
      },
      {
        id: 'kw-count',
        label: 'Au moins 3 mots-clés définis',
        detail: kwCount === 0
          ? 'Aucun mot-clé renseigné'
          : `${kwCount} mot${kwCount > 1 ? 's-clés' : '-clé'}${kwEnough ? ' ✓' : ' — ajoutez-en '+(3-kwCount)+' de plus'}`,
        status: kwSt,
        points: 8,
        earned: kwPts,
      },
      {
        id: 'jsonld',
        label: 'JSON-LD Restaurant (Schema.org)',
        detail: 'Actif — rich snippets étoiles, horaires, adresse',
        status: 'ok',
        points: 10,
        earned: 10,
      },
      {
        id: 'sitemap',
        label: 'Sitemap XML dynamique',
        detail: canonicalUrl
          ? `${canonicalUrl.replace(/\/$/, '')}/sitemap.xml`
          : '/sitemap.xml actif — FR/EN/IT/ES',
        status: 'ok',
        points: 8,
        earned: 8,
      },
    ];
  }, [titleLen, descLen, titleLower, descLower, mainKw, kws, canonicalUrl, metaImageUrl]);

  /* ── Final score ── */
  const totalEarned = criteria.reduce((s, c) => s + c.earned, 0);
  const totalMax    = criteria.reduce((s, c) => s + c.points, 0);
  const score       = Math.round((totalEarned / totalMax) * 100);

  const color       = scoreColor(score);
  const bgColor     = scoreBgColor(score);
  const label       = scoreLabel(score);
  const dashOffset  = CIRC * (1 - score / 100);

  /* ── Duplicate title alert ── */
  const isDuplicateTitle =
    !!title.trim() &&
    siteName.trim().length > 0 &&
    title.trim().toLowerCase() === siteName.trim().toLowerCase();

  /* ── Score tier badge ── */
  const tierDot = score >= 90 ? '🟢' : score >= 75 ? '🟡' : score >= 50 ? '🟠' : '🔴';

  return (
    <div className="admin-card space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm" style={{ color: 'var(--admin-text)' }}>
            {tierDot} Score SEO en temps réel
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            Style Yoast · se recalcule à chaque frappe
          </p>
        </div>
        {/* Compact score pill */}
        <span
          className="text-sm font-black px-3 py-1 rounded-xl"
          style={{ background: bgColor, color }}
        >
          {score}/100
        </span>
      </div>

      {/* ── Score circle + checklist ── */}
      <div className="flex gap-4 items-start">

        {/* SVG circle */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative w-[88px] h-[88px]">
            <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle
                cx="50" cy="50" r={RADIUS}
                fill="none"
                strokeWidth="9"
                stroke="rgba(255,255,255,0.06)"
              />
              {/* Progress */}
              <circle
                cx="50" cy="50" r={RADIUS}
                fill="none"
                strokeWidth="9"
                stroke={color}
                strokeLinecap="round"
                strokeDasharray={`${CIRC} ${CIRC}`}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.45s ease, stroke 0.3s ease' }}
              />
            </svg>
            {/* Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
              <span
                className="text-[26px] font-black leading-none"
                style={{ color, transition: 'color 0.3s ease' }}
              >
                {score}
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--admin-text-muted)' }}>
                /100
              </span>
            </div>
          </div>
          {/* Label badge */}
          <span
            className="text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: bgColor, color }}
          >
            {label}
          </span>
        </div>

        {/* Criteria list */}
        <div className="flex-1 min-w-0 space-y-[5px]">
          {criteria.map(c => (
            <div key={c.id} className="flex items-start gap-1.5 py-[3px] px-2 rounded-lg transition-colors"
              style={{ background: c.status === 'ok' ? 'transparent' : c.status === 'warn' ? 'rgba(252,211,77,0.04)' : 'rgba(252,165,165,0.04)' }}
            >
              <span className="text-[13px] flex-shrink-0 leading-none mt-px">
                {criterionIcon(c.status)}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-semibold leading-tight"
                  style={{ color: criterionColor(c.status) }}
                >
                  {c.label}
                </p>
                <p className="text-[10px] leading-snug mt-0.5 truncate" style={{ color: 'var(--admin-text-muted)' }}>
                  {c.detail}
                </p>
              </div>
              {/* Points badge */}
              <span
                className="flex-shrink-0 text-[9px] font-black px-1 py-0.5 rounded"
                style={{
                  background: c.earned === c.points
                    ? 'rgba(134,239,172,0.12)'
                    : c.earned > 0
                    ? 'rgba(252,211,77,0.12)'
                    : 'rgba(255,255,255,0.05)',
                  color: c.earned === c.points ? '#86EFAC' : c.earned > 0 ? '#FCD34D' : '#4B5563',
                }}
              >
                {c.earned}/{c.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Duplicate title alert ── */}
      {isDuplicateTitle && (
        <div
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          <span className="text-sm flex-shrink-0 mt-px">⚠️</span>
          <p style={{ color: '#FCA5A5' }}>
            <strong style={{ color: '#FCA5A5' }}>Titre dupliqué détecté</strong> — votre titre SEO
            est identique au nom du site <em>({siteName})</em>. Personnalisez-le pour améliorer
            le taux de clic dans Google.
          </p>
        </div>
      )}

      {/* ── Character progress bars ── */}
      <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>
          Longueur des balises
        </p>
        <CharBar
          value={titleLen}
          minOk={50}
          maxOk={60}
          hardMax={70}
          label="Titre SEO"
        />
        <CharBar
          value={descLen}
          minOk={140}
          maxOk={160}
          hardMax={180}
          label="Meta description"
        />
      </div>

      {/* ── Tips strip ── */}
      {score < 90 && (
        <div
          className="rounded-xl px-3 py-2.5 space-y-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>
            Prochaines actions
          </p>
          {criteria
            .filter(c => c.status !== 'ok')
            .slice(0, 3)
            .map(c => (
              <p key={c.id} className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                <span>{criterionIcon(c.status)}</span>
                <span>
                  <strong style={{ color: criterionColor(c.status) }}>{c.label}</strong>
                  {' — '}{c.detail}
                </span>
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
