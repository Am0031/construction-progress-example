export const ACTIVITY_STATUSES = ['not started', 'ongoing', 'late', 'finished'] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export interface ChildActivity {
  activityId: string;
  name: string;
  plannedStart: string;
  plannedFinish: string;
  actualStart: string | null;
  actualFinish: string | null;
  status: ActivityStatus;
  percentComplete: number;
}

/**
 * Simulates the response of a separate DB query keyed by section — in a real
 * system this would be a distinct API call (e.g. GET /sections/:id/activities)
 * rather than living in the same payload as the route/section geometry.
 */
export interface SectionActivities {
  sectionId: string;
  p6ActivityId: string;
  sectionSummary: string;
  activities: ChildActivity[];
}
