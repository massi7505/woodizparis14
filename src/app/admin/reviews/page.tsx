'use client';

import { useState, useEffect } from 'react';
import { ChevronSortUpIcon, ChevronSortDownIcon } from '@/components/ui/icons';

const AVATAR_COLORS = ['#F59E0B','#EF4444','#10B981','#3B82F6','#8B5CF6','#EC4899','#F97316','#06B6D4'];

const DEFAULT_REVIEW = {
  authorName: '', authorInitial: '', avatarColor: '#F59E0B', rating: 5,
  text: '', source: 'google', isVisible: true,
  date: new Date().toISOString().split('T')[0],
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Review settings (googleReviewsUrl, googleReviewCount, googleRating)
  const [reviewSettings, setReviewSettings] = useState({ googleReviewsUrl: '', googleReviewCount: '', googleRating: '' });
  const [savingSettings, setSavingSettings] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/reviews?visible=false');
    setReviews(await res.json());
  }

  async function loadSettings() {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setReviewSettings({
      googleReviewsUrl: data.googleReviewsUrl || '',
      googleReviewCount: data.googleReviewCount != null ? String(data.googleReviewCount) : '',
      googleRating: data.googleRating != null ? String(data.googleRating) : '',
    });
  }

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const payload: any = { googleReviewsUrl: reviewSettings.googleReviewsUrl || null };
      payload.googleReviewCount = reviewSettings.googleReviewCount !== '' ? parseInt(reviewSettings.googleReviewCount) : null;
      payload.googleRating = reviewSettings.googleRating !== '' ? parseFloat(reviewSettings.googleRating) : null;
      const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('✅ Paramètres sauvegardés');
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSavingSettings(false);
  }

  useEffect(() => { load(); loadSettings(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = { ...editing, date: new Date(editing.date).toISOString() };
      if (isNew) {
        const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Avis ajouté');
      } else {
        const res = await fetch(`/api/reviews/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showToast('✅ Avis mis à jour');
      }
      setEditing(null); load();
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  async function del(id: number, name: string) {
    if (!confirm(`Supprimer l'avis de "${name}" ?`)) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    showToast('🗑️ Avis supprimé');
    load();
  }

  async function toggleVisible(r: any) {
    await fetch(`/api/reviews/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isVisible: !r.isVisible }) });
    load();
  }

  async function move(i: number, dir: -1 | 1) {
    const arr = [...reviews];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const items = arr.map((r, idx) => ({ id: r.id, sortOrder: idx }));
    await fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'review', items }) });
    load();
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">⭐ Avis Clients</h1>
          <p className="dcm-page-subtitle">{reviews.length} avis · Note moyenne : {avgRating}/5</p>
        </div>
        <button onClick={() => { setEditing({ ...DEFAULT_REVIEW }); setIsNew(true); }} className="admin-btn-primary">
          + Ajouter un avis
        </button>
      </div>

      {/* Settings card */}
      <div className="admin-card mb-6 space-y-4">
        <h2 className="text-sm font-bold text-white mb-3">⚙️ Paramètres — Section Avis Clients</h2>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Lien « Voir tous les avis Google »</label>
          <input
            value={reviewSettings.googleReviewsUrl}
            onChange={e => setReviewSettings(s => ({ ...s, googleReviewsUrl: e.target.value }))}
            className="admin-input w-full"
            placeholder="https://g.page/r/..."
          />
          <p className="text-xs text-gray-600 mt-1">URL Google Business de vos avis (s'affiche en bouton dans la section avis)</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre d'avis affiché</label>
            <input
              type="number"
              min="0"
              value={reviewSettings.googleReviewCount}
              onChange={e => setReviewSettings(s => ({ ...s, googleReviewCount: e.target.value }))}
              className="admin-input w-full"
              placeholder="Ex : 450"
            />
            <p className="text-xs text-gray-600 mt-1">Laisser vide = nombre réel</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Note affichée (étoiles)</label>
            <input
              type="number"
              min="1" max="5" step="0.1"
              value={reviewSettings.googleRating}
              onChange={e => setReviewSettings(s => ({ ...s, googleRating: e.target.value }))}
              className="admin-input w-full"
              placeholder="Ex : 4.8"
            />
            <p className="text-xs text-gray-600 mt-1">Laisser vide = moyenne réelle</p>
          </div>
        </div>
        <button onClick={saveSettings} disabled={savingSettings} className="admin-btn-primary disabled:opacity-50">
          {savingSettings ? 'Sauvegarde...' : '💾 Sauvegarder les paramètres'}
        </button>
      </div>

      {/* Stats bar */}
      {reviews.length > 0 && (
        <div className="admin-card mb-5 flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-black text-amber-400">{avgRating}</p>
            <p className="text-xs text-gray-500">Note moy.</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-600 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 && (
          <div className="admin-card text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">⭐</p>
            <p>Aucun avis. Ajoutez les avis Google de vos clients.</p>
            <button onClick={() => { setEditing({ ...DEFAULT_REVIEW }); setIsNew(true); }} className="admin-btn-primary mt-4">
              Ajouter le premier avis
            </button>
          </div>
        )}
        {reviews.map((r, i) => (
          <div key={r.id} className={`admin-card flex items-start gap-3 ${!r.isVisible ? 'opacity-50' : ''}`}>
            <div className="flex flex-col gap-0.5 pt-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-600 hover:text-gray-300 disabled:opacity-20 p-0.5">
                <ChevronSortUpIcon />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === reviews.length - 1} className="text-gray-600 hover:text-gray-300 disabled:opacity-20 p-0.5">
                <ChevronSortDownIcon />
              </button>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: r.avatarColor }}>
              {r.authorInitial || r.authorName?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-white text-sm">{r.authorName}</p>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= r.rating ? 'text-amber-400' : 'text-gray-600'}`}>★</span>)}</div>
                {r.source === 'google' && <span className="text-xs text-blue-400 font-medium">Google</span>}
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">{r.text}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => toggleVisible(r)} title={r.isVisible ? 'Masquer' : 'Afficher'}
                className={`p-1.5 rounded-lg transition-colors ${r.isVisible ? 'text-amber-400 hover:bg-amber-500/10' : 'text-gray-600 hover:bg-gray-700'}`}>
                {r.isVisible ? '👁️' : '🙈'}
              </button>
              <button onClick={() => { setEditing({ ...r, date: new Date(r.date).toISOString().split('T')[0] }); setIsNew(false); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">✏️</button>
              <button onClick={() => del(r.id, r.authorName)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">{isNew ? '+ Nouvel avis' : 'Modifier l\'avis'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Nom de l'auteur *</label>
                  <input value={editing.authorName} onChange={e => setEditing((x: any) => ({ ...x, authorName: e.target.value, authorInitial: e.target.value[0] || '' }))}
                    className="admin-input" placeholder="Sophie M." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Initiale</label>
                  <input value={editing.authorInitial || ''} onChange={e => setEditing((x: any) => ({ ...x, authorInitial: e.target.value }))}
                    className="admin-input text-center font-bold" placeholder="S" maxLength={1} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Note</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setEditing((x: any) => ({ ...x, rating: s }))}
                      className={`w-10 h-10 rounded-xl text-xl transition-all ${editing.rating >= s ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-600'}`}>★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Couleur de l'avatar</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setEditing((x: any) => ({ ...x, avatarColor: c }))}
                      className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                      style={{ backgroundColor: c, borderColor: editing.avatarColor === c ? '#F59E0B' : 'transparent' }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Texte de l'avis *</label>
                <textarea value={editing.text} onChange={e => setEditing((x: any) => ({ ...x, text: e.target.value }))}
                  className="admin-input resize-none h-24" placeholder="Pizza incroyable ! La pâte est parfaite..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Date</label>
                  <input type="date" value={editing.date} onChange={e => setEditing((x: any) => ({ ...x, date: e.target.value }))} className="admin-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Source</label>
                  <select value={editing.source} onChange={e => setEditing((x: any) => ({ ...x, source: e.target.value }))} className="admin-input">
                    <option value="google">⭐ Google</option>
                    <option value="manual">✍️ Manuel</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setEditing((x: any) => ({ ...x, isVisible: !x.isVisible }))}
                  className={`w-10 h-6 rounded-full relative transition-colors ${editing.isVisible ? 'bg-amber-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.isVisible ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-gray-300">Visible sur le site</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditing(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={save} disabled={saving || !editing.authorName || !editing.text} className="flex-1 admin-btn-primary disabled:opacity-50">
                {saving ? 'Sauvegarde...' : isNew ? '+ Ajouter' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
