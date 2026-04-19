import { useState } from 'react';
import { Train, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const STATION_NAMES = [
  'Lisboa Oriente', 'Porto Campanhã', 'Aveiro', 'Coimbra-B', 'Faro',
  'Évora', 'Braga', 'Guimarães', 'Sintra', 'Cascais', 'Setúbal',
  'Santarém', 'Entroncamento', 'Tomar', 'Portalegre', 'Beja', 'Viana do Castelo'
];

const TRACK_CONFIG = [
  { top: '12%', dur: 6,  del: 0  },
  { top: '24%', dur: 9,  del: 2  },
  { top: '36%', dur: 7,  del: 4  },
  { top: '50%', dur: 11, del: 1  },
  { top: '63%', dur: 8,  del: 3  },
  { top: '76%', dur: 10, del: 5  },
  { top: '88%', dur: 6,  del: 1.5},
];

function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin]         = useState(true);
  const [formData, setFormData]       = useState({ name: '', email: '', password: '' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ocorreu um erro.');
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── PAGE ── */
        .auth-pg {
          font-family: 'DM Sans', sans-serif;
          background: #08111c;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
        }

        /* ── AMBIENT GIANT TEXT ── */
        .auth-ambient {
          position: absolute;
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-style: italic;
          color: rgba(74,140,194,.035);
          white-space: nowrap;
          pointer-events: none;
          line-height: 1;
          user-select: none;
        }

        /* ── VANISHING POINT LINES ── */
        .auth-vp-line {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 1px;
          height: 100%;
          background: rgba(74,140,194,.05);
          transform-origin: bottom center;
          pointer-events: none;
        }

        /* ── ANIMATED RAIL TRACKS ── */
        .auth-sleepers {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0px, transparent 38px,
            rgba(74,140,194,.04) 38px, rgba(74,140,194,.04) 40px
          );
        }

        .auth-track {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: rgba(74,140,194,.1);
          pointer-events: none;
        }

        .auth-track::after {
          content: '';
          position: absolute;
          top: 0;
          width: 80px; height: 1px;
          background: rgba(74,140,194,.55);
          animation: authTrackMove var(--tdur) linear infinite var(--tdel);
        }

        @keyframes authTrackMove {
          from { left: -80px; }
          to   { left: 100%;  }
        }

        /* ── FLOATING STATION NAMES ── */
        .auth-station {
          position: absolute;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(74,140,194,.18);
          white-space: nowrap;
          pointer-events: none;
          animation: authStnFloat var(--sfdur) linear infinite var(--sfdel);
        }

        @keyframes authStnFloat {
          from { transform: translateX(110vw); }
          to   { transform: translateX(-120vw); }
        }

        /* ── CARD ── */
        .auth-card {
          position: relative;
          z-index: 10;
          width: min(440px, 92vw);
          background: rgba(255,255,255,.98);
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(74,140,194,.15),
            0 40px 100px rgba(0,0,0,.7),
            0 8px 32px rgba(0,0,0,.3);
          animation: authCardIn .6s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes authCardIn {
          from { opacity: 0; transform: translateY(28px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top shimmer bar */
        .auth-card-top {
          height: 4px;
          background: #2c6ea6;
          position: relative;
          overflow: hidden;
        }
        .auth-card-top::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
          animation: authShimmer 3s ease-in-out infinite;
        }
        @keyframes authShimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }

        .auth-card-body { padding: 36px 36px 32px; }

        /* ── MARK ── */
        .auth-mark {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .auth-mark-icon {
          width: 44px; height: 44px;
          background: #08111c;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .auth-mark-icon::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent 0%, rgba(74,140,194,.2) 50%, transparent 100%);
          animation: authRotate 4s linear infinite;
        }
        @keyframes authRotate { to { transform: rotate(360deg); } }
        .auth-mark-icon svg { position: relative; z-index: 1; }
        .auth-mark-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: #08111c; letter-spacing: -.02em; line-height: 1.1;
        }
        .auth-mark-tag {
          font-size: 10px; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase;
          color: #94a3b8; margin-top: 2px;
        }

        /* ── HEADLINE ── */
        .auth-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 4vw, 30px);
          font-weight: 900;
          color: #08111c;
          line-height: 1.1;
          letter-spacing: -.025em;
          margin-bottom: 6px;
        }
        .auth-headline em { font-style: italic; color: #2c6ea6; }
        .auth-desc { font-size: 13px; color: #94a3b8; margin-bottom: 28px; line-height: 1.5; }

        /* ── TOGGLE ── */
        .auth-toggle {
          display: flex;
          background: #f1f5f9;
          border-radius: 14px;
          padding: 4px; gap: 4px;
          margin-bottom: 22px;
        }
        .auth-tbtn {
          flex: 1;
          padding: 11px;
          border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: all .25s cubic-bezier(.22,1,.36,1);
          background: transparent; color: #94a3b8;
          min-height: 44px;
        }
        .auth-tbtn.active {
          background: #fff; color: #08111c;
          box-shadow: 0 2px 8px rgba(15,23,42,.12);
        }

        /* ── ERROR ── */
        .auth-error {
          background: #fff5f5; border: 1px solid #fecaca;
          color: #dc2626; padding: 10px 14px;
          border-radius: 12px; font-size: 12px; font-weight: 500;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
          animation: authShake .3s ease;
        }
        @keyframes authShake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* ── FIELDS ── */
        .auth-field { position: relative; margin-bottom: 12px; }
        .auth-fic {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #b0bac6; pointer-events: none;
          display: flex; align-items: center;
        }
        .auth-inp {
          width: 100%;
          padding: 14px 14px 14px 42px;
          background: #f8fafc;
          border: 1.5px solid #e8edf2;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; /* ≥16px prevents iOS zoom */
          color: #08111c; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .auth-inp::placeholder { color: #c4cdd8; }
        .auth-inp:focus {
          border-color: #2c6ea6; background: #fff;
          box-shadow: 0 0 0 3px rgba(44,110,166,.1);
        }
        .auth-eye {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #b0bac6; padding: 8px;
          display: flex; align-items: center; justify-content: center;
          min-width: 44px; min-height: 44px;
          transition: color .2s;
        }
        .auth-eye:hover { color: #2c6ea6; }

        /* ── SUBMIT ── */
        .auth-submit {
          width: 100%; padding: 15px;
          background: #08111c; color: #fff;
          border: none; border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background .2s, transform .15s;
          margin-top: 6px;
          position: relative; overflow: hidden;
          min-height: 52px;
          -webkit-tap-highlight-color: transparent;
        }
        .auth-submit-shine {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(74,140,194,.2) 55%, transparent 70%);
          transform: translateX(-100%);
          transition: transform .6s;
          pointer-events: none;
        }
        .auth-submit:hover .auth-submit-shine { transform: translateX(100%); }
        .auth-submit:hover { background: #1a2e42; }
        .auth-submit:active { transform: scale(.98); }
        .auth-submit:disabled { opacity: .5; cursor: default; }

        .auth-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: authSpin .7s linear infinite;
        }
        @keyframes authSpin { to { transform: rotate(360deg); } }

        /* ── SWITCH ── */
        .auth-switch { text-align: center; margin-top: 18px; font-size: 13px; color: #94a3b8; }
        .auth-switch-btn {
          background: none; border: none;
          color: #2c6ea6; font-weight: 600;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          cursor: pointer; margin-left: 4px; padding: 4px 0;
          transition: color .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .auth-switch-btn:hover { color: #1a4f80; text-decoration: underline; }

        /* ── BOTTOM STRIP ── */
        .auth-strip {
          height: 6px;
          background: repeating-linear-gradient(
            90deg,
            #2c6ea6 0, #2c6ea6 10px,
            #1a4f80 10px, #1a4f80 20px,
            #4a8cc2 20px, #4a8cc2 30px,
            #08111c 30px, #08111c 40px
          );
          opacity: .8;
        }

        /* ── FIELD ENTER ── */
        .auth-field-enter { animation: authFieldIn .3s cubic-bezier(.22,1,.36,1) both; }
        @keyframes authFieldIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile: more breathing room on short screens */
        @media (max-height: 700px) {
          .auth-mark { margin-bottom: 20px; }
          .auth-card-body { padding: 24px 28px 20px; }
          .auth-desc { margin-bottom: 18px; }
        }

        @media (max-width: 480px) {
          .auth-card-body { padding: 28px 22px 24px; }
        }
      `}</style>

      <div className="auth-pg">

        {/* Ambient letters */}
        <div className="auth-ambient" style={{ fontSize: 'clamp(100px,22vw,220px)', top: '-20px', left: '-20px' }}>Rail</div>
        <div className="auth-ambient" style={{ fontSize: 'clamp(60px,14vw,140px)', bottom: '-10px', right: '-10px' }}>Spot</div>

        {/* Vanishing point lines */}
        {[-80,-60,-40,-20,0,20,40,60,80].map((angle, i) => (
          <div key={i} className="auth-vp-line" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
        ))}

        {/* Sleeper pattern */}
        <div className="auth-sleepers" />

        {/* Animated track lines */}
        {TRACK_CONFIG.map((t, i) => (
          <div
            key={i}
            className="auth-track"
            style={{
              top: t.top,
              '--tdur': `${t.dur}s`,
              '--tdel': `-${t.del}s`,
            }}
          />
        ))}

        {/* Floating station names */}
        {STATION_NAMES.map((name, i) => {
          const topPositions = [8, 18, 28, 38, 50, 62, 72, 82, 90];
          const dur = 14 + (i % 7) * 2.5;
          const del = -(i * 2.1);
          return (
            <div
              key={i}
              className="auth-station"
              style={{
                top: `${topPositions[i % topPositions.length]}%`,
                '--sfdur': `${dur}s`,
                '--sfdel': `${del}s`,
              }}
            >
              {name}
            </div>
          );
        })}

        {/* CARD */}
        <div className="auth-card">
          <div className="auth-card-top" />

          <div className="auth-card-body">

            {/* Mark */}
            <div className="auth-mark">
              <div className="auth-mark-icon">
                <Train size={20} color="#4a8cc2" />
              </div>
              <div>
                <div className="auth-mark-name">RailSpot</div>
                <div className="auth-mark-tag">Portugal · Rede Nacional</div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="auth-headline">
              {isLogin
                ? <> A tua viagem<br />começa <em>aqui.</em> </>
                : <> Junta-te à<br />rede <em>nacional.</em> </>
              }
            </h1>
            <p className="auth-desc">
              {isLogin
                ? 'Entra na maior plataforma ferroviária portuguesa.'
                : 'Cria a tua conta e explora Portugal de comboio.'}
            </p>

            {/* Toggle */}
            <div className="auth-toggle">
              <button
                type="button"
                className={`auth-tbtn ${isLogin ? 'active' : ''}`}
                onClick={() => !isLogin && switchMode()}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`auth-tbtn ${!isLogin ? 'active' : ''}`}
                onClick={() => isLogin && switchMode()}
              >
                Criar conta
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Name */}
              {!isLogin && (
                <div className="auth-field auth-field-enter">
                  <span className="auth-fic"><User size={15} /></span>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="auth-inp"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <span className="auth-fic"><Mail size={15} /></span>
                <input
                  type="email"
                  placeholder="O teu email"
                  className="auth-inp"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="auth-field">
                <span className="auth-fic"><Lock size={15} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="auth-inp"
                  style={{ paddingRight: '52px' }}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Esconder password' : 'Mostrar password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                <span className="auth-submit-shine" />
                {loading
                  ? <span className="auth-spinner" />
                  : <>{isLogin ? 'Entrar na plataforma' : 'Criar conta grátis'}<ArrowRight size={17} /></>
                }
              </button>
            </form>

            <div className="auth-switch">
              {isLogin ? 'Novo por aqui?' : 'Já tens conta?'}
              <button className="auth-switch-btn" onClick={switchMode} type="button">
                {isLogin ? 'Cria a tua conta grátis' : 'Faz login'}
              </button>
            </div>
          </div>

          <div className="auth-strip" />
        </div>
      </div>
    </>
  );
}

export default AuthScreen;