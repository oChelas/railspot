import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowRight } from 'lucide-react';

// Correção dos ícones do Leaflet (para não aparecerem quebrados)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function StationMap({ stations, onStationSelect }) {
  // Centro aproximado de Portugal
  const center = [39.557, -7.853]; 

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0">
      <MapContainer 
        center={center} 
        zoom={7} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          // --- CORREÇÃO AQUI ---
          // Agora lemos latitude e longitude diretamente
          // Usamos Number() para garantir que são números e não texto
          const lat = Number(station.latitude);
          const lng = Number(station.longitude);

          // Se as coordenadas não existirem ou forem inválidas, não desenha o pino
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={station.id} position={[lat, lng]}>
              <Popup className="custom-popup">
                <div className="p-1 text-center">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{station.name}</h3>
                  <button 
                    onClick={() => onStationSelect(station)}
                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 mx-auto hover:bg-blue-700 transition-colors"
                  >
                    Ver Detalhes <ArrowRight size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default StationMap;