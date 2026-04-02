'use client';

import { useState } from 'react';

export default function AdminPasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      showToast('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (form.newPassword.length < 8) {
      showToast('❌ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(`❌ ${data.error || 'Erreur inconnue'}`);
      } else {
        showToast('✅ Mot de passe mis à jour avec succès');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      showToast('❌ Erreur de connexion');
    }
    setSaving(false);
  }

  function PasswordInput({
    id,
    label,
    value,
    visible,
    onToggle,
    onChange,
    placeholder,
  }: {
    id: keyof typeof show;
    label: string;
    value: string;
    visible: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
    placeholder: string;
  }) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
          {label}
        </label>
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="admin-input pr-12"
            placeholder={placeholder}
            required
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            {visible ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
    );
  }

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Faible', color: '#EF4444', width: '20%' };
    if (score <= 2) return { label: 'Moyen', color: '#F59E0B', width: '50%' };
    if (score <= 3) return { label: 'Bon', color: '#10B981', width: '75%' };
    return { label: 'Excellent', color: '#10B981', width: '100%' };
  })();

  return (
    <div className="dcm-page">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="dcm-page-header admin-fade-in">
        <div>
          <h1 className="dcm-page-title">🔑 Changer le mot de passe</h1>
          <p className="dcm-page-subtitle">Modifier le mot de passe de votre compte admin</p>
        </div>
      </div>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="admin-card space-y-4">
            <PasswordInput
              id="current"
              label="Mot de passe actuel"
              value={form.currentPassword}
              visible={show.current}
              onToggle={() => setShow(s => ({ ...s, current: !s.current }))}
              onChange={v => setForm(f => ({ ...f, currentPassword: v }))}
              placeholder="Votre mot de passe actuel"
            />

            <div className="border-t pt-4" style={{ borderColor: 'var(--border-dark)' }}>
              <PasswordInput
                id="new"
                label="Nouveau mot de passe"
                value={form.newPassword}
                visible={show.new}
                onToggle={() => setShow(s => ({ ...s, new: !s.new }))}
                onChange={v => setForm(f => ({ ...f, newPassword: v }))}
                placeholder="Minimum 8 caractères"
              />

              {/* Strength bar */}
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <PasswordInput
              id="confirm"
              label="Confirmer le nouveau mot de passe"
              value={form.confirmPassword}
              visible={show.confirm}
              onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
              onChange={v => setForm(f => ({ ...f, confirmPassword: v }))}
              placeholder="Répétez le nouveau mot de passe"
            />

            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-red-400">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div className="admin-card" style={{ background: 'rgba(232,101,10,0.06)', border: '1px solid rgba(232,101,10,0.2)' }}>
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
              <strong style={{ color: 'var(--accent)' }}>Conseils de sécurité :</strong><br />
              • Minimum 8 caractères<br />
              • Combinez majuscules, chiffres et symboles<br />
              • N'utilisez pas un mot de passe déjà utilisé
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmPassword}
            className="admin-btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Mise à jour...' : '💾 Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
