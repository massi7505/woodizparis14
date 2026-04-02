'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { readConsent, writeConsent } from '@/lib/consent';

/**
 * Bandeau de consentement aux cookies — RGPD / ePrivacy
 *
 * Comportement :
 * - S'affiche si aucun consentement valide n'est enregistré.
 * - Disparaît immédiatement après le choix ; réapparaît au bout de 365 jours.
 * - Écoute `woodiz:open-consent` pour rouvrir la modal depuis n'importe où
 *   (ex: lien "Gérer les cookies" dans le footer).
 * - Dispatche `woodiz:consent` pour notifier les autres composants du choix.
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  // Pré-remplir les toggles avec le consentement actuel (si la modal est rouverte)
  const openModal = useCallback(() => {
    const current = readConsent();
    if (current) {
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    }
    setShowModal(true);
  }, []);

  useEffect(() => {
    // Afficher le bandeau seulement si aucun consentement valide
    if (!readConsent()) {
      const t = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    // Écouter la demande d'ouverture depuis des composants externes (footer, etc.)
    const handler = () => openModal();
    window.addEventListener('woodiz:open-consent', handler);
    return () => window.removeEventListener('woodiz:open-consent', handler);
  }, [openModal]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function acceptAll() {
    writeConsent(true, true);
    setShowBanner(false);
    setShowModal(false);
  }

  function refuseAll() {
    writeConsent(false, false);
    setShowBanner(false);
    setShowModal(false);
  }

  function savePreferences() {
    writeConsent(analytics, marketing);
    setShowBanner(false);
    setShowModal(false);
  }

  // Rien à rendre si ni bandeau ni modal
  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* ── Bandeau bas de page ─────────────────────────────────────────── */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 z-[200] p-3 sm:p-4">
          <div
            className="max-w-4xl mx-auto rounded-2xl border border-gray-700/80 shadow-2xl"
            style={{
              background: 'rgba(17,24,39,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <span aria-hidden="true">🍪</span>
                  Paramètres des cookies
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Nous utilisons des cookies analytiques et marketing pour améliorer votre expérience.
                  Les cookies essentiels sont nécessaires au fonctionnement du site.{' '}
                  <Link
                    href="/legal/politique-cookies"
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Politique de cookies
                  </Link>
                </p>
              </div>

              {/* Boutons */}
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <button
                  onClick={openModal}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  Paramètres
                </button>
                <button
                  onClick={refuseAll}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-600 text-gray-200 hover:border-gray-400 hover:text-white transition-all"
                >
                  Refuser
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-gray-900 transition-all hover:opacity-90"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal paramètres ─────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-3 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white">⚙️ Paramètres des cookies</h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Catégories */}
            <div className="p-4 space-y-2.5">

              {/* Essentiels — toujours actifs */}
              <CategoryRow
                icon="🔒"
                title="Cookies essentiels"
                description="Session administrateur, sécurité CSRF. Indispensables au fonctionnement du site — ils ne peuvent pas être désactivés."
                control={
                  <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-lg whitespace-nowrap">
                    Toujours actifs
                  </span>
                }
              />

              {/* Analytiques */}
              <CategoryRow
                icon="📊"
                title="Cookies analytiques"
                description="Comptage anonymisé des visites (IP tronquée, identifiant haché). Aucune donnée transmise à des tiers."
                control={
                  <Toggle checked={analytics} onChange={setAnalytics} label="Analytiques" />
                }
              />

              {/* Marketing */}
              <CategoryRow
                icon="📢"
                title="Cookies marketing"
                description="Popup d'offres et promotions personnalisées. Mémorise votre préférence d'affichage localement."
                control={
                  <Toggle checked={marketing} onChange={setMarketing} label="Marketing" />
                }
              />
            </div>

            {/* Footer modal */}
            <div className="px-4 pb-5 space-y-2.5 border-t border-gray-800 pt-4">
              <button
                onClick={savePreferences}
                className="w-full py-2.5 text-sm font-bold rounded-xl text-gray-900 transition-all hover:opacity-90"
                style={{ backgroundColor: '#F59E0B' }}
              >
                Enregistrer mes préférences
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={refuseAll}
                  className="py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl border border-gray-700 hover:border-gray-500 transition-all"
                >
                  Tout refuser
                </button>
                <button
                  onClick={acceptAll}
                  className="py-2 text-xs font-semibold text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all"
                >
                  Tout accepter
                </button>
              </div>
              <p className="text-center text-[11px] text-gray-600 pt-1 space-x-2">
                <Link href="/legal/politique-cookies" className="hover:text-gray-400 underline transition-colors">
                  Politique de cookies
                </Link>
                <span>·</span>
                <Link href="/legal/politique-confidentialite" className="hover:text-gray-400 underline transition-colors">
                  Confidentialité
                </Link>
                <span>·</span>
                <Link href="/legal/mentions-legales" className="hover:text-gray-400 underline transition-colors">
                  Mentions légales
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function CategoryRow({
  icon, title, description, control,
}: {
  icon: string;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-800/60 border border-gray-700/50">
      <span className="text-lg mt-0.5 flex-shrink-0" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0 mt-0.5">{control}</div>
    </div>
  );
}

function Toggle({
  checked, onChange, label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
      style={{ backgroundColor: checked ? '#F59E0B' : '#374151' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}
