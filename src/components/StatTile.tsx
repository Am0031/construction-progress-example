interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: 'default' | 'warning' | 'good';
}

const TONE_CLASSES: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-slate-900',
  warning: 'text-rose-600',
  good: 'text-emerald-700',
};

const StatTile = ({ label, value, sublabel, tone = 'default' }: StatTileProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${TONE_CLASSES[tone]}`}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
};

export default StatTile;
