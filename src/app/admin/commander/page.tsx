'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import { EditIcon, TrashIcon, CloseIcon, ChevronSortUpIcon, ChevronSortDownIcon } from '@/components/ui/icons';

const DEFAULT_FORM = {
  label: '',
  url: '',
  iconUrl: '' as string | null,
  bgColor: '#111827',
  textColor: '#ffffff',
  section: 'emporter' as 'emporter' | 'livraison',
  isVisible: true,
};

function platformStyle(label: string, url: string) {
  const key = (label + url).toLowerCase();
  if (key.includes('ubereats') || (key.includes('uber') && key.includes('eat'))) return { emoji: '🖤', bg: '#000000', text: '#ffffff' };
  if (key.includes('deliveroo')) return { emoji: '🛵', bg: '#00CCBC', text: '#ffffff' };
  if (key.includes('delicity')) return { emoji: '📱', bg: '#6366F1', text: '#ffffff' };
  if (key.includes('tel:') || key.includes('téléphone') || key.includes('telephone')) return { emoji: '📞', bg: '#22C55E', text: '#ffffff' };
  if (key.includes('glovo')) return { emoji: '🟡', bg: '#FFC244', text: '#111827' };
  return { emoji: '🔗', bg: '#374151', text: '#ffffff' };
}

