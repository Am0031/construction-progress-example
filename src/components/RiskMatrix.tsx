import { Fragment } from 'react';
import type { Risk, RiskLevel } from '../types/risk';
import { riskSeverityColor } from '../lib/riskColors';

interface RiskMatrixProps {
  risks: Risk[];
  onSelectRisk: (risk: Risk) => void;
}

const IMPACT_ROWS: RiskLevel[] = ['high', 'medium', 'low'];
const PROBABILITY_COLS: RiskLevel[] = ['low', 'medium', 'high'];

const RiskMatrix = ({ risks, onSelectRisk }: RiskMatrixProps) => {
  const openRisks = risks.filter((r) => r.status !== 'closed');

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Risk matrix (open &amp; mitigating risks)
      </p>
      <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-1">
        <div />
        {PROBABILITY_COLS.map((p) => (
          <div key={p} className="text-center text-xs font-medium capitalize text-slate-500">
            {p} probability
          </div>
        ))}

        {IMPACT_ROWS.map((impact) => (
          <Fragment key={impact}>
            <div
              key={`label-${impact}`}
              className="flex items-center justify-end pr-2 text-xs font-medium capitalize text-slate-500"
            >
              {impact} impact
            </div>
            {PROBABILITY_COLS.map((probability) => {
              const cellRisks = openRisks.filter(
                (r) => r.impact === impact && r.probability === probability,
              );
              const color = riskSeverityColor(probability, impact);
              return (
                <div
                  key={`${impact}-${probability}`}
                  className="min-h-20 rounded p-2"
                  style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
                >
                  <div className="flex flex-wrap gap-1">
                    {cellRisks.map((risk) => (
                      <button
                        key={risk.riskId}
                        type="button"
                        onClick={() => onSelectRisk(risk)}
                        className="cursor-pointer rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white hover:opacity-80"
                        style={{ backgroundColor: color }}
                        title={risk.title}
                      >
                        {risk.riskId}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default RiskMatrix;
