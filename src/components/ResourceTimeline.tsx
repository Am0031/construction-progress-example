import { useMemo, useState } from 'react';
import type { ResourceAssignment } from '../lib/resourceMetrics';
import { computeTimelineScale, formatShortDate } from '../lib/timelineScale';

interface ResourceTimelineProps {
  assignmentsByResource: Record<string, ResourceAssignment[]>;
}

const ResourceTimeline = ({ assignmentsByResource }: ResourceTimelineProps) => {
  const resources = Object.keys(assignmentsByResource);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  function toggleResource(resource: string) {
    setSelectedResource((prev) => (prev === resource ? null : resource));
  }

  const { toPct, monthTicks, todayPct, showToday } = useMemo(() => {
    const allDates = Object.values(assignmentsByResource)
      .flat()
      .flatMap((a) => [a.start, a.finish]);
    return computeTimelineScale(allDates);
  }, [assignmentsByResource]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
          Deployed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          Overlapping (same crew needed in two places)
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[900px]">
          <div className="w-56 shrink-0 border-r border-slate-100">
            <div className="h-8 border-b border-slate-100" />
            {resources.map((resource) => (
              <button
                key={resource}
                type="button"
                onClick={() => toggleResource(resource)}
                title={resource}
                className={`flex h-14 w-full items-center border-b border-slate-50 px-3 text-left text-xs text-slate-700 transition-colors ${
                  selectedResource === resource ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{resource}</span>
              </button>
            ))}
          </div>

          <div className="relative flex-1">
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

              {resources.map((resource) => {
                const assignments = assignmentsByResource[resource];
                return (
                  <div
                    key={resource}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleResource(resource)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleResource(resource);
                      }
                    }}
                    className={`relative h-14 cursor-pointer border-b border-slate-50 transition-colors ${
                      selectedResource === resource ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {assignments.map((a, i) => {
                      const left = toPct(a.start);
                      const width = Math.max(toPct(a.finish) - left, 0.8);
                      const conflicted = a.overlapsWith.length > 0;
                      return (
                        <div
                          key={a.sectionId}
                          className={`group absolute h-5 rounded-full ${
                            conflicted ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{ left: `${left}%`, width: `${width}%`, top: 8 + (i % 2) * 22 }}
                        >
                          <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[11px] text-white group-hover:block">
                            {a.label} &middot; {formatShortDate(a.start)}&ndash;
                            {formatShortDate(a.finish)}
                            {conflicted && ` · conflicts with ${a.overlapsWith.join(', ')}`}
                          </div>
                        </div>
                      );
                    })}
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

export default ResourceTimeline;
