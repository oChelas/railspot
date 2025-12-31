import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

// --- ÍCONES ---
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const stationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente que controla a câmara e a rota
function Routing({ userLocation, stationLocation, travelMode, onRouteFound }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  // --- EFEITO DE AUTO-FOLLOW ---
  useEffect(() => {
    if (map && userLocation) {
      map.flyTo(
        [userLocation.latitude, userLocation.longitude], 
        18, 
        { animate: true, duration: 1.5 }
      );
    }
  }, [map, userLocation]);

  // --- CÁLCULO DA ROTA ---
  useEffect(() => {
    if (!map) return;

    const userLat = Number(userLocation.latitude);
    const userLng = Number(userLocation.longitude);
    const stationLat = Number(stationLocation.latitude);
    const stationLng = Number(stationLocation.longitude);

    // Limpar rota anterior
    if (routingControlRef.current) {
      try { 
        map.removeControl(routingControlRef.current); 
      } catch { 
        // Ignorar erro se o controlo já não existir
      }
    }

    const profile = travelMode === 'walking' ? 'foot' : 'driving';

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(stationLat, stationLng)
      ],
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1`,
        profile: profile
      }),
      routeWhileDragging: false,
      language: 'pt',
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false, 
      lineOptions: {
        styles: [{ 
            color: travelMode === 'walking' ? '#10b981' : '#3b82f6', 
            opacity: 0.8, 
            weight: 8 
        }]
      },
      createMarker: function(i, waypoint) {
        return L.marker(waypoint.latLng, {
          icon: i === 0 ? userIcon : stationIcon
        });
      }
    }).addTo(map);

    routingControlRef.current = routingControl;

    // --- ESCONDER A CAIXA BRANCA (CSS via JS) ---
    const container = document.querySelector('.leaflet-routing-container');
    if (container) container.style.display = 'none';

    // --- PROCESSAR A ROTA ---
    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      
      let nextTurnText = "Siga a rota";
      let nextTurnDist = 0;

      if (routes[0].instructions && routes[0].instructions.length > 0) {
         const step = routes[0].instructions.find(i => i.distance > 10) || routes[0].instructions[0];
         nextTurnText = step.text;
         nextTurnDist = step.distance;
      }

      if (onRouteFound) {
        onRouteFound({
          distance: (summary.totalDistance / 1000).toFixed(1),
          time: Math.round(summary.totalTime / 60),
          nextTurn: nextTurnText,
          turnDist: Math.round(nextTurnDist),
          error: false
        });
      }
    });

    routingControl.on('routingerror', function(e) {
      console.error("Erro OSRM:", e);
      if (onRouteFound) onRouteFound({ distance: "--", time: "--", error: true });
    });

    return () => {
      if (routingControlRef.current && map) {
        try { 
            // AQUI ESTAVA O PROBLEMA: Adicionei o comentário para ele não reclamar do vazio
            map.removeControl(routingControlRef.current); 
        } catch {
            // Ignorar erro ao desmontar
        }
      }
    };
  }, [map, userLocation, stationLocation, travelMode, onRouteFound]);

  return null;
}

function RouteMap({ userLocation, stationLocation, travelMode, onRouteInfo }) {
  const startLat = Number(userLocation.latitude) || 39.5;
  const startLng = Number(userLocation.longitude) || -8.0;

  return (
    <MapContainer 
        center={[startLat, startLng]} 
        zoom={18} 
        className="w-full h-full z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='© OpenStreetMap & CartoDB'
      />
      <Routing 
        userLocation={userLocation} 
        stationLocation={stationLocation} 
        travelMode={travelMode} 
        onRouteFound={onRouteInfo} 
      />
    </MapContainer>
  );
}

export default RouteMap;