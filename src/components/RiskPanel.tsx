import type { Risk } from '../types/risk';
import { riskScore, riskSeverityColor } from '../lib/riskColors';

interface RiskPanelProps {
  risk: Risk | null;
  onClose: () => void;
}

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const RiskPanel = ({ risk, onClose }: RiskPanelProps) => {
  if (!risk) return null;

  const color = riskSeverityColor(risk.probability, risk.impact);

  return (
    <aside className="fixed bottom-0 left-0 right-0 top-14 z-40 flex flex-col overflow-y-auto border-t border-slate-200 bg-white shadow-xl sm:static sm:z-auto sm:h-full sm:w-96 sm:border-l sm:border-t-0">
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {risk.riskId} &middot; {risk.category}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{risk.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close risk details"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          &#x2715;
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium capitalize text-slate-800">
            {risk.probability} probability &times; {risk.impact} impact
          </span>
          <span className="ml-auto text-sm text-slate-500">
            Score {riskScore(risk.probability, risk.impact)}/9
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
          <p className="mt-1 text-sm capitalize text-slate-700">{risk.status}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
          <p className="mt-1 text-sm text-slate-700">{risk.description}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mitigation</p>
          <p className="mt-1 text-sm text-slate-700">{risk.mitigation}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Owner</p>
          <p className="mt-1 text-sm text-slate-700">{risk.owner}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dates</p>
          <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <dt className="text-slate-500">Raised</dt>
            <dd className="text-slate-800">{formatDate(risk.dateRaised)}</dd>
            <dt className="text-slate-500">Target close</dt>
            <dd className="text-slate-800">{formatDate(risk.targetCloseDate)}</dd>
          </dl>
        </div>

        {risk.linkedTo && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Linked to</p>
            <p className="mt-1 text-sm text-slate-700">{risk.linkedTo}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RiskPanel;
