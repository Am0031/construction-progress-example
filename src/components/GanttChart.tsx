import { useMemo } from 'react';
import type { ChildActivity } from '../types/activity';
import { ACTIVITY_STATUS_COLORS } from '../lib/activityColors';
import { ACTIVITY_STATUSES } from '../types/activity';
import { computeTimelineScale, formatShortDate, toDate } from '../lib/timelineScale';

interface GanttChartProps {
  activities: ChildActivity[];
}

const GanttChart = ({ activities }: GanttChartProps) => {
  const { toPct, monthTicks, todayPct, showToday } = useMemo(() => {
    const allDates = activities.flatMap((a) =>
      [a.plannedStart, a.plannedFinish, a.actualStart, a.actualFinish].filter(
        (v): v is string => Boolean(v),
      ),
    );
    return computeTimelineScale(allDates.map(toDate));
  }, [activities]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-2">
        {ACTIVITY_STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: ACTIVITY_STATUS_COLORS[status] }}
            />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="w-56 shrink-0 border-r border-slate-100">
          <div className="h-8 border-b border-slate-100" />
          {activities.map((activity) => (
            <div
              key={activity.activityId}
              className="flex h-11 items-center border-b border-slate-50 px-3 text-xs text-slate-700"
              title={activity.name}
            >
              <span className="truncate">{activity.name}</span>
            </div>
          ))}
        </div>

        <div className="relative flex-1 overflow-x-auto">
          <div className="relative min-w-[640px]">
            <div className="relative h-8 border-b border-slate-100">
              {monthTicks.map((tick) => (
                <div
                  key={tick.toISOString()}
                  className="absolute top-0 h-full border-l border-slate-100 pl-1.5 text-[11px] leading-8 text-slate-400"
                  style={{ left: `${toPct(tick)}%` }}
                >
                  {tick.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                </div>
              ))}
            </div>

            <div className="relative">
              {showToday && (
                <div
                  className="pointer-events-none absolute top-0 z-10 h-full border-l-2 border-dashed border-rose-400"
                  style={{ left: `${todayPct}%` }}
                >
                  <span className="absolute -top-0 left-1 whitespace-nowrap text-[10px] font-medium text-rose-500">
                    Today
                  </span>
                </div>
              )}

              {activities.map((activity) => {
                const plannedStartD = toDate(activity.plannedStart);
                const plannedFinishD = toDate(activity.plannedFinish);
                const left = toPct(plannedStartD);
                const width = Math.max(toPct(plannedFinishD) - left, 0.8);
                const color = ACTIVITY_STATUS_COLORS[activity.status];

                return (
                  <div
                    key={activity.activityId}
                    className="relative flex h-11 items-center border-b border-slate-50"
                  >
                    <div
                      className="group absolute h-5 rounded-full"
                      style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
                    >
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[11px] text-white group-hover:block">
                        {activity.activityId} &middot; {formatShortDate(plannedStartD)}&ndash;
                        {formatShortDate(plannedFinishD)} &middot; {activity.percentComplete}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
