/**
 * index.html — adiciona dentro de <head>:
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
 * e antes de </body>:
 *   <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
 */

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, Train, MapPin, ChevronLeft, ChevronRight, Search, X, TriangleAlert, BarChart3 } from 'lucide-react';

import StationMap     from './components/StationMap';
import StationDetails from './components/StationDetails';
import AuthScreen     from './components/AuthScreen';
import AddStation     from './components/AddStation';
import EditStation    from './components/EditStation';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─────────────────────────────────────────────────────────
   2. CURATED PALETTE — reliable colours, no CORS needed
   Each entry: [r, g, b] for the atmospheric glow
──────────────────────────────────────────────────────────*/
const PALETTE = [
  [110, 70, 200],  // violet
  [30, 100, 180],  // ocean blue
  [180, 80, 40],   // warm amber
  [30, 130, 100],  // teal
  [160, 40, 80],   // crimson
  [60, 60, 180],   // indigo
  [100, 140, 30],  // olive
  [180, 100, 20],  // golden
];

/* ─────────────────────────────────────────────────────────
   3. REAL LINE NAMES per station keyword
──────────────────────────────────────────────────────────*/
function getLine(name = '') {
  const n = name.toLowerCase();
  if (n.includes('sintra'))                      return 'Linha de Sintra';
  if (n.includes('cascais'))                     return 'Linha de Cascais';
  if (n.includes('faro') || n.includes('algarve')) return 'Linha do Algarve';
  if (n.includes('braga') || n.includes('minho') || n.includes('viana')) return 'Linha do Minho';
  if (n.includes('guimarães') || n.includes('guimaraes')) return 'Linha do Guimarães';
  if (n.includes('évora') || n.includes('evora') || n.includes('beja')) return 'Linha do Alentejo';
  if (n.includes('douro') || n.includes('bragança')) return 'Linha do Douro';
  if (n.includes('oriente') || n.includes('entronc') || n.includes('setúbal')) return 'Linha de Cintura';
  if (n.includes('porto') || n.includes('campanhã') || n.includes('bento')) return 'Linha do Norte';
  if (n.includes('aveiro') || n.includes('coimbra') || n.includes('santarém')) return 'Linha do Norte';
  return 'Linha do Norte';
}

/* ─────────────────────────────────────────────────────────
   PRE-COMPUTED STATIC DATA — computed once at module level,
   never recalculated on re-renders
──────────────────────────────────────────────────────────*/

// Wheel spokes — 6 angles, computed once
const SPOKES = [0,60,120,180,240,300].map(a => ({
  cos: Math.cos(a * Math.PI / 180),
  sin: Math.sin(a * Math.PI / 180),
}));

// Landscape near layer — random-ish but stable (seeded by index)
const WILDFLOWERS = Array.from({length:55}, (_,i) => ({
  cx: i*26 + (i%4)*5, cy: 75 + Math.sin(i*2.1)*12, r: 1 + ((i*7)%3)*0.5,
}));
const REEDS = Array.from({length:28}, (_,i) => ({
  x: 310+i*30, y: 80+Math.sin(i*1.3)*8,
}));
const WALL_STONES = Array.from({length:44}, (_,i) => ({
  x: i*32+(i%3)*8, y: 87+Math.sin(i*1.7)*5,
}));
const NEAR_PINES = [[45,55],[80,50],[115,58],[200,48],[240,52],[510,45],[545,40],[578,46],[820,44],[858,50],[892,42],[1100,48],[1135,44],[1172,50],[1300,52],[1335,47]];
const VINE_ROWS  = [0,1,2,3];
const VINE_COLS  = Array.from({length:17}, (_,i) => i);

/* ─────────────────────────────────────────────────────────
   MEMOIZED SCENE COMPONENTS — render exactly once, never
   re-render when parent state changes (bgColor, q, tab…)
──────────────────────────────────────────────────────────*/

const LandscapeFar = memo(function LandscapeFar({ refProp }) {
  return (
    <div className="rs-ls-layer" ref={refProp} style={{ bottom:'42%', opacity:.55 }}>
      <svg viewBox="0 0 1400 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mfar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(80,60,160,.65)"/><stop offset="100%" stopColor="rgba(40,25,100,.45)"/></linearGradient>
          <linearGradient id="snowcap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(220,215,255,.55)"/><stop offset="100%" stopColor="transparent"/></linearGradient>
        </defs>
        <path d="M0,220 L0,155 Q60,100 130,90 Q180,82 220,75 Q270,68 310,58 Q370,42 420,38 Q460,34 500,40 Q540,46 580,62 Q630,78 680,70 Q730,60 790,52 Q850,44 900,38 Q960,32 1010,28 Q1060,22 1110,30 Q1160,38 1200,55 Q1240,70 1280,85 Q1320,98 1360,105 Q1390,112 1400,118 L1400,220 Z" fill="url(#mfar)"/>
        <path d="M420,38 Q440,28 460,24 Q480,28 500,40 Q470,36 450,32 Z" fill="url(#snowcap)"/>
        <path d="M1000,28 Q1030,16 1060,12 Q1085,18 1110,30 Q1080,26 1055,22 Z" fill="url(#snowcap)"/>
        <path d="M300,58 Q325,44 350,38 Q375,42 390,52 Q365,46 340,42 Z" fill="url(#snowcap)" opacity=".7"/>
        <path d="M0,160 Q350,145 700,150 Q1050,155 1400,148" fill="none" stroke="rgba(120,100,220,.08)" strokeWidth="1"/>
      </svg>
    </div>
  );
});

