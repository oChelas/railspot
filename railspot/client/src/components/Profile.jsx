import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar o localStorage com os novos dados
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setStatus({ type: 'success', msg: 'Perfil atualizado!' });
        setFormData({ ...formData, password: '' }); // Limpar campo da pass
        
        
        window.dispatchEvent(new Event('profile-updated'));
        
      } else {
        setStatus({ type: 'error', msg: data.error || 'Erro ao atualizar.' });
      }
    } catch  {
      setStatus({ type: 'error', msg: 'Erro de ligação ao servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans p-6 relative overflow-hidden">
      {/* Background Orbs (Coerência com a Home) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Voltar
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2">O meu <span className="text-violet-400 italic">Perfil</span></h1>
          <p className="text-slate-400 text-sm">Gere as tuas informações pessoais aqui.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
          {status.msg && (
            <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {status.type === 'success' ? <CheckCircle size={14} /> : null} {status.msg}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={18} />
              <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition-colors" required />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Endereço de E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition-colors" required />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Nova Palavra-passe (opcional)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Deixa vazio para manter" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all active:scale-95">
            <Save size={18} /> {loading ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;