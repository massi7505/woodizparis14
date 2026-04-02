'use client';
import { useState, useEffect } from 'react';
import { EditIcon, CloseIcon } from '@/components/ui/icons';

const ALL_LOCALES = [
  { code: 'fr', label: '🇫🇷 FR' }, { code: 'en', label: '🇬🇧 EN' },
  { code: 'it', label: '🇮🇹 IT' }, { code: 'es', label: '🇪🇸 ES' },
];

function parseJ(s: any, fb: any = {}): any {
  try { return s ? JSON.parse(s) : fb; } catch { return fb; }
}
function setKey(cur: any, key: string, val: string): string {
  const o = parseJ(cur, {}); o[key] = val; return JSON.stringify(o);
}

const SLUG_LABELS: Record<string, string> = {
  'mentions-legales': '📋 Mentions légales',
  'politique-confidentialite': '🔒 Politique de confidentialité',
  'politique-cookies': '🍪 Politique de cookies',
  'allergenes': '⚠️ Tableau des allergènes',
};

export default function AdminLegalPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [localeTab, setLocaleTab] = useState('fr');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    const res = await fetch('/api/legal');
    if (res.ok) setPages(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch('/api/legal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (res.ok) { showToast('✅ Sauvegardé'); setEditing(null); load(); }
    else showToast('❌ Erreur');
  }

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}
      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">⚖️ Pages légales</h1>
          <p className="dcm-page-subtitle">Mentions légales, confidentialité, cookies, allergènes</p>
        </div>
      </div>
      <div className="space-y-2">
        {pages.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 bg-gray-800">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{SLUG_LABELS[p.slug] || p.slug}</p>
              <a href={`/legal/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-500 hover:text-amber-400">/legal/{p.slug}</a>
            </div>
            <button onClick={() => { setEditing({ ...p }); setLocaleTab('fr'); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
              <EditIcon />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
              <h2 className="font-bold text-white">{SLUG_LABELS[editing.slug] || editing.slug}</h2>
              <button onClick={() => setEditing(null)}><CloseIcon /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Titre (par langue)</label>
                {ALL_LOCALES.map(({ code, label }) => (
                  <div key={code} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{label}</span>
                    <input type="text" value={parseJ(editing.titleJson)[code] || ''}
                      onChange={e => setEditing((p: any) => ({ ...p, titleJson: setKey(p.titleJson, code, e.target.value) }))}
                      className="admin-input text-sm py-1.5" />
                  </div>
                ))}
              </div>
              {/* Content per locale */}
              <div>
                <div className="flex gap-1 mb-2">
                  {ALL_LOCALES.map(({ code, label }) => (
                    <button key={code} onClick={() => setLocaleTab(code)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${localeTab === code ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contenu ({localeTab.toUpperCase()})</label>
                <textarea rows={12} value={parseJ(editing.contentJson)[localeTab] || ''}
                  onChange={e => setEditing((p: any) => ({ ...p, contentJson: setKey(p.contentJson, localeTab, e.target.value) }))}
                  className="admin-input resize-y font-mono text-xs leading-relaxed"
                  placeholder="Contenu de la page légale..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer bg-gray-800 rounded-xl px-3 py-2">
                <input type="checkbox" checked={!!editing.isVisible}
                  onChange={e => setEditing((p: any) => ({ ...p, isVisible: e.target.checked }))}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-white">👁️ Visible</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors">Annuler</button>
                <button onClick={save} disabled={saving} className="flex-1 admin-btn-primary py-2.5 disabled:opacity-50">
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
