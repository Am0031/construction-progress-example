import { STATUSES, type SectionStatus } from '../types/section';
import { statusHex } from '../lib/statusColors';

interface StatusBreakdownChartProps {
  counts: Record<SectionStatus, number>;
  total: number;
}

const StatusBreakdownChart = ({ counts, total }: StatusBreakdownChartProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Sections by status ({total} total)
      </p>
      <ul className="space-y-2.5">
        {STATUSES.map((status) => {
          const count = counts[status];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <li key={status} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm capitalize text-slate-700">{status}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: statusHex(status) }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-sm tabular-nums text-slate-600">
                {count} ({pct.toFixed(0)}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StatusBreakdownChart;
