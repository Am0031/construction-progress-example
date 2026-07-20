import { useState } from 'react';
import RiskMatrix from '../components/RiskMatrix';
import RiskTable from '../components/RiskTable';
import RiskPanel from '../components/RiskPanel';
import risksData from '../data/risks.json';
import type { Risk } from '../types/risk';

const risks = risksData as Risk[];

const RiskRegisterPage = () => {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const openCount = risks.filter((r) => r.status === 'open').length;
  const mitigatingCount = risks.filter((r) => r.status === 'mitigating').length;

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Risk Register</h1>
            <p className="text-sm text-slate-500">
              {openCount} open, {mitigatingCount} being mitigated, {risks.length} total.
            </p>
          </div>

          <RiskMatrix risks={risks} onSelectRisk={setSelectedRisk} />
          <RiskTable risks={risks} selectedRiskId={selectedRisk?.riskId ?? null} onSelectRisk={setSelectedRisk} />
        </div>
      </div>

      {selectedRisk && <RiskPanel risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </div>
  );
};

export default RiskRegisterPage;
