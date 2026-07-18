import type { ActivityStatus } from '../types/activity';

// Distinct from the map's red->green progress palette on purpose: these are
// schedule-adherence states (is this activity on track?), not construction
// phases, so reusing the same hues would blur two different questions into
// one legend. "finished"/"late" reuse the skill's reserved good/critical
// status hexes; "ongoing" takes the categorical blue; "not started" is inked
// neutral gray.
export const ACTIVITY_STATUS_COLORS: Record<ActivityStatus, string> = {
  'not started': '#94a3b8',
  ongoing: '#2a78d6',
  late: '#d03b3b',
  finished: '#0ca30c',
};
