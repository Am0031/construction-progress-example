import { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import type { PickingInfo } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { PowerStation } from '../types/station';
import { statusColorRGB } from '../lib/statusColors';
import { computeInitialViewState } from '../lib/viewport';
import Legend from './Legend';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface PowerStationsMapProps {
  stations: PowerStation[];
  selectedStationId: string | null;
  onSelectStation: (station: PowerStation) => void;
}

const PowerStationsMap = ({ stations, selectedStationId, onSelectStation }: PowerStationsMapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const initialViewState = useMemo(
    () => computeInitialViewState(stations.map((s) => s.coord)),
    [stations],
  );

  const layers = [
    new ScatterplotLayer<PowerStation>({
      id: 'power-stations',
      data: stations,
      getPosition: (d) => d.coord,
      getFillColor: (d) => statusColorRGB(d.status),
      getLineColor: [255, 255, 255],
      getRadius: (d) =>
        d.stationId === selectedStationId ? 900 : d.stationId === hoveredId ? 750 : 600,
      lineWidthMinPixels: 2,
      stroked: true,
      radiusUnits: 'meters',
      radiusMinPixels: 6,
      radiusMaxPixels: 24,
      pickable: true,
      updateTriggers: {
        getRadius: [selectedStationId, hoveredId],
      },
      onClick: (info: PickingInfo<PowerStation>) => {
        if (info.object) onSelectStation(info.object);
      },
      onHover: (info: PickingInfo<PowerStation>) => {
        setHoveredId(info.object ? info.object.stationId : null);
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

export default PowerStationsMap;
