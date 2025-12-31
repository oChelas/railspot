import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para mudar de página
import { Save, MapPin, Image, Type, ArrowLeft } from 'lucide-react';

function AddStation() {
  const navigate = useNavigate();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    latitude: '',
    longitude: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Atualiza os dados conforme escreves
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Envia os dados para o servidor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Sucesso! Estação criada. 🚂');
        navigate('/'); // Volta para a página principal
      } else {
        const errorData = await res.json();
        alert('Erro: ' + (errorData.error || 'Algo correu mal.'));
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center font-sans animate-fade-in">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-8 text-white flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Nova Estação</h1>
            <p className="text-slate-400 text-sm">Adicionar ao mapa ferroviário</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Nome */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Type size={16} className="text-blue-600" /> Nome da Estação
            </label>
            <input 
                required 
                name="name" 
                onChange={handleChange} 
                placeholder="Ex: Estação de Coimbra-B" 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descrição / História</label>
            <textarea 
                required 
                name="description" 
                rows="3" 
                onChange={handleChange} 
                placeholder="Escreve um pouco sobre a estação..." 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          {/* Imagem */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Image size={16} className="text-blue-600" /> URL da Fotografia
            </label>
            <input 
                required 
                name="image_url" 
                onChange={handleChange} 
                placeholder="https://exemplo.com/foto.jpg" 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          {/* Coordenadas (Grid lado a lado) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" /> Latitude
              </label>
              <input 
                required 
                type="number" 
                step="any" 
                name="latitude" 
                onChange={handleChange} 
                placeholder="Ex: 40.6405" 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" /> Longitude
              </label>
              <input 
                required 
                type="number" 
                step="any" 
                name="longitude" 
                onChange={handleChange} 
                placeholder="Ex: -8.6538" 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <button 
            disabled={loading} 
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} /> {loading ? 'A Guardar...' : 'Criar Estação'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddStation;