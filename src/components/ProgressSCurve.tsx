import { useMemo } from 'react';
import type { SCurvePoint } from '../lib/dashboardMetrics';

interface ProgressSCurveProps {
  data: SCurvePoint[];
  now?: Date;
}

const WIDTH = 1000;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 40 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const ProgressSCurve = ({ data, now = new Date() }: ProgressSCurveProps) => {
  const { xScale, yScale, plannedPath, actualPath, monthTicks, todayX } = useMemo(() => {
    const times = data.map((d) => d.date.getTime());
    const minT = Math.min(...times);
    const maxT = Math.max(...times);

    const xScale = (t: number) => MARGIN.left + ((t - minT) / (maxT - minT)) * PLOT_WIDTH;
    const yScale = (v: number) => MARGIN.top + PLOT_HEIGHT - (v / 100) * PLOT_HEIGHT;

    const plannedPath = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.date.getTime())},${yScale(d.planned)}`)
      .join(' ');

    const actualPoints = data.filter((d) => d.actual !== null);
    const actualPath = actualPoints
      .map(
        (d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.date.getTime())},${yScale(d.actual as number)}`,
      )
      .join(' ');

    const monthTicks = data.filter((_, i) => i % 2 === 0);
    const todayT = now.getTime();
    const todayX = todayT >= minT && todayT <= maxT ? xScale(todayT) : null;

    return { xScale, yScale, plannedPath, actualPath, monthTicks, todayX };
  }, [data, now]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Programme progress: planned vs. actual
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg width="16" height="8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            Planned
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="16" height="8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#2a78d6" strokeWidth="2" />
            </svg>
            Actual to date
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Planned vs actual progress S-curve">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="#e1e0d9"
              strokeWidth="1"
            />
            <text x={MARGIN.left - 8} y={yScale(v) + 4} textAnchor="end" fontSize="11" fill="#898781">
              {v}%
            </text>
          </g>
        ))}

        {monthTicks.map((d) => (
          <text
            key={d.date.toISOString()}
            x={xScale(d.date.getTime())}
            y={HEIGHT - MARGIN.bottom + 18}
            textAnchor="middle"
            fontSize="11"
            fill="#898781"
          >
            {d.date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
          </text>
        ))}

        {todayX !== null && (
          <>
            <line
              x1={todayX}
              x2={todayX}
              y1={MARGIN.top}
              y2={HEIGHT - MARGIN.bottom}
              stroke="#fb7185"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text x={todayX + 4} y={MARGIN.top + 10} fontSize="11" fill="#e11d48">
              Today
            </text>
          </>
        )}

        <path d={plannedPath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
        <path d={actualPath} fill="none" stroke="#2a78d6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default ProgressSCurve;
