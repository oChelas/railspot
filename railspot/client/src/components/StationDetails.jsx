import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Bell, Navigation, Send, User, Car, Footprints, CornerUpRight, XCircle, ExternalLink } from 'lucide-react';
import RouteMap from './RouteMap';

function StationDetails({ station, onBack }) {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('info');
  const [reviews, setReviews] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // --- NAVEGAÇÃO & GPS ---
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); 
  const [travelMode, setTravelMode] = useState('driving');

  // Estados de Comentários
  const [newReview, setNewReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Utilizador Logado
  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  // --- CARREGAR DADOS ---
  useEffect(() => {
    if (station) {
      fetch(`http://localhost:5000/api/reviews/${station.id}`)
        .then(res => res.json()).then(data => setReviews(Array.isArray(data) ? data : []));
      fetch(`http://localhost:5000/api/schedules/${station.id}`)
        .then(res => res.json()).then(data => setSchedules(Array.isArray(data) ? data : []));
    }
  }, [station]);

  // --- ENVIAR COMENTÁRIO ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${station.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ content: newReview })
      });
      const savedReview = await res.json();
      if (res.ok) {
        setReviews([savedReview, ...reviews]);
        setNewReview(""); 
      }
    } catch (error) { console.error(error); } 
    finally { setSubmitting(false); }
  };

  // --- INICIAR GPS (CORRIGIDO PARA PORTÁTEIS/REDES RESTRITAS) ---
  const startNavigation = () => {
    if (!station.latitude || !station.longitude) return alert("Sem coordenadas.");

    if ("geolocation" in navigator) {
      setIsNavigating(true);
      setGpsError(null); // Limpa erros antigos

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // SUCESSO!
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsError(null);
        },
        (error) => {
          // ERRO!
          console.error("Erro GPS:", error);
          
          // CRUCIAL: Tira a app do estado de "loading infinito"
          setIsNavigating(false); 
          
          if (error.code === 1) alert("Permissão de localização negada.");
          else if (error.code === 2) alert("Sinal GPS indisponível nesta rede.");
          else if (error.code === 3) alert("O GPS demorou demasiado tempo (Timeout). A firewall da rede pode estar a bloquear o pedido.");
          else alert("Erro ao procurar sinal GPS...");
        },
        { 
          enableHighAccuracy: false, // false é mais rápido em PCs/Wifi
          timeout: 10000,            // Desiste ao fim de 10s se a rede da universidade bloquear
          maximumAge: 0 
        }
      );
    } else {
      alert("O teu browser não suporta GPS.");
    }
  };

  // --- PARAR GPS ---
  const stopNavigation = () => {
    setIsNavigating(false);
    setUserLocation(null);
    setRouteInfo(null);
    setGpsError(null);
  };

  if (!station) return null;

  return (
    <div className="h-full bg-gray-50 flex flex-col animate-fade-in overflow-hidden">
      
      {/* Botão Voltar (Só aparece se NÃO estivermos a navegar) */}
      {!isNavigating && (
        <div className="absolute top-4 left-4 z-50">
           <button onClick={onBack} className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-white text-slate-900 transition-transform hover:scale-110">
            <ArrowLeft size={24} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* --- COLUNA ESQUERDA: MAPA / LOADING / FOTO --- */}
        <div className={`relative shrink-0 transition-all duration-500 bg-gray-200 
            ${isNavigating ? 'h-[75vh] md:h-full md:w-1/2' : 'h-64 md:h-full md:w-1/2'}
        `}>
          
          {isNavigating ? (
            userLocation ? (
              /* CENÁRIO 1: TEMOS GPS -> MOSTRA MAPA */
              <div className="w-full h-full relative animate-fade-in">
                  
                  <RouteMap 
                    userLocation={userLocation} 
                    stationLocation={station} 
                    travelMode={travelMode} 
                    onRouteInfo={setRouteInfo} 
                  />
                  
                  {/* Cartão de Instruções (Topo) */}
                  {routeInfo && routeInfo.nextTurn && (
                     <div className="absolute top-4 left-4 right-16 md:right-auto md:w-80 z-[400] bg-slate-900/90 text-white backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/10">
                        <div className="flex items-start gap-3">
                           <div className="mt-1 text-green-400">
                              <CornerUpRight size={32} />
                           </div>
                           <div>
                              <p className="text-lg font-bold leading-tight">{routeInfo.nextTurn}</p>
                              {routeInfo.turnDist > 0 && (
                                  <p className="text-sm text-gray-400 mt-1">em <span className="text-white font-bold">{routeInfo.turnDist} metros</span></p>
                              )}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Painel Inferior (Tempo e Modos) */}
                  <div className="absolute bottom-6 left-4 right-4 z-[400] flex flex-col gap-3 md:left-4 md:right-auto md:w-64">
                      <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-between">
                           <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">Destino</p>
                              <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-bold text-slate-900">{routeInfo?.time || "--"}</span>
                                  <span className="text-sm font-bold text-gray-500">min</span>
                              </div>
                              <p className="text-xs text-gray-400">{routeInfo?.distance || "--"} km</p>
                           </div>
                           <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                               <button onClick={() => setTravelMode('driving')} className={`p-2 rounded-md ${travelMode==='driving'?'bg-white shadow text-blue-600':'text-gray-400'}`}><Car size={20}/></button>
                               <button onClick={() => setTravelMode('walking')} className={`p-2 rounded-md ${travelMode==='walking'?'bg-white shadow text-green-600':'text-gray-400'}`}><Footprints size={20}/></button>
                           </div>
                      </div>
                  </div>

                  {/* Botão Fechar Navegação */}
                  <button 
                    onClick={stopNavigation}
                    className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-full shadow-xl text-red-500 hover:bg-red-50"
                  >
                    <XCircle size={24} />
                  </button>
              </div>
            ) : (
              /* CENÁRIO 2: À PROCURA DE GPS -> MOSTRA LOADING */
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in z-50">
                  <div className="animate-spin mb-6 text-blue-500">
                    <Navigation size={64} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">A procurar sinal GPS...</h3>
                  <p className="text-gray-400 max-w-xs mb-6">Estamos a localizar a tua posição para traçar a rota até {station.name}.</p>
                  
                  {gpsError && (
                    <div className="mb-6 bg-red-500/20 text-red-200 p-3 rounded-lg text-sm border border-red-500/50 flex items-center gap-2">
                      <XCircle size={16} /> {gpsError}
                    </div>
                  )}

                  <button 
                    onClick={stopNavigation} 
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-medium transition-colors border border-white/10"
                  >
                    Cancelar
                  </button>
              </div>
            )
          ) : (
            /* CENÁRIO 3: MODO NORMAL -> MOSTRA FOTO */
            <>
              <img src={station.image_url} alt={station.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 bg-black/40 text-white/90 text-[10px] px-3 py-1 rounded-full backdrop-blur-md">
                  Foto: RailSpot DB
              </div>
            </>
          )}
        </div>

        {/* --- COLUNA DIREITA: INFO --- */}
        <div className="flex-1 bg-white md:w-1/2 flex flex-col relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{station.name}</h2>
                <div className="flex items-center text-gray-500 text-sm mb-6 font-medium">
                    <MapPin size={18} className="mr-2 text-blue-600" />
                    <span>Portugal</span>
                </div>

                {/* Se estiver a navegar, mostramos opção Google Maps. Se não, botões normais */}
                {isNavigating ? (
                     <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
                        <p className="text-sm text-blue-800 mb-3 font-medium">Preferes a app oficial?</p>
                        <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=$${station.latitude},${station.longitude}`, '_blank')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <ExternalLink size={18} /> Abrir Google Maps
                        </button>
                     </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={startNavigation}
                            className="bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform hover:bg-slate-800"
                        >
                            <Navigation size={20} /> Navegar
                        </button>
                        <button className="bg-white border-2 border-slate-100 text-slate-600 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                            <Bell size={20} /> Alerta
                        </button>
                    </div>
                )}

                {/* Abas */}
                <div className="flex border-b border-gray-100 mb-6 relative">
                    <button onClick={() => setActiveTab('info')} className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab==='info'?'text-blue-600 border-b-2 border-blue-600':'text-gray-400 hover:text-slate-600'}`}>INFO</button>
                    <button onClick={() => setActiveTab('schedules')} className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab==='schedules'?'text-blue-600 border-b-2 border-blue-600':'text-gray-400 hover:text-slate-600'}`}>HORÁRIOS</button>
                </div>

                {/* Conteúdo das Abas */}
                {activeTab === 'info' && (
                    <div className="animate-fade-in">
                        <p className="text-gray-600 mb-8 leading-relaxed">{station.description}</p>
                        
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">💬 Comentários <span className="text-gray-400 text-sm font-normal">({reviews.length})</span></h3>
                             {user ? (
                                <form onSubmit={handleSubmitReview} className="flex gap-2 mb-4">
                                    <input 
                                        value={newReview} 
                                        onChange={(e)=>setNewReview(e.target.value)} 
                                        className="flex-1 p-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                                        placeholder="Escreve algo..." 
                                    />
                                    <button 
                                        disabled={submitting} 
                                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Send size={18}/>
                                    </button>
                                </form>
                            ) : <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg text-center border border-blue-100">Faz login para participar na conversa.</p>}
                            
                            <div className="space-y-3">
                                {reviews.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Sê o primeiro a comentar!</p>}
                                {reviews.map(r => (
                                    <div key={r.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                {r.user_name ? r.user_name[0].toUpperCase() : 'U'}
                                            </div>
                                            <span className="font-bold text-xs text-slate-800">{r.user_name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 pl-8">{r.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'schedules' && (
                     <div className="space-y-3 animate-fade-in">
                        {schedules.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                <p>Sem partidas previstas.</p>
                            </div>
                        ) : (
                            schedules.map(s => (
                                <div key={s.id} className="flex justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-bold text-slate-800">{s.destination}</p>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{s.train_type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-slate-900">{s.departure_time.slice(0,5)}</p>
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">A horas</span>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default StationDetails;