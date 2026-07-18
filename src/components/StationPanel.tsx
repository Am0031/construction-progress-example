import type { PowerStation } from '../types/station';
import { statusHex } from '../lib/statusColors';

interface StationPanelProps {
  station: PowerStation | null;
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

const StationPanel = ({ station, onClose }: StationPanelProps) => {
  if (!station) return null;

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl sm:w-96">
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {station.stationType}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{station.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close station details"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          &#x2715;
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 py-4">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: statusHex(station.status) }}
          />
          <span className="text-sm font-medium capitalize text-slate-800">{station.status}</span>
          <span className="ml-auto text-sm text-slate-500">{station.percentComplete}% complete</span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">P6 reference</p>
          <p className="mt-1 text-sm text-slate-700">Activity ID: {station.p6ActivityId}</p>
          <p className="text-sm text-slate-700">{station.wbsPath}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Voltage</p>
            <p className="mt-1 text-sm text-slate-700">{station.voltageKV} kV</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Capacity</p>
            <p className="mt-1 text-sm text-slate-700">{station.capacityMVA} MVA</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Predecessors</p>
          {station.predecessors.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
              {station.predecessors.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-400">None recorded</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm font-medium text-slate-700">Free float</span>
          <span
            className={`text-sm font-semibold ${station.freeFloat === 0 ? 'text-rose-600' : 'text-slate-800'}`}
          >
            {station.freeFloat === 0
              ? 'Critical path (0 days)'
              : `${station.freeFloat} day${station.freeFloat === 1 ? '' : 's'}`}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dates</p>
          <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <dt className="text-slate-500">Planned energisation</dt>
            <dd className="text-slate-800">{formatDate(station.plannedEnergisation)}</dd>
            <dt className="text-slate-500">Actual energisation</dt>
            <dd className="text-slate-800">{formatDate(station.actualEnergisation)}</dd>
          </dl>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resources on site</p>
          {station.resourcesOnSite.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
              {station.resourcesOnSite.map((resource) => (
                <li key={resource}>{resource}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-400">None currently mobilised</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Blockers</p>
          {station.blockers.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {station.blockers.map((blocker) => (
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
          <p className="mt-1 text-sm text-slate-700">{station.comments}</p>
        </div>
      </div>
    </aside>
  );
};

export default StationPanel;
