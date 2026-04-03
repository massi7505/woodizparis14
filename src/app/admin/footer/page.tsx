'use client';

import { useState, useEffect } from 'react';

interface FooterLink { label: string; url: string }
interface FooterCol  { title: string; items: FooterLink[] }

function parseCol(raw: string | undefined | null, fallback: FooterCol): FooterCol {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

const EMPTY_COL: FooterCol = { title: '', items: [] };

export default function AdminFooterPage() {
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState('');

  const [col1, setCol1] = useState<FooterCol>({ title: 'Notre Carte', items: [] });
  const [col2, setCol2] = useState<FooterCol>({ title: 'Commander', items: [] });
  const [col3, setCol3] = useState<FooterCol>({ title: '', items: [] });
  const [col4, setCol4] = useState<FooterCol>({ title: 'Newsletter', items: [] });
  const [copyright, setCopyright] = useState('© {year} Woodiz. Tous droits réservés.');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [textColor, setTextColor] = useState('#9CA3AF');
  const [accentColor, setAccentColor] = useState('#F59E0B');

  useEffect(() => {
    fetch('/api/footer-settings')
      .then(r => r.json())
      .then(d => {
        setCol1(parseCol(d.col1Json, { title: 'Notre Carte', items: [] }));
        setCol2(parseCol(d.col2Json, { title: 'Commander', items: [] }));
        setCol3(parseCol(d.col3Json, EMPTY_COL));
        setCol4(parseCol(d.col4Json, { title: 'Newsletter', items: [] }));
        setCopyright(d.copyright || '© {year} Woodiz. Tous droits réservés.');
        setBgColor(d.bgColor || '#0f172a');
        setTextColor(d.textColor || '#9CA3AF');
        setAccentColor(d.accentColor || '#F59E0B');
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/footer-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          col1Json: JSON.stringify(col1),
          col2Json: JSON.stringify(col2),
          col3Json: JSON.stringify(col3),
          col4Json: JSON.stringify(col4),
          copyright,
          bgColor,
          textColor,
          accentColor,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Footer — Liens personnalisés</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gérez les colonnes de liens affichées dans le pied de page du menu.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <><div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-current" />Sauvegarde…</>
          ) : saved ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Sauvegardé !</>
          ) : 'Sauvegarder'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">{error}</div>
      )}

      {/* Columns grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {([
          { label: 'Colonne 1', col: col1, set: setCol1 },
          { label: 'Colonne 2', col: col2, set: setCol2 },
          { label: 'Colonne 3', col: col3, set: setCol3 },
          { label: 'Colonne 4 (réservée Newsletter)', col: col4, set: setCol4 },
        ] as const).map(({ label, col, set }, ci) => (
          <ColEditor
            key={ci}
            label={label}
            col={col as FooterCol}
            onChange={set as (c: FooterCol) => void}
            locked={ci === 3}
          />
        ))}
      </div>

      {/* Copyright + Colors */}
      <div className="admin-card p-5 space-y-5">
        <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Apparence du footer</h2>

        {/* Color controls */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Fond', value: bgColor, onChange: setBgColor },
            { label: 'Texte', value: textColor, onChange: setTextColor },
            { label: 'Accent / liens', value: accentColor, onChange: setAccentColor },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="admin-label">{label}</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  className="admin-input font-mono text-sm min-w-0"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preview strip */}
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: bgColor }}>
            <span className="text-xs font-bold" style={{ color: accentColor }}>Woodiz</span>
            <span className="text-xs" style={{ color: textColor }}>Aperçu footer</span>
            <a className="text-xs font-semibold" style={{ color: accentColor }}>Lien →</a>
          </div>
        </div>

        <div>
          <label className="admin-label">Texte copyright <span className="font-normal opacity-60">(utilisez {'{year}'} pour l&apos;année)</span></label>
          <input
            type="text"
            value={copyright}
            onChange={e => setCopyright(e.target.value)}
            className="admin-input w-full"
            placeholder="© {year} Votre Restaurant. Tous droits réservés."
          />
        </div>
      </div>

      {/* Preview note */}
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Les colonnes 1–3 affichent les liens de navigation. La colonne 4 est réservée à la newsletter (le titre est utilisé pour l&apos;en-tête).
      </p>
    </div>
  );
}

/* ── Column editor component ── */
function ColEditor({
  label,
  col,
  onChange,
  locked = false,
}: {
  label: string;
  col: FooterCol;
  onChange: (c: FooterCol) => void;
  locked?: boolean;
}) {
  function setTitle(title: string) { onChange({ ...col, title }); }

  function setLink(i: number, field: 'label' | 'url', val: string) {
    const items = col.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    onChange({ ...col, items });
  }

  function addLink() {
    onChange({ ...col, items: [...col.items, { label: '', url: '' }] });
  }

  function removeLink(i: number) {
    onChange({ ...col, items: col.items.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="admin-card p-5 space-y-4">
      <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</h2>

      <div>
        <label className="admin-label">Titre de la colonne</label>
        <input
          type="text"
          value={col.title}
          onChange={e => setTitle(e.target.value)}
          className="admin-input w-full"
          placeholder="Ex: Notre Carte"
          disabled={locked}
        />
      </div>

      {!locked && (
        <div className="space-y-2">
          <label className="admin-label">Liens ({col.items.length})</label>

          {col.items.length === 0 && (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Aucun lien — cliquez sur Ajouter.</p>
          )}

          {col.items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.label}
                onChange={e => setLink(i, 'label', e.target.value)}
                placeholder="Label"
                className="admin-input flex-1 text-sm"
              />
              <input
                type="text"
                value={item.url}
                onChange={e => setLink(i, 'url', e.target.value)}
                placeholder="/menu ou https://…"
                className="admin-input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/20 text-red-400 flex-shrink-0"
                title="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un lien
          </button>
        </div>
      )}

      {locked && (
        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
          Cette colonne est réservée au formulaire newsletter — gérée automatiquement.
        </p>
      )}
    </div>
  );
}
