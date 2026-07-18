import { useMemo } from 'react';
import ResourceTimeline from '../components/ResourceTimeline';
import { computeResourceAssignments, countConflictedResources } from '../lib/resourceMetrics';

const ResourcesPage = () => {
  const assignmentsByResource = useMemo(() => computeResourceAssignments(), []);
  const conflictedCount = useMemo(
    () => countConflictedResources(assignmentsByResource),
    [assignmentsByResource],
  );

  return (
    <div className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Resource Utilisation</h1>
          <p className="text-sm text-slate-500">
            Crew deployment across all sections, derived from each section's planned dates and
            on-site resources.
          </p>
        </div>

        {conflictedCount > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span className="font-medium">{conflictedCount}</span>{' '}
            {conflictedCount === 1 ? 'crew has' : 'crews have'} overlapping demand across two or
            more sections at the same time — see the highlighted bars below.
          </div>
        )}

        <ResourceTimeline assignmentsByResource={assignmentsByResource} />
      </div>
    </div>
  );
};

export default ResourcesPage;
