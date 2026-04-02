'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChartDay { date: string; count: number }
interface RecentVisit { id: number; ip: string | null; userAgent: string | null; page: string; createdAt: string }
interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  weekVisits: number;
  chartDays: ChartDay[];
  pageBreakdown: Record<string, number>;
  recentVisits: RecentVisit[];
}

type Period = '7' | '30' | 'all';

/* ─── SVG Bar Chart — light background ─── */
function BarChart({ days }: { days: ChartDay[] }) {
  const W = 600;
  const H = 130;
  const PAD = { top: 14, bottom: 28, left: 32, right: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const max = Math.max(...days.map(d => d.count), 1);
  const barW = Math.max(3, (chartW / days.length) - 3);
  const labelEvery = days.length <= 7 ? 1 : days.length <= 14 ? 2 : 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" style={{ overflow: 'visible' }}>
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = PAD.top + chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
              stroke="rgba(17,17,17,0.06)" strokeWidth={1}
            />
            {ratio > 0 && (
              <text x={PAD.left - 6} y={y + 3.5} textAnchor="end" fontSize={8} fill="#A8A8A8">
                {Math.round(max * ratio)}
              </text>
            )}
          </g>
        );
      })}

      {/* Bars */}
      {days.map((d, i) => {
        const barH = max === 0 ? 0 : (d.count / max) * chartH;
        const x = PAD.left + i * (chartW / days.length) + (chartW / days.length - barW) / 2;
        const y = PAD.top + chartH - barH;
        const isToday = d.date === new Date().toISOString().split('T')[0];

        return (
          <g key={d.date}>
            <rect
              x={x} y={y} width={barW}
              height={Math.max(barH, d.count > 0 ? 2 : 0)}
              rx={3}
              fill={isToday ? '#E8650A' : d.count > 0 ? 'rgba(232,101,10,0.28)' : 'rgba(17,17,17,0.05)'}
            />
            {d.count > 0 && barH > 14 && (
              <text x={x + barW / 2} y={y - 3} textAnchor="middle"
                fontSize={7} fill={isToday ? '#E8650A' : '#A8A8A8'}>
                {d.count}
              </text>
            )}
            {i % labelEvery === 0 && (
              <text
                x={x + barW / 2} y={H - 4}
                textAnchor="middle" fontSize={7.5}
                fill={isToday ? '#E8650A' : '#A8A8A8'}
              >
                {new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function parseUA(ua: string | null): string {
  if (!ua) return '—';
  if (/iPhone|iPad/.test(ua)) return '📱';
  if (/Android/.test(ua)) return '📱';
  if (/Windows/.test(ua)) return '🖥️';
  if (/Mac/.test(ua)) return '🖥️';
  if (/Linux/.test(ua)) return '🐧';
  return '🌐';
}

function parseUALabel(ua: string | null): string {
  if (!ua) return '—';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Navigateur';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

const PERIODS: [Period, string][] = [['7', '7 jours'], ['30', '30 jours'], ['all', 'Tout']];

const PERIOD_LABEL: Record<Period, string> = {
  '7': '7 derniers jours',
  '30': '30 derniers jours',
  'all': 'Depuis le début',
};

export default function AdminVisitsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<Period>('30');
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        fetch(`/api/visits?period=${period}`),
        fetch('/api/settings'),
      ]);
      const data = await statsRes.json();
      const settings = await settingsRes.json();
      if (!statsRes.ok || data.error) { setLoading(false); return; }
      setStats(data);
      setTrackingEnabled(settings.trackingEnabled !== false);
    } catch {
      showToast('❌ Erreur de chargement');
    }
    setLoading(false);
  }, [period]);

  useEffect(() => { load(); }, [load]);

  async function toggleTracking() {
    const newVal = !trackingEnabled;
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingEnabled: newVal }),
    });
    setTrackingEnabled(newVal);
    showToast(newVal ? '✅ Tracking activé' : '⏸️ Tracking désactivé');
  }

  async function resetStats() {
    if (!confirm('Supprimer toutes les statistiques de visites ? Cette action est irréversible.')) return;
    await fetch('/api/visits', { method: 'DELETE' });
    showToast('🗑️ Statistiques réinitialisées');
    load();
  }

  const kpis = stats ? [
    { label: 'Visites totales',     value: stats.totalVisits,    icon: '👁️', color: '#1D4ED8', bg: '#EFF6FF' },
    { label: 'Visiteurs uniques',   value: stats.uniqueVisitors, icon: '👤', color: '#7C3AED', bg: '#F5F3FF' },
    { label: "Aujourd'hui",         value: stats.todayVisits,    icon: '📅', color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Cette semaine',       value: stats.weekVisits,     icon: '📈', color: '#E8650A', bg: '#FEF0E6' },
  ] : [];

  const hasData = stats && !stats.chartDays.every(d => d.count === 0);

  return (
    <div className="dcm-page">

      {/* Toast */}
      {toast && (
        <div className="admin-toast">{toast}</div>
      )}

      {/* ── Header ── */}
      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">Statistiques</h1>
          <p className="dcm-page-subtitle">Trafic sans cookies ni localStorage · RGPD</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTracking}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 14px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 600,
              border: '0.5px solid',
              cursor: 'pointer', transition: 'all 0.15s',
              background: trackingEnabled ? 'rgba(34,197,94,0.08)' : 'rgba(107,107,107,0.08)',
              borderColor: trackingEnabled ? 'rgba(34,197,94,0.25)' : 'var(--border)',
              color: trackingEnabled ? '#16A34A' : 'var(--text-muted)',
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: trackingEnabled ? '#22C55E' : '#A8A8A8',
            }} />
            {trackingEnabled ? 'Tracking actif' : 'Tracking inactif'}
          </button>
          <button
            onClick={resetStats}
            style={{
              padding: '7px 14px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 600,
              border: '0.5px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.06)',
              color: '#EF4444', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ── Period selector ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }} className="admin-fade-in">
        {PERIODS.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`visits-period-pill${period === val ? ' active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)',
              animation: 'icon-spin 0.7s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chargement...</span>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* ── KPIs ── */}
          <section className="dcm-section admin-fade-in-1">
            <p className="dcm-section-label">Vue d&apos;ensemble · {PERIOD_LABEL[period]}</p>
            <div className="dcm-kpi-grid">
              {kpis.map(kpi => (
                <div key={kpi.label} className="visits-kpi-card">
                  <div className="visits-kpi-icon" style={{ background: kpi.bg }}>
                    {kpi.icon}
                  </div>
                  <p className="visits-kpi-value" style={{ color: kpi.color }}>
                    {(kpi.value ?? 0).toLocaleString('fr-FR')}
                  </p>
                  <p className="visits-kpi-label">{kpi.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Graphique ── */}
          <section className="dcm-section admin-fade-in-2">
            <div className="visits-chart-card">
              <div className="visits-chart-header">
                <p className="dcm-section-label" style={{ marginBottom: 0 }}>Évolution des visites</p>
                <span className="visits-chart-period-label">{PERIOD_LABEL[period]}</span>
              </div>
              {!hasData ? (
                <div style={{
                  height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: 'var(--text-muted)',
                }}>
                  Aucune visite enregistrée sur cette période
                </div>
              ) : (
                <BarChart days={stats.chartDays} />
              )}
            </div>
          </section>

          {/* ── Pages + Dernières visites ── */}
          <section className="dcm-section admin-fade-in-3">
            <div className="visits-bottom-grid">

              {/* Pages visitées */}
              <div className="visits-pages-card">
                <p className="dcm-section-label" style={{ marginBottom: 16 }}>Pages visitées</p>
                {Object.keys(stats.pageBreakdown).length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aucune donnée</p>
                ) : (
                  <div>
                    {Object.entries(stats.pageBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([page, count]) => {
                        const total = stats.totalVisits || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={page} className="visits-page-row">
                            <div className="visits-page-bar-meta">
                              <span className="visits-page-name">/{page}</span>
                              <span className="visits-page-count">{count} · {pct}%</span>
                            </div>
                            <div className="visits-page-bar-track">
                              <div className="visits-page-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Dernières visites */}
              <div className="visits-recent-card">
                <p className="dcm-section-label" style={{ marginBottom: 16 }}>Dernières visites</p>
                {stats.recentVisits.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aucune visite enregistrée</p>
                ) : (
                  <div>
                    {stats.recentVisits.map(v => (
                      <div key={v.id} className="visits-recent-row">
                        <span className="visits-recent-device" title={parseUALabel(v.userAgent)}>
                          {parseUA(v.userAgent)}
                        </span>
                        <div className="visits-recent-info">
                          <span className="visits-recent-ip">{v.ip || '—'}</span>
                          <span className="visits-recent-sep">·</span>
                          <span className="visits-recent-page">/{v.page}</span>
                        </div>
                        <span className="visits-recent-time">{formatTime(v.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* ── RGPD ── */}
          <p className="visits-rgpd-note admin-fade-in-4">
            🔒 Données anonymisées · IP tronquée · Aucun cookie · Aucun localStorage
          </p>
        </>
      ) : null}
    </div>
  );
}
