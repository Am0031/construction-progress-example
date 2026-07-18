import { STATUSES } from '../types/section';
import { statusHex } from '../lib/statusColors';

const Legend = () => {
  return (
    <div className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Section status
      </p>
      <ul className="space-y-1.5">
        {STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-2 text-sm text-slate-700">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: statusHex(status) }}
            />
            <span className="capitalize">{status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;
