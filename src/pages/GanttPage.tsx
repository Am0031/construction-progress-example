import { useMemo, useState } from 'react';
import SectionList from '../components/SectionList';
import GanttChart from '../components/GanttChart';
import MobileDrawer from '../components/MobileDrawer';
import sectionsData from '../data/sections.json';
import activitiesData from '../data/activities.json';
import type { Section } from '../types/section';
import type { SectionActivities } from '../types/activity';

const sections = sectionsData as Section[];
const activityGroups = activitiesData as SectionActivities[];

const activitiesBySection = new Map(activityGroups.map((g) => [g.sectionId, g]));

const DEFAULT_SECTION_ID = 'RA-013';

const GanttPage = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(DEFAULT_SECTION_ID);
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const selectedSection = useMemo(
    () => sections.find((s) => s.sectionId === selectedSectionId) ?? null,
    [selectedSectionId],
  );
  const selectedActivities = activitiesBySection.get(selectedSectionId) ?? null;

  const demoSectionIds = useMemo(() => new Set(activityGroups.map((g) => g.sectionId)), []);

  return (
    <div className="relative flex min-h-0 flex-1">
      <button
        type="button"
        onClick={() => setSectionsOpen(true)}
        className="absolute left-3 top-3 z-20 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm sm:hidden"
      >
        Section: {selectedSection?.sectionId ?? 'Select'}
      </button>

      <MobileDrawer open={sectionsOpen} onClose={() => setSectionsOpen(false)}>
        <div className="h-full w-64 shrink-0 border-r border-slate-200 bg-slate-50">
          <SectionList
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelect={(s) => {
              setSelectedSectionId(s.sectionId);
              setSectionsOpen(false);
            }}
            hasDetail={(id) => demoSectionIds.has(id)}
          />
        </div>
      </MobileDrawer>

      <div className="min-w-0 flex-1 overflow-y-auto p-6 pt-14 sm:pt-6">
        {!selectedSection ? (
          <p className="text-sm text-slate-500">Select a section from the list.</p>
        ) : !selectedActivities ? (
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-slate-900">{selectedSection.sectionId}</h2>
            <p className="mt-2 text-sm text-slate-500">
              No detailed activity breakdown is available for this section in the demo dataset.
              Try one of the highlighted sections in the list on the left (e.g.{' '}
              {[...demoSectionIds].join(', ')}).
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {selectedActivities.sectionSummary}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedSection.sectionId}{' '}
                <span className="font-normal text-slate-400">
                  &middot; P6 summary activity {selectedActivities.p6ActivityId}
                </span>
              </h2>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <span>
                  Chainage {selectedSection.chainageStartKm}&ndash;{selectedSection.chainageEndKm}km
                </span>
                <span className="capitalize">Status: {selectedSection.status}</span>
                <span>
                  Free float:{' '}
                  {selectedSection.freeFloat === 0
                    ? 'Critical path (0 days)'
                    : `${selectedSection.freeFloat} days`}
                </span>
              </div>
            </div>
            <GanttChart activities={selectedActivities.activities} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttPage;
