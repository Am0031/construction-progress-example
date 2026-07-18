import type { Section } from '../types/section';
import { statusHex } from '../lib/statusColors';

interface SectionPanelProps {
  section: Section | null;
  allSections: Section[];
  onClose: () => void;
}

function formatDate(value: string | null): string {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function describeActivity(activityId: string, allSections: Section[]): string {
  const match = allSections.find((s) => s.p6ActivityId === activityId);
  return match ? `${match.sectionId} (${activityId})` : activityId;
}

const SectionPanel = ({ section, allSections, onClose }: SectionPanelProps) => {
  if (!section) return null;

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl sm:w-96">
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Chainage {section.chainageStartKm}&ndash;{section.chainageEndKm}km
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{section.sectionId}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close section details"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          &#x2715;
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 py-4">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: statusHex(section.status) }}
          />
          <span className="text-sm font-medium capitalize text-slate-800">{section.status}</span>
          <span className="ml-auto text-sm text-slate-500">{section.percentComplete}% complete</span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">P6 reference</p>
          <p className="mt-1 text-sm text-slate-700">Activity ID: {section.p6ActivityId}</p>
          <p className="text-sm text-slate-700">{section.wbsPath}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Predecessors</p>
            {section.predecessors.length > 0 ? (
              <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                {section.predecessors.map((id) => (
                  <li key={id}>{describeActivity(id, allSections)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-400">None (route start)</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Successors</p>
            {section.successors.length > 0 ? (
              <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                {section.successors.map((id) => (
                  <li key={id}>{describeActivity(id, allSections)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-400">None (route end)</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm font-medium text-slate-700">Free float</span>
          <span
            className={`text-sm font-semibold ${section.freeFloat === 0 ? 'text-rose-600' : 'text-slate-800'}`}
          >
            {section.freeFloat === 0 ? 'Critical path (0 days)' : `${section.freeFloat} day${section.freeFloat === 1 ? '' : 's'}`}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dates</p>
          <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <dt className="text-slate-500">Planned start</dt>
            <dd className="text-slate-800">{formatDate(section.plannedStart)}</dd>
            <dt className="text-slate-500">Planned finish</dt>
            <dd className="text-slate-800">{formatDate(section.plannedFinish)}</dd>
            <dt className="text-slate-500">Actual start</dt>
            <dd className="text-slate-800">{formatDate(section.actualStart)}</dd>
            <dt className="text-slate-500">Actual finish</dt>
            <dd className="text-slate-800">{formatDate(section.actualFinish)}</dd>
          </dl>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resources on site</p>
          {section.resourcesOnSite.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
              {section.resourcesOnSite.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-400">None currently mobilised</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Blockers</p>
          {section.blockers.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {section.blockers.map((blocker) => (
                <li
                  key={blocker}
                  className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-sm text-amber-800"
                >
                  {blocker}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-400">No blockers reported</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Comments</p>
          <p className="mt-1 text-sm text-slate-700">{section.comments}</p>
        </div>
      </div>
    </aside>
  );
};

export default SectionPanel;
