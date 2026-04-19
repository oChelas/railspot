import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Train, MessageSquare, TriangleAlert, ChevronLeft, ShieldAlert, RefreshCw, DownloadCloud } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/stats`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token 
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(`Erro ${res.status}: ${errorData.error || 'Falha ao comunicar com a Base de Dados.'}`);
      }
    } catch (error) {
      console.error("Erro no fetchStats:", error); 
      setErrorMsg("Erro de ligação. O teu servidor backend está a correr?");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-4 md:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* --- HEADER CORRIGIDO (RESPONSIVO) --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-violet-300 hover:text-white transition-colors text-sm font-semibold w-fit"
          >
            <ChevronLeft size={18} /> Voltar ao Menu
          </button>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* BOTÃO DE BACKUP - Texto encurtado em Mobile para não quebrar */}
            <button 
              onClick={() => {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                window.open(`${API_URL}/api/backup`, '_blank');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 sm:px-4 py-2 rounded-xl transition-colors text-indigo-300 font-semibold text-xs sm:text-sm"
            >
              <DownloadCloud size={16} />
              <span className="inline">Backup</span>
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* BOTÃO DE REFRESH */}
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* ETIQUETA DE ADMIN - Texto omitido em Mobile para caber */}
            <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 sm:px-4 py-2 rounded-xl backdrop-blur-md">
              <ShieldAlert size={16} className="text-violet-400" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-violet-200">
                Admin<span className="hidden md:inline">istrador</span>
              </span>
            </div>
          </div>
        </div>

        {/* Título da Página */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-3">Painel de Controlo</h1>
          <p className="text-slate-400 text-sm md:text-base">Visão geral do estado da plataforma RailSpot.</p>
        </div>

        {/* Erros */}
        {errorMsg && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400">
            <TriangleAlert size={20} />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {/* --- GRID DE ESTATÍSTICAS CORRIGIDO --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-violet-300 font-medium animate-pulse">Sincronizando com a base de dados...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            
            {/* Estações */}
            <div className="group bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.06] hover:border-blue-500/30">
              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform"><Train size={32} strokeWidth={1.5} /></div>
              <div className="text-5xl font-bold tracking-tight text-white">{stats?.stations ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Estações</div>
            </div>

            {/* Utilizadores */}
            <div className="group bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.06] hover:border-emerald-500/30">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform"><Users size={32} strokeWidth={1.5} /></div>
              <div className="text-5xl font-bold tracking-tight text-white">{stats?.users ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Utilizadores</div>
            </div>

            {/* Comentários */}
            <div className="group bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.06] hover:border-purple-500/30">
              <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform"><MessageSquare size={32} strokeWidth={1.5} /></div>
              <div className="text-5xl font-bold tracking-tight text-white">{stats?.reviews ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Comentários</div>
            </div>

            {/* Ocorrências */}
            <div className="group bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.06] hover:border-red-500/30">
              <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl group-hover:scale-110 transition-transform"><TriangleAlert size={32} strokeWidth={1.5} /></div>
              <div className="text-5xl font-bold tracking-tight text-white">{stats?.occurrences ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Ocorrências</div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}