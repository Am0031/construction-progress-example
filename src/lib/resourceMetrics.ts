import sectionsData from '../data/sections.json';
import type { Section } from '../types/section';

const sections = sectionsData as Section[];

export interface ResourceAssignment {
  sectionId: string;
  label: string;
  start: Date;
  finish: Date;
  overlapsWith: string[];
}

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function rangesOverlap(aStart: Date, aFinish: Date, bStart: Date, bFinish: Date): boolean {
  return aStart < bFinish && bStart < aFinish;
}

/**
 * Groups each named crew/resource (from Section.resourcesOnSite) into its
 * list of planned deployments and flags any that overlap in time - a crew
 * name represents one deployable team, so two overlapping assignments mean
 * a real scheduling conflict, not just a busy period.
 *
 * Only route sections are considered (not power stations), since stations
 * don't carry a plannedStart/plannedFinish window in the mock data to place
 * them on a timeline against.
 */
export function computeResourceAssignments(): Record<string, ResourceAssignment[]> {
  const byResource: Record<string, ResourceAssignment[]> = {};

  for (const section of sections) {
    for (const resource of section.resourcesOnSite) {
      const assignment: ResourceAssignment = {
        sectionId: section.sectionId,
        label: `${section.sectionId} (${section.routeName})`,
        start: toDate(section.plannedStart),
        finish: toDate(section.plannedFinish),
        overlapsWith: [],
      };
      (byResource[resource] ??= []).push(assignment);
    }
  }

  for (const assignments of Object.values(byResource)) {
    for (let i = 0; i < assignments.length; i++) {
      for (let j = i + 1; j < assignments.length; j++) {
        const a = assignments[i];
        const b = assignments[j];
        if (rangesOverlap(a.start, a.finish, b.start, b.finish)) {
          a.overlapsWith.push(b.sectionId);
          b.overlapsWith.push(a.sectionId);
        }
      }
    }
  }

  return byResource;
}

export function countConflictedResources(byResource: Record<string, ResourceAssignment[]>): number {
  return Object.entries(byResource).filter(([, assignments]) =>
    assignments.some((a) => a.overlapsWith.length > 0),
  ).length;
}
