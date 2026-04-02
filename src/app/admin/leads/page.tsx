'use client';

import { useState, useEffect } from 'react';

interface Lead {
  id: number;
  firstname: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  createdAt: string;
}

interface PopupSettings {
  id: number;
  enabled: boolean;
  showFirstname: boolean;
  showPhone: boolean;
  showEmail: boolean;
  delay: number;
  showOnce: boolean;
  title: string;
  message: string;
  buttonText: string;
}

const DEFAULT_SETTINGS: PopupSettings = {
  id: 1, enabled: true,
  showFirstname: true, showPhone: true, showEmail: false,
  delay: 3, showOnce: true,
  title: 'Recevez nos promos & nouveautés',
  message: 'Inscrivez-vous pour être parmi les premiers informés de nos offres exclusives.',
  buttonText: "S'inscrire",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<PopupSettings>(DEFAULT_SETTINGS);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()),
      fetch('/api/popup-settings').then(r => r.json()),
    ]).then(([leadsData, settingsData]) => {
      if (Array.isArray(leadsData)) setLeads(leadsData);
      if (settingsData?.id) setSettings(settingsData);
    }).finally(() => setLoadingLeads(false));
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch('/api/popup-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  }

  async function deleteLead(id: number) {
    setDeleting(id);
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    setLeads(l => l.filter(x => x.id !== id));
    setDeleting(null);
  }

  async function clearAll() {
    await fetch('/api/leads', { method: 'DELETE' });
    setLeads([]);
    setConfirmClear(false);
  }

  function exportCSV() {
    const header = 'ID,Prénom,Téléphone,Email,Source,Date';
    const rows = leads.map(l =>
      [l.id, l.firstname || '', l.phone || '', l.email || '', l.source, new Date(l.createdAt).toLocaleString('fr')].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dcm-page">
      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">Leads & Popup</h1>
          <p className="dcm-page-subtitle">Contacts collectés via le popup + configuration de la fenêtre</p>
        </div>
      </div>

      {/* ── Popup Settings ─────────────────────────────── */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>⚙️ Configuration du popup</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
              {settings.enabled ? 'Activé' : 'Désactivé'}
            </span>
            <button
              onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: settings.enabled ? '#F59E0B' : '#D1D5DB' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ left: '2px', transform: settings.enabled ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="admin-label">Titre du popup</label>
            <input className="admin-input" value={settings.title}
              onChange={e => setSettings(s => ({ ...s, title: e.target.value }))} />
          </div>
          <div>
            <label className="admin-label">Texte du bouton</label>
            <input className="admin-input" value={settings.buttonText}
              onChange={e => setSettings(s => ({ ...s, buttonText: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Message</label>
            <textarea className="admin-input" rows={2} value={settings.message}
              onChange={e => setSettings(s => ({ ...s, message: e.target.value }))} />
          </div>
          <div>
            <label className="admin-label">Délai avant affichage (secondes)</label>
            <input type="number" min={0} max={60} className="admin-input" value={settings.delay}
              onChange={e => setSettings(s => ({ ...s, delay: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>

        {/* Champs à afficher */}
        <div className="mb-4">
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--admin-text)' }}>Champs à afficher</p>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'showFirstname', label: 'Prénom' },
              { key: 'showPhone',    label: 'Téléphone' },
              { key: 'showEmail',    label: 'Email' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={settings[key as keyof PopupSettings] as boolean}
                  onChange={e => setSettings(s => ({ ...s, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-sm" style={{ color: 'var(--admin-text)' }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Afficher une seule fois */}
        <div className="mb-5">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="checkbox" checked={settings.showOnce}
              onChange={e => setSettings(s => ({ ...s, showOnce: e.target.checked }))}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <span className="text-sm" style={{ color: 'var(--admin-text)' }}>
              Afficher une seule fois par visiteur (ne plus montrer après soumission/fermeture)
            </span>
          </label>
        </div>

        <button onClick={saveSettings} disabled={saving}
          className="admin-btn-primary flex items-center gap-2 disabled:opacity-60">
          {saving ? 'Enregistrement...' : saved ? '✓ Enregistré !' : 'Enregistrer les paramètres'}
        </button>
      </div>

      {/* ── Leads list ─────────────────────────────── */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>
              📋 Contacts collectés
              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--admin-text-muted)' }}>
                ({leads.length} lead{leads.length !== 1 ? 's' : ''})
              </span>
            </h2>
          </div>
          <div className="flex gap-2">
            {leads.length > 0 && (
              <>
                <button onClick={exportCSV}
                  className="admin-btn-secondary text-sm flex items-center gap-1.5">
                  ⬇ Exporter CSV
                </button>
                {!confirmClear ? (
                  <button onClick={() => setConfirmClear(true)}
                    className="text-sm px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-semibold">
                    Tout effacer
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-semibold">Confirmer ?</span>
                    <button onClick={clearAll} className="text-sm px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Oui</button>
                    <button onClick={() => setConfirmClear(false)} className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition-colors" style={{ color: 'var(--admin-text)' }}>Non</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {loadingLeads ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--admin-text-muted)' }}>Chargement...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold" style={{ color: 'var(--admin-text)' }}>Aucun lead pour l'instant</p>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>
              Activez le popup pour commencer à collecter des contacts
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  {['Prénom', 'Téléphone', 'Email', 'Source', 'Date'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wide"
                      style={{ color: 'var(--admin-text-muted)' }}>{h}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid var(--admin-border)' }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      {lead.firstname || '—'}
                    </td>
                    <td className="py-3 px-3" style={{ color: 'var(--admin-text)' }}>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-3" style={{ color: 'var(--admin-text)' }}>
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      {new Date(lead.createdAt).toLocaleString('fr', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => deleteLead(lead.id)} disabled={deleting === lead.id}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                        aria-label="Supprimer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
