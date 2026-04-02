'use client';

import { useEffect } from 'react';

/**
 * Sends an anonymous visit count to /api/track-visit.
 * Listens to Axeptio's consent callback — tracks only after analytics consent.
 * Falls back to tracking immediately if Axeptio consent was already given.
 */
export default function VisitTracker({ page }: { page: string }) {
  useEffect(() => {
    let tracked = false;

    function track() {
      if (tracked) return;
      tracked = true;
      fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page }),
      }).catch(() => {});
    }

    // Check if Axeptio consent was already given in a previous session
    try {
      const stored = localStorage.getItem('axeptio_cookies');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If user has completed Axeptio setup ($$completed = true), track
        if (parsed?.$$completed === true) {
          track();
          return;
        }
      }
    } catch {
      // localStorage unavailable — skip
    }

    // Listen for Axeptio consent event during current session
    const w = window as any;
    w._axcb = w._axcb || [];
    w._axcb.push(function (sdk: any) {
      sdk.on('cookies:complete', function () {
        track();
      });
    });
  }, [page]);

  return null;
}
