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
        onSelect({
            id: `temp-${Date.now()}`,
            name: "New Location",
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            description: "Custom Point"
        });
    };

    return (
        <div className="h-full w-full overflow-hidden relative font-sans group">
            <MapContainer
                center={[19.0760, 72.8777]}
                zoom={13}
                minZoom={12}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <MapController onMapClick={handleMapClick} />
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {locations.map(loc => (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        icon={customIcon}
                        eventHandlers={{ click: () => onSelect(loc) }}
                    >
                        <Popup className="text-slate-800 font-sans">
                            <div className="font-bold text-lg">{loc.name}</div>
                            <div className="text-base text-slate-600">{loc.description}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Premium Glass Sidebar */}
            <div className="absolute top-6 left-6 z-[400] glass-panel p-6 rounded-3xl h-auto max-h-[85vh] overflow-y-auto w-[440px] shadow-2xl ring-1 ring-black/5 transition-all">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        Mumbai Kahaani
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide uppercase">
                        Interactive Storytelling Map
                    </p>
                </div>

                <div className="space-y-3">
                    {locations.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => onSelect(loc)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 group border text-base relative overflow-hidden
                  ${selectedId === loc.id
                                    ? 'bg-blue-600 border-blue-500 shadow-blue-500/30 shadow-lg text-white'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-700'}`}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-1">
                                    <div className={`font-bold text-lg ${selectedId === loc.id ? 'text-white' : 'text-slate-800'}`}>
                                        {loc.name}
                                    </div>
                                </div>
                                <div className={`text-sm leading-relaxed ${selectedId === loc.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {loc.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-6 right-6 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-slate-500 shadow-lg border border-white/50">
                Map Narrator v1.0
            </div>
        </div>
    );
}
