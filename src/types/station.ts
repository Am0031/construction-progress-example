import type { SectionStatus } from './section';

export const STATION_TYPES = [
  'Grid Supply Point',
  'Substation',
  'Switching Station',
  'Converter Station',
] as const;

export type StationType = (typeof STATION_TYPES)[number];

export interface PowerStation {
  stationId: string;
  name: string;
  stationType: StationType;
  p6ActivityId: string;
  wbsPath: string;
  coord: [number, number];
  status: SectionStatus;
  voltageKV: number;
  capacityMVA: number;
  plannedEnergisation: string;
  actualEnergisation: string | null;
  percentComplete: number;
  resourcesOnSite: string[];
  blockers: string[];
  comments: string;
  predecessors: string[];
  freeFloat: number;
}
