'use client';

import { useEffect } from 'react';
import { readConsent } from '@/lib/consent';
import type { ConsentData } from '@/lib/consent';

/**
 * Envoie une visite à /api/track-visit uniquement si l'utilisateur
 * a accordé le consentement analytics (woodiz_consent.analytics === true).
 *
 * Écoute aussi l'événement `woodiz:consent` pour tracker au moment où
 * l'utilisateur donne son accord durant la session courante.
 */
export default function VisitTracker({ page }: { page: string }) {
  useEffect(() => {
    let tracked = false;

    function track() {
      if (tracked) return; // ne tracker qu'une fois par montage
      const consent = readConsent();
      if (!consent || !consent.analytics) return;
      tracked = true;
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page }),
      }).catch(() => {});
    }

    // Tentative immédiate (si consentement déjà donné)
    track();

    // Réaction au choix fait pendant la session courante
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentData>).detail;
      if (detail.analytics) track();
    };
    window.addEventListener('woodiz:consent', onConsent);
    return () => window.removeEventListener('woodiz:consent', onConsent);
  }, [page]);

  return null;
}
