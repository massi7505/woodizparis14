/** WCAG relative luminance of a hex color */
export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length < 6) return 0;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = toLinear(parseInt(h.slice(0, 2), 16) / 255);
  const g = toLinear(parseInt(h.slice(2, 4), 16) / 255);
  const b = toLinear(parseInt(h.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns '#000000' or '#ffffff' — whichever gives better contrast on `bgHex`.
 * Use for badge/chip text where background is arbitrary.
 */
export function autoTextColor(bgHex: string): string {
  const L = relativeLuminance(bgHex);
  // Contrast with white: (1+0.05)/(L+0.05), with black: (L+0.05)/(0+0.05)
  return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.05) ? '#ffffff' : '#000000';
}

/**
 * Darkens `hex` (a brand color used as text) until it achieves at least
 * 4.5:1 contrast against `bgHex` (default white). Preserves hue.
 */
export function darkenToContrast(hex: string, bgHex = '#FFFFFF'): string {
  if (contrastRatio(hex, bgHex) >= 4.5) return hex;
  const h = hex.replace('#', '');
  if (h.length < 6) return '#000000';
  let r = parseInt(h.slice(0, 2), 16);
  let g = parseInt(h.slice(2, 4), 16);
  let b = parseInt(h.slice(4, 6), 16);
  const fmt = () =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  while (contrastRatio(fmt(), bgHex) < 4.5 && (r > 0 || g > 0 || b > 0)) {
    r = Math.max(0, r - 10);
    g = Math.max(0, g - 10);
    b = Math.max(0, b - 10);
  }
  return fmt();
}
