/**
 * Image Proxy — Utilities
 *
 * Obfuscates Vercel Blob URLs behind a server-side proxy route.
 * Encoding: base64url (btoa / atob — available Node 18+ and all browsers).
 * This is OBFUSCATION, not encryption. Determined users can reverse it.
 * The main gains are: casual URL hiding, no crawl of the real Blob URL,
 * and a centralised place to add stronger controls later.
 */

// ── Allowed origins ────────────────────────────────────────────────────────
// Only URLs from these hosts will be proxied. Prevents open-proxy abuse.
const ALLOWED_ORIGINS = [
  'public.blob.vercel-storage.com', // matches any subdomain
];

// ── Encoding ───────────────────────────────────────────────────────────────

/** Encode an image URL to a URL-safe base64 token */
export function encodeProxySrc(src: string): string {
  // btoa is a global in Node 18+ and all modern browsers
  return btoa(src).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a base64url token back to the original URL */
export function decodeProxySrc(token: string): string | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    // Re-add stripped padding
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

// ── Domain allow-list ─────────────────────────────────────────────────────

/** Returns true if the URL is safe to proxy */
export function isAllowedOrigin(url: string): boolean {
  // Internal paths (e.g. /img/pizza.webp) are always allowed
  if (url.startsWith('/')) return true;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_ORIGINS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

// ── Proxy URL builder ─────────────────────────────────────────────────────

/**
 * Returns the proxied URL for a given image src.
 * Already-proxied and relative URLs are returned unchanged.
 */
export function buildProxySrc(src: string): string {
  if (!src) return src;
  if (src.startsWith('/api/image')) return src; // already proxied
  if (src.startsWith('/')) return src;           // local — no need to proxy
  return `/api/image?src=${encodeProxySrc(src)}`;
}

// ── Mode helper ────────────────────────────────────────────────────────────

/**
 * Returns true if secure mode should be active for the current render.
 *
 * @param mode          'safe' | 'secure' | undefined
 * @param productionOnly  When true (default), secure mode is a no-op in dev
 *                        so hot-reload and local testing are never affected.
 */
export function shouldUseProxy(
  mode: 'safe' | 'secure' | undefined,
  productionOnly = true
): boolean {
  if (mode !== 'secure') return false;
  if (productionOnly && process.env.NODE_ENV !== 'production') return false;
  return true;
}
