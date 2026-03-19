import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Image, Type, ArrowLeft, CheckCircle, XCircle, X } from 'lucide-react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { min-height: 100%; background: #08111c; }

  .as-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .as-bg::before {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect x='0.5' y='0.5' width='79' height='79' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.5'/%3E%3Ccircle cx='40' cy='40' r='18' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.4'/%3E%3Cpath d='M0 0 L40 40 M80 0 L40 40 M0 80 L40 40 M80 80 L40 40' stroke='%231a3a5c' stroke-width='0.3' opacity='0.25'/%3E%3Ccircle cx='0' cy='0' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='80' cy='0' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='0' cy='80' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='80' cy='80' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3C/svg%3E");
  }
  .as-bg::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 70% at 50% 30%, transparent 20%, rgba(8,17,28,.8) 90%); }

  .as-track { position: fixed; left: 0; right: 0; height: 1px; background: rgba(74,140,194,.08); pointer-events: none; z-index: 0; }
  .as-track::after { content: ''; position: absolute; top: 0; width: 100px; height: 1px; background: rgba(74,140,194,.5); animation: asTrack var(--td) linear infinite var(--tdd); }
  @keyframes asTrack { from { left: -100px; } to { left: 100%; } }

  .as-stn { position: fixed; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: rgba(74,140,194,.13); white-space: nowrap; pointer-events: none; z-index: 0; animation: asStn var(--sd) linear infinite var(--sdd); }
  @keyframes asStn { from { transform: translateX(110vw); } to { transform: translateX(-120vw); } }

  .as-amb { position: fixed; font-family: 'Playfair Display', serif; font-weight: 900; font-style: italic; color: rgba(74,140,194,.03); white-space: nowrap; pointer-events: none; line-height: 1; user-select: none; z-index: 0; }

  /* ── TOAST ── */
  .as-toast {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%);
    z-index: 99999; width: min(92vw, 400px);
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px; border-radius: 16px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    animation: asToastIn .3s cubic-bezier(.22,1,.36,1);
    isolation: isolate;
  }
  @keyframes asToastIn { from { opacity:0; transform:translateX(-50%) translateY(14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .as-toast-success { background: rgba(22,163,74,.95); color: #fff; border: 1px solid rgba(74,222,128,.25); }
  .as-toast-error   { background: rgba(220,38,38,.95);  color: #fff; border: 1px solid rgba(248,113,113,.25); }
  .as-toast-x { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: .7; display: flex; padding: 2px; flex-shrink: 0; }
  .as-toast-x:hover { opacity: 1; }

  /* ── PAGE ── no position:relative so it never traps fixed children ── */
  .as-page { min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px 40px; font-family: 'DM Sans', sans-serif; }

  /* ── CARD ── */
  .as-card { width: min(560px, 100%); background: rgba(255,255,255,.97); border-radius: 4px 24px 24px 24px; overflow: hidden; border-top: 4px solid #2c6ea6; box-shadow: 0 0 0 1px rgba(74,140,194,.12), 0 40px 100px rgba(0,0,0,.7); position: relative; animation: asCardIn .55s cubic-bezier(.22,1,.36,1) both; }
  @keyframes asCardIn { from { opacity:0; transform:translateY(24px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  .as-corner { position: absolute; top: -4px; left: 0; width: 56px; height: 56px; background: #2c6ea6; border-radius: 0 0 100% 0; }
  .as-topbar-card { height: 4px; background: #2c6ea6; position: relative; overflow: hidden; }
  .as-topbar-card::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); animation: asShimmer 3s ease-in-out infinite; }
  @keyframes asShimmer { 0% { left: -100%; } 100% { left: 200%; } }
  .as-card-body { padding: 32px 32px 28px; }
  .as-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
  .as-back-btn { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; background: #08111c; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s, transform .15s; position: relative; overflow: hidden; }
  .as-back-btn::after { content: ''; position: absolute; inset: 0; background: conic-gradient(from 0deg, transparent, rgba(74,140,194,.2), transparent); animation: asLogoSpin 3s linear infinite; }
  @keyframes asLogoSpin { to { transform: rotate(360deg); } }
  .as-back-btn svg { position: relative; z-index: 1; }
  .as-back-btn:hover { background: #1a2e42; transform: scale(1.05); }
  .as-card-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #08111c; letter-spacing: -.025em; line-height: 1.1; }
  .as-card-title em { font-style: italic; color: #2c6ea6; }
  .as-card-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .as-divider { height: 1px; background: #f1f5f9; margin-bottom: 22px; }
  .as-field { margin-bottom: 16px; }
  .as-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #64748b; margin-bottom: 7px; }
  .as-input, .as-textarea { width: 100%; background: #f8fafc; border: 1.5px solid #e8edf2; border-radius: 12px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #08111c; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; resize: none; }
  .as-input:focus, .as-textarea:focus { border-color: #2c6ea6; background: #fff; box-shadow: 0 0 0 3px rgba(44,110,166,.1); }
  .as-input::placeholder, .as-textarea::placeholder { color: #c4cdd8; }
  .as-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .as-submit { width: 100%; padding: 14px; background: #08111c; color: #fff; border: none; border-radius: 13px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: background .2s, transform .15s; margin-top: 6px; position: relative; overflow: hidden; min-height: 50px; }
  .as-submit-shine { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(74,140,194,.2) 55%, transparent 70%); transform: translateX(-100%); transition: transform .6s; pointer-events: none; }
  .as-submit:hover .as-submit-shine { transform: translateX(100%); }
  .as-submit:hover { background: #1a2e42; }
  .as-submit:active { transform: scale(.98); }
  .as-submit:disabled { opacity: .5; cursor: default; }
  .as-strip { height: 5px; background: repeating-linear-gradient(90deg,#2c6ea6 0,#2c6ea6 10px,#1a4f80 10px,#1a4f80 20px,#4a8cc2 20px,#4a8cc2 30px,#08111c 30px,#08111c 40px); opacity: .75; }
  .as-spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: asSpinA .7s linear infinite; }
  @keyframes asSpinA { to { transform: rotate(360deg); } }

  @media (max-width: 480px) { .as-card-body { padding: 24px 20px 20px; } .as-grid { grid-template-columns: 1fr; } .as-card-title { font-size: 19px; } }
`;

const TRACKS = [15, 30, 50, 68, 85];
const DURS   = [7, 11, 9, 13, 8];
const STNS   = ['Lisboa Oriente', 'Porto Campanhã', 'Aveiro · Coimbra-B', 'Faro · Setúbal', 'Braga · Guimarães'];

function AddStation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '', latitude: '', longitude: '' });
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (type !== 'error') setTimeout(() => setToast(null), 4000);
  };

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('Estação criada com sucesso!', 'success');
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

      <div className="as-bg" />
      <div className="as-amb" style={{ fontSize: 'clamp(80px,18vw,180px)', top: '-10px', left: '-10px' }}>Rail</div>
      <div className="as-amb" style={{ fontSize: 'clamp(60px,13vw,120px)', bottom: '-8px', right: '-8px' }}>Spot</div>
      {TRACKS.map((top, i) => (
        <div key={i} className="as-track" style={{ top: `${top}%`, '--td': `${DURS[i]}s`, '--tdd': `${-i * 1.5}s` }} />
      ))}
      {STNS.map((s, i) => (
        <div key={i} className="as-stn" style={{ top: `${10 + i * 18}%`, '--sd': `${14 + i * 2}s`, '--sdd': `${-i * 3}s` }}>{s}</div>
      ))}

      {/* Toast */}
      {toast && (
        <div className={`as-toast as-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} style={{ flexShrink: 0 }} /> : <XCircle size={18} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button className="as-toast-x" onClick={() => setToast(null)}><X size={15} /></button>
        </div>
      )}

      <div className="as-page">
        <div className="as-card">
          <div className="as-topbar-card" />
          <div className="as-corner" />
          <div className="as-card-body">
            <div className="as-card-header">
              <button className="as-back-btn" onClick={() => navigate('/')} title="Voltar">
                <ArrowLeft size={17} color="#4a8cc2" />
              </button>
              <div>
                <div className="as-card-title">Nova <em>estação.</em></div>
                <div className="as-card-sub">Adicionar ao mapa ferroviário nacional</div>
              </div>
            </div>

            <div className="as-divider" />

            <form onSubmit={handleSubmit}>
              <div className="as-field">
                <label className="as-label"><Type size={12} color="#2c6ea6" /> Nome da estação</label>
                <input required name="name" onChange={handleChange} placeholder="Ex: Estação de Coimbra-B" className="as-input" />
              </div>
              <div className="as-field">
                <label className="as-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2c6ea6" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                  Descrição
                </label>
                <textarea required name="description" rows={3} onChange={handleChange} placeholder="Escreve um pouco sobre a estação…" className="as-textarea" />
              </div>
              <div className="as-field">
                <label className="as-label"><Image size={12} color="#2c6ea6" /> URL da fotografia</label>
                <input required name="image_url" onChange={handleChange} placeholder="https://exemplo.com/foto.jpg" className="as-input" />
              </div>
              <div className="as-grid">
                <div className="as-field" style={{ marginBottom: 0 }}>
                  <label className="as-label"><MapPin size={12} color="#ef4444" /> Latitude</label>
                  <input required type="number" step="any" name="latitude" onChange={handleChange} placeholder="Ex: 40.6405" className="as-input" />
                </div>
                <div className="as-field" style={{ marginBottom: 0 }}>
                  <label className="as-label"><MapPin size={12} color="#ef4444" /> Longitude</label>
                  <input required type="number" step="any" name="longitude" onChange={handleChange} placeholder="Ex: -8.6538" className="as-input" />
                </div>
              </div>
              <button type="submit" className="as-submit" disabled={loading} style={{ marginTop: '20px' }}>
                <span className="as-submit-shine" />
                {loading ? <><span className="as-spin" /> A guardar…</> : <><Save size={16} /> Criar estação</>}
              </button>
            </form>
          </div>
          <div className="as-strip" />
        </div>
      </div>
    </>
  );
}

export default AddStation;