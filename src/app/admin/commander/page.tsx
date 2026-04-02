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
    await fetch(`/api/order-modes/${id}`, { method: 'DELETE' });
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
        {filtered.map((btn, i) => (
          <div
            key={btn.id}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${btn.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}
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

            {/* Icon preview */}
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: btn.bgColor || '#111827' }}
            >
              {btn.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={btn.iconUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-lg">{btn.section === 'livraison' ? '🛵' : '🥡'}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{btn.label || '—'}</p>
              <p className="text-xs text-gray-500 truncate">{btn.url}</p>
            </div>

            {/* Visibility badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${btn.isVisible ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
              {btn.isVisible ? 'Visible' : 'Masqué'}
            </span>

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
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">
                {modal === 'new' ? '+ Nouveau lien' : '✏️ Modifier le lien'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white">
                <CloseIcon />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Label *</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="admin-input"
                  placeholder="ex: Uber Eats, Deliveroo..."
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
                  placeholder="https://..."
                />
              </div>

              {/* Icon */}
              <ImageUploader
                label="Icône (logo de la plateforme)"
                value={form.iconUrl}
                onChange={url => setForm(f => ({ ...f, iconUrl: url }))}
              />

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
