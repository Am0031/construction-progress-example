import type { PlanningZone } from '../types/zone';
import { statusHex } from '../lib/statusColors';

interface ZonePanelProps {
  zone: PlanningZone | null;
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

const ZonePanel = ({ zone, onClose }: ZonePanelProps) => {
  if (!zone) return null;

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl sm:w-96">
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {zone.leadAuthority}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{zone.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close zone details"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          &#x2715;
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 py-4">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: statusHex(zone.status) }}
          />
          <span className="text-sm font-medium capitalize text-slate-800">{zone.status}</span>
        </div>
        <p className="-mt-3 text-xs text-slate-400">
          Status reflects wayleave/planning consent progress, not construction phase.
        </p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Consent reference</p>
          <p className="mt-1 text-sm text-slate-700">{zone.consentReference}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dates</p>
          <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <dt className="text-slate-500">Submitted</dt>
            <dd className="text-slate-800">{formatDate(zone.submittedDate || null)}</dd>
            <dt className="text-slate-500">Decision</dt>
            <dd className="text-slate-800">{formatDate(zone.decisionDate)}</dd>
          </dl>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Comments</p>
          <p className="mt-1 text-sm text-slate-700">{zone.comments}</p>
        </div>
      </div>
    </aside>
  );
};

export default ZonePanel;
