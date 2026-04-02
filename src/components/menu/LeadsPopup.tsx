'use client';

import { useState, useEffect } from 'react';

const KEY = 'woodiz_lead_submitted';

const L: Record<string, Record<string, string>> = {
  fr: {
    close: 'Fermer',
    firstname: 'Prénom',
    phone: 'Numéro de téléphone',
    email: 'Email',
    submit: "S'inscrire",
    loading: 'Envoi...',
    successTitle: 'Merci !',
    successMsg: 'Vous êtes bien inscrit(e) 🎉',
    required: 'Ce champ est requis',
  },
  en: {
    close: 'Close',
    firstname: 'First name',
    phone: 'Phone number',
    email: 'Email',
    submit: 'Subscribe',
    loading: 'Sending...',
    successTitle: 'Thank you!',
    successMsg: 'You are now subscribed 🎉',
    required: 'This field is required',
  },
  it: {
    close: 'Chiudi',
    firstname: 'Nome',
    phone: 'Numero di telefono',
    email: 'Email',
    submit: 'Iscriviti',
    loading: 'Invio...',
    successTitle: 'Grazie!',
    successMsg: 'Sei iscritto/a 🎉',
    required: 'Campo obbligatorio',
  },
  es: {
    close: 'Cerrar',
    firstname: 'Nombre',
    phone: 'Número de teléfono',
    email: 'Email',
    submit: 'Suscribirse',
    loading: 'Enviando...',
    successTitle: '¡Gracias!',
    successMsg: 'Estás suscrito/a 🎉',
    required: 'Campo requerido',
  },
};

interface PopupSettings {
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

interface Props {
  settings: PopupSettings;
  locale: string;
  primaryColor?: string;
}

export default function LeadsPopup({ settings, locale, primaryColor = '#F59E0B' }: Props) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = L[locale] || L.fr;

  useEffect(() => {
    if (!settings.enabled) return;
    try {
      if (settings.showOnce && localStorage.getItem(KEY)) return;
    } catch {}
    const timer = setTimeout(() => setVisible(true), settings.delay * 1000);
    return () => clearTimeout(timer);
  }, [settings]);

  function dismiss() {
    setClosing(true);
    setTimeout(() => { setVisible(false); setClosing(false); }, 280);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (settings.showFirstname && !firstname.trim()) errs.firstname = t.required;
    if (settings.showPhone && !phone.trim()) errs.phone = t.required;
    if (settings.showEmail && !email.trim()) errs.email = t.required;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname: firstname || null, phone: phone || null, email: email || null }),
      });
      try { localStorage.setItem(KEY, '1'); } catch {}
      setSuccess(true);
      setTimeout(dismiss, 2500);
    } catch {
      // silent fail — still mark as done
      try { localStorage.setItem(KEY, '1'); } catch {}
      setSuccess(true);
      setTimeout(dismiss, 2500);
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className={`w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-280 ${
          closing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}
        style={{ animation: closing ? undefined : 'leads-popup-in 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* Header band */}
        <div className="px-6 pt-5 pb-4 relative" style={{ backgroundColor: primaryColor }}>
          <button
            onClick={dismiss}
            aria-label={t.close}
            className="absolute right-4 top-4 w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-lg font-black text-white leading-tight pr-8">{settings.title}</p>
          <p className="text-sm text-white/80 mt-1 leading-snug">{settings.message}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-black text-gray-900 text-lg">{t.successTitle}</p>
              <p className="text-sm text-gray-500 mt-1">{t.successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {settings.showFirstname && (
                <div>
                  <input
                    type="text"
                    value={firstname}
                    onChange={e => { setFirstname(e.target.value); setErrors(v => ({ ...v, firstname: '' })); }}
                    placeholder={t.firstname}
                    autoComplete="given-name"
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                  {errors.firstname && <p className="text-xs text-red-500 mt-1 ml-1">{errors.firstname}</p>}
                </div>
              )}
              {settings.showPhone && (
                <div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(v => ({ ...v, phone: '' })); }}
                    placeholder={t.phone}
                    autoComplete="tel"
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1">{errors.phone}</p>}
                </div>
              )}
              {settings.showEmail && (
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })); }}
                    placeholder={t.email}
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': primaryColor } as any}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? t.loading : settings.buttonText}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes leads-popup-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
