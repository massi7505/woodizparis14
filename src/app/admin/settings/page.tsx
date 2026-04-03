'use client';

import { useState, useEffect, useRef } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorPicker from '@/components/admin/ColorPicker';
import SeoScoreWidget from '@/components/admin/SeoScoreWidget';

/* ── Tag/Chip input for meta keywords ─────────────────────────────────────── */
function KeywordsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tags = value.split(',').map((t: string) => t.trim()).filter(Boolean);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || tags.includes(tag)) { setInput(''); return; }
    onChange([...tags, tag].join(', '));
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t: string) => t !== tag).join(', '));
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      className="admin-input flex flex-wrap gap-1.5 h-auto min-h-[44px] cursor-text"
      style={{ padding: '8px 14px', alignItems: 'center' }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag: string, i: number) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(232,101,10,0.22)' }}
        >
          {tag}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); removeTag(tag); }}
            style={{ lineHeight: 1, opacity: 0.6, fontWeight: 700, fontSize: 13 }}
            className="hover:opacity-100 transition-opacity"
          >×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => {
          const v = e.target.value;
          if (v.endsWith(',')) { addTag(v.slice(0, -1)); } else { setInput(v); }
        }}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input); }}
        className="flex-1 bg-transparent border-none outline-none text-sm"
        style={{ minWidth: 140, color: 'var(--admin-text)' }}
        placeholder={tags.length === 0 ? 'Tapez un mot-clé puis Entrée...' : 'Ajouter un mot-clé...'}
      />
    </div>
  );
}

/* ── Inline character progress bar (used on SEO fields) ─────────────── */
function CharProgressBar({ value, minOk, maxOk, hardMax }: {
  value: number; minOk: number; maxOk: number; hardMax: number;
}) {
  const ceiling = hardMax + Math.round(hardMax * 0.25);
  const pct = Math.min(100, (value / ceiling) * 100);
  const color =
    value === 0 ? '#4B5563'
    : value < minOk ? '#EF4444'
    : value <= maxOk ? '#22C55E'
    : value <= hardMax ? '#F97316'
    : '#EF4444';
  const hint =
    value === 0 ? `0 — non renseigné`
    : value < minOk ? `${value} car. — trop court (min ${minOk})`
    : value <= maxOk ? `${value} car. — idéal ✓`
    : value <= hardMax ? `${value} car. — un peu long`
    : `${value} car. — trop long (max ${maxOk})`;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="ml-2 text-[11px] font-bold flex-shrink-0" style={{ color }}>{hint}</span>
      </div>
    </div>
  );
}