const LandscapeMid = memo(function LandscapeMid({ refProp }) {
  return (
    <div className="rs-ls-layer" ref={refProp} style={{ bottom:'18%', opacity:.75 }}>
      <svg viewBox="0 0 1400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mhill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(55,42,120,.8)"/><stop offset="100%" stopColor="rgba(25,15,70,.9)"/></linearGradient>
          <linearGradient id="mhill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(45,35,105,.78)"/><stop offset="100%" stopColor="rgba(20,12,60,.9)"/></linearGradient>
          <linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(100,130,220,.55)"/><stop offset="100%" stopColor="rgba(60,80,180,.35)"/></linearGradient>
          <linearGradient id="rivershine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="transparent"/><stop offset="30%" stopColor="rgba(180,200,255,.18)"/><stop offset="55%" stopColor="rgba(200,220,255,.28)"/><stop offset="80%" stopColor="rgba(180,200,255,.12)"/><stop offset="100%" stopColor="transparent"/></linearGradient>
        </defs>
        <path d="M0,300 L0,200 Q30,180 70,165 Q110,148 150,140 Q190,132 230,128 Q270,124 300,130 Q330,136 350,148 Q370,160 380,175 Q390,188 400,200 L400,300 Z" fill="url(#mhill)"/>
        {[148,158,168,178,190,202,215].map((y,i)=><path key={i} d={`M${30+i*8},${y+2} Q${120+i*4},${y-3} ${200+i*3},${y}`} fill="none" stroke="rgba(167,139,250,.1)" strokeWidth=".8"/>)}
        <path d="M1000,300 L1000,175 Q1040,155 1090,140 Q1140,125 1190,118 Q1240,110 1280,115 Q1320,120 1360,135 Q1385,145 1400,158 L1400,300 Z" fill="url(#mhill)"/>
        {[140,150,162,174,186].map((y,i)=><path key={i} d={`M${1050+i*5},${y} Q${1200+i*3},${y-4} ${1370+i*2},${y+2}`} fill="none" stroke="rgba(167,139,250,.1)" strokeWidth=".8"/>)}
        <path d="M320,300 L320,210 Q360,185 410,170 Q460,155 520,148 Q580,140 640,142 Q700,144 750,150 Q800,155 840,165 Q880,175 910,188 Q940,200 960,215 L960,300 Z" fill="url(#mhill2)"/>
        <path d="M0,250 Q80,238 160,232 Q240,226 330,228 Q420,230 500,235 Q580,240 660,242 Q740,244 820,240 Q900,236 980,230 Q1060,224 1140,222 Q1220,220 1300,224 Q1360,227 1400,232 L1400,265 Q1320,260 1220,258 Q1100,256 980,260 Q860,264 740,262 Q620,260 500,258 Q380,256 270,262 Q160,268 80,272 Q40,274 0,274 Z" fill="url(#river)"/>
        <path d="M0,250 Q350,238 700,242 Q1050,246 1400,232 L1400,246 Q1050,260 700,256 Q350,252 0,264 Z" fill="url(#rivershine)"/>
        <path d="M80,252 Q180,248 280,250" fill="none" stroke="rgba(200,220,255,.12)" strokeWidth="1"/>
        <path d="M420,254 Q540,250 660,253" fill="none" stroke="rgba(200,220,255,.1)" strokeWidth="1"/>
        <path d="M800,250 Q920,246 1040,249" fill="none" stroke="rgba(200,220,255,.12)" strokeWidth="1"/>
        {[[452,182,28,34],[484,172,24,42],[510,178,30,36],[543,170,26,40],[568,180,22,32],[455,160,16,24],[490,152,18,22]].map(([x,y,w,h],i)=>(
          <g key={i}><rect x={x} y={y} width={w} height={h} rx="1" fill="rgba(55,40,110,.85)" stroke="rgba(140,120,220,.18)" strokeWidth=".5"/><polygon points={`${x},${y} ${x+w/2},${y-8} ${x+w},${y}`} fill="rgba(90,65,160,.75)"/><rect x={x+w/2-4} y={y+h/2-4} width="7" height="6" rx="1" fill="rgba(255,240,180,.15)"/></g>
        ))}
        <rect x="596" y="148" width="18" height="52" rx="1" fill="rgba(70,52,135,.88)"/><polygon points="596,148 605,132 614,148" fill="rgba(100,75,175,.82)"/><rect x="600" y="162" width="10" height="8" rx="1" fill="rgba(255,240,180,.18)"/><line x1="605" y1="132" x2="605" y2="126" stroke="rgba(200,185,255,.45)" strokeWidth="1"/><line x1="602" y1="129" x2="608" y2="129" stroke="rgba(200,185,255,.45)" strokeWidth="1"/>
        {[[630,160],[638,155],[646,158],[654,153]].map(([tx,ty],i)=><g key={i}><line x1={tx+2} y1={ty+30} x2={tx+2} y2={ty+5} stroke="rgba(60,45,120,.8)" strokeWidth="1"/><ellipse cx={tx+2} cy={ty+15} rx="4" ry="14" fill="rgba(38,28,88,.82)"/></g>)}
        {[[822,188,26,32],[852,178,22,40],[878,184,28,34],[908,176,24,38],[935,186,20,30]].map(([x,y,w,h],i)=>(
          <g key={i}><rect x={x} y={y} width={w} height={h} rx="1" fill="rgba(50,38,105,.82)" stroke="rgba(135,115,215,.16)" strokeWidth=".5"/><polygon points={`${x},${y} ${x+w/2},${y-7} ${x+w},${y}`} fill="rgba(82,58,152,.72)"/><rect x={x+w/2-4} y={y+h/2-4} width="7" height="6" rx="1" fill="rgba(255,240,180,.13)"/></g>
        ))}
        <rect x="690" y="238" width="120" height="8" rx="2" fill="rgba(70,55,140,.65)"/>
        {[700,720,740,760,780].map((bx,i)=><path key={i} d={`M${bx},246 Q${bx+10},236 ${bx+20},246`} fill="none" stroke="rgba(120,100,200,.35)" strokeWidth="1"/>)}
        <rect x="760" y="175" width="46" height="50" rx="2" fill="rgba(60,46,125,.85)"/><polygon points="760,175 783,158 806,175" fill="rgba(85,62,158,.8)"/>
        {[[766,185],[788,185],[766,205],[788,205]].map(([wx,wy],i)=><rect key={i} x={wx} y={wy} width="10" height="10" rx="1" fill="rgba(255,240,180,.14)" strokeWidth=".5"/>)}
        <rect x="779" y="210" width="10" height="15" rx="2" fill="rgba(40,28,90,.9)"/>
        <rect x="806" y="162" width="14" height="62" rx="1" fill="rgba(65,50,130,.88)"/><polygon points="806,162 813,150 820,162" fill="rgba(90,68,160,.82)"/>
        <rect x="1210" y="112" width="8" height="48" fill="rgba(55,40,115,.8)"/><polygon points="1210,118 1218,118 1214,108" fill="rgba(75,55,145,.75)"/>
        {[[-18,-18],[18,-18],[18,18],[-18,18]].map(([dx,dy],i)=><line key={i} x1="1214" y1="120" x2={1214+dx} y2={120+dy} stroke="rgba(150,130,220,.35)" strokeWidth="1.5"/>)}
        {[[380,168],[395,162],[368,175],[355,170],[340,178]].map(([tx,ty],i)=><g key={i}><line x1={tx+4} y1={ty+20} x2={tx+4} y2={ty+8} stroke="rgba(80,55,140,.7)" strokeWidth="1.5"/><polygon points={`${tx},${ty+14} ${tx+4},${ty} ${tx+8},${ty+14}`} fill="rgba(40,28,90,.8)"/><polygon points={`${tx+1},${ty+20} ${tx+4},${ty+8} ${tx+7},${ty+20}`} fill="rgba(35,24,82,.85)"/></g>)}
      </svg>
    </div>
  );
});

const LandscapeNear = memo(function LandscapeNear({ refProp }) {
  return (
    <div className="rs-ls-layer" ref={refProp} style={{ bottom:0, opacity:.9 }}>
      <svg viewBox="0 0 1400 160" preserveAspectRatio="none">
        <defs><linearGradient id="nearhill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(28,18,70,.94)"/><stop offset="100%" stopColor="rgba(14,7,42,.99)"/></linearGradient></defs>
        <path d="M0,160 L0,95 Q40,75 90,68 Q150,60 210,64 Q270,68 330,72 Q390,76 450,70 Q510,64 570,62 Q630,58 700,60 Q770,62 840,68 Q900,74 960,78 Q1020,80 1080,75 Q1140,68 1200,65 Q1260,62 1320,68 Q1360,72 1400,78 L1400,160 Z" fill="url(#nearhill)"/>
        <path d="M0,100 Q200,90 400,88 Q600,86 800,90 Q1000,94 1200,90 Q1320,88 1400,92" fill="none" stroke="rgba(100,82,180,.28)" strokeWidth="2.5"/>
        {WALL_STONES.map((s,i)=><rect key={i} x={s.x} y={s.y-3} width="28" height="6" rx="1" fill="none" stroke="rgba(100,82,180,.14)" strokeWidth=".8"/>)}
        {WILDFLOWERS.map((f,i)=><circle key={i} cx={f.cx} cy={f.cy} r={f.r} fill="rgba(167,139,250,.2)"/>)}
        {NEAR_PINES.map(([tx,ty],i)=>(
          <g key={i}>
            <line x1={tx+5} y1={ty+38} x2={tx+5} y2={ty+10} stroke="rgba(18,10,52,.98)" strokeWidth="2"/>
            <polygon points={`${tx},${ty+30} ${tx+5},${ty+14} ${tx+10},${ty+30}`} fill="rgba(20,12,58,.96)"/>
            <polygon points={`${tx+1},${ty+40} ${tx+5},${ty+22} ${tx+9},${ty+40}`} fill="rgba(17,9,50,.97)"/>
            <polygon points={`${tx+2},${ty+50} ${tx+5},${ty+34} ${tx+8},${ty+50}`} fill="rgba(14,7,46,.98)"/>
          </g>
        ))}
        {VINE_ROWS.map(row=>(
          <g key={row}>{VINE_COLS.map(i=>{ const x=640+i*28+row*4,y=72+row*8; return <g key={i}><line x1={x} y1={y+12} x2={x} y2={y+4} stroke="rgba(80,60,140,.45)" strokeWidth="1"/><ellipse cx={x} cy={y+2} rx="5" ry="3" fill="rgba(32,22,75,.6)"/></g>; })}</g>
        ))}
        {REEDS.map((r,i)=><path key={i} d={`M${r.x},${r.y+22} Q${r.x+2},${r.y+10} ${r.x+1},${r.y} Q${r.x-1},${r.y+8} ${r.x-2},${r.y+22}`} fill="rgba(48,34,96,.58)"/>)}
      </svg>
    </div>
  );
});

