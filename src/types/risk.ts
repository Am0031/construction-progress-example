export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_STATUSES = ['open', 'mitigating', 'closed'] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];

export const RISK_CATEGORIES = [
  'Weather',
  'Supply Chain',
  'Planning & Consents',
  'Third-Party Dependency',
  'Environmental',
  'Resourcing',
  'Commercial',
  'Health & Safety',
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export interface Risk {
  riskId: string;
  title: string;
  category: RiskCategory;
  description: string;
  probability: RiskLevel;
  impact: RiskLevel;
  status: RiskStatus;
  owner: string;
  mitigation: string;
  dateRaised: string;
  targetCloseDate: string | null;
  /** Optional link to a section, route, or planning zone this risk relates to. */
  linkedTo: string | null;
}
