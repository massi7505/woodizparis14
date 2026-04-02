'use client';

import { useState, useEffect } from 'react';
import { ChevronSortUpIcon, ChevronSortDownIcon, EditIcon, TrashIcon, CloseIcon } from '@/components/ui/icons';

const LOCALES = ['fr', 'en', 'it', 'es'];
const LOCALE_LABELS: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', it: '🇮🇹 IT', es: '🇪🇸 ES' };

const DEFAULT_FAQ = {
  isVisible: true, showOnLinktree: true, showOnMenu: true,
  translations: LOCALES.map(l => ({ locale: l, question: '', answer: '' })),
};

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/faqs?visible=false');
    setFaqs(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const created = await res.json();
        setFaqs(f => [...f, created]);
      } else {
        const res = await fetch(`/api/faqs/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();
        setFaqs(f => f.map(x => x.id === updated.id ? updated : x));
      }
      setEditing(null);
      showToast('✅ FAQ sauvegardée');
      load();
    } catch (e) { showToast(`❌ Erreur: ${e instanceof Error ? e.message : 'inconnue'}`); }
    setSaving(false);
  }

  async function deleteFaq(id: number) {
    if (!confirm('Supprimer cette FAQ ?')) return;
    await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
    setFaqs(f => f.filter(x => x.id !== id));
    showToast('🗑️ Supprimée');
  }

  function move(i: number, dir: -1 | 1) {
    const newFaqs = [...faqs];
    const target = i + dir;
    if (target < 0 || target >= newFaqs.length) return;
    [newFaqs[i], newFaqs[target]] = [newFaqs[target], newFaqs[i]];
    const updated = newFaqs.map((f, idx) => ({ ...f, sortOrder: idx }));
    setFaqs(updated);
    fetch('/api/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'faq', items: updated.map(f => ({ id: f.id, sortOrder: f.sortOrder })) }) });
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">❓ FAQs</h1>
          <p className="dcm-page-subtitle">{faqs.length} questions configurées</p>
        </div>
        <button onClick={() => { setEditing(JSON.parse(JSON.stringify(DEFAULT_FAQ))); setIsNew(true); }} className="admin-btn-primary">+ Ajouter</button>
      </div>

      <div className="space-y-2">
        {faqs.length === 0 && <div className="admin-card text-center text-gray-500 py-12">Aucune FAQ. Créez les questions fréquentes de vos clients.</div>}
        {faqs.map((faq, i) => {
          const t = faq.translations?.find((x: any) => x.locale === 'fr') || faq.translations?.[0];
          return (
            <div key={faq.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${faq.isVisible ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-60'}`}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(i, -1)} className="text-gray-600 hover:text-gray-300 p-0.5"><ChevronSortUpIcon /></button>
                <button onClick={() => move(i, 1)} className="text-gray-600 hover:text-gray-300 p-0.5"><ChevronSortDownIcon /></button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{t?.question || '—'}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{t?.answer || ''}</p>
              </div>
              <div className="flex items-center gap-1">
                {faq.showOnLinktree && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">🔗</span>}
                {faq.showOnMenu && <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">🍕</span>}
                <button onClick={() => { setEditing({ ...faq, translations: faq.translations?.length ? faq.translations : DEFAULT_FAQ.translations }); setIsNew(false); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                  <EditIcon />
                </button>
                <button onClick={() => deleteFaq(faq.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-white">{isNew ? 'Nouvelle FAQ' : 'Modifier la FAQ'}</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[{ key: 'isVisible', label: '👁️ Visible' }, { key: 'showOnLinktree', label: '🔗 Linktree' }, { key: 'showOnMenu', label: '🍕 Menu' }].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                    <input type="checkbox" checked={!!editing[key]} onChange={e => setEditing((x: any) => ({ ...x, [key]: e.target.checked }))} className="accent-amber-500 w-4 h-4" />
                    <span className="text-xs text-white">{label}</span>
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm font-semibold text-white mb-3">Traductions</p>
                {LOCALES.map(locale => {
                  const t = editing.translations?.find((x: any) => x.locale === locale) || { locale, question: '', answer: '' };
                  const update = (field: string, val: string) => setEditing((e: any) => ({ ...e, translations: (e.translations || []).map((x: any) => x.locale === locale ? { ...x, [field]: val } : x) }));
                  return (
                    <div key={locale} className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 mb-2">{LOCALE_LABELS[locale]}</label>
                      <input type="text" value={t.question || ''} onChange={e => update('question', e.target.value)} className="admin-input mb-2" placeholder="Question *" />
                      <textarea value={t.answer || ''} onChange={e => update('answer', e.target.value)} className="admin-input resize-none h-20 text-sm" placeholder="Réponse *" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setEditing(null)} className="flex-1 admin-btn-ghost">Annuler</button>
              <button onClick={save} disabled={saving} className="flex-1 admin-btn-primary disabled:opacity-50">{saving ? '...' : isNew ? 'Créer' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