const TrainScene = memo(function TrainScene({ refProp }) {
  return (
        <div className="rs-train-scene">

          {/* Perspective vanishing-point track */}
          <div className="rs-track-3d-wrap">
            <div className="rs-track-3d-inner" />
          </div>
          <div className="rs-track-vanish" />

          {/* Flat rails at train level */}
          <div className="rs-rail-flat"  style={{ bottom:'62px' }} />
          <div className="rs-sleepers-flat" style={{ bottom:'56px', height:'8px' }} />

          {/* Parallax container — shifts on swipe */}
          <div ref={refProp} className="rs-train-parallax">

            {/* ── DISTANT TRAIN (small, slow, faint) ── */}
            <div className="rs-train-slot" style={{ '--tdur':'52s', '--tdel':'-20s', bottom:'72px', opacity:.13 }}>
              <svg width="480" height="68" viewBox="0 0 480 68" fill="none">
                <defs>
                  <linearGradient id="db" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(167,139,250,.6)"/>
                    <stop offset="100%" stopColor="rgba(99,60,200,.5)"/>
                  </linearGradient>
                </defs>
                <polygon points="0,42 22,28 22,58 0,60" fill="rgba(99,60,200,.7)"/>
                <polygon points="22,24 118,24 126,14 30,14" fill="rgba(167,139,250,.4)"/>
                <polygon points="118,24 126,14 126,58 118,60" fill="rgba(80,50,180,.5)"/>
                <rect x="22" y="24" width="96" height="36" rx="3" fill="url(#db)"/>
                <rect x="28" y="29" width="18" height="20" rx="1" fill="rgba(0,0,0,.35)"/>
                <rect x="52" y="29" width="18" height="20" rx="1" fill="rgba(0,0,0,.35)"/>
                <rect x="76" y="29" width="18" height="20" rx="1" fill="rgba(0,0,0,.35)"/>
                <circle cx="3"  cy="44" r="3.5" fill="rgba(255,240,160,.9)"/>
                <circle cx="36" cy="60" r="7" fill="rgba(20,10,45,.9)" stroke="rgba(167,139,250,.5)" strokeWidth="1"/>
                <circle cx="36" cy="60" r="3" fill="rgba(167,139,250,.4)"/>
                <circle cx="72" cy="60" r="7" fill="rgba(20,10,45,.9)" stroke="rgba(167,139,250,.5)" strokeWidth="1"/>
                <circle cx="72" cy="60" r="3" fill="rgba(167,139,250,.4)"/>
                <circle cx="105" cy="60" r="7" fill="rgba(20,10,45,.9)" stroke="rgba(167,139,250,.4)" strokeWidth="1"/>
                <circle cx="105" cy="60" r="3" fill="rgba(167,139,250,.3)"/>
                <polygon points="130,30 250,30 258,20 138,20" fill="rgba(139,92,246,.35)"/>
                <polygon points="250,30 258,20 258,60 250,62" fill="rgba(80,50,180,.4)"/>
                <polygon points="130,30 138,20 138,62 130,64" fill="rgba(80,50,180,.45)"/>
                <rect x="130" y="30" width="120" height="32" rx="3" fill="rgba(139,92,246,.45)"/>
                {[136,162,188,214].map((wx,j)=>(<rect key={j} x={wx} y="35" width="18" height="18" rx="1" fill="rgba(0,0,0,.3)"/>))}
                <circle cx="150" cy="62" r="6" fill="rgba(20,10,45,.9)" stroke="rgba(139,92,246,.45)" strokeWidth="1"/>
                <circle cx="232" cy="62" r="6" fill="rgba(20,10,45,.9)" stroke="rgba(139,92,246,.45)" strokeWidth="1"/>
                <polygon points="262,30 382,30 390,20 270,20" fill="rgba(139,92,246,.3)"/>
                <polygon points="382,30 390,20 390,60 382,62" fill="rgba(80,50,180,.35)"/>
                <polygon points="262,30 270,20 270,62 262,64" fill="rgba(80,50,180,.4)"/>
                <rect x="262" y="30" width="120" height="32" rx="3" fill="rgba(99,70,200,.4)"/>
                {[268,294,320,346].map((wx,j)=>(<rect key={j} x={wx} y="35" width="18" height="18" rx="1" fill="rgba(0,0,0,.28)"/>))}
                <circle cx="282" cy="62" r="6" fill="rgba(20,10,45,.9)" stroke="rgba(139,92,246,.4)" strokeWidth="1"/>
                <circle cx="364" cy="62" r="6" fill="rgba(20,10,45,.9)" stroke="rgba(139,92,246,.4)" strokeWidth="1"/>
                <polygon points="394,30 480,30 480,20 402,20" fill="rgba(99,70,200,.25)"/>
                <rect x="394" y="30" width="86" height="32" rx="3" fill="rgba(99,70,200,.35)"/>
                {[400,426,452].map((wx,j)=>(<rect key={j} x={wx} y="35" width="18" height="18" rx="1" fill="rgba(0,0,0,.25)"/>))}
                <circle cx="414" cy="62" r="6" fill="rgba(20,10,45,.9)" stroke="rgba(99,70,200,.38)" strokeWidth="1"/>
                <line x1="-10" y1="67" x2="490" y2="67" stroke="rgba(167,139,250,.18)" strokeWidth="1.5"/>
              </svg>
            </div>

            {/* ── MAIN CLOSE TRAIN (large, detailed, 3D isometric) ── */}
            <div className="rs-train-slot" style={{ '--tdur':'30s', '--tdel':'-7s', bottom:'64px', opacity:.42 }}>
              <div className="rs-train-bob">
                <svg width="860" height="148" viewBox="0 0 860 148" fill="none">
                  <defs>
                    <linearGradient id="lb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(185,160,255,.75)"/><stop offset="50%" stopColor="rgba(139,92,246,.68)"/><stop offset="100%" stopColor="rgba(90,50,200,.65)"/></linearGradient>
                    <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(167,139,250,.62)"/><stop offset="100%" stopColor="rgba(99,60,200,.58)"/></linearGradient>
                    <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(220,235,255,.22)"/><stop offset="35%" stopColor="rgba(180,210,255,.08)"/><stop offset="100%" stopColor="rgba(0,0,0,.18)"/></linearGradient>
                    <linearGradient id="wr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,.18)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></linearGradient>
                    <linearGradient id="tf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(210,195,255,.5)"/><stop offset="100%" stopColor="rgba(167,139,250,.3)"/></linearGradient>
                    <linearGradient id="rf" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(80,45,180,.7)"/><stop offset="100%" stopColor="rgba(60,30,150,.6)"/></linearGradient>
                    <radialGradient id="hl" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(255,245,190,1)"/><stop offset="50%" stopColor="rgba(255,220,100,.4)"/><stop offset="100%" stopColor="transparent"/></radialGradient>
                    <linearGradient id="mb" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(139,92,246,.18)"/><stop offset="100%" stopColor="transparent"/></linearGradient>
                    <radialGradient id="wh" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="rgba(70,50,140,.9)"/><stop offset="100%" stopColor="rgba(20,10,50,.98)"/></radialGradient>
                  </defs>
                  <rect x="-280" y="46" width="320" height="74" rx="6" fill="url(#mb)" opacity=".7"/>
                  <rect x="-180" y="60" width="220" height="42" rx="3" fill="url(#mb)" opacity=".4"/>
                  <polygon points="38,44 178,44 196,20 56,20" fill="url(#tf)" stroke="rgba(210,195,255,.25)" strokeWidth=".5"/>
                  <polygon points="0,82 38,46 38,118 0,120" fill="rgba(80,45,200,.75)" stroke="rgba(167,139,250,.25)" strokeWidth=".5"/>
                  <polygon points="0,82 38,46 38,56 4,84" fill="rgba(210,195,255,.22)"/>
                  <rect x="56" y="14" width="40" height="6" rx="2" fill="rgba(210,195,255,.2)" stroke="rgba(196,181,253,.2)" strokeWidth=".5"/>
                  <rect x="100" y="11" width="56" height="9" rx="2" fill="rgba(167,139,250,.25)" stroke="rgba(196,181,253,.2)" strokeWidth=".5"/>
                  <line x1="118" y1="20" x2="112" y2="5" stroke="rgba(196,181,253,.4)" strokeWidth="1.5"/>
                  <line x1="138" y1="20" x2="144" y2="5" stroke="rgba(196,181,253,.4)" strokeWidth="1.5"/>
                  <line x1="108" y1="5" x2="148" y2="5" stroke="rgba(196,181,253,.45)" strokeWidth="1.5"/>
                  <line x1="105" y1="9" x2="151" y2="9" stroke="rgba(196,181,253,.3)" strokeWidth="1"/>
                  <rect x="38" y="44" width="140" height="74" rx="7" fill="url(#lb)" stroke="rgba(196,181,253,.2)" strokeWidth=".5"/>
                  <polygon points="178,44 196,20 196,118 178,118" fill="url(#rf)" stroke="rgba(80,45,180,.2)" strokeWidth=".5"/>
                  <polygon points="4,68 36,50 36,100 4,108" fill="url(#wg)" stroke="rgba(200,220,255,.2)" strokeWidth=".5"/>
                  <polygon points="4,68 28,57 36,52 36,62 12,74" fill="url(#wr)"/>
                  {[44,90,136].map((wx,j)=>(<g key={j}><rect x={wx} y="52" width="36" height="44" rx="3" fill="url(#wg)" stroke="rgba(200,220,255,.22)" strokeWidth=".5"/><polygon points={`${wx},52 ${wx+26},52 ${wx+36},52 ${wx+20},60 ${wx},63`} fill="url(#wr)"/></g>))}
                  <rect x="38" y="100" width="140" height="5" rx="1" fill="rgba(210,195,255,.38)"/>
                  <rect x="30" y="118" width="148" height="10" rx="3" fill="rgba(40,20,90,.85)" stroke="rgba(167,139,250,.18)" strokeWidth=".5"/>
                  <circle cx="4" cy="82" r="11" fill="rgba(15,8,40,.9)" stroke="rgba(167,139,250,.3)" strokeWidth="1"/>
                  <circle cx="4" cy="82" r="7" fill="url(#hl)"/>
                  <circle cx="4" cy="82" r="18" fill="rgba(255,230,140,.06)"/>
                  {[[42,105,126],[120,183]].map((bxs,bi)=>(<g key={bi}><rect x={bxs[0]-2} y="125" width={bxs[bxs.length-1]-bxs[0]+16} height="10" rx="4" fill="rgba(30,15,70,.95)" stroke="rgba(167,139,250,.2)" strokeWidth=".5"/>{bxs.map(cx=>(<g key={cx}><circle cx={cx+7} cy="140" r="10" fill="url(#wh)" stroke="rgba(167,139,250,.55)" strokeWidth="1.5"/><circle cx={cx+7} cy="140" r="5" fill="rgba(120,90,220,.35)"/><circle cx={cx+7} cy="140" r="2" fill="rgba(210,195,255,.65)"/>{[0,60,120,180,240,300].map(a=>(<line key={a} x1={cx+7+Math.cos(a*Math.PI/180)*2.5} y1={140+Math.sin(a*Math.PI/180)*2.5} x2={cx+7+Math.cos(a*Math.PI/180)*8} y2={140+Math.sin(a*Math.PI/180)*8} stroke="rgba(167,139,250,.4)" strokeWidth=".8"/>))}</g>))}</g>))}
                  {[200,410,620].map((sx,ci)=>(<g key={ci}><polygon points={`${sx},50 ${sx+194},50 ${sx+210},26 ${sx+16},26`} fill="url(#tf)" stroke="rgba(210,195,255,.18)" strokeWidth=".5"/><polygon points={`${sx},50 ${sx+16},26 ${sx+16},118 ${sx},120`} fill="rgba(75,42,175,.65)" stroke="rgba(167,139,250,.15)" strokeWidth=".5"/><polygon points={`${sx+194},50 ${sx+210},26 ${sx+210},118 ${sx+194},120`} fill="rgba(70,38,170,.6)" stroke="rgba(167,139,250,.12)" strokeWidth=".5"/><rect x={sx} y="50" width="194" height="68" rx="5" fill="url(#cb)" stroke="rgba(196,181,253,.18)" strokeWidth=".5"/>{[0,1,2,3,4].map(j=>{ const wx=sx+10+j*38; return (<g key={j}><rect x={wx} y="58" width="30" height="38" rx="3" fill="url(#wg)" stroke="rgba(200,220,255,.2)" strokeWidth=".5"/><polygon points={`${wx},58 ${wx+22},58 ${wx+30},58 ${wx+16},66 ${wx},69`} fill="url(#wr)"/></g>); })}<rect x={sx} y="100" width="194" height="5" rx="1" fill="rgba(196,181,253,.3)"/><rect x={sx-2} y="118" width="198" height="10" rx="3" fill="rgba(40,20,90,.85)" stroke="rgba(167,139,250,.15)" strokeWidth=".5"/><line x1={sx+97} y1="50" x2={sx+97} y2="118" stroke="rgba(255,255,255,.06)" strokeWidth=".8"/>{ci>0&&<rect x={sx-6} y="78" width="7" height="14" rx="2" fill="rgba(80,50,180,.5)" stroke="rgba(167,139,250,.15)" strokeWidth=".5"/>}{[sx+18,sx+160].map(bx=>(<g key={bx}><rect x={bx} y="125" width="36" height="10" rx="4" fill="rgba(30,15,70,.95)" stroke="rgba(167,139,250,.18)" strokeWidth=".5"/>{[bx+6,bx+22].map(cx=>(<g key={cx}><circle cx={cx+2} cy="140" r="10" fill="url(#wh)" stroke="rgba(167,139,250,.5)" strokeWidth="1.5"/><circle cx={cx+2} cy="140" r="5" fill="rgba(110,80,210,.35)"/><circle cx={cx+2} cy="140" r="2" fill="rgba(210,195,255,.6)"/>{[0,60,120,180,240,300].map(a=>(<line key={a} x1={cx+2+Math.cos(a*Math.PI/180)*2.5} y1={140+Math.sin(a*Math.PI/180)*2.5} x2={cx+2+Math.cos(a*Math.PI/180)*8} y2={140+Math.sin(a*Math.PI/180)*8} stroke="rgba(167,139,250,.38)" strokeWidth=".8"/>))}</g>))}</g>))}</g>))}
                  <line x1="-40" y1="147" x2="900" y2="147" stroke="rgba(167,139,250,.3)" strokeWidth="2"/>
                  <line x1="-40" y1="143" x2="900" y2="143" stroke="rgba(167,139,250,.2)" strokeWidth="1.5"/>
                </svg>
              </div>
            </div>

          </div>
        </div>
  );
});

