import { WebMercatorViewport } from '@deck.gl/core';

export function computeInitialViewState(coords: [number, number][]) {
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];

  const viewport = new WebMercatorViewport({ width: 800, height: 600 }).fitBounds(bounds, {
    padding: 60,
  });

  return {
    longitude: viewport.longitude,
    latitude: viewport.latitude,
    zoom: viewport.zoom,
    pitch: 0,
    bearing: 0,
  };
}
