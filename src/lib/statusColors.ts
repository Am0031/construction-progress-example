import type { SectionStatus } from '../types/section';

// Traffic-light progress scale: crimson -> orange -> gold -> blue -> green.
// Validated for max practical separation (normal-vision floor passes at
// ΔE 15.6+); the one unavoidable fail is red-vs-green under deutan CVD, which
// is inherent to any red-to-green scale, not fixable by re-picking hues. That
// pair is mitigated by always pairing the swatch with a text label (legend,
// side panel) rather than relying on hue alone.
export const STATUS_COLORS: Record<SectionStatus, { hex: string; rgb: [number, number, number] }> = {
  'not started': { hex: '#be123c', rgb: [190, 18, 60] },
  preparing: { hex: '#f97316', rgb: [249, 115, 22] },
  'main works ongoing': { hex: '#a16207', rgb: [161, 98, 7] },
  commissioning: { hex: '#0284c7', rgb: [2, 132, 199] },
  completed: { hex: '#15803d', rgb: [21, 128, 61] },
};

export function statusColorRGB(status: SectionStatus): [number, number, number] {
  return STATUS_COLORS[status].rgb;
}

export function statusHex(status: SectionStatus): string {
  return STATUS_COLORS[status].hex;
}
