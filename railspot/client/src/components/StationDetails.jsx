import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bell, Navigation, Send, Car, Footprints,
  CornerUpRight, CircleX, ExternalLink, Edit, Trash2, CircleCheck,
  Info, TriangleAlert, X, Plus
} from 'lucide-react';
import RouteMap from './RouteMap';

// --- MATEMATICA LBS ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function StationDetails({ station, onBack }) {
  const navigate = useNavigate();

  // --- ESTADOS GERAIS ---
  const [activeTab, setActiveTab] = useState('info');
  const [reviews, setReviews] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [occurrences, setOccurrences] = useState([]);

  // --- ESTADOS DE MAPAS / GPS ---
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('driving');

  const [isAlertActive, setIsAlertActive] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // --- ESTADOS DE FORMULARIOS ---
  const [newReview, setNewReview] = useState("");
  const [newOccurrence, setNewOccurrence] = useState("");
  const [newSchedule, setNewSchedule] = useState({ train_type: 'Urbano', destination: '', departure_time: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- INTERFACE (TOASTS E DIALOGS) ---
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: null });
  
  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  const openDialog = (title, message, type, onConfirm) => {
    setDialog({ isOpen: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  // --- VARIAVEL DE CONTROLO PARA O ESLINT ---
  const stationId = station?.id;

  // --- FUNCOES DE CARREGAMENTO ---
  const fetchOccurrences = useCallback(async () => {
    if (!stationId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/occurrences/${stationId}`);
      const data = await res.json();
      setOccurrences(Array.isArray(data) ? data : []);
    } catch {
      console.error("Erro ao carregar ocorrências.");
    }
  }, [stationId]);

  const fetchSchedules = useCallback(async () => {
    if (!stationId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/schedules/${stationId}`);
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch {
      console.error("Erro ao carregar horários.");
    }
  }, [stationId]);

  // Carregamento inicial da Estacao
  useEffect(() => {
    if (stationId) {
      fetch(`http://localhost:5000/api/reviews/${stationId}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data) ? data : []))
        .catch(() => console.error("Erro ao carregar avaliações."));

      fetchSchedules();
      fetchOccurrences();
    }
  }, [stationId, fetchSchedules, fetchOccurrences]);

  // Limpeza do GPS
  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  // --- FUNCOES DE REVIEWS ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${stationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ content: newReview })
      });
      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setNewReview("");
        showToast("Comentário adicionado!", "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Erro ao adicionar comentário.", "error");
      }
    } catch {
      showToast("Erro de ligação.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    openDialog("Apagar Comentário", "Tens a certeza que queres eliminar este comentário? Esta ação é irreversível.", "danger", async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          setReviews(reviews.filter(r => r.id !== reviewId));
          showToast("Comentário apagado.", "info");
        } else {
          showToast("Erro ao apagar.", "error");
        }
      } catch {
        showToast("Erro no servidor.", "error");
      }
    });
  };

  // --- FUNCOES DA ESTACAO ---
  const handleDeleteStation = () => {
    openDialog("Eliminar Estação", `Tens a certeza absoluta que pretendes eliminar a ${station.name}? Todos os dados, horários e ocorrências serão apagados.`, "danger", async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/stations/${stationId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          showToast('Estação eliminada com sucesso!', 'success');
          setTimeout(() => {
            onBack();
            window.location.reload();
          }, 1500);
        } else {
          showToast('Erro ao apagar estação.', 'error');
        }
      } catch {
        showToast('Erro no servidor.', 'error');
      }
    });
  };

  // --- FUNCOES DE OCORRENCIAS ---
  const handleReportOccurrence = async (e) => {
    e.preventDefault();
    if (!newOccurrence.trim()) return showToast("A descrição não pode estar vazia.", "warning");
    if (!("geolocation" in navigator)) return showToast("O teu browser não suporta GPS.", "error");

    setSubmitting(true);
    showToast("A capturar a tua localização GPS exata...", "info");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`http://localhost:5000/api/occurrences/${stationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ description: newOccurrence, latitude, longitude })
          });
          if (res.ok) {
            showToast("Ocorrência enviada com sucesso!", "success");
            setNewOccurrence("");
            fetchOccurrences();
          } else {
            const errorData = await res.json().catch(() => ({}));
            showToast(errorData.error || "Erro ao reportar ocorrência.", "error");
          }
        } catch {
          showToast("Erro de conexão.", "error");
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        showToast("Erro ao ler GPS. Verifica permissões.", "error");
        setSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDeleteOccurrence = (occId) => {
    openDialog("Resolver Ocorrência", "Queres marcar esta ocorrência como resolvida? Ela será removida da lista pública.", "success", async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/occurrences/${occId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          setOccurrences(occurrences.filter(o => o.id !== occId));
          showToast("Ocorrência marcada como resolvida.", "success");
        } else {
          showToast("Erro ao resolver ocorrência.", "error");
        }
      } catch {
        showToast("Erro no servidor.", "error");
      }
    });
  };

  // --- FUNCOES DE HORARIOS ---
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.destination || !newSchedule.departure_time) {
      return showToast("Preenche todos os campos.", "warning");
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/schedules/${stationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          departureTime: newSchedule.departure_time,
          destination: newSchedule.destination,
          trainType: newSchedule.train_type
        })
      });
      
      if (res.ok) {
        showToast("Horário adicionado!", "success");
        setNewSchedule({ train_type: 'Urbano', destination: '', departure_time: '' });
        fetchSchedules();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Erro ao adicionar horário.", "error");
      }
    } catch {
      showToast("Erro de conexão.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = (id) => {
    openDialog("Apagar Horário", "Tens a certeza que pretendes apagar este horário da tabela?", "danger", async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/schedules/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          setSchedules(schedules.filter(s => s.id !== id));
          showToast("Horário apagado.", "info");
        } else {
          showToast("Erro ao apagar horário.", "error");
        }
      } catch {
        showToast("Erro no servidor.", "error");
      }
    });
  };

  // --- LOGICA DE MAPAS ---
  const toggleAlert = () => {
    if (isAlertActive) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsAlertActive(false);
      setWatchId(null);
      showToast("Radar desativado.", "info");
    } else {
      if (!station.latitude || !station.longitude) return showToast("Sem coordenadas da estação.", "error");
      if (!("geolocation" in navigator)) return showToast("Browser sem suporte a GPS.", "error");

      showToast("📡 Radar ativado! Receberás um aviso a menos de 500m.", "success");
      setIsAlertActive(true);

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            station.latitude,
            station.longitude
          );
          if (distance <= 0.5) {
            showToast(`📍 GEOFENCE ATINGIDO: Chegaste à zona da ${station.name}!`, "success");
            navigator.geolocation.clearWatch(id);
            setIsAlertActive(false);
            setWatchId(null);
          }
        },
        () => {
          showToast("Sinal GPS perdido.", "error");
          setIsAlertActive(false);
          navigator.geolocation.clearWatch(id);
          setWatchId(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      setWatchId(id);
    }
  };

  const startNavigation = () => {
    if (!station.latitude || !station.longitude) return showToast("Sem coordenadas.", "error");
    if ("geolocation" in navigator) {
      setIsNavigating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {
          setIsNavigating(false);
          showToast("Erro a ler GPS. Verifica as permissões.", "error");
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    } else {
      showToast("Sem suporte para GPS no teu navegador.", "error");
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setUserLocation(null);
    setRouteInfo(null);
  };

  if (!station) return null;

  return (
    <div className="h-full bg-gray-50 flex flex-col animate-fade-in overflow-hidden relative">
      
      {/* CUSTOM CONFIRM DIALOG */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-slide-up border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${dialog.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {dialog.type === 'danger' ? <TriangleAlert size={24} /> : <CircleCheck size={24} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{dialog.title}</h3>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-sm">{dialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeDialog} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                Cancelar
              </button>
              <button
                onClick={() => { dialog.onConfirm(); closeDialog(); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-white transition-transform active:scale-95 text-sm shadow-md ${
                  dialog.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACOES (TOASTS) */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[5000] w-11/12 max-w-md flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-fade-in font-medium backdrop-blur-md bg-opacity-95
          ${toast.type === 'success' ? 'bg-green-600 text-white' : ''} 
          ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
          ${toast.type === 'info' ? 'bg-slate-900 text-white' : ''} 
          ${toast.type === 'warning' ? 'bg-yellow-500 text-slate-900' : ''}
        `}>
          <div className="shrink-0">
            {toast.type === 'success' && <CircleCheck size={24} />}
            {toast.type === 'error' && <CircleX size={24} />}
            {toast.type === 'info' && <Info size={24} />}
            {toast.type === 'warning' && <TriangleAlert size={24} />}
          </div>
          <span className="flex-1 text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* BOTAO VOLTAR */}
      {!isNavigating && (
        <div className="absolute top-4 left-4 z-50">
           <button onClick={onBack} className="bg-white/90 p-3 rounded-full shadow-lg hover:bg-white text-slate-900 transition-transform hover:scale-110">
            <ArrowLeft size={24} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* LADO ESQUERDO: MAPA OU IMAGEM */}
        <div className={`relative shrink-0 transition-all duration-500 bg-gray-200 ${isNavigating ? 'h-[75vh] md:h-full md:w-1/2' : 'h-64 md:h-full md:w-1/2'}`}>
          {isNavigating ? (
            userLocation ? (
              <div className="w-full h-full relative animate-fade-in">
                  <RouteMap userLocation={userLocation} stationLocation={station} travelMode={travelMode} onRouteInfo={setRouteInfo} />
                  
                  {routeInfo && routeInfo.nextTurn && (
                     <div className="absolute top-4 left-4 right-16 md:right-auto md:w-80 z-[400] bg-slate-900/90 text-white backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/10">
                        <div className="flex items-start gap-3">
                           <div className="mt-1 text-green-400"><CornerUpRight size={32} /></div>
                           <div>
                              <p className="text-lg font-bold leading-tight">{routeInfo.nextTurn}</p>
                              {routeInfo.turnDist > 0 && <p className="text-sm text-gray-400 mt-1">em <span className="text-white font-bold">{routeInfo.turnDist} metros</span></p>}
                           </div>
                        </div>
                     </div>
                  )}

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
                               <button onClick={() => setTravelMode('driving')} className={`p-2 rounded-md ${travelMode === 'driving' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}><Car size={20}/></button>
                               <button onClick={() => setTravelMode('walking')} className={`p-2 rounded-md ${travelMode === 'walking' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}><Footprints size={20}/></button>
                           </div>
                      </div>
                  </div>
                  <button onClick={stopNavigation} className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-full shadow-xl text-red-500 hover:bg-red-50">
                    <CircleX size={24} />
                  </button>
              </div>
            ) : (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in z-50">
                  <div className="animate-spin mb-6 text-blue-500"><Navigation size={64} /></div>
                  <h3 className="text-2xl font-bold mb-2">A procurar sinal GPS...</h3>
                  <button onClick={stopNavigation} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-sm font-medium transition-colors border border-white/10 mt-4">Cancelar</button>
              </div>
            )
          ) : (
            <>
              <img src={station.image_url} alt={station.name} className="w-full h-full object-cover" />
              {user && user.is_admin && (
                  <div className="absolute top-4 right-4 z-[400] flex gap-2">
                    <button onClick={() => navigate(`/admin/edit/${stationId}`)} className="bg-blue-600 p-3 rounded-full shadow-xl text-white hover:bg-blue-700 transition-transform hover:scale-110" title="Editar">
                      <Edit size={24} />
                    </button>
                    <button onClick={handleDeleteStation} className="bg-red-600 p-3 rounded-full shadow-xl text-white hover:bg-red-700 transition-transform hover:scale-110" title="Eliminar">
                      <Trash2 size={24} />
                    </button>
                  </div>
              )}
            </>
          )}
        </div>

        {/* LADO DIREITO: INFORMACAO E ABAS */}
        <div className="flex-1 bg-white md:w-1/2 flex flex-col relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{station.name}</h2>
                <div className="flex items-center text-gray-500 text-sm mb-6 font-medium">
                  <MapPin size={18} className="mr-2 text-blue-600" />
                  <span>Portugal</span>
                </div>

                {/* BOTOES DE NAVEGACAO SUPERIORES */}
                {isNavigating ? (
                    <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
                        <p className="text-sm text-blue-800 mb-3 font-medium">Preferes a app oficial?</p>
                        <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=$$${station.latitude},${station.longitude}`, '_blank')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <ExternalLink size={18} /> Abrir Google Maps
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={startNavigation} className="bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform hover:bg-slate-800">
                            <Navigation size={20} /> Navegar
                        </button>
                        <button onClick={toggleAlert} className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors border-2 shadow-sm ${isAlertActive ? 'bg-yellow-50 border-yellow-400 text-yellow-700 animate-pulse' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                            <Bell size={20} className={isAlertActive ? 'text-yellow-600' : ''} /> {isAlertActive ? 'A Rastrear...' : 'Alerta'}
                        </button>
                    </div>
                )}

                {/* BARRA DE ABAS */}
                <div className="flex border-b border-gray-100 mb-6 relative overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('info')} className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-slate-600'}`}>INFO</button>
                    <button onClick={() => setActiveTab('schedules')} className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'schedules' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-slate-600'}`}>HORÁRIOS</button>
                    <button onClick={() => setActiveTab('occurrences')} className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'occurrences' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-slate-600'}`}>
                      <TriangleAlert size={16}/> OCORRÊNCIAS
                    </button>
                </div>

                {/* ABA: INFO E COMENTARIOS */}
                {activeTab === 'info' && (
                    <div className="animate-fade-in">
                        <p className="text-gray-600 mb-8 leading-relaxed">{station.description}</p>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">💬 Comentários <span className="text-gray-400 text-sm font-normal">({reviews.length})</span></h3>
                             {user ? (
                                <form onSubmit={handleSubmitReview} className="flex gap-2 mb-4">
                                    <input value={newReview} onChange={(e) => setNewReview(e.target.value)} className="flex-1 p-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="Escreve algo..." />
                                    <button type="submit" disabled={submitting} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                      <Send size={18}/>
                                    </button>
                                </form>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg text-center border border-blue-100">Faz login para participar na conversa.</p>
                            )}
                            
                            <div className="space-y-3">
                                {reviews.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Sê o primeiro a comentar!</p>}
                                {reviews.map(r => (
                                    <div key={r.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                {r.user_name ? r.user_name[0].toUpperCase() : 'U'}
                                              </div>
                                              <span className="font-bold text-xs text-slate-800">{r.user_name}</span>
                                            </div>
                                            {user && user.is_admin && (
                                              <button onClick={() => handleDeleteReview(r.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={16} />
                                              </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 pl-8">{r.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA: HORARIOS */}
                {activeTab === 'schedules' && (
                     <div className="space-y-4 animate-fade-in">
                        {user && user.is_admin && (
                           <form onSubmit={handleAddSchedule} className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                              <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2"><Plus size={16}/> Adicionar Partida</h4>
                              <div className="flex gap-2">
                                <select value={newSchedule.train_type} onChange={e => setNewSchedule({...newSchedule, train_type: e.target.value})} className="p-2 rounded-lg border-none outline-none ring-1 ring-blue-200 text-sm bg-white">
                                  <option value="Urbano">Urbano</option>
                                  <option value="Regional">Regional</option>
                                  <option value="Intercidades">Intercidades</option>
                                  <option value="Alfa Pendular">Alfa Pendular</option>
                                </select>
                                <input type="time" value={newSchedule.departure_time} onChange={e => setNewSchedule({...newSchedule, departure_time: e.target.value})} className="p-2 rounded-lg border-none outline-none ring-1 ring-blue-200 text-sm bg-white" required />
                              </div>
                              <div className="flex gap-2">
                                <input type="text" placeholder="Destino (ex: Porto)" value={newSchedule.destination} onChange={e => setNewSchedule({...newSchedule, destination: e.target.value})} className="flex-1 p-2 rounded-lg border-none outline-none ring-1 ring-blue-200 text-sm bg-white" required />
                                <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Gravar</button>
                              </div>
                           </form>
                        )}

                        {schedules.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                              <p>Sem partidas previstas.</p>
                            </div>
                        ) : (
                            schedules.map(s => (
                                <div key={s.id} className="flex justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm group">
                                    <div>
                                        <p className="font-bold text-slate-800">{s.destination}</p>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{s.train_type}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="font-bold text-xl text-slate-900">{s.departure_time.slice(0,5)}</p>
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Previsto</span>
                                        </div>
                                        {user && user.is_admin && (
                                            <button onClick={() => handleDeleteSchedule(s.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                              <Trash2 size={18}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                )}

                {/* ABA: OCORRENCIAS */}
                {activeTab === 'occurrences' && (
                  <div className="animate-fade-in">
                    <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                        <h3 className="font-bold mb-2 flex items-center gap-2 text-red-800">Reportar Problema</h3>
                        <p className="text-xs text-red-600 mb-6 leading-relaxed">A tua localização GPS será anexada automaticamente ao relatório para a equipa técnica.</p>
                        
                        {user ? (
                            <form onSubmit={handleReportOccurrence} className="flex flex-col gap-3 mb-8">
                                <textarea value={newOccurrence} onChange={(e) => setNewOccurrence(e.target.value)} className="w-full p-4 rounded-xl border-none ring-1 ring-red-200 focus:ring-2 focus:ring-red-500 outline-none transition-shadow text-sm resize-none" placeholder="Ex: Máquina de bilhetes número 2 avariada..." rows="3" />
                                <button type="submit" disabled={submitting} className="bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md">
                                  <MapPin size={18} /> Enviar Ocorrência via GPS
                                </button>
                            </form>
                        ) : (
                          <p className="text-sm text-red-700 mb-8 bg-red-100 p-4 rounded-xl text-center">Inicia sessão para reportar problemas.</p>
                        )}

                        <h4 className="font-bold text-sm text-slate-800 mb-4 border-b border-red-100 pb-2">Histórico Técnico</h4>
                        <div className="space-y-3">
                            {occurrences.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">Sem ocorrências ativas nesta estação.</p>}
                            {occurrences.map(o => (
                                <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-red-500 border border-gray-100 relative group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-xs text-slate-800">{o.user_name}</span>
                                        <span className="text-[10px] text-red-600 font-mono bg-red-50 px-2 py-1 rounded-md">Lat: {Number(o.latitude || 0).toFixed(4)}, Lon: {Number(o.longitude || 0).toFixed(4)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{o.description}</p>
                                    {user && user.is_admin && (
                                      <button onClick={() => handleDeleteOccurrence(o.id)} className="absolute -top-3 -right-3 text-green-500 hover:text-white hover:bg-green-500 p-2 bg-green-50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all" title="Marcar como resolvido">
                                        <CircleCheck size={16} />
                                      </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}

export default StationDetails;