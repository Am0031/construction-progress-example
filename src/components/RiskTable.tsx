import type { Risk } from '../types/risk';
import { riskScore, riskSeverityColor } from '../lib/riskColors';

interface RiskTableProps {
  risks: Risk[];
  selectedRiskId: string | null;
  onSelectRisk: (risk: Risk) => void;
}

const STATUS_BADGE: Record<Risk['status'], string> = {
  open: 'bg-rose-100 text-rose-800',
  mitigating: 'bg-amber-100 text-amber-800',
  closed: 'bg-slate-100 text-slate-500',
};

const RiskTable = ({ risks, selectedRiskId, onSelectRisk }: RiskTableProps) => {
  const sorted = [...risks].sort(
    (a, b) => riskScore(b.probability, b.impact) - riskScore(a.probability, a.impact),
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Risk</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Owner</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((risk) => {
            const isSelected = risk.riskId === selectedRiskId;
            const color = riskSeverityColor(risk.probability, risk.impact);
            return (
              <tr
                key={risk.riskId}
                onClick={() => onSelectRisk(risk)}
                className={`cursor-pointer border-b border-slate-50 hover:bg-slate-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <span className="font-medium text-slate-800">{risk.riskId}</span>
                  <span className="ml-2 text-slate-600">{risk.title}</span>
                </td>
                <td className="px-3 py-2 text-slate-600">{risk.category}</td>
                <td className="px-3 py-2">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {riskScore(risk.probability, risk.impact)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[risk.status]}`}
                  >
                    {risk.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">{risk.owner}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RiskTable;
