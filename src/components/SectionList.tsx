import type { Section } from '../types/section';
import { statusHex } from '../lib/statusColors';

interface SectionListProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelect: (section: Section) => void;
  hasDetail?: (sectionId: string) => boolean;
}

const SectionList = ({ sections, selectedSectionId, onSelect, hasDetail }: SectionListProps) => {
  const grouped = sections.reduce<Record<string, Section[]>>((acc, section) => {
    (acc[section.routeName] ??= []).push(section);
    return acc;
  }, {});

  return (
    <nav className="h-full overflow-y-auto">
      {Object.entries(grouped).map(([routeName, routeSections]) => (
        <div key={routeName}>
          <p className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {routeName}
          </p>
          <ul>
            {routeSections.map((section) => {
              const isSelected = section.sectionId === selectedSectionId;
              const detailed = hasDetail?.(section.sectionId) ?? true;
              return (
                <li key={section.sectionId}>
                  <button
                    type="button"
                    onClick={() => onSelect(section)}
                    className={`flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                    } ${detailed ? '' : 'opacity-60'}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: statusHex(section.status) }}
                    />
                    <span className="flex-1 truncate">{section.sectionId}</span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {section.chainageStartKm}-{section.chainageEndKm}km
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default SectionList;
