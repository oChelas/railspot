import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, MapPin, Image, Type, ArrowLeft, CheckCircle, XCircle, X } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { min-height: 100%; background: #08111c; }

  .es-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .es-bg::before {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect x='0.5' y='0.5' width='79' height='79' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.5'/%3E%3Ccircle cx='40' cy='40' r='18' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.4'/%3E%3Cpath d='M0 0 L40 40 M80 0 L40 40 M0 80 L40 40 M80 80 L40 40' stroke='%231a3a5c' stroke-width='0.3' opacity='0.25'/%3E%3Ccircle cx='0' cy='0' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='80' cy='0' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='0' cy='80' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='80' cy='80' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3C/svg%3E");
  }
  .es-bg::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 70% at 50% 30%, transparent 20%, rgba(8,17,28,.8) 90%); }

  .es-track { position: fixed; left: 0; right: 0; height: 1px; background: rgba(74,140,194,.08); pointer-events: none; z-index: 0; }
  .es-track::after { content: ''; position: absolute; top: 0; width: 100px; height: 1px; background: rgba(74,140,194,.5); animation: esTrack var(--td) linear infinite var(--tdd); }
  @keyframes esTrack { from { left: -100px; } to { left: 100%; } }

  .es-stn { position: fixed; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: rgba(74,140,194,.13); white-space: nowrap; pointer-events: none; z-index: 0; animation: esStn var(--sd) linear infinite var(--sdd); }
  @keyframes esStn { from { transform: translateX(110vw); } to { transform: translateX(-120vw); } }

  .es-amb { position: fixed; font-family: 'Playfair Display', serif; font-weight: 900; font-style: italic; color: rgba(74,140,194,.03); white-space: nowrap; pointer-events: none; line-height: 1; user-select: none; z-index: 0; }

  /* ── TOAST ── */
  .es-toast {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%);
    z-index: 99999; width: min(92vw, 400px);
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px; border-radius: 16px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    animation: esToastIn .3s cubic-bezier(.22,1,.36,1);
    isolation: isolate;
  }
  @keyframes esToastIn { from { opacity:0; transform:translateX(-50%) translateY(14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .es-toast-success { background: rgba(22,163,74,.95);  color: #fff; border: 1px solid rgba(74,222,128,.25); }
  .es-toast-error   { background: rgba(220,38,38,.95);   color: #fff; border: 1px solid rgba(248,113,113,.25); }
  .es-toast-x { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: .7; display: flex; padding: 2px; flex-shrink: 0; }
  .es-toast-x:hover { opacity: 1; }

  /* ── PAGE ── no position:relative so it never traps fixed children ── */
  .es-page { min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px 40px; font-family: 'DM Sans', sans-serif; }

  /* ── CARD ── */
  .es-card { width: min(560px, 100%); background: rgba(255,255,255,.97); border-radius: 4px 24px 24px 24px; overflow: hidden; border-top: 4px solid #f59e0b; box-shadow: 0 0 0 1px rgba(245,158,11,.12), 0 40px 100px rgba(0,0,0,.7); position: relative; animation: esCardIn .55s cubic-bezier(.22,1,.36,1) both; }
  @keyframes esCardIn { from { opacity:0; transform:translateY(24px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  .es-corner { position: absolute; top: -4px; left: 0; width: 56px; height: 56px; background: #f59e0b; border-radius: 0 0 100% 0; }
  .es-topbar-card { height: 4px; background: #f59e0b; position: relative; overflow: hidden; }
  .es-topbar-card::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); animation: esShimmer 3s ease-in-out infinite; }
  @keyframes esShimmer { 0% { left: -100%; } 100% { left: 200%; } }
  .es-card-body { padding: 32px 32px 28px; }
  .es-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
  .es-back-btn { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; background: #08111c; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s, transform .15s; position: relative; overflow: hidden; }
  .es-back-btn::after { content: ''; position: absolute; inset: 0; background: conic-gradient(from 0deg, transparent, rgba(245,158,11,.2), transparent); animation: esLogoSpin 3s linear infinite; }
  @keyframes esLogoSpin { to { transform: rotate(360deg); } }
  .es-back-btn svg { position: relative; z-index: 1; }
  .es-back-btn:hover { background: #1a2e42; transform: scale(1.05); }
  .es-card-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #08111c; letter-spacing: -.025em; line-height: 1.1; }
  .es-card-title em { font-style: italic; color: #d97706; }
  .es-card-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .es-divider { height: 1px; background: #f1f5f9; margin-bottom: 22px; }
  .es-preview { width: 100%; height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: 16px; position: relative; border: 1.5px solid #e8edf2; background: #f8fafc; }
  .es-preview img { width: 100%; height: 100%; object-fit: cover; }
  .es-preview-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 10px; background: rgba(8,17,28,.7); font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.6); font-family: 'DM Sans', sans-serif; }
  .es-field { margin-bottom: 16px; }
  .es-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #64748b; margin-bottom: 7px; }
  .es-input, .es-textarea { width: 100%; background: #f8fafc; border: 1.5px solid #e8edf2; border-radius: 12px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #08111c; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; resize: none; }
  .es-input:focus, .es-textarea:focus { border-color: #f59e0b; background: #fff; box-shadow: 0 0 0 3px rgba(245,158,11,.1); }
  .es-input::placeholder, .es-textarea::placeholder { color: #c4cdd8; }
  .es-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .es-submit { width: 100%; padding: 14px; background: #08111c; color: #fff; border: none; border-radius: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: background .2s, transform .15s; margin-top: 6px; position: relative; overflow: hidden; min-height: 50px; }
  .es-submit-shine { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(245,158,11,.2) 55%, transparent 70%); transform: translateX(-100%); transition: transform .6s; pointer-events: none; }
  .es-submit:hover .es-submit-shine { transform: translateX(100%); }
  .es-submit:hover { background: #1a2e42; }
  .es-submit:active { transform: scale(.98); }
  .es-submit:disabled { opacity: .5; cursor: default; }
  .es-strip { height: 5px; background: repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 10px,#d97706 10px,#d97706 20px,#fbbf24 20px,#fbbf24 30px,#08111c 30px,#08111c 40px); opacity: .75; }
  .es-spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: esSpinA .7s linear infinite; }
  @keyframes esSpinA { to { transform: rotate(360deg); } }
  .es-loading-screen { position: fixed; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .es-loading-spin { width: 28px; height: 28px; border: 2.5px solid rgba(245,158,11,.2); border-top-color: #f59e0b; border-radius: 50%; animation: esSpinA .8s linear infinite; }
  .es-loading-txt { font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.3); letter-spacing: .05em; }

  @media (max-width: 480px) { .es-card-body { padding: 24px 20px 20px; } .es-grid { grid-template-columns: 1fr; } .es-card-title { font-size: 19px; } }
`;

const TRACKS = [15, 30, 50, 68, 85];
const DURS   = [7, 11, 9, 13, 8];
const STNS   = ['Lisboa Oriente', 'Porto Campanhã', 'Aveiro · Coimbra-B', 'Faro · Setúbal', 'Braga · Guimarães'];

function EditStation() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '', latitude: '', longitude: '' });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast,    setToast]    = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (type !== 'error') setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/stations')
      .then(r => r.json())
      .then(data => {
        const s = data.find(x => String(x.id) === String(id));
        if (s) setFormData({ name: s.name||'', description: s.description||'', image_url: s.image_url||'', latitude: s.latitude||'', longitude: s.longitude||'' });
        setFetching(false);
      })
      .catch(err => { console.error('Erro:', err); setFetching(false); });
  }, [id]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/stations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('Estação atualizada com sucesso!', 'success');
        setTimeout(() => navigate('/'), 1800);
      } else {
        const err = await res.json();
        showToast(err.error || 'Algo correu mal.', 'error');
      }
    } catch {
      showToast('Erro de conexão ao servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="es-bg" />
      <div className="es-amb" style={{ fontSize: 'clamp(80px,18vw,180px)', top: '-10px', left: '-10px' }}>Rail</div>
      <div className="es-amb" style={{ fontSize: 'clamp(60px,13vw,120px)', bottom: '-8px', right: '-8px' }}>Spot</div>
      {TRACKS.map((top, i) => (
        <div key={i} className="es-track" style={{ top: `${top}%`, '--td': `${DURS[i]}s`, '--tdd': `${-i * 1.5}s` }} />
      ))}
      {STNS.map((s, i) => (
        <div key={i} className="es-stn" style={{ top: `${10 + i * 18}%`, '--sd': `${14 + i * 2}s`, '--sdd': `${-i * 3}s` }}>{s}</div>
      ))}

      {/* Toast */}
      {toast && (
        <div className={`es-toast es-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} style={{ flexShrink: 0 }} /> : <XCircle size={18} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button className="es-toast-x" onClick={() => setToast(null)}><X size={15} /></button>
        </div>
      )}

      {fetching && (
        <div className="es-loading-screen">
          <div className="es-loading-spin" />
          <span className="es-loading-txt">A carregar dados da estação…</span>
        </div>
      )}

      {!fetching && (
        <div className="es-page">
          <div className="es-card">
            <div className="es-topbar-card" />
            <div className="es-corner" />
            <div className="es-card-body">
              <div className="es-card-header">
                <button className="es-back-btn" onClick={() => navigate('/')} title="Voltar">
                  <ArrowLeft size={17} color="#f59e0b" />
                </button>
                <div>
                  <div className="es-card-title">Editar <em>estação.</em></div>
                  <div className="es-card-sub">Atualizar dados no mapa ferroviário nacional</div>
                </div>
              </div>

              <div className="es-divider" />

              {formData.image_url && (
                <div className="es-preview">
                  <img src={formData.image_url} alt="Preview" />
                  <div className="es-preview-label">Pré-visualização da fotografia</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="es-field">
                  <label className="es-label"><Type size={12} color="#d97706" /> Nome da estação</label>
                  <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Estação de Coimbra-B" className="es-input" />
                </div>
                <div className="es-field">
                  <label className="es-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                    Descrição
                  </label>
                  <textarea required name="description" rows={3} value={formData.description} onChange={handleChange} placeholder="Escreve um pouco sobre a estação…" className="es-textarea" />
                </div>
                <div className="es-field">
                  <label className="es-label"><Image size={12} color="#d97706" /> URL da fotografia</label>
                  <input required name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://exemplo.com/foto.jpg" className="es-input" />
                </div>
                <div className="es-grid">
                  <div className="es-field" style={{ marginBottom: 0 }}>
                    <label className="es-label"><MapPin size={12} color="#ef4444" /> Latitude</label>
                    <input required type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Ex: 40.6405" className="es-input" />
                  </div>
                  <div className="es-field" style={{ marginBottom: 0 }}>
                    <label className="es-label"><MapPin size={12} color="#ef4444" /> Longitude</label>
                    <input required type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Ex: -8.6538" className="es-input" />
                  </div>
                </div>
                <button type="submit" className="es-submit" disabled={loading} style={{ marginTop: '20px' }}>
                  <span className="es-submit-shine" />
                  {loading ? <><span className="es-spin" /> A guardar…</> : <><Save size={16} /> Guardar alterações</>}
                </button>
              </form>
            </div>
            <div className="es-strip" />
          </div>
        </div>
      )}
    </>
  );
}

export default EditStation;