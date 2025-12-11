import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Location } from '../../data/locations';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface WorldMapProps {
    locations: Location[];
    onSelect: (loc: Location) => void;
    selectedId?: string;
}

const MUMBAI_BOUNDS: [number, number][] = [
    [18.89, 72.77], // Southwest
    [19.27, 73.00], // Northeast
];

function MapController({ onMapClick }: { onMapClick: (e: any) => void }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e);
        },
    });
    return null;
}

export default function WorldMap({ locations, onSelect, selectedId }: WorldMapProps) {
    const handleMapClick = (e: any) => {
        // Reverse geocode or just pass coords. 
        // For professional feel, we'll try to find nearest location or create a new temporary one.
        onSelect({
            id: `temp-${Date.now()}`,
            name: "Selected Location",
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            description: "Custom Selection"
        });
    };

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 relative font-sans group">
            <MapContainer
                center={[19.0760, 72.8777]}
                zoom={11}
                minZoom={10}
                maxBounds={MUMBAI_BOUNDS}
                scrollWheelZoom={true}
                className="h-full w-full bg-[#cbd5e1] z-0"
            >
                <MapController onMapClick={handleMapClick} />
                {/* Using CartoDB Positron for light theme */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {locations.map(loc => (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => onSelect(loc),
                        }}
                    >
                        <Popup className="text-black font-medium">
                            <div className="font-bold text-base">{loc.name}</div>
                            <div className="text-sm opacity-80">{loc.description}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Glassmorphic Sidebar */}
            <div className="absolute top-4 left-4 z-[400] bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-black/5 max-h-[calc(100vh-2rem)] overflow-y-auto w-72 shadow-xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">🇮🇳 Mumbai Kahaani</h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Voices of the City</p>
                </div>

                <div className="space-y-2">
                    {locations.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => onSelect(loc)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-300 group
                  ${selectedId === loc.id
                                    ? 'bg-blue-600 shadow-md text-white'
                                    : 'hover:bg-black/5 border border-transparent'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className={`font-semibold transition-colors ${selectedId === loc.id ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                    {loc.name}
                                </div>
                                {selectedId === loc.id && <span className="text-xs text-blue-200">●</span>}
                            </div>
                            <div className={`text-xs mt-1 ${selectedId === loc.id ? 'text-blue-100' : 'text-slate-500'}`}>{loc.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-[400] bg-white/60 backdrop-blur px-3 py-1 rounded-full text-xs text-slate-500 border border-black/5">
                11.x Hackathon Build
            </div>
        </div>
    );
}
