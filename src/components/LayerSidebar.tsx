export const MAP_LAYERS = [
  {
    id: 'cable-network',
    label: 'Cable Network',
    description: 'Route sections colored by construction status',
  },
  {
    id: 'power-stations',
    label: 'Power Stations',
    description: 'Substations & switching stations colored by status',
  },
  {
    id: 'planning-zones',
    label: 'Planning Zones',
    description: 'Wayleave/consent status by local authority area',
  },
] as const;

export type MapLayerId = (typeof MAP_LAYERS)[number]['id'];

interface LayerSidebarProps {
  activeLayer: MapLayerId;
  onChange: (layer: MapLayerId) => void;
}

const LayerSidebar = ({ activeLayer, onChange }: LayerSidebarProps) => {
  return (
    <nav className="w-56 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Map view
      </p>
      <ul className="space-y-1">
        {MAP_LAYERS.map((layer) => {
          const isActive = layer.id === activeLayer;
          return (
            <li key={layer.id}>
              <button
                type="button"
                onClick={() => onChange(layer.id)}
                className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="block text-sm font-medium">{layer.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{layer.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LayerSidebar;
