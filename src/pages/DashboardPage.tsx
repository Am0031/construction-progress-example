import { useMemo } from 'react';
import StatTile from '../components/StatTile';
import StatusBreakdownChart from '../components/StatusBreakdownChart';
import ProgressSCurve from '../components/ProgressSCurve';
import { computeDashboardMetrics, computeSCurve } from '../lib/dashboardMetrics';
import contractData from '../data/contract.json';

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const DashboardPage = () => {
  const now = useMemo(() => new Date(), []);
  const metrics = useMemo(() => computeDashboardMetrics(now), [now]);
  const sCurveData = useMemo(() => computeSCurve(now), [now]);

  const nextMilestone = contractData.keyMilestones.find(
    (m) => new Date(`${m.date}T00:00:00`).getTime() >= now.getTime(),
  );

  return (
    <div className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Programme Overview</h1>
          <p className="text-sm text-slate-500">
            {contractData.projectName} &middot; data as of {formatDate(now.toISOString().slice(0, 10))}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            label="Overall progress"
            value={`${metrics.overallPercentComplete.toFixed(0)}%`}
            sublabel={`${metrics.totalSections} sections tracked`}
          />
          <StatTile
            label="Critical path"
            value={`${metrics.criticalPathCount}`}
            sublabel="sections at 0 days free float"
            tone={metrics.criticalPathCount > 0 ? 'warning' : 'good'}
          />
          <StatTile
            label="Open blockers"
            value={`${metrics.openBlockersCount}`}
            sublabel="sections & stations"
            tone={metrics.openBlockersCount > 0 ? 'warning' : 'good'}
          />
          <StatTile
            label="Stations energised"
            value={`${metrics.stationsEnergised} / ${metrics.totalStations}`}
            sublabel="power stations"
          />
          <StatTile
            label={metrics.daysToCompletion >= 0 ? 'Days to completion' : 'Days overdue'}
            value={`${Math.abs(metrics.daysToCompletion)}`}
            sublabel={`Overall completion: ${formatDate(metrics.overallCompletionDate)}`}
            tone={metrics.daysToCompletion < 0 ? 'warning' : 'default'}
          />
        </div>

        <ProgressSCurve data={sCurveData} now={now} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatusBreakdownChart counts={metrics.statusCounts} total={metrics.totalSections} />

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Key milestones
            </p>
            <ul className="space-y-2">
              {contractData.keyMilestones.map((milestone) => {
                const isNext = nextMilestone?.name === milestone.name;
                const isPast = new Date(`${milestone.date}T00:00:00`).getTime() < now.getTime();
                return (
                  <li
                    key={milestone.name}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-sm ${
                      isNext ? 'bg-blue-50 text-blue-900' : isPast ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    <span>
                      {milestone.name}
                      {isNext && (
                        <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                          NEXT
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums">{formatDate(milestone.date)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
