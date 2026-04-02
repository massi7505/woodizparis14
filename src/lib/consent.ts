/**
 * Consent — utilitaires RGPD
 *
 * Stocke le choix utilisateur dans localStorage sous la clé `woodiz_consent`.
 * Expire après EXPIRE_DAYS jours → le bandeau réapparaît pour renouveler le consentement.
 * Un CustomEvent `woodiz:consent` est dispatché à chaque écriture, permettant
 * aux composants (ex: VisitTracker) de réagir sans polling.
 */

export const CONSENT_KEY = 'woodiz_consent';
const CONSENT_VERSION = 1;
const EXPIRE_MS = 365 * 24 * 60 * 60 * 1000; // 365 jours

export interface ConsentData {
  v: number;
  analytics: boolean;
  marketing: boolean;
  ts: number; // timestamp epoch ms
}

/** Lit le consentement stocké. Retourne null si absent, invalide ou expiré. */
export function readConsent(): ConsentData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ConsentData;
    if (data.v !== CONSENT_VERSION) return null;
    if (Date.now() - data.ts > EXPIRE_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** Écrit le consentement et notifie les abonnés via CustomEvent. */
export function writeConsent(analytics: boolean, marketing: boolean): ConsentData {
  const data: ConsentData = {
    v: CONSENT_VERSION,
    analytics,
    marketing,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('woodiz:consent', { detail: data }));
  } catch {
    // localStorage indisponible (private mode strict) — on ignore silencieusement
  }
  return data;
}

/** Efface le consentement (permet de rouvrir le bandeau). */
export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // noop
  }
}
