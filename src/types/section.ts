export const STATUSES = [
  'not started',
  'preparing',
  'main works ongoing',
  'commissioning',
  'completed',
] as const;

export type SectionStatus = (typeof STATUSES)[number];

export interface Section {
  sectionId: string;
  p6ActivityId: string;
  wbsPath: string;
  routeId: string;
  routeName: string;
  chainageStartKm: number;
  chainageEndKm: number;
  startCoord: [number, number];
  endCoord: [number, number];
  status: SectionStatus;
  plannedStart: string;
  plannedFinish: string;
  actualStart: string | null;
  actualFinish: string | null;
  percentComplete: number;
  resourcesOnSite: string[];
  blockers: string[];
  comments: string;
  /** P6 activity IDs of activities that must finish before this section can start. */
  predecessors: string[];
  /** P6 activity IDs of activities that depend on this section finishing. */
  successors: string[];
  /** Days this section could slip without delaying its successor(s); 0 = critical path. */
  freeFloat: number;
}
