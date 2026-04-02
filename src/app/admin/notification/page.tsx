'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Clock, Zap, Bell } from 'lucide-react';
import ColorPicker from '@/components/admin/ColorPicker';

const LOCALES = ['fr', 'en', 'it', 'es'];
const LOCALE_FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', es: '🇪🇸' };
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const ANIM_OPTIONS = [
  { value: 'slide', label: 'Slide ↕' },
  { value: 'fade', label: 'Fondu' },
  { value: 'bounce', label: 'Rebond' },
];

const TYPE_OPTIONS = [
  { value: 'custom', label: '✏️ Personnalisé' },
  { value: 'closed', label: '🔒 Fermé (auto)' },
  { value: 'open', label: '✅ Ouvert seulement' },
];

const EMPTY_BANNER = {
  isVisible: true,
  bgColor: '#1F2937',
  textColor: '#F59E0B',
  icon: '',
  link: '',
  linkLabel: '',
  priority: 0,
  displayDuration: 8000,
  animType: 'slide',
  type: 'custom',
  scheduleEnabled: false,
  scheduleStart: '',
  scheduleEnd: '',
  scheduleDays: '[0,1,2,3,4,5,6]',
  sortOrder: 0,
  translations: LOCALES.map(l => ({ locale: l, text: '' })),
};

type Banner = typeof EMPTY_BANNER & { id?: number };

