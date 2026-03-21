/**
 * index.html — adiciona dentro de <head>:
 *   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
 * e antes de </body>:
 *   <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, Train, MapPin, ChevronLeft, ChevronRight, Search, X, TriangleAlert } from 'lucide-react';

import StationMap     from './components/StationMap';
import StationDetails from './components/StationDetails';
import AuthScreen     from './components/AuthScreen';
import AddStation     from './components/AddStation';
import EditStation    from './components/EditStation';

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

  .rs-inner { position:absolute; inset:0; z-index:1; display:flex; flex-direction:column; overflow:hidden; }

  /* ── 4. SHARED ELEMENT TRANSITION ──
     The detail layer starts clipped to the card rect then expands to full screen */
  .rs-detail-layer {
    position:absolute; inset:0; z-index:50; overflow:hidden;
    background:#f8fafc;
    animation:rsExpand var(--exp-dur,.42s) cubic-bezier(.32,.72,0,1) both;
    transform-origin: var(--exp-ox,50%) var(--exp-oy,50%);
  }
  @keyframes rsExpand {
    from { clip-path: inset(var(--exp-t) var(--exp-r) var(--exp-b) var(--exp-l) round 22px); }
    to   { clip-path: inset(0% 0% 0% 0% round 0px); }
  }
  /* Reverse — closing the detail */
  .rs-detail-layer.closing {
    animation:rsCollapse .35s cubic-bezier(.32,.72,0,1) both;
  }
  @keyframes rsCollapse {
    from { clip-path: inset(0% 0% 0% 0% round 0px); opacity:1; }
    to   { clip-path: inset(var(--exp-t) var(--exp-r) var(--exp-b) var(--exp-l) round 22px); opacity:0; }
  }

  /* TOPBAR */
  .rs-topbar { position:relative; z-index:10; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:rgba(255,255,255,.04); backdrop-filter:blur(24px) saturate(160%); -webkit-backdrop-filter:blur(24px) saturate(160%); border-bottom:1px solid rgba(255,255,255,.07); box-shadow:inset 0 1px 0 rgba(255,255,255,.09); }
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

  /* COVERFLOW VIEW */
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

  /* ── CARD ── */
  .rs-card {
    width: clamp(185px, 52vw, 265px);
    aspect-ratio: 9 / 14;
    border-radius: 22px; overflow:hidden; position:relative; cursor:pointer;
    background:rgba(15,10,30,.65);
    border:1px solid rgba(255,255,255,.13);
    box-shadow: inset 0 1.5px 0 rgba(255,255,255,.2), 0 24px 60px rgba(0,0,0,.55);
    transition: box-shadow .3s ease, transform .15s ease;
    user-select:none; -webkit-user-select:none;
  }
  .rs-card:active { transform:scale(.97); }
  .rs-card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,1,.36,1); }
  .rs-card:hover img { transform:scale(1.05); }
  .rs-card-ph { position:absolute; inset:0; }
  .rs-card-frost { position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent); z-index:3; }
  .rs-card-ov-top { position:absolute; top:0; left:0; right:0; height:38%; background:linear-gradient(to bottom,rgba(2,6,23,.55) 0%,transparent 100%); z-index:2; }
  .rs-card-ov-bot { position:absolute; bottom:0; left:0; right:0; height:58%; background:linear-gradient(to top,rgba(2,6,23,.96) 0%,rgba(2,6,23,.5) 55%,transparent 100%); z-index:2; }
  .rs-card-body { position:absolute; bottom:0; left:0; right:0; padding:18px 16px 20px; z-index:3; }
  .rs-card-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(167,139,250,.18); border:1px solid rgba(167,139,250,.25); backdrop-filter:blur(8px); color:rgba(196,181,253,.9); font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:3px 8px; border-radius:100px; margin-bottom:7px; font-family:'DM Sans',sans-serif; width:fit-content; }
  .rs-card-name { font-family:'Playfair Display',serif; font-size:clamp(15px,3.5vw,20px); font-weight:900; color:rgba(255,255,255,.95); letter-spacing:-.02em; margin-bottom:5px; line-height:1.15; }
  .rs-card-loc { display:flex; align-items:center; gap:4px; font-size:11px; color:rgba(255,255,255,.38); font-family:'DM Sans',sans-serif; }

  /* 1. BREATHE — only shadow pulses, scale is imperceptible to text */
  .swiper-slide-active .rs-card {
    animation: rsBreathe 3.5s ease-in-out infinite;
    /* Force GPU compositing so text stays crisp */
    will-change: box-shadow;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  @keyframes rsBreathe {
    0%,100% { box-shadow: inset 0 1.5px 0 rgba(255,255,255,.2), 0 24px 60px rgba(0,0,0,.55), 0 0 0 0 rgba(139,92,246,.0); }
    50%      { box-shadow: inset 0 1.5px 0 rgba(255,255,255,.3), 0 32px 80px rgba(0,0,0,.5), 0 0 40px 8px rgba(139,92,246,.18); }
  }
  /* The image zooms slightly instead of the whole card */
  .swiper-slide-active .rs-card img {
    animation: rsBreathImg 3.5s ease-in-out infinite;
    will-change: transform;
  }
  @keyframes rsBreathImg {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.03); }
  }
  /* Stop on click */
  .swiper-slide-active .rs-card:active { animation:none; transform:scale(.97); }

  /* Pulsing arrow */
  .rs-card-tap { position:absolute; bottom:20px; right:14px; z-index:4; width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.1); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .3s ease; pointer-events:none; }
  .swiper-slide-active .rs-card-tap { opacity:1; animation:rsPulse 2.5s ease-in-out infinite 1s; }
  @keyframes rsPulse { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.35);} 50%{box-shadow:0 0 0 8px rgba(167,139,250,0);} }

  /* 3. OCCURRENCES BADGE */
  .rs-card-occ-badge {
    position:absolute; top:12px; right:12px; z-index:5;
    display:flex; align-items:center; gap:4px;
    background:rgba(220,38,38,.82);
    backdrop-filter:blur(8px);
    border:1px solid rgba(255,150,150,.3);
    border-radius:100px; padding:3px 8px 3px 5px;
    font-family:'DM Sans',sans-serif; font-size:9px; font-weight:700;
    color:#fff; letter-spacing:.04em;
    animation:rsBadgeIn .4s cubic-bezier(.22,1,.36,1) both;
    box-shadow: 0 0 0 0 rgba(220,38,38,.5);
    animation:rsBadgePop .4s cubic-bezier(.22,1,.36,1) both, rsBadgeGlow 2s ease-in-out infinite 1s;
  }
  @keyframes rsBadgePop { from{opacity:0;transform:scale(.5);} to{opacity:1;transform:scale(1);} }
  @keyframes rsBadgeGlow { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4);} 50%{box-shadow:0 0 0 6px rgba(220,38,38,0);} }

  /* Swiper pagination */
  .rs-swiper .swiper-pagination { bottom:8px !important; }
  .rs-swiper .swiper-pagination-bullet { width:5px; height:5px; background:rgba(255,255,255,.22); opacity:1; transition:all .3s ease; }
  .rs-swiper .swiper-pagination-bullet-active { background:#a78bfa; width:18px; border-radius:3px; }

  /* Nav arrows */
  .rs-nav-arrows { position:absolute; top:50%; left:0; right:0; display:flex; justify-content:space-between; padding:0 6px; transform:translateY(-60%); z-index:5; pointer-events:none; }
  .rs-nav-btn { width:36px; height:36px; border-radius:50%; border:none; background:rgba(255,255,255,.07); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.12); box-shadow:inset 0 1px 0 rgba(255,255,255,.15); display:flex; align-items:center; justify-content:center; cursor:pointer; pointer-events:all; color:rgba(255,255,255,.55); transition:all .2s ease; }
  .rs-nav-btn:hover { background:rgba(139,92,246,.25); color:#a78bfa; transform:scale(1.1); }
  .rs-nav-btn:active { transform:scale(.94); }
  @media(hover:none) { .rs-nav-arrows{display:none;} }

  .rs-map { position:absolute; inset:0; z-index:0; }

  /* BOTTOM NAV */
  .rs-botnav { position:absolute; bottom:0; left:0; right:0; z-index:20; padding:0 16px calc(14px + env(safe-area-inset-bottom,0px)); display:flex; justify-content:center; align-items:flex-end; gap:10px; background:linear-gradient(to top,rgba(2,6,23,.45) 0%,transparent 100%); }
  .rs-botnav-inner { display:flex; align-items:center; padding:5px; gap:3px; border-radius:22px; width:min(260px,72vw); background:rgba(15,10,30,.85); backdrop-filter:blur(40px) saturate(180%); -webkit-backdrop-filter:blur(40px) saturate(180%); border:1px solid rgba(255,255,255,.1); box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 32px rgba(0,0,0,.55); }
  .rs-nb { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 6px; border-radius:17px; border:none; background:transparent; cursor:pointer; transition:all .25s ease; font-family:'DM Sans',sans-serif; -webkit-tap-highlight-color:transparent; }
  .rs-nb:hover { background:rgba(255,255,255,.05); }
  .rs-nb:active { transform:scale(.94); transition-duration:.1s; }
  .rs-nb.on { background:rgba(139,92,246,.2); border:1px solid rgba(167,139,250,.2); box-shadow:inset 0 1px 0 rgba(255,255,255,.12); transform:scale(1.04); }
  .rs-nb-ico { color:rgba(255,255,255,.28); display:flex; transition:color .25s ease; }
  .rs-nb.on .rs-nb-ico { color:#a78bfa; }
  .rs-nb-lbl { font-size:10px; font-weight:600; letter-spacing:.04em; color:rgba(255,255,255,.28); transition:color .25s ease; font-family:'DM Sans',sans-serif; }
  .rs-nb.on .rs-nb-lbl { color:#a78bfa; }
  .rs-nb-search { width:52px; height:52px; flex-shrink:0; border-radius:50%; border:none; background:rgba(15,10,30,.85); backdrop-filter:blur(40px) saturate(180%); -webkit-backdrop-filter:blur(40px) saturate(180%); border:1px solid rgba(255,255,255,.1); box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 32px rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .25s ease; color:rgba(255,255,255,.4); -webkit-tap-highlight-color:transparent; }
  .rs-nb-search:hover { color:rgba(255,255,255,.8); transform:scale(1.08); }
  .rs-nb-search:active { transform:scale(.92); transition-duration:.1s; }
  .rs-nb-search.on { background:rgba(139,92,246,.25); border-color:rgba(167,139,250,.3); color:#a78bfa; box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 32px rgba(0,0,0,.55),0 0 0 3px rgba(139,92,246,.15); }

  /* SEARCH OVERLAY */
  .rs-search-overlay { position:absolute; left:50%; bottom:90px; transform:translateX(-50%); width:min(520px,94vw); z-index:15; background:rgba(12,8,24,.88); backdrop-filter:blur(40px) saturate(180%); -webkit-backdrop-filter:blur(40px) saturate(180%); border:1px solid rgba(255,255,255,.1); border-radius:22px; box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 24px 60px rgba(0,0,0,.6); overflow:hidden; animation:rsPopUp .28s cubic-bezier(.22,1,.36,1); max-height:60vh; display:flex; flex-direction:column; }
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

  /* LOADING */
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

/* ─── HOME ──────────────────────────────────────────────── */
function Home() {
  const navigate   = useNavigate();
  const swiperEl   = useRef(null);
  const swiperObj  = useRef(null);
  const imgRefs    = useRef({});
  const bgRef      = useRef(null);
  const cardRefs   = useRef({});          // for shared element transition
  const detailRef  = useRef(null);
  const savedIdx   = useRef(parseInt(sessionStorage.getItem('rs_slide_idx') || '0', 10));

  const [user, setUser] = useState(() => {
    try { const u=localStorage.getItem('user'); const t=localStorage.getItem('token'); return u&&t?JSON.parse(u):null; } catch{return null;}
  });
  const [stations, setStations]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('list');
  const [selected, setSelected]     = useState(null);
  const [closing, setClosing]       = useState(false);
  const [activeIdx, setActiveIdx]   = useState(() => parseInt(sessionStorage.getItem('rs_slide_idx') || '0', 10));
  const [bgColor, setBgColor]       = useState('rgba(90,60,170,.18)');
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ]                   = useState('');
  // 3. occurrences count per station id
  const [occCounts, setOccCounts]   = useState({});

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:5000/api/stations')
      .then(r=>r.json())
      .then(d=>{ setStations(d); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [user]);

  // 3. Fetch occurrence counts for all stations
  useEffect(() => {
    if (!stations.length) return;
    stations.forEach(s => {
      fetch(`http://localhost:5000/api/occurrences/${s.id}`)
        .then(r=>r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setOccCounts(prev => ({ ...prev, [s.id]: data.length }));
          }
        })
        .catch(() => {});
    });
  }, [stations]);

  // 2. CURATED PALETTE — updateBg uses index-based palette, no CORS
  const updateBg = useCallback((idx) => {
    const [r, g, b] = PALETTE[idx % PALETTE.length];
    // Slightly darken for atmosphere
    const dr = Math.round(r * .38), dg = Math.round(g * .38), db = Math.round(b * .38);
    setBgColor(`radial-gradient(ellipse 85% 65% at 50% 40%,rgba(${dr},${dg},${db},.62) 0%,transparent 70%)`);
  }, []);

  // Swiper init
  useEffect(() => {
    if (loading || tab!=='list' || !stations.length) return;
    const timer = setTimeout(() => {
      const el = swiperEl.current;
      if (!el || !window.Swiper) return;
      if (swiperObj.current) { swiperObj.current.destroy(true, true); swiperObj.current = null; }
      swiperObj.current = new window.Swiper(el, {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        initialSlide: savedIdx.current,
        keyboard: { enabled: true },
        coverflowEffect: { rotate:40, stretch:0, depth:175, modifier:1.15, slideShadows:false },
        pagination: { el: el.querySelector('.swiper-pagination'), clickable:true },
        on: {
          slideChange(sw) {
            savedIdx.current = sw.realIndex;
            sessionStorage.setItem('rs_slide_idx', sw.realIndex);
            setActiveIdx(sw.realIndex);
            updateBg(sw.realIndex);
            if (bgRef.current) {
              const total = stations.length - 1 || 1;
              const pct   = sw.realIndex / total;
              const x     = (pct - 0.5) * -60;
              const y     = Math.sin(pct * Math.PI) * -18;
              bgRef.current.style.transform = `translate(${x}px,${y}px) scale(1.08)`;
            }
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

  // 4. SHARED ELEMENT TRANSITION — open
  const openStation = useCallback((s) => {
    const cardEl = cardRefs.current[s.id];
    if (cardEl) {
      const rect  = cardEl.getBoundingClientRect();
      const vw    = window.innerWidth;
      const vh    = window.innerHeight;
      // Express inset as % of viewport
      const top   = `${(rect.top   / vh * 100).toFixed(2)}%`;
      const right = `${((vw - rect.right)  / vw * 100).toFixed(2)}%`;
      const bot   = `${((vh - rect.bottom) / vh * 100).toFixed(2)}%`;
      const left  = `${(rect.left  / vw * 100).toFixed(2)}%`;
      // Set CSS vars on shell so the detail layer can read them
      const shell = cardEl.closest('.rs-shell');
      if (shell) {
        shell.style.setProperty('--exp-t',   top);
        shell.style.setProperty('--exp-r',   right);
        shell.style.setProperty('--exp-b',   bot);
        shell.style.setProperty('--exp-l',   left);
        shell.style.setProperty('--exp-dur', '.42s');
      }
    }
    setClosing(false);
    setSelected(s);
  }, []);

  // 4. SHARED ELEMENT TRANSITION — close
  const closeStation = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setClosing(false); setSelected(null); }, 340);
  }, []);

  const handleLogin  = (u,t) => { localStorage.setItem('token',t); localStorage.setItem('user',JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setStations([]); };

  const filtered = q.trim()
    ? stations.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || (s.description||'').toLowerCase().includes(q.toLowerCase()))
    : stations;
  const initials = user?.name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()||'U';

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <>
      <style>{CSS}</style>
      <div className="rs-shell">
        <div className="rs-bg" ref={bgRef} />
        <div className="rs-color-overlay" style={{ background: bgColor }} />

        {TRACKS.map((top,i)=>(
          <div key={i} className="rs-track" style={{top:`${top}%`,'--td':`${DURS[i]}s`,'--tdd':`${-i*1.5}s`}} />
        ))}
        {STNS.map((s,i)=>(
          <div key={i} className="rs-stn" style={{top:`${8+i*15}%`,'--sd':`${STN_DUR[i]}s`,'--sdd':`${-i*3}s`}}>{s}</div>
        ))}

        {/* 4. Detail layer with shared element transition */}
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
                  <button className="rs-add-btn" onClick={()=>navigate('/admin/add')}>
                    <PlusCircle size={13} />
                    <span className="rs-add-btn-txt">Nova estação</span>
                  </button>
                )}
                <div className="rs-user-pill">
                  <div className="rs-user-av">{initials}</div>
                  <span className="rs-user-nm">{user?.name?.split(' ')[0]}</span>
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
                <div className="rs-loading">
                  <div className="rs-spin" />
                  <span className="rs-loading-txt">A carregar estações…</span>
                </div>
              ) : (
                <div className="rs-coverflow-view">
                  <div className="rs-hero">
                    <div className="rs-eyebrow">Rede Ferroviária Nacional</div>
                    <h1 className="rs-title">Descobre <em>Portugal</em></h1>
                  </div>
                  <div className="rs-slide-counter">
                    <span>{activeIdx + 1}</span> / {stations.length}
                  </div>

                  <div className="rs-swiper-wrap">
                    <div className="swiper rs-swiper" ref={swiperEl}>
                      <div className="swiper-wrapper">
                        {stations.map((s, i) => (
                          <div key={s.id} className="swiper-slide">
                            {/* ref on the card for shared element */}
                            <div
                              className="rs-card"
                              ref={el => { if (el) cardRefs.current[s.id] = el; }}
                              onClick={() => openStation(s)}
                            >
                              {s.image_url ? (
                                <img
                                  ref={el => { if (el) imgRefs.current[s.id] = el; }}
                                  src={s.image_url}
                                  alt={s.name}
                                />
                              ) : (
                                <div className="rs-card-ph" style={{ background:`linear-gradient(160deg,${BG_GRADS[i%BG_GRADS.length]})` }} />
                              )}
                              <div className="rs-card-frost" />
                              <div className="rs-card-ov-top" />
                              <div className="rs-card-ov-bot" />

                              {/* 3. Occurrences badge */}
                              {occCounts[s.id] > 0 && (
                                <div className="rs-card-occ-badge">
                                  <TriangleAlert size={9} />
                                  {occCounts[s.id]} ocorr.
                                </div>
                              )}

                              <div className="rs-card-body">
                                {/* 1. Real line name */}
                                <div className="rs-card-badge">{getLine(s.name)}</div>
                                <div className="rs-card-name">{s.name}</div>
                                <div className="rs-card-loc"><MapPin size={10} /> Portugal</div>
                              </div>
                              <div className="rs-card-tap">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.5">
                                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="swiper-pagination"></div>
                    </div>

                    <div className="rs-nav-arrows">
                      <button className="rs-nav-btn" onClick={() => swiperObj.current?.slidePrev()}>
                        <ChevronLeft size={16} />
                      </button>
                      <button className="rs-nav-btn" onClick={() => swiperObj.current?.slideNext()}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {tab === 'map' && (
              <div className="rs-map">
                <StationMap stations={stations} onStationSelect={openStation} />
              </div>
            )}
          </div>

          {/* SEARCH OVERLAY */}
          {searchOpen && (
            <div className="rs-search-overlay">
              <div className="rs-search-box">
                <Search size={16} color="rgba(167,139,250,.5)" style={{ flexShrink:0 }} />
                <input
                  autoFocus
                  placeholder="Pesquisar estação…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  inputMode="search"
                />
                {q && (
                  <button className="rs-search-clear" onClick={() => setQ('')}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="rs-search-results">
                {filtered.length === 0 && <div className="rs-search-empty">Nenhuma estação encontrada.</div>}
                {filtered.map((s, i) => (
                  <div
                    key={s.id}
                    className="rs-search-result"
                    style={{ '--ri': `${i * 0.05}s` }}
                    onClick={() => { setSearchOpen(false); setQ(''); openStation(s); }}
                  >
                    {s.image_url
                      ? <img src={s.image_url} alt={s.name} className="rs-search-result-img" />
                      : <div className="rs-search-result-ph" />
                    }
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
                <span className="rs-nb-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                    <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                <span className="rs-nb-lbl">Estações</span>
              </button>
              <button className={`rs-nb ${tab==='map'&&!searchOpen?'on':''}`} onClick={()=>{ setSearchOpen(false); setTab('map'); }}>
                <span className="rs-nb-ico">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                </span>
                <span className="rs-nb-lbl">Mapa</span>
              </button>
            </div>
            <button
              className={`rs-nb-search ${searchOpen?'on':''}`}
              onClick={() => { setSearchOpen(v=>!v); if (searchOpen) setQ(''); }}
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
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