/** Preview of a button as it will appear on the menu */
function ButtonPreview({ form }: { form: typeof DEFAULT_FORM & { id?: number } }) {
  const ps = platformStyle(form.label, form.url);
  const bg = form.bgColor || ps.bg;
  const text = form.textColor || ps.text;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <p className="text-xs font-medium text-gray-400 mb-3">Aperçu du bouton</p>
      <div className="flex flex-col items-center gap-3">
        {/* Large (mobile) */}
        <div>
          <p className="text-[10px] text-gray-500 text-center mb-1.5">Mobile</p>
          <div
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl w-24"
            style={{ backgroundColor: bg, color: text }}
          >
            {form.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.iconUrl} alt="" className="w-8 h-8 object-contain rounded" />
            ) : (
              <span className="text-2xl leading-none">{ps.emoji}</span>
            )}
            <span className="text-xs font-semibold text-center leading-tight">
              {form.label || 'Label'}
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-600" />

        {/* Small (desktop) */}
        <div>
          <p className="text-[10px] text-gray-500 text-center mb-1.5">Desktop</p>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: bg, color: text, height: '28px' }}
          >
            {form.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.iconUrl} alt="" className="w-4 h-4 object-contain rounded-sm flex-shrink-0" />
            ) : (
              <span className="text-sm leading-none">{ps.emoji}</span>
            )}
            {form.label || 'Label'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommanderPage() {
  const [buttons, setButtons] = useState<any[]>([]);
  const [tab, setTab] = useState<'emporter' | 'livraison'>('emporter');
  const [modal, setModal] = useState<null | 'new' | 'edit'>(null);
  const [form, setForm] = useState<typeof DEFAULT_FORM & { id?: number }>({ ...DEFAULT_FORM });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  async function load() {
    const res = await fetch('/api/order-modes');
    if (!res.ok) return;
    const data = await res.json();
    setButtons(Array.isArray(data) ? data : []);
  }

  useEffect(() => { load(); }, []);

  const filtered = buttons.filter(b => b.section === tab);

  function openNew() {
    setForm({ ...DEFAULT_FORM, section: tab });
    setModal('new');
  }

  function openEdit(btn: any) {
    setForm({
      id: btn.id,
      label: btn.label ?? '',
      url: btn.url ?? '',
      iconUrl: btn.iconUrl ?? null,
      bgColor: btn.bgColor ?? '#111827',
      textColor: btn.textColor ?? '#ffffff',
      section: btn.section ?? tab,
      isVisible: btn.isVisible ?? true,
    });
    setModal('edit');
  }

  async function handleSave() {
    if (!form.label.trim() || !form.url.trim()) {
      showToast('❌ Label et URL requis');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'new') {
        const res = await fetch('/api/order-modes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, sortOrder: filtered.length }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Bouton créé');
      } else {
        const { id, ...rest } = form;
        const res = await fetch(`/api/order-modes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rest),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Bouton mis à jour');
      }
      setModal(null);
      await load();
    } catch (e) {
      showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`);
    }
    setSaving(false);
  }

  async function handleDelete(id: number, label: string) {
    if (!confirm(`Supprimer "${label}" ?`)) return;
    const res = await fetch(`/api/order-modes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      showToast(`❌ Erreur suppression (${res.status})`);
      return;
    }
    showToast('🗑️ Bouton supprimé');
    await load();
  }

  async function move(i: number, dir: -1 | 1) {
    const arr = [...filtered];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    await Promise.all(
      arr.map((b, idx) =>
        fetch(`/api/order-modes/${b.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: idx }),
        })
      )
    );
    await load();
  }

  async function toggleVisible(btn: any) {
    await fetch(`/api/order-modes/${btn.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !btn.isVisible }),
    });
    await load();
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">🥡 Commander</h1>
          <p className="dcm-page-subtitle">Gérer les boutons "À emporter" et "En livraison" du menu</p>
        </div>
        <a
          href="/menu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors font-mono"
        >
          👁️ Aperçu menu
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['emporter', 'livraison'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400 hover:text-white border border-transparent'}`}
          >
            {t === 'emporter' ? '🥡 À emporter' : '🛵 En livraison'}
            <span className="ml-2 text-xs opacity-60">
              ({buttons.filter(b => b.section === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button onClick={openNew} className="admin-btn-primary">
          + Ajouter un lien
        </button>
      </div>

      {/* Button list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 text-center text-gray-500 py-12 text-sm">
            Aucun lien pour cette section. Ajoutez des plateformes de commande.
          </div>
        )}
        {filtered.map((btn, i) => {
          const ps = platformStyle(btn.label, btn.url);
          const bg = btn.bgColor || ps.bg;
          const text = btn.textColor || ps.text;
          return (
            <div
              key={btn.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${btn.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}
            >
              {/* Sort arrows */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5" title="Monter">
                  <ChevronSortUpIcon />
                </button>
                <button onClick={() => move(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5" title="Descendre">
                  <ChevronSortDownIcon />
                </button>
              </div>

              {/* Button preview */}
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex flex-col items-center justify-center gap-0.5 overflow-hidden"
                style={{ backgroundColor: bg, color: text }}
              >
                {btn.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={btn.iconUrl} alt="" className="w-7 h-7 object-contain" />
                ) : (
                  <span className="text-xl">{ps.emoji}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: text, backgroundColor: bg, display: 'inline', padding: '1px 6px', borderRadius: '4px' }}>
                  {btn.label || '—'}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{btn.url}</p>
              </div>

              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisible(btn)}
                title={btn.isVisible ? 'Masquer' : 'Afficher'}
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 transition-colors ${btn.isVisible ? 'bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400' : 'bg-gray-700 text-gray-500 hover:bg-green-500/15 hover:text-green-400'}`}
              >
                {btn.isVisible ? 'Visible' : 'Masqué'}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(btn)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Modifier"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDelete(btn.id, btn.label)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">
                {modal === 'new' ? '+ Nouveau lien' : '✏️ Modifier le lien'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">
                <CloseIcon />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Live preview */}
              <ButtonPreview form={form} />

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Label *</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="admin-input"
                  placeholder="ex: Uber Eats, Deliveroo, Commander par tél..."
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">URL *</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="admin-input"
                  placeholder="https://... ou tel:+33..."
                />
                <p className="text-xs text-gray-500 mt-1">Accepte aussi les liens téléphone : <code className="text-amber-400">tel:+33123456789</code></p>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Icône (logo de la plateforme)</label>
                <div className="flex gap-3 items-start">
                  <div className="w-24 flex-shrink-0">
                    <ImageUploader
                      label=""
                      value={form.iconUrl}
                      onChange={url => setForm(f => ({ ...f, iconUrl: url || null }))}
                      onRemove={() => setForm(f => ({ ...f, iconUrl: null }))}
                      folder="icons"
                      aspectRatio="aspect-square"
                      accept="image/svg+xml,image/png,image/gif,image/jpeg,image/webp"
                      objectFit="contain"
                      hint="SVG, PNG, GIF · max 5MB"
                    />
                  </div>
                  <div className="flex-1 text-xs text-gray-500 pt-2 space-y-1">
                    <p>Formats acceptés :</p>
                    <p className="text-amber-400 font-medium">SVG · PNG · GIF · JPG</p>
                    <p>Si pas d&apos;icône, un emoji sera utilisé automatiquement selon la plateforme.</p>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Couleur fond</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.bgColor}
                      onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-600 cursor-pointer bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={form.bgColor}
                      onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                      className="admin-input font-mono text-xs flex-1"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Couleur texte</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-600 cursor-pointer bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                      className="admin-input font-mono text-xs flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Quick color presets */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Presets plateformes</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Uber Eats', bg: '#000000', text: '#ffffff' },
                    { name: 'Deliveroo', bg: '#00CCBC', text: '#ffffff' },
                    { name: 'Delicity', bg: '#6366F1', text: '#ffffff' },
                    { name: 'Glovo', bg: '#FFC244', text: '#111827' },
                    { name: 'Téléphone', bg: '#22C55E', text: '#ffffff' },
                    { name: 'Custom', bg: '#374151', text: '#ffffff' },
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, bgColor: p.bg, textColor: p.text }))}
                      className="px-2 py-1 rounded-lg text-xs font-semibold border border-gray-600 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: p.bg, color: p.text }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Section</label>
                <select
                  value={form.section}
                  onChange={e => setForm(f => ({ ...f, section: e.target.value as 'emporter' | 'livraison' }))}
                  className="admin-input"
                >
                  <option value="emporter">🥡 À emporter</option>
                  <option value="livraison">🛵 En livraison</option>
                </select>
              </div>

              {/* Visible toggle */}
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="text-sm text-white">👁️ Visible sur le menu</span>
              </label>
            </div>

            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setModal(null)} className="flex-1 admin-btn-ghost">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 admin-btn-primary disabled:opacity-50">
                {saving ? '...' : modal === 'new' ? 'Créer' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