export default function AdminNotificationPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [adding, setAdding] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800); }

  async function load() {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (Array.isArray(data)) setBanners(data.map(normalizeBanner));
    } catch { /* noop */ }
  }

  useEffect(() => { load(); }, []);

  function normalizeBanner(b: any): Banner {
    return {
      ...EMPTY_BANNER,
      ...b,
      translations: LOCALES.map(l => ({
        locale: l,
        text: b.translations?.find((t: any) => t.locale === l)?.text || '',
      })),
    };
  }

  function updateBanner(idx: number, patch: Partial<Banner>) {
    setBanners(bs => bs.map((b, i) => i === idx ? { ...b, ...patch } : b));
  }

  function updateTranslation(bannerIdx: number, locale: string, text: string) {
    setBanners(bs => bs.map((b, i) =>
      i === bannerIdx
        ? { ...b, translations: b.translations.map(t => t.locale === locale ? { ...t, text } : t) }
        : b
    ));
  }

  function toggleDay(bannerIdx: number, day: number) {
    const b = banners[bannerIdx];
    let days: number[] = [];
    try { days = JSON.parse(b.scheduleDays); } catch { days = []; }
    const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort();
    updateBanner(bannerIdx, { scheduleDays: JSON.stringify(next) });
  }

  async function saveBanner(idx: number) {
    const b = banners[idx];
    setSaving(idx);
    try {
      const method = b.id ? 'PUT' : 'POST';
      const url = b.id ? `/api/banners/${b.id}` : '/api/banners';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setBanners(bs => bs.map((x, i) => i === idx ? normalizeBanner(saved) : x));
      showToast('✅ Notification sauvegardée');
    } catch (e) {
      showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`);
    }
    setSaving(null);
  }

  async function deleteBanner(idx: number) {
    const b = banners[idx];
    if (!b.id) { setBanners(bs => bs.filter((_, i) => i !== idx)); return; }
    if (!confirm('Supprimer cette notification ?')) return;
    try {
      await fetch(`/api/banners/${b.id}`, { method: 'DELETE' });
      setBanners(bs => bs.filter((_, i) => i !== idx));
      showToast('🗑️ Supprimée');
    } catch { showToast('❌ Erreur lors de la suppression'); }
  }

  async function toggleVisibility(idx: number) {
    const b = banners[idx];
    const updated = { ...b, isVisible: !b.isVisible };
    setBanners(bs => bs.map((x, i) => i === idx ? updated : x));
    if (b.id) {
      await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    }
  }

  function addBanner() {
    const newBanner = { ...EMPTY_BANNER, sortOrder: banners.length };
    setBanners(bs => [...bs, newBanner]);
    setExpanded(banners.length);
    setAdding(false);
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Header */}
      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">Notifications intelligentes</h1>
          <p className="dcm-page-subtitle">
            {banners.length} notification{banners.length > 1 ? 's' : ''} · rotation automatique avec horaires
          </p>
        </div>
        <button
          onClick={addBanner}
          className="admin-btn-primary flex items-center gap-2 px-4 py-2.5"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Legend */}
      <div className="admin-card mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Priorité haute = affichée en premier</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> Plage horaire optionnelle par notification</span>
        <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-red-400" /> Type "Fermé" → texte auto avec temps restant</span>
      </div>

      {banners.length === 0 && (
        <div className="admin-card text-center py-10 text-gray-500">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aucune notification</p>
          <p className="text-sm mt-1">Cliquez "Ajouter" pour créer votre première notification</p>
        </div>
      )}

      <div className="space-y-3">
        {banners.map((b, idx) => {
          const isOpen = expanded === idx;
          const previewText = b.translations.find(t => t.locale === 'fr')?.text || '';
          let days: number[] = [];
          try { days = JSON.parse(b.scheduleDays); } catch { days = [0,1,2,3,4,5,6]; }

          return (
            <div key={idx} className={`rounded-2xl border transition-all duration-200 ${isOpen ? 'border-amber-500/40' : 'border-gray-700/60'}`}
              style={{ background: 'var(--admin-surface)' }}>

              {/* Banner row header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : idx)}>
                {/* Live preview pill */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: b.type === 'closed' ? '#f87171' : b.type === 'open' ? '#34d399' : '#f59e0b' }}>
                      {TYPE_OPTIONS.find(t => t.value === b.type)?.label}
                    </span>
                    {b.scheduleEnabled && (
                      <span className="text-xs text-blue-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {b.scheduleStart}–{b.scheduleEnd}
                      </span>
                    )}
                    <span className="text-xs text-gray-600">Priorité {b.priority}</span>
                  </div>
                  {previewText ? (
                    <div className="rounded-lg overflow-hidden inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium max-w-full truncate"
                      style={{ backgroundColor: b.bgColor, color: b.textColor }}>
                      {b.icon && <span>{b.icon}</span>}
                      <span className="truncate">{previewText}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600 italic">Aucun texte</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleVisibility(idx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-700"
                    title={b.isVisible ? 'Masquer' : 'Afficher'}>
                    {b.isVisible
                      ? <Eye className="w-4 h-4 text-green-400" />
                      : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                  <button onClick={() => deleteBanner(idx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-900/30">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </div>

              {/* Expanded edit form */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-5 border-t border-gray-700/40 pt-4">

                  {/* Appearance */}
                  <div>
                    <p className="admin-section-title">Apparence</p>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <ColorPicker value={b.bgColor} onChange={c => updateBanner(idx, { bgColor: c })} label="Fond" />
                      <ColorPicker value={b.textColor} onChange={c => updateBanner(idx, { textColor: c })} label="Texte" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Icône</label>
                        <input type="text" value={b.icon || ''} onChange={e => updateBanner(idx, { icon: e.target.value })}
                          className="admin-input text-center text-lg" placeholder="🎉" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Texte lien</label>
                        <input type="text" value={b.linkLabel || ''} onChange={e => updateBanner(idx, { linkLabel: e.target.value })}
                          className="admin-input" placeholder="J'en profite" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">URL lien</label>
                        <input type="url" value={b.link || ''} onChange={e => updateBanner(idx, { link: e.target.value })}
                          className="admin-input" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  {/* Behaviour */}
                  <div>
                    <p className="admin-section-title">Comportement</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select value={b.type} onChange={e => updateBanner(idx, { type: e.target.value })} className="admin-input text-sm">
                          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Animation</label>
                        <select value={b.animType} onChange={e => updateBanner(idx, { animType: e.target.value })} className="admin-input text-sm">
                          {ANIM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Priorité</label>
                        <input type="number" value={b.priority} onChange={e => updateBanner(idx, { priority: parseInt(e.target.value) || 0 })}
                          className="admin-input" min={0} max={100} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 mb-1">Durée d'affichage (ms)</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min={3000} max={30000} step={1000} value={b.displayDuration}
                          onChange={e => updateBanner(idx, { displayDuration: parseInt(e.target.value) })}
                          className="flex-1 accent-amber-400" />
                        <span className="text-sm text-amber-400 font-bold w-14 text-right">{b.displayDuration / 1000}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling — hidden for closed/open types */}
                  {b.type === 'closed' || b.type === 'open' ? (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs"
                      style={{ background: b.type === 'closed' ? 'rgba(239,68,68,0.08)' : 'rgba(52,211,153,0.08)', color: b.type === 'closed' ? '#fca5a5' : '#6ee7b7' }}>
                      <span className="text-base">{b.type === 'closed' ? '🔒' : '✅'}</span>
                      <span>
                        {b.type === 'closed'
                          ? 'S\'affiche automatiquement quand le restaurant est fermé selon les horaires configurés dans'
                          : 'S\'affiche automatiquement quand le restaurant est ouvert selon les horaires configurés dans'}
                        {' '}<a href="/admin/hours" target="_blank" className="underline font-bold">Admin › Horaires</a>.
                        {b.type === 'closed' && ' Aucune programmation manuelle nécessaire.'}
                      </span>
                    </div>
                  ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="admin-section-title mb-0">Programmation horaire</p>
                      <div onClick={() => updateBanner(idx, { scheduleEnabled: !b.scheduleEnabled })}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${b.scheduleEnabled ? 'bg-amber-500' : 'bg-gray-700'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${b.scheduleEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                    {b.scheduleEnabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Début</label>
                            <input type="time" value={b.scheduleStart || ''} onChange={e => updateBanner(idx, { scheduleStart: e.target.value })}
                              className="admin-input" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Fin</label>
                            <input type="time" value={b.scheduleEnd || ''} onChange={e => updateBanner(idx, { scheduleEnd: e.target.value })}
                              className="admin-input" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">Jours actifs</label>
                          <div className="flex gap-1.5 flex-wrap">
                            {DAYS_FR.map((day, d) => (
                              <button key={d} onClick={() => toggleDay(idx, d)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${days.includes(d) ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {/* Translations */}
                  <div>
                    <p className="admin-section-title">Textes multilingues</p>
                    {b.type === 'closed' && (
                      <p className="text-xs text-amber-500/80 mb-3 bg-amber-500/10 rounded-lg px-3 py-2">
                        💡 Laissez vide → texte automatique <em>"Restaurant fermé · Réouverture dans 2h30"</em>.
                        Ou personnalisez avec <code className="bg-gray-800 px-1 rounded">&#123;time&#125;</code> pour insérer le temps calculé.
                        Ex : <em>"Fermé pour ce soir, on rouvre dans &#123;time&#125; !"</em>
                      </p>
                    )}
                    <div className="space-y-2">
                      {LOCALES.map(locale => {
                        const tr = b.translations.find(t => t.locale === locale);
                        return (
                          <div key={locale} className="flex items-center gap-2">
                            <span className="text-lg flex-shrink-0 w-7">{LOCALE_FLAGS[locale]}</span>
                            <input
                              type="text"
                              value={tr?.text || ''}
                              onChange={e => updateTranslation(idx, locale, e.target.value)}
                              className="admin-input flex-1"
                              placeholder={locale === 'fr' ? 'Menu midi : Pizza + boisson 10,90€' : `Text in ${locale}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => saveBanner(idx)}
                    disabled={saving === idx}
                    className="w-full admin-btn-primary py-2.5 disabled:opacity-50"
                  >
                    {saving === idx ? 'Sauvegarde...' : '💾 Sauvegarder cette notification'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 0 && (
        <p className="text-center text-xs text-gray-600 mt-6">
          Les notifications s'affichent en rotation automatique · Programmation par plage horaire · Fermeture auto selon les horaires du restaurant
        </p>
      )}
    </div>
  );
}
