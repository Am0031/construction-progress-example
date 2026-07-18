import type { SectionStatus } from './section';

/**
 * Represents a local planning authority area the route passes through.
 * Reuses the same 5-value status scale as sections/stations, here meaning
 * wayleave/planning consent progress rather than construction phase:
 * not started = no application submitted, preparing = submitted/under
 * review, main works ongoing = consent granted & conditions being
 * discharged, commissioning = conditions largely discharged, completed =
 * fully discharged.
 */
export interface PlanningZone {
  zoneId: string;
  name: string;
  leadAuthority: string;
  polygon: [number, number][];
  status: SectionStatus;
  consentReference: string;
  submittedDate: string;
  decisionDate: string | null;
  comments: string;
}