/* ─────────────────────────────────────────────────────────
   CSS
──────────────────────────────────────────────────────────*/
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body, #root { height:100%; }

  .rs-shell { height:100svh; position:relative; overflow:hidden; background:#020617; font-family:'DM Sans',sans-serif; }
  .rs-color-overlay { position:absolute; inset:0; z-index:0; pointer-events:none; transition:background 1.2s cubic-bezier(.4,0,.2,1); }
  .rs-bg {
    position:absolute; inset:0; pointer-events:none; z-index:0; overflow:hidden;
    will-change:transform; transition:transform 0.8s cubic-bezier(.22,1,.36,1);
  }
  .rs-bg::before {
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(ellipse 55% 45% at 20% 20%, rgba(99,102,241,.18) 0%,transparent 60%),
      radial-gradient(ellipse 45% 55% at 80% 10%, rgba(139,92,246,.14) 0%,transparent 55%),
      radial-gradient(ellipse 60% 45% at 50% 90%, rgba(59,130,246,.1)  0%,transparent 60%);
  }
  .rs-bg::after { content:''; position:absolute; inset:0; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect x='0.5' y='0.5' width='79' height='79' fill='none' stroke='rgba(255,255,255,.025)' stroke-width='0.5'/%3E%3C/svg%3E"); }
  .rs-track { position:absolute; left:0; right:0; height:1px; background:rgba(255,255,255,.03); pointer-events:none; z-index:0; }
  .rs-track::after { content:''; position:absolute; top:0; width:80px; height:1px; background:linear-gradient(90deg,transparent,rgba(167,139,250,.28),transparent); animation:rsTrack var(--td) linear infinite var(--tdd); }
  @keyframes rsTrack { from{left:-80px;} to{left:100%;} }
  .rs-stn { position:absolute; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:rgba(167,139,250,.06); white-space:nowrap; pointer-events:none; z-index:0; animation:rsStn var(--sd) linear infinite var(--sdd); }
  @keyframes rsStn { from{transform:translateX(110vw);} to{transform:translateX(-120vw);} }

  .rs-landscape {
    position:absolute; bottom:0; left:-8%; right:-8%;
    height:62%; pointer-events:none; z-index:0;
    -webkit-mask-image:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.2) 12%,rgba(0,0,0,.6) 28%,black 55%);
    mask-image:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.2) 12%,rgba(0,0,0,.6) 28%,black 55%);
  }
  .rs-ls-layer { position:absolute; left:-5%; right:-5%; bottom:0; transition:transform 0.9s cubic-bezier(.22,1,.36,1); will-change:transform; }
  .rs-ls-layer svg { display:block; width:110%; height:auto; }

  .rs-train-scene { position:absolute; bottom:0; left:0; right:0; height:260px; pointer-events:none; z-index:0; overflow:hidden; }
  .rs-track-3d-wrap { position:absolute; bottom:0; left:-15%; right:-15%; height:55%; perspective:320px; overflow:hidden; }
  .rs-track-3d-inner {
    position:absolute; bottom:0; left:0; right:0; height:100%;
    transform:rotateX(62deg); transform-origin:50% 100%;
    background:
      linear-gradient(90deg,
        transparent 0%, transparent calc(50% - 24px),
        rgba(167,139,250,.28) calc(50% - 24px), rgba(167,139,250,.28) calc(50% - 22px),
        transparent calc(50% - 22px), transparent calc(50% + 22px),
        rgba(167,139,250,.22) calc(50% + 22px), rgba(167,139,250,.22) calc(50% + 24px),
        transparent calc(50% + 24px), transparent 100%
      ),
      repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, rgba(255,255,255,.04) 10px, rgba(255,255,255,.04) 14px);
  }
  .rs-track-vanish { position:absolute; bottom:50%; left:50%; transform:translate(-50%,50%); width:300px; height:60px; background:radial-gradient(ellipse at center, rgba(167,139,250,.12) 0%, transparent 70%); }
  .rs-rail-flat { position:absolute; left:-5%; right:-5%; height:2px; background:rgba(167,139,250,.22); }
  .rs-rail-flat::after { content:''; position:absolute; top:8px; left:0; right:0; height:1.5px; background:rgba(167,139,250,.16); }
  .rs-sleepers-flat { position:absolute; left:-5%; right:-5%; background:repeating-linear-gradient(90deg, transparent 0, transparent 16px, rgba(255,255,255,.05) 16px, rgba(255,255,255,.05) 24px); }
  .rs-train-parallax { position:absolute; inset:0; transition:transform 0.9s cubic-bezier(.22,1,.36,1); will-change:transform; }
  .rs-train-slot { position:absolute; animation:rsTrain3d var(--tdur,30s) linear infinite var(--tdel,0s); will-change:transform; }
  @keyframes rsTrain3d { from { transform:translateX(110vw); } to { transform:translateX(-150vw); } }
  .rs-train-bob { animation:rsTrainBob3d 1.8s ease-in-out infinite; will-change:transform; }
  @keyframes rsTrainBob3d { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-3px); } }

  .rs-inner { position:absolute; inset:0; z-index:1; display:flex; flex-direction:column; overflow:hidden; }

  .rs-detail-layer {
    position:absolute; inset:0; z-index:50; overflow:hidden;
    background:#020617;
    animation:rsExpand var(--exp-dur,.42s) cubic-bezier(.32,.72,0,1) both;
    transform-origin: var(--exp-ox,50%) var(--exp-oy,50%);
  }
  @keyframes rsExpand { from { clip-path: inset(var(--exp-t) var(--exp-r) var(--exp-b) var(--exp-l) round 22px); } to { clip-path: inset(0% 0% 0% 0% round 0px); } }
  .rs-detail-layer.closing { animation:rsCollapse .35s cubic-bezier(.32,.72,0,1) both; }
  @keyframes rsCollapse { from { clip-path: inset(0% 0% 0% 0% round 0px); opacity:1; } to { clip-path: inset(var(--exp-t) var(--exp-r) var(--exp-b) var(--exp-l) round 22px); opacity:0; } }

  .rs-topbar { position:relative; z-index:10; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:rgba(139,92,246,.05); backdrop-filter:blur(48px) saturate(200%); -webkit-backdrop-filter:blur(48px) saturate(200%); border-bottom:1px solid rgba(167,139,250,.12); box-shadow:inset 0 1px 0 rgba(196,181,253,.15); }
  .rs-logo { display:flex; align-items:center; gap:9px; }
  .rs-logo-ico { width:34px; height:34px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(139,92,246,.25); border:1px solid rgba(167,139,250,.3); box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 2px 8px rgba(139,92,246,.2); position:relative; overflow:hidden; }
  .rs-logo-ico::after { content:''; position:absolute; inset:0; background:conic-gradient(from 0deg,transparent,rgba(167,139,250,.18),transparent); animation:rsLogoSpin 3s linear infinite; }
  @keyframes rsLogoSpin { to{transform:rotate(360deg);} }
  .rs-logo-ico svg { position:relative; z-index:1; }
  .rs-logo-name { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:rgba(255,255,255,.9); letter-spacing:-.02em; }
  .rs-logo-name span { color:#a78bfa; font-style:italic; }
  .rs-topbar-r { display:flex; align-items:center; gap:7px; flex-shrink:0; }
  .rs-add-btn { display:flex; align-items:center; gap:5px; background:rgba(139,92,246,.18); border:1px solid rgba(167,139,250,.25); border-radius:10px; padding:7px 10px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; color:rgba(196,181,253,.9); cursor:pointer; white-space:nowrap; flex-shrink:0; box-shadow:inset 0 1px 0 rgba(255,255,255,.1); transition:all .25s ease; }
  .rs-add-btn:hover { background:rgba(139,92,246,.32); transform:translateY(-1px); }
  .rs-add-btn:active { transform:scale(.96); }
  .rs-add-btn-txt { display:none; }
  .rs-user-pill { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); padding:5px 9px 5px 6px; border-radius:100px; box-shadow:inset 0 1px 0 rgba(255,255,255,.1); }
  .rs-user-av { width:22px; height:22px; border-radius:50%; background:rgba(139,92,246,.35); border:1px solid rgba(167,139,250,.3); display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:rgba(196,181,253,.9); font-family:'DM Sans',sans-serif; flex-shrink:0; }
  .rs-user-nm { font-size:12px; font-weight:500; color:rgba(255,255,255,.55); display:none; }
  .rs-logout { width:32px; height:32px; border-radius:9px; flex-shrink:0; background:rgba(239,68,68,.12); border:1px solid rgba(252,165,165,.18); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .25s ease; }
  .rs-logout:hover { background:rgba(239,68,68,.28); transform:scale(1.05); }
  @media(min-width:480px) { .rs-add-btn-txt{display:inline;} .rs-add-btn{padding:7px 12px;} .rs-user-nm{display:block;} .rs-topbar-r{gap:8px;} }

  .rs-content { flex:1; position:relative; overflow:hidden; }

  .rs-coverflow-view { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 0 80px; overflow:hidden; }
  .rs-hero { text-align:center; margin-bottom:14px; flex-shrink:0; padding:0 20px; animation:rsFadeUp .5s cubic-bezier(.22,1,.36,1) both; }
  .rs-eyebrow { font-size:10px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:rgba(167,139,250,.55); margin-bottom:6px; display:flex; align-items:center; justify-content:center; gap:8px; }
  .rs-eyebrow::before,.rs-eyebrow::after { content:''; width:14px; height:1px; background:rgba(167,139,250,.35); flex-shrink:0; }
  .rs-title { font-family:'Playfair Display',serif; font-size:clamp(20px,4.5vw,32px); font-weight:900; color:rgba(255,255,255,.9); line-height:1.05; letter-spacing:-.03em; }
  .rs-title em { font-style:italic; color:#a78bfa; }
  .rs-slide-counter { text-align:center; flex-shrink:0; margin-bottom:6px; font-size:11px; font-weight:600; letter-spacing:.08em; color:rgba(255,255,255,.22); font-family:'DM Sans',sans-serif; transition:all .3s ease; }
  .rs-slide-counter span { color:rgba(167,139,250,.7); }

  .rs-swiper-wrap { position:relative; width:100%; flex:1; min-height:0; }
  .rs-swiper { width:100% !important; height:100% !important; padding:16px 0 36px !important; }
  .swiper-slide { width:auto !important; }

  @keyframes rsShimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  .rs-card::before {
    content:''; position:absolute; inset:0; z-index:4; pointer-events:none; border-radius:22px;
    background:linear-gradient(105deg,transparent 20%,rgba(196,181,253,.04) 35%,rgba(167,139,250,.09) 45%,rgba(220,210,255,.07) 50%,rgba(167,139,250,.09) 55%,rgba(196,181,253,.04) 65%,transparent 80%);
    background-size:200% 100%; animation:rsShimmer 5s linear infinite; mix-blend-mode:screen;
  }

  .rs-card {
    width: clamp(185px, 52vw, 265px);
    aspect-ratio: 9 / 14;
    border-radius: 22px; overflow:hidden; position:relative; cursor:pointer;
    background:rgba(139,92,246,.06);
    border:1px solid rgba(167,139,250,.22);
    box-shadow: inset 0 1.5px 0 rgba(196,181,253,.3), 0 24px 60px rgba(0,0,0,.5), inset 0 0 0 0.5px rgba(167,139,250,.08);
    transition: box-shadow .3s ease, transform .15s ease;
    user-select:none; -webkit-user-select:none;
  }
  .rs-card:active { transform:scale(.97); }
  .rs-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,1,.36,1); }
  .rs-card:hover img { transform:scale(1.05); }
  .rs-card-ph { position:absolute; inset:0; }
  .rs-card-frost { position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,transparent,rgba(196,181,253,.45),rgba(220,210,255,.6),rgba(196,181,253,.45),transparent); z-index:3; }
  .rs-card-ov-top { position:absolute; top:0; left:0; right:0; height:38%; background:linear-gradient(to bottom,rgba(2,6,23,.55) 0%,transparent 100%); z-index:2; }
  .rs-card-ov-bot { position:absolute; bottom:0; left:0; right:0; height:58%; background:linear-gradient(to top,rgba(2,6,23,.96) 0%,rgba(2,6,23,.5) 55%,transparent 100%); z-index:2; }
  .rs-card-body { position:absolute; bottom:0; left:0; right:0; padding:18px 16px 20px; z-index:3; }
  .rs-card-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(167,139,250,.18); border:1px solid rgba(167,139,250,.25); backdrop-filter:blur(8px); color:rgba(196,181,253,.9); font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:3px 8px; border-radius:100px; margin-bottom:7px; font-family:'DM Sans',sans-serif; width:fit-content; }
  .rs-card-name { font-family:'Playfair Display',serif; font-size:clamp(15px,3.5vw,20px); font-weight:900; color:rgba(255,255,255,.95); letter-spacing:-.02em; margin-bottom:5px; line-height:1.15; }
  .rs-card-loc { display:flex; align-items:center; gap:4px; font-size:11px; color:rgba(255,255,255,.38); font-family:'DM Sans',sans-serif; }

  .swiper-slide-active .rs-card { animation: rsBreathe 3.5s ease-in-out infinite; will-change: box-shadow; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  @keyframes rsBreathe {
    0%,100% { box-shadow: inset 0 1.5px 0 rgba(196,181,253,.3), 0 24px 60px rgba(0,0,0,.5), 0 0 0 0 rgba(139,92,246,.0); }
    50%      { box-shadow: inset 0 1.5px 0 rgba(196,181,253,.4), 0 32px 80px rgba(0,0,0,.45), 0 0 40px 10px rgba(139,92,246,.2); }
  }
  .swiper-slide-active .rs-card img { animation: rsBreathImg 3.5s ease-in-out infinite; will-change: transform; }
  @keyframes rsBreathImg { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
  .swiper-slide-active .rs-card:active { animation:none; transform:scale(.97); }

  .rs-card-tap { position:absolute; bottom:20px; right:14px; z-index:4; width:30px; height:30px; border-radius:50%; background:rgba(139,92,246,.1); backdrop-filter:blur(14px); border:1px solid rgba(167,139,250,.24); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .3s ease; pointer-events:none; }
  .swiper-slide-active .rs-card-tap { opacity:1; animation:rsPulse 2.5s ease-in-out infinite 1s; }
  @keyframes rsPulse { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.35);} 50%{box-shadow:0 0 0 8px rgba(167,139,250,0);} }

  .rs-card-occ-badge { position:absolute; top:12px; right:12px; z-index:5; display:flex; align-items:center; gap:4px; background:rgba(220,38,38,.82); backdrop-filter:blur(8px); border:1px solid rgba(255,150,150,.3); border-radius:100px; padding:3px 8px 3px 5px; font-family:'DM Sans',sans-serif; font-size:9px; font-weight:700; color:#fff; letter-spacing:.04em; animation:rsBadgePop .4s cubic-bezier(.22,1,.36,1) both, rsBadgeGlow 2s ease-in-out infinite 1s; }
  @keyframes rsBadgePop { from{opacity:0;transform:scale(.5);} to{opacity:1;transform:scale(1);} }
  @keyframes rsBadgeGlow { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4);} 50%{box-shadow:0 0 0 6px rgba(220,38,38,0);} }

  .rs-swiper .swiper-pagination { bottom:8px !important; }
  .rs-swiper .swiper-pagination-bullet { width:5px; height:5px; background:rgba(255,255,255,.22); opacity:1; transition:all .3s ease; }
  .rs-swiper .swiper-pagination-bullet-active { background:#a78bfa; width:18px; border-radius:3px; }

  .rs-nav-arrows { position:absolute; top:50%; left:0; right:0; display:flex; justify-content:space-between; padding:0 6px; transform:translateY(-60%); z-index:5; pointer-events:none; }
  .rs-nav-btn { width:36px; height:36px; border-radius:50%; border:none; background:rgba(139,92,246,.07); backdrop-filter:blur(20px); border:1px solid rgba(167,139,250,.16); box-shadow:inset 0 1px 0 rgba(196,181,253,.2); display:flex; align-items:center; justify-content:center; cursor:pointer; pointer-events:all; color:rgba(196,181,253,.6); transition:all .2s ease; }
  .rs-nav-btn:hover { background:rgba(139,92,246,.25); color:#a78bfa; transform:scale(1.1); }
  .rs-nav-btn:active { transform:scale(.94); }
  @media(hover:none) { .rs-nav-arrows{display:none;} }

  .rs-map { position:absolute; inset:0; z-index:0; }

  .rs-botnav { position:absolute; bottom:0; left:0; right:0; z-index:20; padding:0 16px calc(14px + env(safe-area-inset-bottom,0px)); display:flex; justify-content:center; align-items:flex-end; gap:10px; background:linear-gradient(to top,rgba(2,6,23,.45) 0%,transparent 100%); }
  .rs-botnav-inner { display:flex; align-items:center; padding:5px; gap:3px; border-radius:22px; width:min(260px,72vw); background:rgba(139,92,246,.08); backdrop-filter:blur(56px) saturate(240%); -webkit-backdrop-filter:blur(56px) saturate(240%); border:1px solid rgba(167,139,250,.18); box-shadow:inset 0 1px 0 rgba(196,181,253,.25),0 8px 32px rgba(0,0,0,.4); }
  .rs-nb { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; border-radius:17px; border:none; background:transparent; cursor:pointer; transition:all .25s ease; font-family:'DM Sans',sans-serif; -webkit-tap-highlight-color:transparent; }
  .rs-nb:hover { background:rgba(255,255,255,.05); }
  .rs-nb:active { transform:scale(.94); transition-duration:.1s; }
  .rs-nb.on { background:rgba(139,92,246,.2); border:1px solid rgba(167,139,250,.2); box-shadow:inset 0 1px 0 rgba(255,255,255,.12); transform:scale(1.04); }
  .rs-nb-ico { color:rgba(255,255,255,.28); display:flex; transition:color .25s ease; }
  .rs-nb.on .rs-nb-ico { color:#a78bfa; }
  .rs-nb-lbl { font-size:10px; font-weight:600; letter-spacing:.04em; color:rgba(255,255,255,.28); transition:color .25s ease; font-family:'DM Sans',sans-serif; }
  .rs-nb.on .rs-nb-lbl { color:#a78bfa; }
  .rs-nb-search { width:52px; height:52px; flex-shrink:0; border-radius:50%; border:none; background:rgba(139,92,246,.08); backdrop-filter:blur(56px) saturate(240%); -webkit-backdrop-filter:blur(56px) saturate(240%); border:1px solid rgba(167,139,250,.18); box-shadow:inset 0 1px 0 rgba(196,181,253,.25),0 8px 32px rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .25s ease; color:rgba(196,181,253,.5); -webkit-tap-highlight-color:transparent; }
  .rs-nb-search:hover { color:rgba(255,255,255,.8); transform:scale(1.08); }
  .rs-nb-search:active { transform:scale(.92); transition-duration:.1s; }
  .rs-nb-search.on { background:rgba(139,92,246,.25); border-color:rgba(167,139,250,.3); color:#a78bfa; box-shadow:inset 0 1px 0 rgba(196,181,253,.25),0 8px 32px rgba(0,0,0,.4),0 0 0 3px rgba(139,92,246,.15); }

  .rs-search-overlay { position:absolute; left:50%; bottom:90px; transform:translateX(-50%); width:min(520px,94vw); z-index:15; background:rgba(10,5,25,.72); backdrop-filter:blur(56px) saturate(220%); -webkit-backdrop-filter:blur(56px) saturate(220%); border:1px solid rgba(167,139,250,.14); border-radius:22px; box-shadow:inset 0 1px 0 rgba(196,181,253,.2),0 24px 60px rgba(0,0,0,.55); overflow:hidden; animation:rsPopUp .28s cubic-bezier(.22,1,.36,1); max-height:60vh; display:flex; flex-direction:column; }
  @keyframes rsPopUp { from{opacity:0;transform:translateX(-50%) translateY(12px) scale(.97);} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1);} }
  .rs-search-box { display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.07); flex-shrink:0; }
  .rs-search-box input { flex:1; background:transparent; border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:15px; color:rgba(255,255,255,.88); }
  .rs-search-box input::placeholder { color:rgba(255,255,255,.22); }
  .rs-search-clear { background:rgba(255,255,255,.08); border:none; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; color:rgba(255,255,255,.45); transition:background .2s; }
  .rs-search-clear:hover { background:rgba(255,255,255,.15); }
  .rs-search-results { overflow-y:auto; flex:1; scrollbar-width:none; padding:8px; }
  .rs-search-results::-webkit-scrollbar { display:none; }
  .rs-search-result { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:14px; cursor:pointer; transition:all .18s ease; animation:rsFadeUp .25s cubic-bezier(.22,1,.36,1) both; animation-delay:var(--ri,.0s); }
  .rs-search-result:hover { background:rgba(255,255,255,.07); transform:translateX(3px); }
  .rs-search-result:active { transform:scale(.98); }
  .rs-search-result-img { width:46px; height:46px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid rgba(255,255,255,.08); }
  .rs-search-result-ph { width:46px; height:46px; border-radius:10px; flex-shrink:0; border:1px solid rgba(255,255,255,.08); background:linear-gradient(135deg,#1a0c2a,#0d1a2e); }
  .rs-search-result-name { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:rgba(255,255,255,.88); letter-spacing:-.01em; margin-bottom:2px; }
  .rs-search-result-sub { font-size:11px; color:rgba(255,255,255,.3); font-family:'DM Sans',sans-serif; }
  .rs-search-empty { text-align:center; padding:28px 0; font-size:13px; color:rgba(255,255,255,.22); font-family:'DM Sans',sans-serif; }

  .rs-loading { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .rs-spin { width:28px; height:28px; border:2.5px solid rgba(167,139,250,.15); border-top-color:rgba(167,139,250,.7); border-radius:50%; animation:rsSpin .8s linear infinite; }
  @keyframes rsSpin { to{transform:rotate(360deg);} }
  .rs-loading-txt { font-family:'DM Sans',sans-serif; font-size:13px; color:rgba(255,255,255,.25); letter-spacing:.05em; }

  @keyframes rsFadeUp { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
  @media(min-width:640px) { .rs-topbar{padding:12px 28px;} .rs-botnav{padding:0 28px calc(16px + env(safe-area-inset-bottom,0px));} }
`;

const TRACKS   = [18,33,50,67,83];
const DURS     = [7,11,9,13,8];
const STNS     = ['Lisboa Oriente','Porto Campanhã','Aveiro · Coimbra-B','Faro · Setúbal','Entroncamento · Sintra','Viana · Évora'];
const STN_DUR  = [16,22,18,14,20,17];
const BG_GRADS = ['#12062a,#1e0d40','#06141a,#0d2a35','#0a0a1f,#15153d','#1a1000,#332000','#160618,#2a0d30','#071414,#0e2828'];

function Home({ user, setUser }) {
  const navigate   = useNavigate();
  const swiperEl   = useRef(null);
  const swiperObj  = useRef(null);
  const imgRefs    = useRef({});
  const bgRef      = useRef(null);
  const cardRefs   = useRef({});
  const detailRef  = useRef(null);
  const trainRef   = useRef(null);
  const lsfarRef   = useRef(null);
  const lsmidRef   = useRef(null);
  const lsnearRef  = useRef(null);
  const savedIdx   = useRef(parseInt(sessionStorage.getItem('rs_slide_idx') || '0', 10));

  // O useState do user desapareceu daqui!
  
  const [stations, setStations]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('list');
  const [selected, setSelected]     = useState(null);
  const [closing, setClosing]       = useState(false);
  const [activeIdx, setActiveIdx]   = useState(() => parseInt(sessionStorage.getItem('rs_slide_idx') || '0', 10));
  const [bgColor, setBgColor]       = useState('rgba(90,60,170,.18)');
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ]                   = useState('');
  const [occCounts, setOccCounts]   = useState({});


  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/stations`).then(r=>r.json()).then(d=>{ setStations(d); setLoading(false); }).catch(()=>setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!stations.length) return;
    stations.forEach(s => {
      fetch(`${API_URL}/api/occurrences/${s.id}`).then(r=>r.json()).then(data => {
        if (Array.isArray(data) && data.length > 0) setOccCounts(prev => ({ ...prev, [s.id]: data.length }));
      }).catch(() => {});
    });
  }, [stations]);

  const updateBg = useCallback((idx) => {
    const [r, g, b] = PALETTE[idx % PALETTE.length];
    const dr = Math.round(r * .38), dg = Math.round(g * .38), db = Math.round(b * .38);
    setBgColor(`radial-gradient(ellipse 85% 65% at 50% 40%,rgba(${dr},${dg},${db},.62) 0%,transparent 70%)`);
  }, []);

  useEffect(() => {
    if (loading || tab!=='list' || !stations.length) return;
    const timer = setTimeout(() => {
      const el = swiperEl.current;
      if (!el || !window.Swiper) return;
      if (swiperObj.current) { swiperObj.current.destroy(true, true); swiperObj.current = null; }
      swiperObj.current = new window.Swiper(el, {
        effect: 'coverflow', grabCursor: true, centeredSlides: true, slidesPerView: 'auto',
        initialSlide: savedIdx.current, keyboard: { enabled: true },
        coverflowEffect: { rotate:40, stretch:0, depth:175, modifier:1.15, slideShadows:false },
        pagination: { el: el.querySelector('.swiper-pagination'), clickable:true },
        on: {
          slideChange(sw) {
            savedIdx.current = sw.realIndex;
            sessionStorage.setItem('rs_slide_idx', sw.realIndex);
            setActiveIdx(sw.realIndex);
            updateBg(sw.realIndex);
            if (bgRef.current) {
              const total = stations.length - 1 || 1, pct = sw.realIndex / total;
              bgRef.current.style.transform = `translate(${(pct-.5)*-60}px,${Math.sin(pct*Math.PI)*-18}px) scale(1.08)`;
            }
            const total2 = stations.length - 1 || 1, pct2 = sw.realIndex / total2, base = pct2 - .5;
            if (lsfarRef.current)  lsfarRef.current.style.transform  = `translateX(${base * -35}px)`;
            if (lsmidRef.current)  lsmidRef.current.style.transform  = `translateX(${base * -70}px)`;
            if (lsnearRef.current) lsnearRef.current.style.transform = `translateX(${base * -110}px)`;
            if (trainRef.current)  trainRef.current.style.transform  = `translateX(${base * 120}px)`;
          },
          afterInit(sw) {
            savedIdx.current = sw.realIndex;
            sessionStorage.setItem('rs_slide_idx', sw.realIndex);
            updateBg(sw.realIndex);
          },
        },
      });
    }, 80);
    return () => { clearTimeout(timer); if (swiperObj.current) { swiperObj.current.destroy(true,true); swiperObj.current=null; } };
  }, [loading, tab, stations, updateBg]);

  const openStation = useCallback((s) => {
    const cardEl = cardRefs.current[s.id];
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
      const shell = cardEl.closest('.rs-shell');
      if (shell) {
        shell.style.setProperty('--exp-t', `${(rect.top/vh*100).toFixed(2)}%`);
        shell.style.setProperty('--exp-r', `${((vw-rect.right)/vw*100).toFixed(2)}%`);
        shell.style.setProperty('--exp-b', `${((vh-rect.bottom)/vh*100).toFixed(2)}%`);
        shell.style.setProperty('--exp-l', `${(rect.left/vw*100).toFixed(2)}%`);
        shell.style.setProperty('--exp-dur', '.42s');
      }
    }
    setClosing(false); setSelected(s);
  }, []);

  const closeStation = useCallback(() => {
    setClosing(true); setTimeout(() => { setClosing(false); setSelected(null); }, 340);
  }, []);

  const handleLogin  = (u,t) => { localStorage.setItem('token',t); localStorage.setItem('user',JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setStations([]); };
  const filtered = useMemo(() => q.trim() ? stations.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || (s.description||'').toLowerCase().includes(q.toLowerCase())) : stations, [stations, q]);
  const initials = useMemo(() => user?.name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || 'U', [user]);

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <>
      <style>{CSS}</style>
      <div className="rs-shell">
        <div className="rs-bg" ref={bgRef} />
        <div className="rs-color-overlay" style={{ background: bgColor }} />

        {TRACKS.map((top,i)=>(<div key={i} className="rs-track" style={{top:`${top}%`,'--td':`${DURS[i]}s`,'--tdd':`${-i*1.5}s`}}/>))}
        {STNS.map((s,i)=>(<div key={i} className="rs-stn" style={{top:`${8+i*15}%`,'--sd':`${STN_DUR[i]}s`,'--sdd':`${-i*3}s`}}>{s}</div>))}

        <div className="rs-landscape">
          <LandscapeFar refProp={lsfarRef} />
          <LandscapeMid refProp={lsmidRef} />
          <LandscapeNear refProp={lsnearRef} />
        </div>
        <TrainScene refProp={trainRef} />

        {selected && (
          <div ref={detailRef} className={`rs-detail-layer${closing?' closing':''}`}>
            <StationDetails station={selected} onBack={closeStation} />
          </div>
        )}

        <div className="rs-inner">
          {tab !== 'map' && (
            <header className="rs-topbar">
              <div className="rs-logo">
                <div className="rs-logo-ico"><Train size={17} color="rgba(196,181,253,.9)" /></div>
                <div className="rs-logo-name">Rail<span>Spot</span></div>
              </div>
              <div className="rs-topbar-r">
                {user?.is_admin && (
                  <>
                    <button className="rs-add-btn" onClick={() => navigate('/admin/dashboard')} style={{ marginRight: '4px' }}>
                      <BarChart3 size={13} /><span className="rs-add-btn-txt">Estatísticas</span>
                    </button>
                    <button className="rs-add-btn" onClick={()=>navigate('/admin/add')}>
                      <PlusCircle size={13} /><span className="rs-add-btn-txt">Nova estação</span>
                    </button>
                  </>
                )}
                <div 
                  className="rs-user-pill cursor-pointer hover:bg-white/10 transition-colors" 
                  onClick={() => navigate('/profile')}
                  title="Ver o meu perfil"
                >
                  <div className="rs-user-av">{initials}</div>
                  <span className="rs-user-nm">{user?.name?.split(' ')}</span>
                </div>
                <button className="rs-logout" onClick={handleLogout} title="Sair">
                  <LogOut size={14} color="rgba(252,165,165,.8)" />
                </button>
              </div>
            </header>
          )}

          <div className="rs-content">
            {tab === 'list' && (
              loading ? (
                <div className="rs-loading"><div className="rs-spin" /><span className="rs-loading-txt">A carregar estações…</span></div>
              ) : (
                <div className="rs-coverflow-view">
                  <div className="rs-hero">
                    <div className="rs-eyebrow">Rede Ferroviária Nacional</div>
                    <h1 className="rs-title">Descobre <em>Portugal</em></h1>
                  </div>
                  <div className="rs-slide-counter"><span>{activeIdx + 1}</span> / {stations.length}</div>
                  <div className="rs-swiper-wrap">
                    <div className="swiper rs-swiper" ref={swiperEl}>
                      <div className="swiper-wrapper">
                        {stations.map((s, i) => (
                          <div key={s.id} className="swiper-slide">
                            <div className="rs-card" ref={el => { if (el) cardRefs.current[s.id] = el; }} onClick={() => openStation(s)}>
                              {s.image_url ? (
                                <img ref={el => { if (el) imgRefs.current[s.id] = el; }} src={s.image_url} alt={s.name} />
                              ) : (
                                <div className="rs-card-ph" style={{ background:`linear-gradient(160deg,${BG_GRADS[i%BG_GRADS.length]})` }} />
                              )}
                              <div className="rs-card-frost" />
                              <div className="rs-card-ov-top" />
                              <div className="rs-card-ov-bot" />
                              {occCounts[s.id] > 0 && (<div className="rs-card-occ-badge"><TriangleAlert size={9} />{occCounts[s.id]} ocorr.</div>)}
                              <div className="rs-card-body">
                                <div className="rs-card-badge">{getLine(s.name)}</div>
                                <div className="rs-card-name">{s.name}</div>
                                <div className="rs-card-loc"><MapPin size={10} /> Portugal</div>
                              </div>
                              <div className="rs-card-tap">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="swiper-pagination"></div>
                    </div>
                    <div className="rs-nav-arrows">
                      <button className="rs-nav-btn" onClick={() => swiperObj.current?.slidePrev()}><ChevronLeft size={16} /></button>
                      <button className="rs-nav-btn" onClick={() => swiperObj.current?.slideNext()}><ChevronRight size={16} /></button>
                    </div>
                  </div>
                </div>
              )
            )}
            {tab === 'map' && (<div className="rs-map"><StationMap stations={stations} onStationSelect={openStation} /></div>)}
          </div>

          {searchOpen && (
            <div className="rs-search-overlay">
              <div className="rs-search-box">
                <Search size={16} color="rgba(167,139,250,.5)" style={{ flexShrink:0 }} />
                <input autoFocus placeholder="Pesquisar estação…" value={q} onChange={e => setQ(e.target.value)} inputMode="search" />
                {q && (<button className="rs-search-clear" onClick={() => setQ('')}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>)}
              </div>
              <div className="rs-search-results">
                {filtered.length === 0 && <div className="rs-search-empty">Nenhuma estação encontrada.</div>}
                {filtered.map((s, i) => (
                  <div key={s.id} className="rs-search-result" style={{ '--ri': `${i * 0.05}s` }} onClick={() => { setSearchOpen(false); setQ(''); openStation(s); }}>
                    {s.image_url ? <img src={s.image_url} alt={s.name} className="rs-search-result-img" /> : <div className="rs-search-result-ph" />}
                    <div>
                      <div className="rs-search-result-name">{s.name}</div>
                      <div className="rs-search-result-sub">{getLine(s.name)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rs-botnav">
            <div className="rs-botnav-inner">
              <button className={`rs-nb ${tab==='list'&&!searchOpen?'on':''}`} onClick={()=>{ setSearchOpen(false); setTab('list'); }}>
                <span className="rs-nb-ico"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg></span>
                <span className="rs-nb-lbl">Estações</span>
              </button>
              <button className={`rs-nb ${tab==='map'&&!searchOpen?'on':''}`} onClick={()=>{ setSearchOpen(false); setTab('map'); }}>
                <span className="rs-nb-ico"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg></span>
                <span className="rs-nb-lbl">Mapa</span>
              </button>
            </div>
            <button className={`rs-nb-search ${searchOpen?'on':''}`} onClick={() => { setSearchOpen(v=>!v); if (searchOpen) setQ(''); }}>
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // 1. 🟢 ESTADO GLOBAL: O App agora é o "dono" da informação do utilizador
  const [user, setUser] = useState(() => {
    try { 
      const u = localStorage.getItem('user'); 
      const t = localStorage.getItem('token'); 
      return u && t ? JSON.parse(u) : null; 
    } catch { return null; }
  });

  // 2. 🟢 OUVINTE DE EVENTOS: O App fica à escuta do Profile
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
      } catch (e) {
        console.error("Erro ao atualizar user via evento", e);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // (O teu código original do offline mantém-se)
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline  = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:9999,
          background:'rgba(200,30,30,.92)', backdropFilter:'blur(8px)',
          color:'#fff', textAlign:'center', padding:'10px 16px',
          fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans',sans-serif",
          letterSpacing:'.02em', boxShadow:'0 2px 12px rgba(0,0,0,.4)',
          borderBottom:'1px solid rgba(255,100,100,.3)',
        }}>
          ⚠️ Sem ligação à rede. A mostrar dados guardados offline.
        </div>
      )}
      <div style={isOffline ? { paddingTop:'42px' } : {}}>
        <Router>
          <Routes>
            {/* 3. 🟢 PASSAGEM DE PROPS: O App envia o user para a Home */}
            <Route path="/"               element={<Home user={user} setUser={setUser} />} />
            <Route path="/profile"        element={<Profile />} />
            <Route path="/admin/add"      element={<AddStation />} />
            <Route path="/admin/edit/:id" element={<EditStation />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;