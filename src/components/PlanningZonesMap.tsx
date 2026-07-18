import { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { PolygonLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import type { PickingInfo } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { PlanningZone } from '../types/zone';
import { statusColorRGB } from '../lib/statusColors';
import { computeInitialViewState } from '../lib/viewport';
import Legend from './Legend';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface PlanningZonesMapProps {
  zones: PlanningZone[];
  selectedZoneId: string | null;
  onSelectZone: (zone: PlanningZone) => void;
}

const PlanningZonesMap = ({ zones, selectedZoneId, onSelectZone }: PlanningZonesMapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const initialViewState = useMemo(
    () => computeInitialViewState(zones.flatMap((z) => z.polygon)),
    [zones],
  );

  const layers = [
    new PolygonLayer<PlanningZone>({
      id: 'planning-zones',
      data: zones,
      getPolygon: (d) => d.polygon,
      getFillColor: (d) => {
        const [r, g, b] = statusColorRGB(d.status);
        const isActive = d.zoneId === selectedZoneId || d.zoneId === hoveredId;
        return [r, g, b, isActive ? 140 : 90];
      },
      getLineColor: (d) => statusColorRGB(d.status),
      getLineWidth: (d) => (d.zoneId === selectedZoneId ? 4 : 2),
      lineWidthUnits: 'pixels',
      stroked: true,
      filled: true,
      pickable: true,
      updateTriggers: {
        getFillColor: [selectedZoneId, hoveredId],
        getLineWidth: [selectedZoneId],
      },
      onClick: (info: PickingInfo<PlanningZone>) => {
        if (info.object) onSelectZone(info.object);
      },
      onHover: (info: PickingInfo<PlanningZone>) => {
        setHoveredId(info.object ? info.object.zoneId : null);
      },
    }),
  ];

  return (
    <div className="relative h-full w-full">
      <DeckGL
        initialViewState={initialViewState}
        controller
        layers={layers}
        getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'grab')}
      >
        <Map mapStyle={BASEMAP_STYLE} reuseMaps />
      </DeckGL>
      <Legend />
    </div>
  );
};

export default PlanningZonesMap;
