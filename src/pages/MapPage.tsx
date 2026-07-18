import { useState } from 'react';
import ProgressMap from '../components/ProgressMap';
import SectionPanel from '../components/SectionPanel';
import PowerStationsMap from '../components/PowerStationsMap';
import StationPanel from '../components/StationPanel';
import PlanningZonesMap from '../components/PlanningZonesMap';
import ZonePanel from '../components/ZonePanel';
import LayerSidebar, { type MapLayerId } from '../components/LayerSidebar';
import sectionsData from '../data/sections.json';
import powerStationsData from '../data/powerStations.json';
import planningZonesData from '../data/planningZones.json';
import type { Section } from '../types/section';
import type { PowerStation } from '../types/station';
import type { PlanningZone } from '../types/zone';

const sections = sectionsData as Section[];
const powerStations = powerStationsData as unknown as PowerStation[];
const planningZones = planningZonesData as PlanningZone[];

const MapPage = () => {
  const [activeLayer, setActiveLayer] = useState<MapLayerId>('cable-network');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedStation, setSelectedStation] = useState<PowerStation | null>(null);
  const [selectedZone, setSelectedZone] = useState<PlanningZone | null>(null);

  function handleLayerChange(layer: MapLayerId) {
    setActiveLayer(layer);
    setSelectedSection(null);
    setSelectedStation(null);
    setSelectedZone(null);
  }

  return (
    <div className="flex min-h-0 flex-1">
      <LayerSidebar activeLayer={activeLayer} onChange={handleLayerChange} />

      <div className="min-w-0 flex-1">
        {activeLayer === 'cable-network' && (
          <ProgressMap
            sections={sections}
            selectedSectionId={selectedSection?.sectionId ?? null}
            onSelectSection={setSelectedSection}
          />
        )}
        {activeLayer === 'power-stations' && (
          <PowerStationsMap
            stations={powerStations}
            selectedStationId={selectedStation?.stationId ?? null}
            onSelectStation={setSelectedStation}
          />
        )}
        {activeLayer === 'planning-zones' && (
          <PlanningZonesMap
            zones={planningZones}
            selectedZoneId={selectedZone?.zoneId ?? null}
            onSelectZone={setSelectedZone}
          />
        )}
      </div>

      {activeLayer === 'cable-network' && selectedSection && (
        <SectionPanel
          section={selectedSection}
          allSections={sections}
          onClose={() => setSelectedSection(null)}
        />
      )}
      {activeLayer === 'power-stations' && selectedStation && (
        <StationPanel station={selectedStation} onClose={() => setSelectedStation(null)} />
      )}
      {activeLayer === 'planning-zones' && selectedZone && (
        <ZonePanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
};

export default MapPage;
