import type { RiskLevel } from '../types/risk';

// The skill's reserved status palette (good/warning/serious/critical) - kept
// distinct from the map's traffic-light and the Gantt schedule-status colors
// since this encodes a third, unrelated meaning: risk severity.
const SEVERITY_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
} as const;

const LEVEL_SCORE: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

export function riskScore(probability: RiskLevel, impact: RiskLevel): number {
  return LEVEL_SCORE[probability] * LEVEL_SCORE[impact];
}

export function riskSeverityColor(probability: RiskLevel, impact: RiskLevel): string {
  const score = riskScore(probability, impact);
  if (score <= 2) return SEVERITY_COLORS.good;
  if (score <= 4) return SEVERITY_COLORS.warning;
  if (score <= 6) return SEVERITY_COLORS.serious;
  return SEVERITY_COLORS.critical;
}
