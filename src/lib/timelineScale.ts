export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export interface TimelineScale {
  domainStart: Date;
  domainEnd: Date;
  toPct: (d: Date) => number;
  monthTicks: Date[];
  today: Date;
  todayPct: number;
  showToday: boolean;
}

/**
 * Shared date-domain/scale computation for the app's timeline-style charts
 * (Gantt activities, resource utilisation) - one x-axis, month ticks, and a
 * "today" marker, driven off whatever date range the caller's data spans.
 */
export function computeTimelineScale(dates: Date[], paddingFraction = 0.05): TimelineScale {
  const times = dates.map((d) => d.getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const pad = (maxTime - minTime) * paddingFraction || MS_PER_DAY * 3;
  const domainStart = new Date(minTime - pad);
  const domainEnd = new Date(maxTime + pad);
  const totalDays = daysBetween(domainStart, domainEnd);
  const toPct = (d: Date) => (daysBetween(domainStart, d) / totalDays) * 100;

  const monthTicks: Date[] = [];
  const cursor = new Date(domainStart.getFullYear(), domainStart.getMonth(), 1);
  while (cursor <= domainEnd) {
    if (cursor >= domainStart) monthTicks.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const today = new Date();
  const todayPct = toPct(today);
  const showToday = todayPct >= 0 && todayPct <= 100;

  return { domainStart, domainEnd, toPct, monthTicks, today, todayPct, showToday };
}
