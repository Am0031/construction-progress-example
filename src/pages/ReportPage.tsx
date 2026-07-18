import { useMemo } from 'react';
import StatTile from '../components/StatTile';
import StatusBreakdownChart from '../components/StatusBreakdownChart';
import { computeDashboardMetrics } from '../lib/dashboardMetrics';
import { computeResourceAssignments, countConflictedResources } from '../lib/resourceMetrics';
import { riskScore } from '../lib/riskColors';
import sectionsData from '../data/sections.json';
import powerStationsData from '../data/powerStations.json';
import contractData from '../data/contract.json';
import risksData from '../data/risks.json';
import type { Section } from '../types/section';
import type { PowerStation } from '../types/station';
import type { Risk } from '../types/risk';

const sections = sectionsData as Section[];
const powerStations = powerStationsData as unknown as PowerStation[];
const risks = risksData as Risk[];

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const ReportPage = () => {
  const now = useMemo(() => new Date(), []);
  const metrics = useMemo(() => computeDashboardMetrics(now), [now]);
  const assignmentsByResource = useMemo(() => computeResourceAssignments(), []);
  const conflictedCount = useMemo(
    () => countConflictedResources(assignmentsByResource),
    [assignmentsByResource],
  );

  const blockedSections = sections.filter((s) => s.blockers.length > 0);
  const blockedStations = powerStations.filter((s) => s.blockers.length > 0);

  const topRisks = [...risks]
    .filter((r) => r.status !== 'closed')
    .sort((a, b) => riskScore(b.probability, b.impact) - riskScore(a.probability, a.impact))
    .slice(0, 5);

  const upcomingMilestones = contractData.keyMilestones
    .filter((m) => new Date(`${m.date}T00:00:00`).getTime() >= now.getTime())
    .slice(0, 3);

  return (
    <div className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-6 print:max-w-none">
        <div className="no-print flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Weekly Progress Report</h1>
            <p className="text-sm text-slate-500">Preview below — use Print to save as PDF.</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">{contractData.projectName}</h2>
            <p className="text-sm text-slate-500">
              Weekly Progress Report &middot; week ending {formatDate(now.toISOString().slice(0, 10))}
            </p>
          </div>

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Programme summary
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status breakdown
            </h3>
            <StatusBreakdownChart counts={metrics.statusCounts} total={metrics.totalSections} />
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Top risks
            </h3>
            {topRisks.length > 0 ? (
              <ul className="space-y-1.5">
                {topRisks.map((risk) => (
                  <li
                    key={risk.riskId}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-sm"
                  >
                    <span className="text-slate-700">
                      <span className="font-medium">{risk.riskId}</span> &middot; {risk.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      score {riskScore(risk.probability, risk.impact)}/9 &middot; {risk.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No open risks.</p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Open blockers
            </h3>
            {blockedSections.length + blockedStations.length > 0 ? (
              <ul className="space-y-1.5">
                {blockedSections.map((s) => (
                  <li key={s.sectionId} className="text-sm text-slate-700">
                    <span className="font-medium">{s.sectionId}</span> ({s.routeName}):{' '}
                    {s.blockers.join('; ')}
                  </li>
                ))}
                {blockedStations.map((s) => (
                  <li key={s.stationId} className="text-sm text-slate-700">
                    <span className="font-medium">{s.name}</span>: {s.blockers.join('; ')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No blockers reported.</p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Resourcing
            </h3>
            <p className="text-sm text-slate-700">
              {conflictedCount > 0
                ? `${conflictedCount} crew${conflictedCount === 1 ? '' : 's'} have overlapping demand across two or more sections — see the Resource Utilisation view for detail.`
                : 'No overlapping crew demand detected this period.'}
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming milestones
            </h3>
            <ul className="space-y-1.5">
              {upcomingMilestones.map((m) => (
                <li key={m.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{m.name}</span>
                  <span className="tabular-nums text-slate-500">{formatDate(m.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
