'use client';
import { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorPicker from '@/components/admin/ColorPicker';
import { ChevronSortUpIcon, ChevronSortDownIcon, EditIcon, TrashIcon, CloseIcon } from '@/components/ui/icons';

const ALL_LOCALES = [
  { code: 'fr', label: '🇫🇷 FR' }, { code: 'en', label: '🇬🇧 EN' },
  { code: 'it', label: '🇮🇹 IT' }, { code: 'es', label: '🇪🇸 ES' },
];

const SECTION_TYPES = [
  { key: 'text-image', label: '📝 Texte + Image droite' },
  { key: 'image-text', label: '🖼️ Image gauche + Texte' },
  { key: 'full-text', label: '📄 Texte centré' },
  { key: 'values', label: '⭐ Valeurs / Cartes' },
  { key: 'stats', label: '📊 Statistiques' },
];

const DEFAULT_SECTION = {
  type: 'text-image',
  titleJson: '{"fr":"","en":"","it":"","es":""}',
  textJson: '{"fr":"","en":"","it":"","es":""}',
  imageUrl: '',
  bgColor: '#ffffff',
  textColor: '#111827',
  accentColor: '#f59e0b',
  isVisible: true,
  sortOrder: 0,
  itemsJson: '[]',
};

function parseJ(s: string | null | undefined, fb: any = {}): any {
  try { return s ? JSON.parse(s) : fb; } catch { return fb; }
}
function setKey(cur: string | null | undefined, key: string, val: string): string {
  const o = parseJ(cur, {}); o[key] = val; return JSON.stringify(o);
}

type Tab = 'settings' | 'sections';

export default function AdminNotrHistoirePage() {
  const [tab, setTab] = useState<Tab>('settings');
  const [page, setPage] = useState<any>({ isVisible: true, heroColor: '#111827' });
  const [sections, setSections] = useState<any[]>([]);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [isNewSection, setIsNewSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [localeTab, setLocaleTab] = useState('fr');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/story');
    if (!res.ok) return;
    const data = await res.json();
    setPage(data || { isVisible: true, heroColor: '#111827' });
    setSections(data?.sections || []);
  }

  useEffect(() => { load(); }, []);

  async function saveSettings() {
    setSaving(true);
    const res = await fetch('/api/story', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page),
    });
    setSaving(false);
    if (res.ok) showToast('✅ Paramètres sauvegardés');
    else showToast('❌ Erreur sauvegarde');
  }

  async function saveSection() {
    if (!editingSection) return;
    setSaving(true);
    const url = isNewSection ? '/api/story/sections' : `/api/story/sections/${editingSection.id}`;
    const method = isNewSection ? 'POST' : 'PATCH';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingSection),
    });
    setSaving(false);
    if (res.ok) { showToast('✅ Section sauvegardée'); setEditingSection(null); load(); }
    else showToast('❌ Erreur');
  }

  async function deleteSection(id: number) {
    if (!confirm('Supprimer cette section ?')) return;
    await fetch(`/api/story/sections/${id}`, { method: 'DELETE' });
    showToast('🗑️ Section supprimée');
    load();
  }

  async function moveSection(i: number, dir: -1 | 1) {
    const arr = [...sections];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    await fetch('/api/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'storySection', items: arr.map((s, idx) => ({ id: s.id, sortOrder: idx })) }),
    });
    load();
  }

  // Items editor for values/stats sections
  function addItem() {
    const items = parseJ(editingSection?.itemsJson, []);
    if (editingSection?.type === 'values') {
      items.push({ icon: '⭐', titleJson: '{"fr":"","en":"","it":"","es":""}', descJson: '{"fr":"","en":"","it":"","es":""}', color: '#F59E0B' });
    } else {
      items.push({ value: '100+', labelJson: '{"fr":"","en":"","it":"","es":""}' });
    }
    setEditingSection((s: any) => ({ ...s, itemsJson: JSON.stringify(items) }));
  }
  function updateItem(idx: number, field: string, value: string) {
    const items = parseJ(editingSection?.itemsJson, []);
    items[idx] = { ...items[idx], [field]: value };
    setEditingSection((s: any) => ({ ...s, itemsJson: JSON.stringify(items) }));
  }
  function updateItemJson(idx: number, field: string, locale: string, value: string) {
    const items = parseJ(editingSection?.itemsJson, []);
    const cur = items[idx]?.[field] || '{"fr":"","en":"","it":"","es":""}';
    items[idx] = { ...items[idx], [field]: setKey(cur, locale, value) };
    setEditingSection((s: any) => ({ ...s, itemsJson: JSON.stringify(items) }));
  }
  function removeItem(idx: number) {
    const items = parseJ(editingSection?.itemsJson, []);
    items.splice(idx, 1);
    setEditingSection((s: any) => ({ ...s, itemsJson: JSON.stringify(items) }));
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">📖 Notre Histoire</h1>
          <p className="dcm-page-subtitle">Page histoire publique avec sections personnalisables</p>
        </div>
        <div className="flex gap-2">
          <a href="/notre-histoire" target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            👁️ Aperçu
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="dcm-tabs-loose">
        {(['settings', 'sections'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`dcm-tab-loose${tab === t ? ' active' : ''}`}>
            {t === 'settings' ? '⚙️ Paramètres & SEO' : '🧱 Sections'}
          </button>
        ))}
      </div>

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Visibility */}
          <div className="admin-card">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!page.isVisible}
                onChange={e => setPage((p: any) => ({ ...p, isVisible: e.target.checked }))}
                className="accent-amber-500 w-4 h-4" />
              <span className="text-sm font-medium text-white">👁️ Page visible (accessible publiquement)</span>
            </label>
          </div>

          {/* SEO */}
          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">🔍 SEO</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Titre SEO (par langue)</label>
              <div className="space-y-2">
                {ALL_LOCALES.map(({ code, label }) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                    <input type="text" value={parseJ(page.seoTitleJson)[code] || ''}
                      onChange={e => setPage((p: any) => ({ ...p, seoTitleJson: setKey(p.seoTitleJson, code, e.target.value) }))}
                      placeholder={code === 'fr' ? 'Notre Histoire' : 'Our Story'}
                      className="admin-input text-sm py-1.5" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description SEO (par langue)</label>
              <div className="space-y-2">
                {ALL_LOCALES.map(({ code, label }) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                    <input type="text" value={parseJ(page.seoDescJson)[code] || ''}
                      onChange={e => setPage((p: any) => ({ ...p, seoDescJson: setKey(p.seoDescJson, code, e.target.value) }))}
                      className="admin-input text-sm py-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="admin-card space-y-4">
            <h2 className="font-bold text-white">🦸 Hero</h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Titre hero (par langue)</label>
              <div className="space-y-2">
                {ALL_LOCALES.map(({ code, label }) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                    <input type="text" value={parseJ(page.heroTitleJson)[code] || ''}
                      onChange={e => setPage((p: any) => ({ ...p, heroTitleJson: setKey(p.heroTitleJson, code, e.target.value) }))}
                      className="admin-input text-sm py-1.5" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sous-titre (par langue)</label>
              <div className="space-y-2">
                {ALL_LOCALES.map(({ code, label }) => (
                  <div key={code} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                    <input type="text" value={parseJ(page.heroSubtitleJson)[code] || ''}
                      onChange={e => setPage((p: any) => ({ ...p, heroSubtitleJson: setKey(p.heroSubtitleJson, code, e.target.value) }))}
                      className="admin-input text-sm py-1.5" />
                  </div>
                ))}
              </div>
            </div>
            <ImageUploader label="🖼️ Image hero" value={page.heroImageUrl} folder="story"
              onChange={url => setPage((p: any) => ({ ...p, heroImageUrl: url }))}
              onRemove={() => setPage((p: any) => ({ ...p, heroImageUrl: '' }))} />
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">🎬 Vidéo hero (MP4 — optionnel, remplace l&apos;image)</label>
              <input type="text" value={page.heroVideoUrl || ''}
                onChange={e => setPage((p: any) => ({ ...p, heroVideoUrl: e.target.value }))}
                className="admin-input text-sm" placeholder="URL vidéo MP4..." />
            </div>
            <ColorPicker label="Couleur de fond du hero" value={page.heroColor || '#111827'}
              onChange={c => setPage((p: any) => ({ ...p, heroColor: c }))} />
          </div>

          <button onClick={saveSettings} disabled={saving}
            className="admin-btn-primary w-full py-3 disabled:opacity-50">
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      )}

      {/* ── SECTIONS TAB ── */}
      {tab === 'sections' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditingSection({ ...DEFAULT_SECTION }); setIsNewSection(true); setLocaleTab('fr'); }}
              className="admin-btn-primary">
              + Ajouter une section
            </button>
          </div>
          <div className="space-y-2">
            {sections.length === 0 && (
              <div className="admin-card text-center text-gray-500 py-12">
                Aucune section. Ajoutez votre première section.
              </div>
            )}
            {sections.map((sec, i) => (
              <div key={sec.id} className={`flex items-center gap-3 p-4 rounded-xl border ${sec.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveSection(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5"><ChevronSortUpIcon /></button>
                  <button onClick={() => moveSection(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5"><ChevronSortDownIcon /></button>
                </div>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-gray-600" style={{ backgroundColor: sec.bgColor || '#fff' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {parseJ(sec.titleJson).fr || parseJ(sec.titleJson).en || `Section ${i + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">{SECTION_TYPES.find(t => t.key === sec.type)?.label || sec.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingSection({ ...sec }); setIsNewSection(false); setLocaleTab('fr'); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteSection(sec.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SECTION MODAL ── */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <h2 className="font-bold text-white">{isNewSection ? '+ Nouvelle section' : '✏️ Modifier la section'}</h2>
              <button onClick={() => setEditingSection(null)}><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type de section</label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTION_TYPES.map(t => (
                    <button key={t.key} type="button" onClick={() => setEditingSection((s: any) => ({ ...s, type: t.key }))}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${editingSection.type === t.key ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locale tabs */}
              <div>
                <div className="flex gap-1 mb-3">
                  {ALL_LOCALES.map(({ code, label }) => (
                    <button key={code} onClick={() => setLocaleTab(code)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${localeTab === code ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {editingSection.type !== 'stats' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Titre ({localeTab.toUpperCase()})</label>
                      <input type="text" value={parseJ(editingSection.titleJson)[localeTab] || ''}
                        onChange={e => setEditingSection((s: any) => ({ ...s, titleJson: setKey(s.titleJson, localeTab, e.target.value) }))}
                        className="admin-input" placeholder="Titre de la section..." />
                    </div>
                  )}
                  {(editingSection.type === 'text-image' || editingSection.type === 'image-text' || editingSection.type === 'full-text' || editingSection.type === 'values') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        {editingSection.type === 'values' ? `Sous-titre (${localeTab.toUpperCase()})` : `Texte (${localeTab.toUpperCase()})`}
                      </label>
                      <textarea rows={4} value={parseJ(editingSection.textJson)[localeTab] || ''}
                        onChange={e => setEditingSection((s: any) => ({ ...s, textJson: setKey(s.textJson, localeTab, e.target.value) }))}
                        className="admin-input resize-none" placeholder="Contenu de la section..." />
                    </div>
                  )}
                </div>
              </div>

              {/* Image (for text-image, image-text) */}
              {(editingSection.type === 'text-image' || editingSection.type === 'image-text') && (
                <ImageUploader label="🖼️ Image" value={editingSection.imageUrl} folder="story"
                  onChange={url => setEditingSection((s: any) => ({ ...s, imageUrl: url }))}
                  onRemove={() => setEditingSection((s: any) => ({ ...s, imageUrl: '' }))} />
              )}

              {/* Items editor for values */}
              {editingSection.type === 'values' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Cartes valeurs</label>
                    <button onClick={addItem} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">+ Ajouter</button>
                  </div>
                  <div className="space-y-3">
                    {parseJ(editingSection.itemsJson, []).map((item: any, idx: number) => (
                      <div key={idx} className="bg-gray-800 rounded-xl p-3 space-y-2 border border-gray-700">
                        <div className="flex items-center gap-2">
                          <input type="text" value={item.icon || ''} onChange={e => updateItem(idx, 'icon', e.target.value)}
                            className="admin-input w-16 text-center text-lg py-1" placeholder="⭐" />
                          <input type="color" value={item.color || '#F59E0B'} onChange={e => updateItem(idx, 'color', e.target.value)}
                            className="w-10 h-9 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <button onClick={() => removeItem(idx)} className="ml-auto text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {ALL_LOCALES.map(({ code }) => (
                            <input key={code} type="text" value={parseJ(item.titleJson)[code] || ''}
                              onChange={e => updateItemJson(idx, 'titleJson', code, e.target.value)}
                              className="admin-input text-xs py-1" placeholder={`Titre ${code.toUpperCase()}`} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {ALL_LOCALES.map(({ code }) => (
                            <input key={code} type="text" value={parseJ(item.descJson)[code] || ''}
                              onChange={e => updateItemJson(idx, 'descJson', code, e.target.value)}
                              className="admin-input text-xs py-1" placeholder={`Desc ${code.toUpperCase()}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items editor for stats */}
              {editingSection.type === 'stats' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Statistiques</label>
                    <button onClick={addItem} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">+ Ajouter</button>
                  </div>
                  <div className="space-y-2">
                    {parseJ(editingSection.itemsJson, []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="text" value={item.value || ''} onChange={e => updateItem(idx, 'value', e.target.value)}
                          className="admin-input w-24 text-center font-bold py-1.5" placeholder="100+" />
                        {ALL_LOCALES.map(({ code }) => (
                          <input key={code} type="text" value={parseJ(item.labelJson)[code] || ''}
                            onChange={e => updateItemJson(idx, 'labelJson', code, e.target.value)}
                            className="admin-input text-xs flex-1 min-w-0 py-1.5" placeholder={`Label ${code.toUpperCase()}`} />
                        ))}
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"><TrashIcon /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              <div className="grid grid-cols-3 gap-3">
                <ColorPicker label="Fond" value={editingSection.bgColor || '#ffffff'}
                  onChange={c => setEditingSection((s: any) => ({ ...s, bgColor: c }))} />
                <ColorPicker label="Texte" value={editingSection.textColor || '#111827'}
                  onChange={c => setEditingSection((s: any) => ({ ...s, textColor: c }))} />
                <ColorPicker label="Accentuation" value={editingSection.accentColor || '#f59e0b'}
                  onChange={c => setEditingSection((s: any) => ({ ...s, accentColor: c }))} />
              </div>

              {/* Visibility */}
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                <input type="checkbox" checked={!!editingSection.isVisible}
                  onChange={e => setEditingSection((s: any) => ({ ...s, isVisible: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">👁️ Visible</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingSection(null)} className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors">
                  Annuler
                </button>
                <button onClick={saveSection} disabled={saving} className="flex-1 admin-btn-primary py-2.5 disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
