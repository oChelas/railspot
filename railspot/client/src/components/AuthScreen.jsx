import { useState } from 'react';
import { Train, User, Mail, Lock, ArrowRight } from 'lucide-react';

function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login e Registo
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro.');
      }

      // Sucesso! Passamos os dados para a App principal
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Logótipo */}
      <div className="mb-8 text-center animate-bounce-slow">
        <div className="bg-yellow-400 p-4 rounded-full inline-block shadow-lg mb-4">
          <Train className="h-10 w-10 text-slate-900" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">RailSpot</h1>
        <p className="text-slate-400 mt-2">O teu companheiro ferroviário.</p>
      </div>

      {/* Cartão de Login */}
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          {isLogin ? 'Bem-vindo de volta!' : 'Cria a tua conta'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
             ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Nome (Só aparece no Registo) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="O teu nome"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}

          {/* Campo Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Campo Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'A carregar...' : (isLogin ? 'Entrar' : 'Registar Conta')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            {isLogin ? 'Ainda não tens conta?' : 'Já tens conta?'}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Regista-te' : 'Faz Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;