function contrastColor(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#ffffff';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

const DEFAULT_SETTINGS = {
  siteName: 'Woodiz Paris 15', siteSlogan: 'Pizza artisanale au feu de bois',
  logoUrl: '', faviconUrl: '', defaultLanguage: 'fr', homePage: 'linktree',
  primaryColor: '#F59E0B', secondaryColor: '#1F2937', accentColor: '#EF4444',
  backgroundColor: '#111827', textColor: '#FFFFFF',
  googleMapsUrl: '', googleReviewsUrl: '', instagramUrl: '',
  phoneNumber: '', address: '', metaTitle: '', metaDescription: '', metaKeywords: '',
  metaImageUrl: '', ogTitle: '', ogDescription: '', canonicalUrl: '', enabledLocales: '["fr","en","it","es"]',
  reviewPopupEnabled: false, reviewPopupDelay: 5, reviewPopupFrequency: 'repeat', reviewPopupRepeatDays: 7,
  showFeatured: true, showWeekSpecial: true,
  featuredTitles: '{"fr":"⭐ Produits en Vedette","en":"⭐ Featured Products","it":"⭐ Prodotti in Evidenza","es":"⭐ Productos Destacados"}',
  weekTitles: '{"fr":"🔥 Produit de la Semaine","en":"🔥 Product of the Week","it":"🔥 Prodotto della Settimana","es":"🔥 Producto de la Semana"}',
  orderButtonEnabled: false,
  orderButtonLabel: 'Commander en ligne',
  orderButtonUrl: '',
  loginButtonEnabled: false,
  loginButtonUrl: 'https://app.woodiz14.fr/login',
  registerButtonEnabled: false,
  registerButtonUrl: 'https://app.woodiz14.fr/register',
};

const ALL_LOCALES = [
  { code: 'fr', label: '🇫🇷 Français', disabled: true },
  { code: 'en', label: '🇬🇧 English', disabled: false },
  { code: 'it', label: '🇮🇹 Italiano', disabled: false },
  { code: 'es', label: '🇪🇸 Español', disabled: false },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'general' | 'seo' | 'colors' | 'social' | 'menu'>('general');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings({ ...DEFAULT_SETTINGS, ...data });
  }
  useEffect(() => { load(); }, []);

  function set(key: string, value: any) {
    setSettings((s: any) => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings({ ...DEFAULT_SETTINGS, ...data });
      showToast('✅ Paramètres sauvegardés');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">⚙️ Paramètres</h1>
          <p className="dcm-page-subtitle">Configuration globale du site</p>
        </div>
        <button onClick={save} disabled={saving} className="admin-btn-primary disabled:opacity-50">
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
      </div>

      {/* Tabs */}
      <div className="dcm-tabs-bar">
        {([['general', '🏠 Général'], ['colors', '🎨 Couleurs'], ['seo', '🔍 SEO'], ['social', '🌐 Liens'], ['menu', '🍕 Menu']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`dcm-tab-pill${tab === t ? ' active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== GENERAL ===== */}
      {tab === 'general' && (
        <div className="space-y-5">
          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Identité</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nom du site</label>
                <input type="text" value={settings.siteName} onChange={e => set('siteName', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Slogan</label>
                <input type="text" value={settings.siteSlogan || ''} onChange={e => set('siteSlogan', e.target.value)} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Téléphone</label>
                <input type="text" value={settings.phoneNumber || ''} onChange={e => set('phoneNumber', e.target.value)} className="admin-input" placeholder="+33 1 00 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Langue par défaut</label>
                <select value={settings.defaultLanguage} onChange={e => set('defaultLanguage', e.target.value)} className="admin-input">
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Adresse</label>
              <input type="text" value={settings.address || ''} onChange={e => set('address', e.target.value)} className="admin-input" placeholder="93 Rue Lecourbe, Paris 75015" />
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Page d'accueil</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['linktree', '🔗 Linktree (défaut)'], ['menu', '🍕 Page Menu']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => set('homePage', val)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${settings.homePage === val ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{val === 'linktree' ? 'Page lien avec boutons' : 'Catalogue produits directement'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Médias</h3>
            <ImageUploader value={settings.logoUrl} onChange={url => set('logoUrl', url)} onRemove={() => set('logoUrl', '')} folder="brand" label="Logo (PNG transparent recommandé)" aspectRatio="aspect-square" />
            <ImageUploader value={settings.faviconUrl} onChange={url => set('faviconUrl', url)} onRemove={() => set('faviconUrl', '')} folder="brand" label="Favicon (.ico ou .png 32×32)" aspectRatio="aspect-square" />
          </div>

          <div className="admin-card space-y-4">
            <h3 className="font-bold text-white">Langues actives</h3>
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>Le Français est toujours actif. Désactivez les autres langues pour masquer le sélecteur.</p>
            <div className="space-y-2">
              {ALL_LOCALES.map(({ code, label, disabled }) => {
                const enabled: string[] = (() => { try { return JSON.parse(settings.enabledLocales || '[]'); } catch { return ['fr','en','it','es']; } })();
                const isChecked = enabled.includes(code);
                return (
                  <label key={code} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer ${disabled ? 'opacity-50' : ''}`} style={{ background: 'var(--admin-surface-2)' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={e => {
                        const next = e.target.checked ? [...enabled, code] : enabled.filter((l: string) => l !== code);
                        set('enabledLocales', JSON.stringify(['fr', ...next.filter((l: string) => l !== 'fr')]));
                      }}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="text-sm" style={{ color: 'var(--admin-text)' }}>{label}</span>
                    {disabled && <span className="text-xs ml-auto" style={{ color: 'var(--admin-text-muted)' }}>Requis</span>}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== COLORS ===== */}
      {tab === 'colors' && (
        <div className="space-y-5">
          {/* Preset themes */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Thèmes prédéfinis</h3>
                <p className="text-xs text-gray-500 mt-0.5">Un clic pour appliquer, puis ajustez librement.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  name: 'Woodiz Flame', tag: 'Défaut',
                  primary: '#F59E0B', accent: '#EF4444', bg: '#0C0A09', text: '#FAFAF9',
                  gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                },
                {
                  name: 'Nuit Profonde', tag: 'Dark',
                  primary: '#6366F1', accent: '#A78BFA', bg: '#030712', text: '#F9FAFB',
                  gradient: 'linear-gradient(135deg, #6366F1 0%, #A78BFA 100%)',
                },
                {
                  name: 'Océan Luxe', tag: 'Blue',
                  primary: '#0EA5E9', accent: '#38BDF8', bg: '#020617', text: '#F0F9FF',
                  gradient: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
                },
                {
                  name: 'Émeraude', tag: 'Green',
                  primary: '#10B981', accent: '#34D399', bg: '#022C22', text: '#ECFDF5',
                  gradient: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
                },
                {
                  name: 'Rose Velvet', tag: 'Pink',
                  primary: '#EC4899', accent: '#F43F5E', bg: '#1A0010', text: '#FDF2F8',
                  gradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                },
                {
                  name: 'Aurora', tag: 'Aurora',
                  primary: '#8B5CF6', accent: '#EC4899', bg: '#0D0814', text: '#FAF5FF',
                  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
                },
                {
                  name: 'Solaire', tag: 'Light',
                  primary: '#D97706', accent: '#EF4444', bg: '#FFFBEB', text: '#1C1917',
                  gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                },
                {
                  name: 'Monochrome', tag: 'Minimal',
                  primary: '#18181B', accent: '#3B82F6', bg: '#FFFFFF', text: '#09090B',
                  gradient: 'linear-gradient(135deg, #27272A 0%, #52525B 100%)',
                },
                {
                  name: 'Charbon Rouge', tag: 'Bold',
                  primary: '#EF4444', accent: '#F97316', bg: '#0A0A0A', text: '#FAFAFA',
                  gradient: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                },
                {
                  name: 'Glacier', tag: 'Ice',
                  primary: '#22D3EE', accent: '#818CF8', bg: '#0B1120', text: '#E0F2FE',
                  gradient: 'linear-gradient(135deg, #22D3EE 0%, #818CF8 100%)',
                },
              ].map((theme) => {
                const isActive =
                  settings.primaryColor === theme.primary &&
                  settings.backgroundColor === theme.bg;
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      set('primaryColor', theme.primary);
                      set('secondaryColor', theme.bg === '#FFFFFF' || theme.bg === '#FFFBEB' ? '#F4F4F5' : '#1F2937');
                      set('accentColor', theme.accent);
                      set('backgroundColor', theme.bg);
                      set('textColor', theme.text);
                    }}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all text-left group ${isActive ? 'border-white/60 scale-[1.02]' : 'border-transparent hover:border-white/20'}`}
                    style={{ background: theme.bg }}
                  >
                    {/* Gradient band */}
                    <div className="h-10 w-full" style={{ background: theme.gradient }} />

                    {/* Content */}
                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-black leading-none" style={{ color: theme.text }}>{theme.name}</p>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: theme.primary + '30', color: theme.primary }}
                        >{theme.tag}</span>
                      </div>
                      <div className="flex gap-1">
                        {[theme.primary, theme.accent, theme.bg === '#FFFFFF' || theme.bg === '#FFFBEB' ? '#E4E4E7' : '#374151'].map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>

                    {/* Active checkmark */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom colors */}
          <div className="admin-card space-y-5">
            <h3 className="font-bold text-white">Personnalisation</h3>
            {[
              { key: 'primaryColor', label: 'Couleur principale (boutons, prix, accents)' },
              { key: 'secondaryColor', label: 'Couleur secondaire (fond cartes)' },
              { key: 'accentColor', label: 'Couleur d\'accentuation (badges, alertes)' },
              { key: 'backgroundColor', label: 'Fond général du site' },
              { key: 'textColor', label: 'Couleur de texte principale' },
            ].map(({ key, label }) => (
              <ColorPicker key={key} value={settings[key] || '#000000'} onChange={c => set(key, c)} label={label} />
            ))}
          </div>

          {/* Live Preview */}
          <div className="admin-card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aperçu en direct</p>
            </div>

            {/* Hero / Page preview */}
            <div className="p-5 space-y-3" style={{ backgroundColor: settings.backgroundColor }}>
              {/* Header bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md font-black text-[10px] flex items-center justify-center" style={{ backgroundColor: settings.primaryColor, color: contrastColor(settings.primaryColor) }}>W</div>
                  <span className="text-[10px] font-bold" style={{ color: settings.textColor }}>Woodiz Paris 15</span>
                </div>
                <div className="flex gap-1">
                  <div className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: settings.primaryColor, color: contrastColor(settings.primaryColor) }}>Commander</div>
                </div>
              </div>

              {/* Hero card mock */}
              <div className="rounded-xl overflow-hidden" style={{ background: `linear-gradient(105deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), ${settings.secondaryColor}` }}>
                <div className="p-3">
                  <div className="h-0.5 w-5 rounded-full mb-1.5" style={{ backgroundColor: settings.accentColor }} />
                  <p className="text-xs font-black text-white">Plus qu'une pizza</p>
                  <p className="text-[9px] text-white/70 mt-0.5">Le plaisir commence ici.</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: settings.primaryColor, color: contrastColor(settings.primaryColor) }}>
                    Commander →
                  </div>
                </div>
              </div>

              {/* Product cards */}
              <div className="flex gap-2">
                {['Pizza Margherita', 'Pizza 4 Fromages'].map((p, i) => (
                  <div key={i} className="flex-1 rounded-lg p-2" style={{ backgroundColor: settings.secondaryColor }}>
                    <p className="text-[9px] font-bold truncate" style={{ color: contrastColor(settings.secondaryColor) }}>{p}</p>
                    <p className="text-[10px] font-black mt-0.5" style={{ color: settings.primaryColor }}>12,90 €</p>
                  </div>
                ))}
              </div>

              {/* Accent badge */}
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: settings.accentColor, color: contrastColor(settings.accentColor) }}>NOUVEAU</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>PROMO -20%</span>
              </div>
            </div>

            {/* Footer preview */}
            <div className="px-4 py-3" style={{ backgroundColor: settings.backgroundColor === '#FFFFFF' || settings.backgroundColor === '#FFFBEB' ? '#111827' : settings.backgroundColor, opacity: 0.9 }}>
              <div className="h-px w-full mb-2" style={{ background: `linear-gradient(90deg, transparent, ${settings.primaryColor}, transparent)` }} />
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-gray-500">© 2026 Woodiz Paris 15</p>
                <p className="text-[9px] font-medium" style={{ color: settings.primaryColor }}>AdsBooster</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEO ===== */}
      {tab === 'seo' && (
        <div className="space-y-4">
          {/* SERP Preview */}
          <div className="admin-card">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Aperçu Google</p>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-[#1a0dab] text-lg font-medium truncate hover:underline cursor-pointer">
                {settings.metaTitle || settings.siteName || 'Titre de votre site'}
              </p>
              <p className="text-[#006621] text-sm">{(settings.canonicalUrl || 'votre-site.com').replace(/^https?:\/\//, '')} › menu</p>
              <p className="text-[#545454] text-sm mt-1 line-clamp-2">
                {settings.metaDescription || 'Description de votre site...'}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="admin-card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Titre SEO (balise title)</label>
              <input type="text" value={settings.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} className="admin-input" placeholder="Woodiz Paris 15 — Pizza artisanale au feu de bois" />
              <CharProgressBar value={(settings.metaTitle || '').length} minOk={50} maxOk={60} hardMax={70} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Description SEO (meta description)</label>
              <textarea value={settings.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} className="admin-input resize-none h-20" placeholder="Pizzeria artisanale au feu de bois à Paris 15. Pâte maison, ingrédients frais du marché. Commandez en ligne sur Uber Eats, Deliveroo..." />
              <CharProgressBar value={(settings.metaDescription || '').length} minOk={140} maxOk={160} hardMax={180} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Mots-clés (meta keywords)</label>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {(settings.metaKeywords || '').split(',').filter((k: string) => k.trim()).length} mots-clés
                </span>
              </div>
              <KeywordsInput value={settings.metaKeywords || ''} onChange={v => set('metaKeywords', v)} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Entrée ou virgule pour ajouter · Backspace pour supprimer · Utile pour Bing</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>URL Canonique (votre domaine principal)</label>
              <input type="url" value={settings.canonicalUrl || ''} onChange={e => set('canonicalUrl', e.target.value)} className="admin-input" placeholder="https://woodiz.fr" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Définit votre domaine principal — utilisé dans le sitemap, robots.txt et les balises hreflang.</p>
            </div>
          </div>

          {/* SEO Score Widget */}
          <SeoScoreWidget
            title={settings.metaTitle || ''}
            description={settings.metaDescription || ''}
            keywords={settings.metaKeywords || ''}
            canonicalUrl={settings.canonicalUrl || ''}
            metaImageUrl={settings.metaImageUrl || ''}
            siteName={settings.siteName || ''}
          />

          {/* OG / Social Sharing */}
          <div className="admin-card space-y-4">
            <div>
              <h4 className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>🖼️ Partage sur les réseaux (Open Graph)</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ce qui s'affiche quand vous partagez le lien sur WhatsApp, Facebook, Instagram, LinkedIn…
              </p>
            </div>

            <ImageUploader value={settings.metaImageUrl} onChange={url => set('metaImageUrl', url)} onRemove={() => set('metaImageUrl', '')} folder="brand" label="Photo de partage (1200×630 px recommandé)" />

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Titre (optionnel — sinon utilise le titre SEO)
              </label>
              <input
                type="text"
                value={settings.ogTitle || ''}
                onChange={e => set('ogTitle', e.target.value)}
                className="admin-input"
                placeholder={settings.metaTitle || settings.siteName || 'Titre de partage…'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Description (optionnel — sinon utilise la description SEO)
              </label>
              <textarea
                value={settings.ogDescription || ''}
                onChange={e => set('ogDescription', e.target.value)}
                className="admin-input resize-none h-16"
                placeholder={settings.metaDescription || 'Description de partage…'}
              />
            </div>

            {/* Live preview card */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                Aperçu carte de partage
              </p>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)', maxWidth: 400 }}>
                {/* Image zone */}
                <div
                  className="w-full flex items-center justify-center"
                  style={{
                    aspectRatio: '1200/630',
                    background: settings.metaImageUrl
                      ? `url(${settings.metaImageUrl}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
                  }}
                >
                  {!settings.metaImageUrl && (
                    <div className="text-center">
                      <p className="text-3xl mb-1">🖼️</p>
                      <p className="text-xs text-gray-500">Ajoutez une photo ci-dessus</p>
                    </div>
                  )}
                </div>
                {/* Meta info */}
                <div className="px-3 py-2.5" style={{ background: '#1E1E1E' }}>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">
                    {(settings.canonicalUrl || 'woodiz15.fr').replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </p>
                  <p className="text-sm font-semibold text-white leading-tight truncate">
                    {settings.ogTitle || settings.metaTitle || settings.siteName || 'Titre du site'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {settings.ogDescription || settings.metaDescription || 'Description du site…'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO status badges */}
          <div className="admin-card space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Signaux de confiance actifs</p>
            {[
              { icon: '✅', label: 'Schema.org Restaurant (JSON-LD)', desc: 'Rich snippets Google : étoiles, horaires, adresse, prix.' },
              { icon: '✅', label: 'Sitemap XML dynamique', desc: '/sitemap.xml — généré automatiquement avec toutes les pages FR/EN/IT/ES.' },
              { icon: '✅', label: 'Robots.txt optimisé', desc: '/robots.txt — crawl autorisé, admin et API protégés.' },
              { icon: '✅', label: 'Open Graph & Twitter Card', desc: 'Aperçu riche sur WhatsApp, Facebook, X, LinkedIn.' },
              { icon: '✅', label: 'Hreflang multilingue', desc: 'Balises lang FR/EN/IT/ES pour cibler les bonnes régions.' },
              { icon: '✅', label: 'Canonical URL', desc: 'Évite le contenu dupliqué — définissez votre URL principale ci-dessus.' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Google Search Console */}
          <div className="admin-card" style={{ background: 'var(--accent-soft)', border: '0.5px solid rgba(232,101,10,0.22)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🔍</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>Google Search Console — Action requise</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Pour indexer le site rapidement et surveiller les positions SEO :<br />
                  1. Allez sur <strong>search.google.com/search-console</strong><br />
                  2. Ajoutez votre domaine (ex : woodiz.fr)<br />
                  3. Vérification recommandée : <strong>méthode DNS</strong> (la plus fiable)<br />
                  4. Soumettez le sitemap : <strong>{(settings.canonicalUrl || 'https://woodiz.fr').replace(/\/$/, '')}/sitemap.xml</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SOCIAL / LINKS ===== */}
      {tab === 'social' && (
        <div className="space-y-4">
        <div className="admin-card space-y-4">
          <h3 className="font-bold text-white">Réseaux & Liens utiles</h3>
          {[
            { key: 'googleMapsUrl', label: '📍 Google Maps URL', placeholder: 'https://maps.google.com/...' },
            { key: 'googleReviewsUrl', label: '⭐ Google Avis URL', placeholder: 'https://maps.google.com/.../reviews' },
            { key: 'instagramUrl', label: '📸 Instagram', placeholder: 'https://instagram.com/woodizparis' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
              <input type="url" value={settings[key] || ''} onChange={e => set(key, e.target.value)} className="admin-input" placeholder={placeholder} />
            </div>
          ))}
        </div>

        {/* Review Popup */}
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">⭐ Popup Avis Google</h3>
              <p className="text-xs text-gray-500 mt-0.5">Demande automatiquement un avis aux visiteurs</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.reviewPopupEnabled}
                onChange={e => set('reviewPopupEnabled', e.target.checked)}
                className="accent-amber-500 w-4 h-4"
              />
              <span className="text-sm text-white font-medium">Activer</span>
            </label>
          </div>

          {settings.reviewPopupEnabled && (
            <div className="space-y-4 pt-3 border-t border-gray-700">

              {/* Google link */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Lien Google Avis</label>
                <input
                  type="url"
                  value={settings.googleReviewsUrl || ''}
                  onChange={e => set('googleReviewsUrl', e.target.value)}
                  className="admin-input"
                  placeholder="https://g.page/r/votre-établissement/review"
                />
                <p className="text-xs text-gray-600 mt-1">Google Business Profile → Demander des avis → copier le lien.</p>
              </div>

              {/* Delay */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Délai avant affichage</label>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 10, 20, 30].map(sec => (
                    <button key={sec} type="button" onClick={() => set('reviewPopupDelay', sec)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${settings.reviewPopupDelay === sec ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Fréquence d'affichage</label>
                <div className="space-y-2">
                  {[
                    { value: 'always', label: '🔁 Toujours', desc: 'S\'affiche à chaque visite' },
                    { value: 'once', label: '1️⃣ Une seule fois', desc: 'Disparaît définitivement après fermeture' },
                    { value: 'repeat', label: '⏳ Réapparaître après X jours', desc: 'Si fermé sans cliquer, réapparaît plus tard' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-start gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all ${settings.reviewPopupFrequency === opt.value ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-gray-800 border border-transparent'}`}>
                      <input type="radio" name="popupFrequency" value={opt.value}
                        checked={settings.reviewPopupFrequency === opt.value}
                        onChange={() => set('reviewPopupFrequency', opt.value)}
                        className="accent-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Repeat days — only if frequency === repeat */}
              {settings.reviewPopupFrequency === 'repeat' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Réapparaître après</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 7, 14, 30].map(d => (
                      <button key={d} type="button" onClick={() => set('reviewPopupRepeatDays', d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${settings.reviewPopupRepeatDays === d ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {d} jour{d > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5">Si le client clique sur "Laisser un avis" → ne réapparaît jamais.</p>
                </div>
              )}

              {/* Preview */}
              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aperçu</p>
                <div className="bg-white rounded-3xl overflow-hidden max-w-xs mx-auto" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <div className="h-1.5 w-full" style={{ background: settings.primaryColor || '#F59E0B' }} />
                  <div className="p-4 text-center">
                    <div className="flex justify-center gap-0.5 mb-2">
                      {[1,2,3,4,5].map(i => <span key={i} className="text-xl" style={{ color: settings.primaryColor || '#F59E0B' }}>★</span>)}
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">Vous avez aimé ?</p>
                    <p className="text-xs text-gray-500 mb-3">Laissez-nous un avis Google, ça nous aide beaucoup !</p>
                    <div className="py-2 rounded-2xl text-white text-xs font-bold" style={{ background: settings.primaryColor || '#F59E0B' }}>
                      ⭐ Laisser un avis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {tab === 'menu' && (
        <div className="space-y-4">
          {/* Featured section */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">⭐ Produits en Vedette</h3>
                <p className="text-xs text-gray-500 mt-0.5">Section affichée en haut du menu</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!settings.showFeatured} onChange={e => set('showFeatured', e.target.checked)} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white font-medium">Afficher</span>
              </label>
            </div>
            {settings.showFeatured && (
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre de la section par langue</p>
                {[['fr','🇫🇷'],['en','🇬🇧'],['it','🇮🇹'],['es','🇪🇸']].map(([loc, flag]) => {
                  let titles: Record<string, string> = {};
                  try { titles = JSON.parse(settings.featuredTitles || '{}'); } catch {}
                  return (
                    <div key={loc} className="flex items-center gap-2">
                      <span className="text-sm w-6 flex-shrink-0">{flag}</span>
                      <input
                        type="text"
                        value={titles[loc] || ''}
                        onChange={e => {
                          const updated = { ...titles, [loc]: e.target.value };
                          set('featuredTitles', JSON.stringify(updated));
                        }}
                        className="admin-input text-sm"
                        placeholder={loc === 'fr' ? '⭐ Produits en Vedette' : loc === 'en' ? '⭐ Featured Products' : loc === 'it' ? '⭐ Prodotti in Evidenza' : '⭐ Productos Destacados'}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order button */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">🛒 Bouton Commander</h3>
                <p className="text-xs text-gray-500 mt-0.5">Affiché dans le header du menu et sur chaque page produit</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.orderButtonEnabled}
                  onChange={e => set('orderButtonEnabled', e.target.checked)}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="text-sm text-white font-medium">Activer</span>
              </label>
            </div>
            {settings.orderButtonEnabled && (
              <div className="space-y-3 pt-3 border-t border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Texte du bouton</label>
                  <input
                    type="text"
                    value={settings.orderButtonLabel || ''}
                    onChange={e => set('orderButtonLabel', e.target.value)}
                    className="admin-input"
                    placeholder="Commander en ligne"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">URL de commande</label>
                  <input
                    type="url"
                    value={settings.orderButtonUrl || ''}
                    onChange={e => set('orderButtonUrl', e.target.value)}
                    className="admin-input"
                    placeholder="https://www.ubereats.com/fr/store/woodiz..."
                  />
                  <p className="text-xs text-gray-600 mt-1">Lien Uber Eats, Deliveroo, Just Eat, ou votre propre système.</p>
                </div>
                {settings.orderButtonUrl && settings.orderButtonUrl !== '#' && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aperçu</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold" style={{ backgroundColor: settings.primaryColor || '#F59E0B', color: '#fff' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {settings.orderButtonLabel || 'Commander en ligne'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth buttons */}
          <div className="admin-card space-y-4">
            <div>
              <h3 className="font-bold text-white">🔐 Connexion / Inscription</h3>
              <p className="text-xs text-gray-500 mt-0.5">Boutons affichés dans le header du menu</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
              {/* Login button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Se connecter</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.loginButtonEnabled}
                      onChange={e => set('loginButtonEnabled', e.target.checked)}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="text-sm text-white font-medium">Activer</span>
                  </label>
                </div>
                {settings.loginButtonEnabled && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
                    <input
                      type="url"
                      value={settings.loginButtonUrl || ''}
                      onChange={e => set('loginButtonUrl', e.target.value)}
                      className="admin-input text-sm"
                      placeholder="https://app.woodiz14.fr/login"
                    />
                  </div>
                )}
              </div>
              {/* Register button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">S&apos;inscrire</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!settings.registerButtonEnabled}
                      onChange={e => set('registerButtonEnabled', e.target.checked)}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="text-sm text-white font-medium">Activer</span>
                  </label>
                </div>
                {settings.registerButtonEnabled && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
                    <input
                      type="url"
                      value={settings.registerButtonUrl || ''}
                      onChange={e => set('registerButtonUrl', e.target.value)}
                      className="admin-input text-sm"
                      placeholder="https://app.woodiz14.fr/register"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Week special section */}
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">🔥 Produit de la Semaine</h3>
                <p className="text-xs text-gray-500 mt-0.5">Section mise en avant hebdomadaire</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!settings.showWeekSpecial} onChange={e => set('showWeekSpecial', e.target.checked)} className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white font-medium">Afficher</span>
              </label>
            </div>
            {settings.showWeekSpecial && (
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre de la section par langue</p>
                {[['fr','🇫🇷'],['en','🇬🇧'],['it','🇮🇹'],['es','🇪🇸']].map(([loc, flag]) => {
                  let titles: Record<string, string> = {};
                  try { titles = JSON.parse(settings.weekTitles || '{}'); } catch {}
                  return (
                    <div key={loc} className="flex items-center gap-2">
                      <span className="text-sm w-6 flex-shrink-0">{flag}</span>
                      <input
                        type="text"
                        value={titles[loc] || ''}
                        onChange={e => {
                          const updated = { ...titles, [loc]: e.target.value };
                          set('weekTitles', JSON.stringify(updated));
                        }}
                        className="admin-input text-sm"
                        placeholder={loc === 'fr' ? '🔥 Produit de la Semaine' : loc === 'en' ? '🔥 Product of the Week' : loc === 'it' ? '🔥 Prodotto della Settimana' : '🔥 Producto de la Semana'}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="w-full admin-btn-primary py-3 text-base disabled:opacity-50">
          {saving ? 'Sauvegarde en cours...' : '💾 Sauvegarder tous les paramètres'}
        </button>
      </div>
    </div>
  );
}
