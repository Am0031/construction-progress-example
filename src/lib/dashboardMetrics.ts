import sectionsData from '../data/sections.json';
import powerStationsData from '../data/powerStations.json';
import contractData from '../data/contract.json';
import { STATUSES, type Section, type SectionStatus } from '../types/section';
import type { PowerStation } from '../types/station';

const sections = sectionsData as Section[];
const powerStations = powerStationsData as unknown as PowerStation[];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export interface DashboardMetrics {
  totalSections: number;
  overallPercentComplete: number;
  criticalPathCount: number;
  openBlockersCount: number;
  stationsEnergised: number;
  totalStations: number;
  daysToCompletion: number;
  overallCompletionDate: string;
  statusCounts: Record<SectionStatus, number>;
}

export function computeDashboardMetrics(now: Date = new Date()): DashboardMetrics {
  const totalSections = sections.length;
  const overallPercentComplete =
    sections.reduce((sum, s) => sum + s.percentComplete, 0) / totalSections;
  const criticalPathCount = sections.filter((s) => s.freeFloat === 0).length;
  const openBlockersCount =
    sections.filter((s) => s.blockers.length > 0).length +
    powerStations.filter((s) => s.blockers.length > 0).length;
  const stationsEnergised = powerStations.filter((s) => s.status === 'completed').length;

  const overallCompletionDate = contractData.overallCompletionDate;
  const daysToCompletion = Math.round(
    (toDate(overallCompletionDate).getTime() - now.getTime()) / MS_PER_DAY,
  );

  const statusCounts = Object.fromEntries(
    STATUSES.map((status) => [status, sections.filter((s) => s.status === status).length]),
  ) as Record<SectionStatus, number>;

  return {
    totalSections,
    overallPercentComplete,
    criticalPathCount,
    openBlockersCount,
    stationsEnergised,
    totalStations: powerStations.length,
    daysToCompletion,
    overallCompletionDate,
    statusCounts,
  };
}

export interface SCurvePoint {
  date: Date;
  planned: number;
  actual: number | null;
}

function plannedProgressAt(section: Section, d: Date): number {
  const start = toDate(section.plannedStart).getTime();
  const finish = toDate(section.plannedFinish).getTime();
  const t = d.getTime();
  if (t <= start) return 0;
  if (t >= finish) return 100;
  return ((t - start) / (finish - start)) * 100;
}

function actualProgressAt(section: Section, d: Date, now: Date): number | null {
  if (d.getTime() > now.getTime()) return null; // don't project actuals into the future
  if (!section.actualStart) return 0;
  const start = toDate(section.actualStart).getTime();
  if (d.getTime() <= start) return 0;

  if (section.actualFinish) {
    const finish = toDate(section.actualFinish).getTime();
    if (d.getTime() >= finish) return 100;
    return ((d.getTime() - start) / (finish - start)) * 100;
  }

  // Still in progress: ramp linearly from actualStart(0%) to now(current % complete),
  // since the mock data only has a current snapshot, not a full progress history.
  const nowT = now.getTime();
  if (nowT <= start) return 0;
  const t = d.getTime();
  return (Math.min(t, nowT) - start) / (nowT - start) * section.percentComplete;
}

/**
 * Builds a monthly-sampled planned-vs-actual S-curve, aggregated (simple
 * average, one section = one unit of weight) across every modelled section.
 * The actual line only extends up to `now` — a real S-curve's actual line
 * always stops at the data-as-of date, it doesn't project forward.
 */
export function computeSCurve(now: Date = new Date()): SCurvePoint[] {
  const allDates = sections.flatMap((s) => [s.plannedStart, s.plannedFinish]);
  const earliest = toDate(allDates.sort()[0]);
  const overallCompletion = toDate(contractData.overallCompletionDate);
  const latest = overallCompletion > earliest ? overallCompletion : toDate(allDates.sort().slice(-1)[0]);

  const points: SCurvePoint[] = [];
  const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  while (cursor <= latest) {
    const d = new Date(cursor);
    const planned =
      sections.reduce((sum, s) => sum + plannedProgressAt(s, d), 0) / sections.length;

    const actualValues = sections.map((s) => actualProgressAt(s, d, now));
    const actual =
      d.getTime() > now.getTime()
        ? null
        : actualValues.reduce((sum: number, v) => sum + (v ?? 0), 0) / sections.length;

    points.push({ date: d, planned, actual });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
}
