import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MapPin, Train, List, LogOut, User as UserIcon, PlusCircle } from 'lucide-react';

// --- IMPORTAÇÃO DOS COMPONENTES ---
import StationMap from './components/StationMap';
import StationDetails from './components/StationDetails';
import SearchBar from './components/SearchBar';
import AuthScreen from './components/AuthScreen';
import AddStation from './components/AddStation'; // A tua nova página

// =========================================================
// 1. COMPONENTE "HOME" (O teu código antigo vive aqui agora)
// =========================================================
function Home() {
  const navigate = useNavigate(); // Para poder ir para a página de admin

  // --- ESTADO DO UTILIZADOR ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return (savedUser && savedToken) ? JSON.parse(savedUser) : null;
  });

  // --- ESTADOS DA APP ---
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); 
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 

  // Buscar Estações
  useEffect(() => {
    if (user) {
        fetch('http://localhost:5000/api/stations')
        .then(res => res.json())
        .then(data => {
            setStations(data);
            setLoading(false);
        })
        .catch(err => console.error("Erro:", err));
    }
  }, [user]);

  // --- AÇÕES ---
  const handleLogin = (userData, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setStations([]); 
  };

  // --- FILTRAGEM ---
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDERIZAÇÃO ---
  if (!user) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      
      {selectedStation ? (
        <StationDetails station={selectedStation} onBack={() => setSelectedStation(null)} />
      ) : (
        <>
          {/* Cabeçalho */}
          <header className="bg-slate-900 text-white p-4 shadow-md shrink-0 z-20">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Train className="h-6 w-6 text-yellow-400" />
                    <h1 className="text-xl font-bold hidden md:block">RailSpot</h1>
                </div>
                
                {/* Info do Utilizador + Botões */}
                <div className="flex items-center gap-4">
                    
                    {/* --- BOTÃO NOVO: SÓ APARECE SE FOR ADMIN --- */}
                    {user && user.is_admin && (
                        <button 
                            onClick={() => navigate('/admin/add')}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"
                        >
                            <PlusCircle size={16} /> <span className="hidden sm:inline">Nova Estação</span>
                        </button>
                    )}

                    <div className="h-6 w-px bg-gray-700 mx-2"></div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <UserIcon size={16} />
                        <span className="hidden sm:inline">Olá, <strong>{user.name}</strong></span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600/20 hover:bg-red-600 p-2 rounded-lg text-red-200 hover:text-white transition-colors"
                        title="Sair"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto relative w-full">
            <div className="h-full w-full max-w-7xl mx-auto flex flex-col">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="animate-pulse text-gray-500">A carregar dados...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'list' && (
                            <div className="p-4">
                                <div className="max-w-md mx-auto mb-2">
                                  <SearchBar value={searchTerm} onChange={setSearchTerm} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredStations.map((station) => (
                                    <div 
                                            key={station.id} 
                                            onClick={() => setSelectedStation(station)}
                                            className="bg-white border rounded-xl p-4 shadow-sm flex gap-4 cursor-pointer hover:shadow-md hover:border-blue-500 transition-all group"
                                    >
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                                {station.image_url && (
                                                    <img src={station.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h3 className="font-bold text-slate-800 text-lg">{station.name}</h3>
                                                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block self-start">Linha do Norte</p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 group-hover:text-blue-600">
                                                    <MapPin size={14} /> Ver detalhes
                                                </div>
                                            </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="h-full w-full relative">
                                <StationMap stations={filteredStations} onStationSelect={setSelectedStation} />
                            </div>
                        )}
                    </>
                )}
            </div>
          </main>

          <nav className="bg-white border-t border-gray-200 flex justify-center py-3 shrink-0 z-20 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around w-full max-w-md">
                <button 
                    onClick={() => setActiveTab('map')}
                    className={`flex flex-col items-center text-xs ${activeTab === 'map' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-slate-600'}`}
                >
                <MapPin size={24} className="mb-1" />
                Mapa
                </button>
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex flex-col items-center text-xs ${activeTab === 'list' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-slate-600'}`}
                >
                <List size={24} className="mb-1" />
                Lista
                </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

// =========================================================
// 2. COMPONENTE APP PRINCIPAL (ROUTER)
// =========================================================
function App() {
  return (
    <Router>
      <Routes>
        {/* A Rota Principal carrega o componente Home (o teu código antigo) */}
        <Route path="/" element={<Home />} />
        
        {/* A Nova Rota carrega o componente AddStation */}
        <Route path="/admin/add" element={<AddStation />} />
      </Routes>
    </Router>
  );
}

export default App;