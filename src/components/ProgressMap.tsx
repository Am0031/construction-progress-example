import { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import type { PickingInfo } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Section } from '../types/section';
import { statusColorRGB } from '../lib/statusColors';
import { computeInitialViewState } from '../lib/viewport';
import Legend from './Legend';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface ProgressMapProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (section: Section) => void;
}

const ProgressMap = ({ sections, selectedSectionId, onSelectSection }: ProgressMapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const initialViewState = useMemo(
    () => computeInitialViewState(sections.flatMap((s) => [s.startCoord, s.endCoord])),
    [sections],
  );

  const layers = [
    new PathLayer<Section>({
      id: 'route-sections',
      data: sections,
      getPath: (d) => [d.startCoord, d.endCoord],
      getColor: (d) => statusColorRGB(d.status),
      getWidth: (d) => (d.sectionId === selectedSectionId ? 9 : d.sectionId === hoveredId ? 7 : 5),
      widthUnits: 'pixels',
      capRounded: true,
      jointRounded: true,
      pickable: true,
      autoHighlight: false,
      updateTriggers: {
        getWidth: [selectedSectionId, hoveredId],
      },
      onClick: (info: PickingInfo<Section>) => {
        if (info.object) onSelectSection(info.object);
      },
      onHover: (info: PickingInfo<Section>) => {
        setHoveredId(info.object ? info.object.sectionId : null);
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

export default ProgressMap;
