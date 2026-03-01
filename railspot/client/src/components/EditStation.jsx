import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, MapPin, Image, Type, ArrowLeft } from 'lucide-react';

function EditStation() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    latitude: '',
    longitude: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

useEffect(() => {
    fetch('http://localhost:5000/api/stations')
      .then(res => res.json())
      .then(data => {
        // CORREÇÃO: Converter ambos para Texto (String) para garantir que batem certo!
        const stationToEdit = data.find(s => String(s.id) === String(id));
        
        if (stationToEdit) {
          setFormData({
            name: stationToEdit.name || '',
            description: stationToEdit.description || '',
            image_url: stationToEdit.image_url || '',
            latitude: stationToEdit.latitude || '',
            longitude: stationToEdit.longitude || ''
          });
        }
        setFetching(false);
      })
      .catch(err => {
        console.error("Erro ao buscar estação:", err);
        setFetching(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/stations/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Estação atualizada com sucesso! 🚂');
        navigate('/'); 
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

  if (fetching) {
      return <div className="min-h-screen flex items-center justify-center">A carregar dados...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center font-sans animate-fade-in">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-8 text-white flex items-center gap-4">
          <button onClick={() => navigate('/')} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Editar Estação</h1>
            <p className="text-slate-400 text-sm">Atualizar dados no mapa ferroviário</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Type size={16} className="text-blue-600" /> Nome da Estação
            </label>
            <input 
              required 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Ex: Estação de Coimbra-B" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descrição / História</label>
            <textarea 
              required 
              name="description" 
              rows="3" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Escreve um pouco sobre a estação..." 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Image size={16} className="text-blue-600" /> URL da Fotografia
            </label>
            <input 
              required 
              name="image_url" 
              value={formData.image_url} 
              onChange={handleChange} 
              placeholder="https://exemplo.com/foto.jpg" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
            
            {formData.image_url && (
                <div className="mt-4 h-32 w-full rounded-xl overflow-hidden border border-gray-200">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}
          </div>

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
                value={formData.latitude} 
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
                value={formData.longitude} 
                onChange={handleChange} 
                placeholder="Ex: -8.6538" 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={20} /> {loading ? 'A Guardar...' : 'Guardar Alterações'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditStation;