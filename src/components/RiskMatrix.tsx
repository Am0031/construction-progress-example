import { Fragment } from 'react';
import type { Risk, RiskLevel } from '../types/risk';
import { riskScore, riskSeverityColor } from '../lib/riskColors';

interface RiskMatrixProps {
  risks: Risk[];
  onSelectRisk: (risk: Risk) => void;
}

const IMPACT_ROWS: RiskLevel[] = ['high', 'medium', 'low'];
const PROBABILITY_COLS: RiskLevel[] = ['low', 'medium', 'high'];

const RiskMatrix = ({ risks, onSelectRisk }: RiskMatrixProps) => {
  const openRisks = risks.filter((r) => r.status !== 'closed');

  const cells = IMPACT_ROWS.flatMap((impact) =>
    PROBABILITY_COLS.map((probability) => ({
      impact,
      probability,
      color: riskSeverityColor(probability, impact),
      risks: openRisks.filter((r) => r.impact === impact && r.probability === probability),
    })),
  );
  const nonEmptyCells = [...cells]
    .filter((cell) => cell.risks.length > 0)
    .sort((a, b) => riskScore(b.probability, b.impact) - riskScore(a.probability, a.impact));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Risk matrix (open &amp; mitigating risks)
      </p>

      {/* Below sm: a stacked list grouped by severity, since a 3x3 grid gets too
          cramped to read on narrow screens. */}
      <div className="space-y-2 sm:hidden">
        {nonEmptyCells.length > 0 ? (
          nonEmptyCells.map((cell) => (
            <div
              key={`${cell.impact}-${cell.probability}`}
              className="rounded p-2"
              style={{ backgroundColor: `${cell.color}1a`, border: `1px solid ${cell.color}55` }}
            >
              <p className="mb-1.5 text-xs font-medium capitalize text-slate-600">
                {cell.impact} impact &times; {cell.probability} probability
              </p>
              <div className="flex flex-wrap gap-1">
                {cell.risks.map((risk) => (
                  <button
                    key={risk.riskId}
                    type="button"
                    onClick={() => onSelectRisk(risk)}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white hover:opacity-80"
                    style={{ backgroundColor: cell.color }}
                    title={risk.title}
                  >
                    {risk.riskId}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No open or mitigating risks.</p>
        )}
      </div>

      {/* sm and up: the full probability x impact grid */}
      <div className="hidden overflow-x-auto sm:block">
        <div className="grid min-w-[420px] grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1">
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
                const cell = cells.find(
                  (c) => c.impact === impact && c.probability === probability,
                )!;
                return (
                  <div
                    key={`${impact}-${probability}`}
                    className="min-h-20 rounded p-2"
                    style={{ backgroundColor: `${cell.color}1a`, border: `1px solid ${cell.color}55` }}
                  >
                    <div className="flex flex-wrap gap-1">
                      {cell.risks.map((risk) => (
                        <button
                          key={risk.riskId}
                          type="button"
                          onClick={() => onSelectRisk(risk)}
                          className="cursor-pointer rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white hover:opacity-80"
                          style={{ backgroundColor: cell.color }}
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
    </div>
  );
};

export default RiskMatrix;
