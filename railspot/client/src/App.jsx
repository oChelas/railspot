import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MapPin, LogOut, PlusCircle, Train, Search } from 'lucide-react';

import StationMap     from './components/StationMap';
import StationDetails from './components/StationDetails';
import AuthScreen     from './components/AuthScreen';
import AddStation     from './components/AddStation';
import EditStation    from './components/EditStation';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #08111c; }

  .rs-shell { height: 100svh; position: relative; overflow: hidden; background: #08111c; }

  /* Animated background — all absolute, contained in shell */
  .rs-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .rs-bg::before {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect x='0.5' y='0.5' width='79' height='79' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.5'/%3E%3Ccircle cx='40' cy='40' r='18' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.4'/%3E%3Cpath d='M0 0 L40 40 M80 0 L40 40 M0 80 L40 40 M80 80 L40 40' stroke='%231a3a5c' stroke-width='0.3' opacity='0.25'/%3E%3Ccircle cx='0' cy='0' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='80' cy='0' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='0' cy='80' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3Ccircle cx='80' cy='80' r='8' fill='none' stroke='%231a3a5c' stroke-width='0.4' opacity='0.3'/%3E%3C/svg%3E");
  }
  .rs-bg::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 90% 60% at 50% 20%, transparent 20%, rgba(8,17,28,.75) 85%);
  }
  .rs-amb {
    position: absolute; font-family: 'Playfair Display', serif;
    font-weight: 900; font-style: italic; color: rgba(74,140,194,.032);
    white-space: nowrap; pointer-events: none; line-height: 1; user-select: none; z-index: 0;
  }
  .rs-track {
    position: absolute; left: 0; right: 0; height: 1px;
    background: rgba(74,140,194,.08); pointer-events: none; z-index: 0;
  }
  .rs-track::after {
    content: ''; position: absolute; top: 0; width: 100px; height: 1px;
    background: rgba(74,140,194,.5);
    animation: rsTrack var(--td) linear infinite var(--tdd);
  }
  @keyframes rsTrack { from { left: -100px; } to { left: 100%; } }
  .rs-stn {
    position: absolute; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
    color: rgba(74,140,194,.14); white-space: nowrap; pointer-events: none; z-index: 0;
    animation: rsStn var(--sd) linear infinite var(--sdd);
  }
  @keyframes rsStn { from { transform: translateX(110vw); } to { transform: translateX(-120vw); } }

  /* StationDetails — full opaque layer, z-index 50 */
  .rs-detail-layer {
    position: absolute; inset: 0; z-index: 50;
    background: #f8fafc; overflow: hidden;
  }

  /* Main app layer */
  .rs-inner {
    position: absolute; inset: 0; z-index: 1;
    display: flex; flex-direction: column; overflow: hidden;
  }

  /* Desktop centering wrapper */
  .rs-centered { width: 100%; max-width: 960px; margin: 0 auto; }

  /* Top bar */
  .rs-topbar {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; flex-shrink: 0;
    background: linear-gradient(to bottom, rgba(8,17,28,.98) 0%, rgba(8,17,28,.6) 80%, transparent 100%);
  }
  /* Topbar inner also max-width on desktop */
  .rs-topbar-centered {
    width: 100%; max-width: 960px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
  }
  .rs-logo { display: flex; align-items: center; gap: 9px; }
  .rs-logo-ico {
    width: 36px; height: 36px; background: #2c6ea6; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .rs-logo-ico::after {
    content: ''; position: absolute; inset: 0;
    background: conic-gradient(from 0deg, transparent, rgba(255,255,255,.18), transparent);
    animation: rsLogoSpin 3s linear infinite;
  }
  @keyframes rsLogoSpin { to { transform: rotate(360deg); } }
  .rs-logo-ico svg { position: relative; z-index: 1; }
  .rs-logo-name {
    font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700;
    color: #fff; letter-spacing: -.02em; white-space: nowrap;
  }
  .rs-logo-name span { color: #4a8cc2; font-style: italic; }
  .rs-topbar-r { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  /* Add button: icon-only on mobile, text shows on ≥480px */
  .rs-add-btn {
    display: flex; align-items: center; gap: 5px;
    background: rgba(44,110,166,.2); border: 1px solid rgba(44,110,166,.35);
    border-radius: 10px; padding: 7px 10px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
    color: #7ec8f0; cursor: pointer; transition: background .2s; white-space: nowrap; flex-shrink: 0;
  }
  .rs-add-btn:hover { background: rgba(44,110,166,.38); }
  .rs-add-btn-txt { display: none; }

  .rs-user-pill {
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
    padding: 5px 9px 5px 6px; border-radius: 100px; flex-shrink: 0;
  }
  .rs-user-av {
    width: 22px; height: 22px; border-radius: 50%; background: #1a4f80;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: #7ec8f0;
    font-family: 'DM Sans', sans-serif; flex-shrink: 0;
  }
  .rs-user-nm { font-size: 12px; font-weight: 500; color: rgba(255,255,255,.65); display: none; }
  .rs-logout {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .2s;
  }
  .rs-logout:hover { background: rgba(239,68,68,.28); }

  /* ≥ 480px: show text labels */
  @media (min-width: 480px) {
    .rs-add-btn-txt { display: inline; }
    .rs-user-nm { display: block; }
    .rs-topbar-r { gap: 8px; }
    .rs-add-btn { padding: 7px 12px; }
  }

  /* Content area */
  .rs-content { flex: 1; position: relative; overflow: hidden; }

  /* List view */
  .rs-list {
    position: absolute; inset: 0; overflow-y: auto;
    padding: 16px 20px 90px; scrollbar-width: none;
  }
  .rs-list::-webkit-scrollbar { display: none; }

  .rs-hero { margin-bottom: 22px; }
  .rs-eyebrow {
    font-size: 10px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(74,140,194,.55); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .rs-eyebrow::before { content: ''; width: 16px; height: 1px; background: rgba(74,140,194,.4); flex-shrink: 0; }
  .rs-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 7vw, 44px); font-weight: 900;
    color: #fff; line-height: 1.0; letter-spacing: -.03em; margin-bottom: 8px;
  }
  .rs-title em { font-style: italic; color: #4a8cc2; }
  .rs-sub { font-size: 13px; color: rgba(255,255,255,.28); line-height: 1.6; }

  /* Search */
  .rs-search {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
    border-radius: 16px; padding: 12px 16px; margin-bottom: 22px;
    transition: border-color .2s, background .2s;
  }
  .rs-search:focus-within { border-color: rgba(44,110,166,.5); background: rgba(255,255,255,.07); }
  .rs-search input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'DM Sans', sans-serif; font-size: 16px; color: #fff;
  }
  .rs-search input::placeholder { color: rgba(255,255,255,.2); }

  /* Cards grid */
  .rs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr));
    gap: 10px;
  }
  .rs-gc {
    border-radius: 18px; overflow: hidden; position: relative;
    cursor: pointer; border: 1px solid rgba(255,255,255,.05);
    transition: transform .28s cubic-bezier(.22,1,.36,1), border-color .2s;
  }
  .rs-gc:hover { transform: translateY(-5px); border-color: rgba(44,110,166,.3); }
  .rs-gc:active { transform: scale(.97); }
  .rs-gc-img { height: 130px; position: relative; overflow: hidden; }
  .rs-gc-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
  .rs-gc:hover .rs-gc-img img { transform: scale(1.09); }
  .rs-gc-ph { width: 100%; height: 100%; }
  .rs-gc-ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,17,28,.85) 0%, transparent 60%); }
  .rs-gc-body { background: #111d2a; padding: 11px 13px; }
  .rs-gc-name {
    font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700;
    color: #fff; letter-spacing: -.01em; margin-bottom: 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .rs-gc-row { display: flex; align-items: center; justify-content: space-between; }
  .rs-gc-sub { font-size: 10px; color: rgba(255,255,255,.28); letter-spacing: .05em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; }
  .rs-gc-dot { width: 6px; height: 6px; border-radius: 50%; background: #2c6ea6; flex-shrink: 0; }

  /* Map */
  .rs-map { position: absolute; inset: 0; z-index: 0; }

  /* Bottom nav */
  .rs-botnav {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
    padding: 0 16px calc(14px + env(safe-area-inset-bottom, 0px));
  }
  .rs-botnav-inner {
    background: rgba(8,17,28,.88); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,.07); border-radius: 20px;
    display: flex; padding: 5px; gap: 3px;
  }
  .rs-nb {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 10px 6px; border-radius: 15px; border: none; background: transparent;
    cursor: pointer; transition: background .2s; font-family: 'DM Sans', sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  .rs-nb:hover { background: rgba(255,255,255,.04); }
  .rs-nb.on { background: rgba(44,110,166,.15); }
  .rs-nb-ico { color: rgba(255,255,255,.22); display: flex; transition: color .2s; }
  .rs-nb.on .rs-nb-ico { color: #4a8cc2; }
  .rs-nb-lbl { font-size: 10px; font-weight: 600; letter-spacing: .04em; color: rgba(255,255,255,.22); transition: color .2s; font-family: 'DM Sans', sans-serif; }
  .rs-nb.on .rs-nb-lbl { color: #4a8cc2; }

  /* Loading */
  .rs-loading {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px;
  }
  .rs-spin {
    width: 28px; height: 28px;
    border: 2.5px solid rgba(44,110,166,.2); border-top-color: #2c6ea6;
    border-radius: 50%; animation: rsSpin .8s linear infinite;
  }
  @keyframes rsSpin { to { transform: rotate(360deg); } }
  .rs-loading-txt { font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,.25); letter-spacing: .05em; }

  /* Card entrance stagger */
  .rs-card-enter { animation: rsCardIn .45s cubic-bezier(.22,1,.36,1) both; animation-delay: var(--ci, 0s); }
  @keyframes rsCardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  /* Clear button */
  .rs-clear-btn {
    background: rgba(255,255,255,.08); border: none; border-radius: 50%;
    width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; color: rgba(255,255,255,.5); transition: background .2s;
  }
  .rs-clear-btn:hover { background: rgba(255,255,255,.15); }

  /* ── RESPONSIVE ── */
  @media (min-width: 640px) {
    .rs-topbar { padding: 16px 32px; }
    .rs-list { padding: 20px 32px 90px; }
    .rs-botnav { padding: 0 32px calc(16px + env(safe-area-inset-bottom, 0px)); }
    .rs-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  }
  @media (min-width: 1024px) {
    .rs-topbar { padding: 18px 48px; }
    .rs-list { padding: 28px 48px 90px; }
    .rs-botnav { padding: 0 48px calc(18px + env(safe-area-inset-bottom, 0px)); }
    .rs-botnav-inner { max-width: 280px; margin: 0 auto; }
    .rs-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  }
`;

const TRACKS     = [18, 33, 50, 67, 83];
const DURS       = [7, 11, 9, 13, 8];
const STNS       = [
  'Lisboa Oriente', 'Porto Campanhã', 'Aveiro · Coimbra-B · Braga',
  'Faro · Setúbal · Guimarães', 'Entroncamento · Sintra · Cascais', 'Viana do Castelo · Évora · Beja',
];
const STN_DUR    = [16, 22, 18, 14, 20, 17];
const DOT_COLORS = ['#2c6ea6','#ef4444','#22c55e','#f59e0b','#a855f7','#06b6d4','#ec4899','#10b981'];
const BG_GRADS   = ['#1a0c0c,#3d1a1a','#0a1a0a,#153d15','#0e0e1a,#1a1a3d','#1a1200,#3d2c00','#1a0a18,#3d1538','#0a1818,#153d38'];

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      const t = localStorage.getItem('token');
      return u && t ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [stations, setStations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('list');
  const [selected, setSelected] = useState(null);
  const [q, setQ]               = useState('');

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:5000/api/stations')
      .then(r => r.json())
      .then(d => { setStations(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleLogin  = (u, t) => { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const handleLogout = ()     => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setStations([]); };

  const filtered = stations.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(q.toLowerCase())
  );

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <>
      <style>{CSS}</style>

      <div className="rs-shell">

        {/* ── ANIMATED BACKGROUND ── */}
        <div className="rs-bg" />
        <div className="rs-amb" style={{ fontSize: 'clamp(80px,18vw,180px)', top: '-10px', left: '-10px' }}>Rail</div>
        <div className="rs-amb" style={{ fontSize: 'clamp(60px,13vw,120px)', bottom: '-8px', right: '-8px' }}>Spot</div>
        {TRACKS.map((top, i) => (
          <div key={i} className="rs-track" style={{ top: `${top}%`, '--td': `${DURS[i]}s`, '--tdd': `${-i * 1.5}s` }} />
        ))}
        {STNS.map((s, i) => (
          <div key={i} className="rs-stn" style={{ top: `${8 + i * 15}%`, '--sd': `${STN_DUR[i]}s`, '--sdd': `${-i * 3}s` }}>{s}</div>
        ))}

        {/* ── STATION DETAILS — z-index 50, fully covers background ── */}
        {selected && (
          <div className="rs-detail-layer">
            <StationDetails station={selected} onBack={() => setSelected(null)} />
          </div>
        )}

        {/* ── MAIN APP — z-index 1 ── */}
        <div className="rs-inner">

          {/* TOP BAR (hidden on map) */}
          {tab !== 'map' && (
            <header className="rs-topbar">
              <div className="rs-topbar-centered">
                <div className="rs-logo">
                  <div className="rs-logo-ico"><Train size={18} color="#fff" /></div>
                  <div className="rs-logo-name">Rail<span>Spot</span></div>
                </div>
                <div className="rs-topbar-r">
                  {user?.is_admin && (
                    <button className="rs-add-btn" onClick={() => navigate('/admin/add')}>
                      <PlusCircle size={13} /> <span className="rs-add-btn-txt">Nova estação</span>
                    </button>
                  )}
                  <div className="rs-user-pill">
                    <div className="rs-user-av">{initials}</div>
                    <span className="rs-user-nm">{user?.name?.split(' ')[0]}</span>
                  </div>
                  <button className="rs-logout" onClick={handleLogout} title="Sair">
                    <LogOut size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            </header>
          )}

          {/* CONTENT */}
          <div className="rs-content">

            {/* LIST TAB */}
            {tab === 'list' && (
              loading ? (
                <div className="rs-loading">
                  <div className="rs-spin" />
                  <span className="rs-loading-txt">A carregar estações…</span>
                </div>
              ) : (
                <div className="rs-list">
                  <div className="rs-centered">

                    <div className="rs-hero">
                      <div className="rs-eyebrow">Rede Ferroviária Nacional</div>
                      <h1 className="rs-title">Descobre<br /><em>Portugal</em><br />de comboio.</h1>
                      <p className="rs-sub">Horários e ocorrências em tempo real.</p>
                    </div>

                    <div className="rs-search">
                      <Search size={15} color="rgba(255,255,255,.28)" style={{ flexShrink: 0 }} />
                      <input
                        placeholder="Pesquisar estação ou linha…"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        inputMode="search"
                      />
                      {q && (
                        <button className="rs-clear-btn" onClick={() => setQ('')} aria-label="Limpar">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="rs-grid">
                      {filtered.map((s, i) => (
                        <div
                          key={s.id}
                          className="rs-gc rs-card-enter"
                          style={{ '--ci': `${i * 0.05}s` }}
                          onClick={() => setSelected(s)}
                        >
                          <div className="rs-gc-img">
                            {s.image_url
                              ? <img src={s.image_url} alt={s.name} />
                              : <div className="rs-gc-ph" style={{ background: `linear-gradient(135deg,${BG_GRADS[i % BG_GRADS.length]})` }} />
                            }
                            <div className="rs-gc-ov" />
                          </div>
                          <div className="rs-gc-body">
                            <div className="rs-gc-name">{s.name}</div>
                            <div className="rs-gc-row">
                              <span className="rs-gc-sub">Portugal</span>
                              <div className="rs-gc-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )
            )}

            {/* MAP TAB — fullscreen, zero chrome */}
            {tab === 'map' && (
              <div className="rs-map">
                <StationMap stations={stations} onStationSelect={setSelected} />
              </div>
            )}

          </div>

          {/* BOTTOM NAV */}
          <div className="rs-botnav">
            <div className="rs-botnav-inner">
              <button className={`rs-nb ${tab === 'list' ? 'on' : ''}`} onClick={() => setTab('list')}>
                <span className="rs-nb-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <circle cx="3.5" cy="6"  r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                <span className="rs-nb-lbl">Estações</span>
              </button>
              <button className={`rs-nb ${tab === 'map' ? 'on' : ''}`} onClick={() => setTab('map')}>
                <span className="rs-nb-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                </span>
                <span className="rs-nb-lbl">Mapa</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/admin/add"      element={<AddStation />} />
        <Route path="/admin/edit/:id" element={<EditStation />} />
      </Routes>
    </Router>
  );
}

export default App;