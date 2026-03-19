import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bell, Navigation, Send, Car, Footprints,
  CornerUpRight, CircleX, ExternalLink, Edit, Trash2, CircleCheck,
  Info, TriangleAlert, X, Plus
} from 'lucide-react';
import RouteMap from './RouteMap';

/* ─── DISTANCE UTIL ───────────────────────────────────────── */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ─── STYLES ──────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sd-root {
    height: 100%;
    background: #08111c;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* ── SAME TILE BG ── */
  .sd-bg {
    position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .sd-bg::before {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect x='0.5' y='0.5' width='79' height='79' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.4'/%3E%3Ccircle cx='40' cy='40' r='18' fill='none' stroke='%231a3a5c' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E");
  }

  /* ── LAYOUT: hero image top + panel below (mobile) / side-by-side (desktop) ── */
  .sd-layout {
    position: relative; z-index: 1;
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden;
  }
  @media (min-width: 768px) {
    .sd-layout { flex-direction: row; }
  }

  /* ── HERO IMAGE ── */
  .sd-hero {
    position: relative; flex-shrink: 0;
    height: 260px; background: #0c1e30; overflow: hidden;
  }
  @media (min-width: 768px) {
    .sd-hero { height: 100%; width: 50%; }
  }
  .sd-hero img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .4s cubic-bezier(.22,1,.36,1);
  }
  .sd-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(8,17,28,.85) 0%, rgba(8,17,28,.1) 60%, transparent 100%);
  }
  /* Station name on hero (mobile) */
  .sd-hero-name {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 20px 20px 16px;
  }
  .sd-hero-name h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px,5vw,28px); font-weight: 900;
    color: #fff; letter-spacing: -.025em; line-height: 1.1; margin-bottom: 4px;
  }
  .sd-hero-name .sd-loc {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: rgba(255,255,255,.4);
  }
  @media (min-width: 768px) {
    .sd-hero-name { display: none; }
  }

  /* Back button */
  .sd-back {
    position: absolute; top: 14px; left: 14px; z-index: 20;
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(8,17,28,.7); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background .2s, transform .2s;
    color: #fff;
  }
  .sd-back:hover { background: rgba(44,110,166,.5); transform: scale(1.08); }

  /* Admin buttons on hero */
  .sd-admin-btns {
    position: absolute; top: 14px; right: 14px; z-index: 20;
    display: flex; gap: 8px;
  }
  .sd-admin-btn {
    width: 38px; height: 38px; border-radius: 50%;
    backdrop-filter: blur(8px); border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: transform .2s, opacity .2s;
  }
  .sd-admin-btn:hover { transform: scale(1.1); }
  .sd-admin-btn-edit { background: rgba(44,110,166,.7); }
  .sd-admin-btn-del  { background: rgba(239,68,68,.7); }

  /* ── RIGHT PANEL ── */
  .sd-panel {
    flex: 1; display: flex; flex-direction: column;
    background: #0d1a26; overflow: hidden;
    border-top: 1px solid rgba(255,255,255,.05);
  }
  @media (min-width: 768px) {
    .sd-panel {
      width: 50%; border-top: none;
      border-left: 1px solid rgba(255,255,255,.05);
    }
  }
  .sd-panel-scroll {
    flex: 1; overflow-y: auto; padding: 24px 22px 32px;
    scrollbar-width: thin; scrollbar-color: rgba(44,110,166,.2) transparent;
  }
  .sd-panel-scroll::-webkit-scrollbar { width: 3px; }
  .sd-panel-scroll::-webkit-scrollbar-thumb { background: rgba(44,110,166,.25); border-radius: 3px; }

  /* Desktop heading (hidden on mobile — shown on hero) */
  .sd-desktop-heading {
    display: none;
    margin-bottom: 20px;
  }
  .sd-desktop-heading h2 {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 900;
    color: #fff; letter-spacing: -.025em; line-height: 1.1; margin-bottom: 5px;
  }
  .sd-desktop-heading .sd-loc {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: rgba(255,255,255,.3);
  }
  @media (min-width: 768px) {
    .sd-desktop-heading { display: block; }
  }

  /* ── ACTION BUTTONS ── */
  .sd-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 22px; }
  .sd-btn-nav {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 16px; border-radius: 14px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    background: #2c6ea6; color: #fff;
    transition: background .2s, transform .15s;
  }
  .sd-btn-nav:hover { background: #3a7dba; }
  .sd-btn-nav:active { transform: scale(.97); }
  .sd-btn-alert {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 16px; border-radius: 14px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
    color: rgba(255,255,255,.6);
    transition: background .2s, border-color .2s, transform .15s;
  }
  .sd-btn-alert:hover { background: rgba(255,255,255,.08); }
  .sd-btn-alert:active { transform: scale(.97); }
  .sd-btn-alert.active {
    background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.3);
    color: #fbbf24; animation: sdPulse 2s ease-in-out infinite;
  }
  @keyframes sdPulse { 0%,100% { opacity:1; } 50% { opacity:.65; } }

  .sd-gmaps-banner {
    background: rgba(44,110,166,.1); border: 1px solid rgba(44,110,166,.2);
    border-radius: 14px; padding: 14px; margin-bottom: 20px;
  }
  .sd-gmaps-banner p { font-size: 12px; color: rgba(255,255,255,.4); margin-bottom: 10px; }
  .sd-gmaps-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 11px; background: #2c6ea6; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: #fff; cursor: pointer; transition: background .2s;
  }
  .sd-gmaps-btn:hover { background: #3a7dba; }

  /* ── TABS ── */
  .sd-tabs {
    display: flex; border-bottom: 1px solid rgba(255,255,255,.07);
    margin-bottom: 20px; gap: 0; overflow-x: auto; scrollbar-width: none;
  }
  .sd-tabs::-webkit-scrollbar { display: none; }
  .sd-tab {
    padding: 10px 14px; border: none; background: transparent; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: rgba(255,255,255,.28); white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: color .2s, border-color .2s;
    display: flex; align-items: center; gap: 5px;
  }
  .sd-tab:hover { color: rgba(255,255,255,.6); }
  .sd-tab.active { color: #4a8cc2; border-bottom-color: #4a8cc2; }
  .sd-tab.active-red { color: #f87171; border-bottom-color: #f87171; }

  /* ── INFO TAB ── */
  .sd-desc {
    font-size: 13px; color: rgba(255,255,255,.45); line-height: 1.75;
    margin-bottom: 22px;
  }

  /* Comments box */
  .sd-comments-box {
    background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
    border-radius: 16px; padding: 18px;
  }
  .sd-comments-title {
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: rgba(255,255,255,.35); margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px;
  }
  .sd-comment-form { display: flex; gap: 8px; margin-bottom: 14px; }
  .sd-comment-input {
    flex: 1; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #fff; outline: none;
    transition: border-color .2s, background .2s;
  }
  .sd-comment-input:focus { border-color: rgba(44,110,166,.5); background: rgba(255,255,255,.07); }
  .sd-comment-input::placeholder { color: rgba(255,255,255,.2); }
  .sd-comment-send {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: #2c6ea6; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #fff; transition: background .2s;
  }
  .sd-comment-send:hover { background: #3a7dba; }
  .sd-comment-send:disabled { opacity: .4; cursor: default; }
  .sd-no-auth {
    font-size: 12px; color: rgba(255,255,255,.3); text-align: center;
    background: rgba(44,110,166,.08); border: 1px solid rgba(44,110,166,.15);
    border-radius: 10px; padding: 10px; margin-bottom: 14px;
  }
  .sd-comment-item {
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.05);
    border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; position: relative;
  }
  .sd-comment-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
  .sd-comment-user { display: flex; align-items: center; gap: 7px; }
  .sd-comment-av {
    width: 22px; height: 22px; border-radius: 50%; background: #1a4f80;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: #7ec8f0; flex-shrink: 0;
  }
  .sd-comment-name { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.7); }
  .sd-comment-del {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,.15); padding: 2px; display: flex;
    transition: color .2s;
  }
  .sd-comment-del:hover { color: #f87171; }
  .sd-comment-text { font-size: 12px; color: rgba(255,255,255,.4); line-height: 1.5; padding-left: 29px; }
  .sd-empty { font-size: 12px; color: rgba(255,255,255,.2); text-align: center; padding: 16px 0; }

  /* ── SCHEDULES TAB ── */
  .sd-add-sched {
    background: rgba(44,110,166,.08); border: 1px solid rgba(44,110,166,.18);
    border-radius: 14px; padding: 14px; margin-bottom: 14px;
  }
  .sd-add-sched-title {
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: #7ec8f0; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;
  }
  .sd-sched-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .sd-sched-input {
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
    border-radius: 10px; padding: 9px 11px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; color: #fff; outline: none;
    transition: border-color .2s;
  }
  .sd-sched-input:focus { border-color: rgba(44,110,166,.5); }
  .sd-sched-select { flex-shrink: 0; }
  .sd-sched-dest { flex: 1; }
  .sd-sched-save {
    background: #2c6ea6; border: none; border-radius: 10px;
    padding: 9px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600; color: #fff; cursor: pointer;
    transition: background .2s; flex-shrink: 0;
  }
  .sd-sched-save:hover { background: #3a7dba; }
  .sd-sched-save:disabled { opacity: .4; cursor: default; }

  /* Schedule item */
  .sd-sched-item {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.05);
    border-radius: 14px; padding: 13px 16px; margin-bottom: 8px;
    transition: border-color .2s;
  }
  .sd-sched-item:hover { border-color: rgba(44,110,166,.25); }
  .sd-sched-dest-name { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 3px; }
  .sd-sched-type { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.3); }
  .sd-sched-right { display: flex; align-items: center; gap: 10px; }
  .sd-sched-time { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -.02em; }
  .sd-sched-status {
    font-size: 9px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    color: #4ade80; background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.15);
    padding: 3px 7px; border-radius: 100px; display: block; text-align: center; margin-top: 2px;
  }
  .sd-sched-del {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,.12); padding: 4px; display: flex;
    transition: color .2s; opacity: 0;
  }
  .sd-sched-item:hover .sd-sched-del { opacity: 1; }
  .sd-sched-del:hover { color: #f87171; }
  .sd-no-schedules {
    text-align: center; padding: 28px 0;
    font-size: 12px; color: rgba(255,255,255,.2);
    border: 1px dashed rgba(255,255,255,.06); border-radius: 14px;
  }

  /* ── OCCURRENCES TAB ── */
  .sd-occ-report {
    background: rgba(239,68,68,.05); border: 1px solid rgba(239,68,68,.12);
    border-radius: 16px; padding: 16px; margin-bottom: 16px;
  }
  .sd-occ-report-title {
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: #f87171; margin-bottom: 4px; display: flex; align-items: center; gap: 5px;
  }
  .sd-occ-hint { font-size: 11px; color: rgba(239,68,68,.5); margin-bottom: 12px; line-height: 1.5; }
  .sd-occ-textarea {
    width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.07);
    border-radius: 12px; padding: 11px 13px; resize: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #fff; outline: none;
    transition: border-color .2s; margin-bottom: 10px;
  }
  .sd-occ-textarea:focus { border-color: rgba(239,68,68,.4); }
  .sd-occ-textarea::placeholder { color: rgba(255,255,255,.2); }
  .sd-occ-submit {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 12px; background: rgba(239,68,68,.7); border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: #fff; cursor: pointer; transition: background .2s;
  }
  .sd-occ-submit:hover { background: rgba(239,68,68,.9); }
  .sd-occ-submit:disabled { opacity: .4; cursor: default; }
  .sd-occ-no-auth {
    font-size: 12px; color: rgba(239,68,68,.5); text-align: center;
    background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.1);
    border-radius: 10px; padding: 10px;
  }
  .sd-occ-history-title {
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: rgba(255,255,255,.25); margin-bottom: 10px; padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .sd-occ-item {
    background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.05);
    border-left: 3px solid rgba(239,68,68,.5);
    border-radius: 0 12px 12px 0;
    padding: 11px 13px; margin-bottom: 8px; position: relative;
  }
  .sd-occ-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
  .sd-occ-user { font-size: 11px; font-weight: 600; color: rgba(255,255,255,.6); }
  .sd-occ-coords {
    font-size: 9px; font-family: monospace; color: rgba(239,68,68,.5);
    background: rgba(239,68,68,.06); padding: 2px 6px; border-radius: 5px;
  }
  .sd-occ-desc { font-size: 12px; color: rgba(255,255,255,.4); line-height: 1.5; }
  .sd-occ-resolve {
    position: absolute; top: -10px; right: -10px;
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(74,222,128,.15); border: 1px solid rgba(74,222,128,.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; opacity: 0; transition: opacity .2s, background .2s; color: #4ade80;
  }
  .sd-occ-item:hover .sd-occ-resolve { opacity: 1; }
  .sd-occ-resolve:hover { background: rgba(74,222,128,.3); }

  /* ── TOAST ── */
  .sd-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 9000; width: min(92vw, 420px);
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 16px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    backdrop-filter: blur(16px); animation: sdToastIn .3s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
  }
  @keyframes sdToastIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  .sd-toast-success { background: rgba(22,163,74,.92); color: #fff; }
  .sd-toast-error   { background: rgba(220,38,38,.92); color: #fff; }
  .sd-toast-info    { background: rgba(8,17,28,.95); border: 1px solid rgba(255,255,255,.08); color: #fff; }
  .sd-toast-warning { background: rgba(245,158,11,.92); color: #08111c; }
  .sd-toast-close { margin-left: auto; background: none; border: none; cursor: pointer; color: inherit; opacity: .7; display: flex; padding: 2px; }
  .sd-toast-close:hover { opacity: 1; }

  /* ── DIALOG ── */
  .sd-dialog-bg {
    position: fixed; inset: 0; z-index: 8000;
    background: rgba(8,17,28,.75); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: sdFadeIn .2s ease;
  }
  @keyframes sdFadeIn { from { opacity:0; } to { opacity:1; } }
  .sd-dialog {
    background: #0d1a26; border: 1px solid rgba(255,255,255,.08);
    border-radius: 22px; padding: 24px; width: min(360px, 100%);
    box-shadow: 0 24px 60px rgba(0,0,0,.6);
    animation: sdSlideUp .3s cubic-bezier(.22,1,.36,1);
  }
  @keyframes sdSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .sd-dialog-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
  }
  .sd-dialog-icon-danger  { background: rgba(239,68,68,.12); color: #f87171; }
  .sd-dialog-icon-success { background: rgba(74,222,128,.1); color: #4ade80; }
  .sd-dialog h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .sd-dialog p { font-size: 13px; color: rgba(255,255,255,.4); line-height: 1.6; margin-bottom: 22px; }
  .sd-dialog-btns { display: flex; gap: 8px; justify-content: flex-end; }
  .sd-dialog-cancel {
    padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.04); color: rgba(255,255,255,.6);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .2s;
  }
  .sd-dialog-cancel:hover { background: rgba(255,255,255,.08); }
  .sd-dialog-confirm-danger {
    padding: 10px 18px; border-radius: 10px; border: none;
    background: rgba(239,68,68,.7); color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .2s;
  }
  .sd-dialog-confirm-danger:hover  { background: rgba(239,68,68,.9); }
  .sd-dialog-confirm-success {
    padding: 10px 18px; border-radius: 10px; border: none;
    background: rgba(74,222,128,.2); color: #4ade80;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: background .2s;
  }
  .sd-dialog-confirm-success:hover { background: rgba(74,222,128,.35); }

  /* ── NAVIGATION MODE ── */
  .sd-nav-mode {
    flex: 1; display: flex; flex-direction: column; overflow: hidden;
  }
  .sd-nav-map-wrap { position: relative; flex: 1; overflow: hidden; }
  @media (min-width: 768px) {
    .sd-nav-mode { flex-direction: row; }
    .sd-nav-map-wrap { flex: 1; }
  }
  .sd-nav-turn {
    position: absolute; top: 12px; left: 12px; right: 56px; z-index: 400;
    background: rgba(8,17,28,.88); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 13px 14px;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .sd-nav-turn-ico { color: #4ade80; flex-shrink: 0; margin-top: 2px; }
  .sd-nav-turn-street { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .sd-nav-turn-dist { font-size: 12px; color: rgba(255,255,255,.35); }
  .sd-nav-turn-dist span { color: #fff; font-weight: 600; }
  .sd-nav-eta {
    position: absolute; bottom: 16px; left: 12px; right: 12px; z-index: 400;
    background: rgba(8,17,28,.88); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 14px 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .sd-nav-eta-time { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -.02em; }
  .sd-nav-eta-unit { font-size: 12px; color: rgba(255,255,255,.3); margin-top: 2px; }
  .sd-nav-eta-km { font-size: 12px; color: rgba(255,255,255,.3); }
  .sd-nav-mode-btns { display: flex; gap: 6px; background: rgba(255,255,255,.06); padding: 4px; border-radius: 10px; }
  .sd-nav-mode-btn {
    width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: transparent; color: rgba(255,255,255,.35); transition: all .2s;
  }
  .sd-nav-mode-btn.active-car  { background: rgba(44,110,166,.5); color: #7ec8f0; }
  .sd-nav-mode-btn.active-walk { background: rgba(74,222,128,.2); color: #4ade80; }
  .sd-nav-close {
    position: absolute; top: 12px; right: 12px; z-index: 400;
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(239,68,68,.2); border: 1px solid rgba(239,68,68,.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #f87171; transition: background .2s;
  }
  .sd-nav-close:hover { background: rgba(239,68,68,.4); }
  .sd-nav-gps-loading {
    flex: 1; background: #08111c;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  }
  .sd-nav-spin {
    width: 44px; height: 44px;
    border: 3px solid rgba(44,110,166,.2); border-top-color: #2c6ea6;
    border-radius: 50%; animation: sdSpin .8s linear infinite;
  }
  @keyframes sdSpin { to { transform: rotate(360deg); } }
  .sd-nav-spin-txt { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: rgba(255,255,255,.5); }
  .sd-nav-cancel {
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
    border-radius: 100px; padding: 8px 20px; color: rgba(255,255,255,.4);
    font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: background .2s;
  }
  .sd-nav-cancel:hover { background: rgba(255,255,255,.1); }

  /* gmaps panel during nav */
  .sd-nav-panel-strip {
    background: #0d1a26; border-top: 1px solid rgba(255,255,255,.05);
    padding: 14px 18px;
  }
  .sd-nav-gmaps-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 11px; background: #2c6ea6; border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: #fff; cursor: pointer; transition: background .2s;
  }
  .sd-nav-gmaps-btn:hover { background: #3a7dba; }
`;

/* ─── COMPONENT ───────────────────────────────────────────── */
function StationDetails({ station, onBack }) {
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState('info');
  const [reviews,      setReviews]      = useState([]);
  const [schedules,    setSchedules]    = useState([]);
  const [occurrences,  setOccurrences]  = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeInfo,    setRouteInfo]    = useState(null);
  const [travelMode,   setTravelMode]   = useState('driving');
  const [isAlertActive,setIsAlertActive]= useState(false);
  const [watchId,      setWatchId]      = useState(null);
  const [newReview,    setNewReview]    = useState('');
  const [newOccurrence,setNewOccurrence]= useState('');
  const [newSchedule,  setNewSchedule]  = useState({ train_type: 'Urbano', destination: '', departure_time: '' });
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [dialog,       setDialog]       = useState({ isOpen:false, title:'', message:'', type:'danger', onConfirm:null });

  const [user] = useState(() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
    catch { return null; }
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };
  const openDialog  = (title, message, type, onConfirm) => setDialog({ isOpen:true, title, message, type, onConfirm });
  const closeDialog = () => setDialog(p => ({ ...p, isOpen:false }));

  const stationId = station?.id;

  const fetchOccurrences = useCallback(async () => {
    if (!stationId) return;
    try { const r = await fetch(`http://localhost:5000/api/occurrences/${stationId}`); const d = await r.json(); setOccurrences(Array.isArray(d) ? d : []); }
    catch { console.error('Erro ocorrências'); }
  }, [stationId]);

  const fetchSchedules = useCallback(async () => {
    if (!stationId) return;
    try { const r = await fetch(`http://localhost:5000/api/schedules/${stationId}`); const d = await r.json(); setSchedules(Array.isArray(d) ? d : []); }
    catch { console.error('Erro horários'); }
  }, [stationId]);

  useEffect(() => {
    if (stationId) {
      fetch(`http://localhost:5000/api/reviews/${stationId}`).then(r=>r.json()).then(d=>setReviews(Array.isArray(d)?d:[])).catch(()=>{});
      fetchSchedules(); fetchOccurrences();
    }
  }, [stationId, fetchSchedules, fetchOccurrences]);

  useEffect(() => { return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); }; }, [watchId]);

  /* ── Reviews ── */
  const handleSubmitReview = async e => {
    e.preventDefault(); if (!newReview.trim()) return;
    setSubmitting(true); const token = localStorage.getItem('token');
    try {
      const r = await fetch(`http://localhost:5000/api/reviews/${stationId}`, { method:'POST', headers:{'Content-Type':'application/json','x-auth-token':token}, body:JSON.stringify({content:newReview}) });
      if (r.ok) { 
        const s = await r.json(); 
        setReviews([s, ...reviews]); // Agora o s (review que vem do backend) já tem o user_name correto da Base de Dados!
        setNewReview(''); 
        showToast('Comentário adicionado!','success'); 
      }
      else { const err = await r.json().catch(()=>({})); showToast(err.error||'Erro.','error'); }
    } catch { showToast('Erro de ligação.','error'); } finally { setSubmitting(false); }
  };

  const handleDeleteReview = id => openDialog('Apagar Comentário','Tens a certeza que queres eliminar este comentário?','danger', async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`http://localhost:5000/api/reviews/${id}`,{method:'DELETE',headers:{'x-auth-token':token}});
    if (r.ok) { setReviews(reviews.filter(x=>x.id!==id)); showToast('Comentário apagado.','info'); } else showToast('Erro.','error');
  });

  /* ── Station ── */
  const handleDeleteStation = () => openDialog('Eliminar Estação',`Tens a certeza absoluta que pretendes eliminar a ${station.name}? Todos os dados serão apagados.`,'danger', async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`http://localhost:5000/api/stations/${stationId}`,{method:'DELETE',headers:{'x-auth-token':token}});
    if (r.ok) { showToast('Estação eliminada!','success'); setTimeout(()=>{ onBack(); window.location.reload(); },1500); } else showToast('Erro.','error');
  });

  /* ── Occurrences ── */
  const handleReportOccurrence = async e => {
    e.preventDefault(); if (!newOccurrence.trim()) return showToast('A descrição não pode estar vazia.','warning');
    if (!('geolocation' in navigator)) return showToast('Browser sem suporte a GPS.','error');
    setSubmitting(true); showToast('A capturar localização GPS…','info');
    navigator.geolocation.getCurrentPosition(async pos => {
      const token = localStorage.getItem('token');
      try {
        const r = await fetch(`http://localhost:5000/api/occurrences/${stationId}`,{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':token},body:JSON.stringify({description:newOccurrence,latitude:pos.coords.latitude,longitude:pos.coords.longitude})});
        if (r.ok) { showToast('Ocorrência enviada!','success'); setNewOccurrence(''); fetchOccurrences(); }
        else { const err = await r.json().catch(()=>({})); showToast(err.error||'Erro.','error'); }
      } catch { showToast('Erro de conexão.','error'); } finally { setSubmitting(false); }
    }, () => { showToast('Erro ao ler GPS.','error'); setSubmitting(false); }, { enableHighAccuracy:true, timeout:10000, maximumAge:0 });
  };

  const handleDeleteOccurrence = id => openDialog('Resolver Ocorrência','Marcar como resolvida?','success', async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`http://localhost:5000/api/occurrences/${id}`,{method:'DELETE',headers:{'x-auth-token':token}});
    if (r.ok) { setOccurrences(occurrences.filter(o=>o.id!==id)); showToast('Ocorrência resolvida.','success'); } else showToast('Erro.','error');
  });

  /* ── Schedules ── */
  const handleAddSchedule = async e => {
    e.preventDefault(); if (!newSchedule.destination||!newSchedule.departure_time) return showToast('Preenche todos os campos.','warning');
    setSubmitting(true); const token = localStorage.getItem('token');
    try {
      const r = await fetch(`http://localhost:5000/api/schedules/${stationId}`,{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':token},body:JSON.stringify({departureTime:newSchedule.departure_time,destination:newSchedule.destination,trainType:newSchedule.train_type})});
      if (r.ok) { showToast('Horário adicionado!','success'); setNewSchedule({train_type:'Urbano',destination:'',departure_time:''}); fetchSchedules(); }
      else { const err = await r.json().catch(()=>({})); showToast(err.error||'Erro.','error'); }
    } catch { showToast('Erro de conexão.','error'); } finally { setSubmitting(false); }
  };

  const handleDeleteSchedule = id => openDialog('Apagar Horário','Tens a certeza que pretendes apagar este horário?','danger', async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`http://localhost:5000/api/schedules/${id}`,{method:'DELETE',headers:{'x-auth-token':token}});
    if (r.ok) { setSchedules(schedules.filter(s=>s.id!==id)); showToast('Horário apagado.','info'); } else showToast('Erro.','error');
  });

  /* ── GPS / Navigation ── */
  const toggleAlert = () => {
    if (isAlertActive) {
      if (watchId!==null) navigator.geolocation.clearWatch(watchId);
      setIsAlertActive(false); setWatchId(null); showToast('Radar desativado.','info');
    } else {
      if (!station.latitude||!station.longitude) return showToast('Sem coordenadas.','error');
      if (!('geolocation' in navigator)) return showToast('Browser sem suporte a GPS.','error');
      showToast('Radar ativado! Aviso a menos de 500m.','success'); setIsAlertActive(true);
      const id = navigator.geolocation.watchPosition(pos => {
        if (calculateDistance(pos.coords.latitude,pos.coords.longitude,station.latitude,station.longitude)<=0.5) {
          showToast(`Chegaste à zona da ${station.name}!`,'success');
          navigator.geolocation.clearWatch(id); setIsAlertActive(false); setWatchId(null);
        }
      }, () => { showToast('GPS perdido.','error'); setIsAlertActive(false); navigator.geolocation.clearWatch(id); setWatchId(null); }, {enableHighAccuracy:true,timeout:10000,maximumAge:0});
      setWatchId(id);
    }
  };

  const startNavigation = () => {
    if (!station.latitude||!station.longitude) return showToast('Sem coordenadas.','error');
    if ('geolocation' in navigator) {
      setIsNavigating(true);
      navigator.geolocation.getCurrentPosition(pos=>setUserLocation({latitude:pos.coords.latitude,longitude:pos.coords.longitude}),()=>{setIsNavigating(false);showToast('Erro GPS.','error');},{enableHighAccuracy:false,timeout:10000,maximumAge:0});
    } else showToast('Sem suporte GPS.','error');
  };
  const stopNavigation = () => { setIsNavigating(false); setUserLocation(null); setRouteInfo(null); };

  if (!station) return null;

  /* ─── NAVIGATION MODE ─── */
  if (isNavigating) {
    return (
      <>
        <style>{CSS}</style>
        <div className="sd-root">
          {/* Dialog / Toast in nav mode */}
          {dialog.isOpen && <DialogBox dialog={dialog} closeDialog={closeDialog} />}
          {toast && <ToastBox toast={toast} setToast={setToast} />}

          <div className="sd-nav-mode">
            {userLocation ? (
              <div className="sd-nav-map-wrap">
                <RouteMap userLocation={userLocation} stationLocation={station} travelMode={travelMode} onRouteInfo={setRouteInfo} />

                {routeInfo?.nextTurn && (
                  <div className="sd-nav-turn">
                    <div className="sd-nav-turn-ico"><CornerUpRight size={24} /></div>
                    <div>
                      <div className="sd-nav-turn-street">{routeInfo.nextTurn}</div>
                      {routeInfo.turnDist > 0 && <div className="sd-nav-turn-dist">em <span>{routeInfo.turnDist} metros</span></div>}
                    </div>
                  </div>
                )}

                <div className="sd-nav-eta">
                  <div>
                    <div className="sd-nav-eta-time">{routeInfo?.time || '--'}</div>
                    <div className="sd-nav-eta-unit">minutos</div>
                    <div className="sd-nav-eta-km">{routeInfo?.distance || '--'} km</div>
                  </div>
                  <div className="sd-nav-mode-btns">
                    <button className={`sd-nav-mode-btn ${travelMode==='driving'?'active-car':''}`} onClick={()=>setTravelMode('driving')}><Car size={17}/></button>
                    <button className={`sd-nav-mode-btn ${travelMode==='walking'?'active-walk':''}`} onClick={()=>setTravelMode('walking')}><Footprints size={17}/></button>
                  </div>
                </div>

                <button className="sd-nav-close" onClick={stopNavigation}><CircleX size={20}/></button>
              </div>
            ) : (
              <div className="sd-nav-gps-loading">
                <div className="sd-nav-spin" />
                <div className="sd-nav-spin-txt">A procurar sinal GPS…</div>
                <button className="sd-nav-cancel" onClick={stopNavigation}>Cancelar</button>
              </div>
            )}

            {userLocation && (
              <div className="sd-nav-panel-strip">
                <button className="sd-nav-gmaps-btn" onClick={()=>window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,'_blank')}>
                  <ExternalLink size={15}/> Abrir no Google Maps
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ─── NORMAL MODE ─── */
  return (
    <>
      <style>{CSS}</style>
      <div className="sd-root">
        <div className="sd-bg" />

        {dialog.isOpen && <DialogBox dialog={dialog} closeDialog={closeDialog} />}
        {toast && <ToastBox toast={toast} setToast={setToast} />}

        <div className="sd-layout">

          {/* HERO IMAGE */}
          <div className="sd-hero">
            <img src={station.image_url} alt={station.name} />
            <div className="sd-hero-overlay" />

            {/* Station name on hero — mobile only */}
            <div className="sd-hero-name">
              <h2>{station.name}</h2>
              <div className="sd-loc"><MapPin size={10} /><span>Portugal</span></div>
            </div>

            {/* Back */}
            <button className="sd-back" onClick={onBack}><ArrowLeft size={18}/></button>

            {/* Admin */}
            {user?.is_admin && (
              <div className="sd-admin-btns">
                <button className="sd-admin-btn sd-admin-btn-edit" onClick={()=>navigate(`/admin/edit/${stationId}`)} title="Editar"><Edit size={16} color="#fff"/></button>
                <button className="sd-admin-btn sd-admin-btn-del" onClick={handleDeleteStation} title="Eliminar"><Trash2 size={16} color="#fff"/></button>
              </div>
            )}
          </div>

          {/* PANEL */}
          <div className="sd-panel">
            <div className="sd-panel-scroll">

              {/* Desktop heading */}
              <div className="sd-desktop-heading">
                <h2>{station.name}</h2>
                <div className="sd-loc"><MapPin size={10}/><span>Portugal</span></div>
              </div>

              {/* Action buttons */}
              <div className="sd-actions">
                <button className="sd-btn-nav" onClick={startNavigation}><Navigation size={16}/> Navegar</button>
                <button className={`sd-btn-alert ${isAlertActive?'active':''}`} onClick={toggleAlert}>
                  <Bell size={16}/> {isAlertActive ? 'A Rastrear…' : 'Alerta GPS'}
                </button>
              </div>

              {/* Tabs */}
              <div className="sd-tabs">
                <button className={`sd-tab ${activeTab==='info'?'active':''}`} onClick={()=>setActiveTab('info')}>Info</button>
                <button className={`sd-tab ${activeTab==='schedules'?'active':''}`} onClick={()=>setActiveTab('schedules')}>Horários</button>
                <button className={`sd-tab ${activeTab==='occurrences'?'active-red':''}`} onClick={()=>setActiveTab('occurrences')}>
                  <TriangleAlert size={12}/> Ocorrências {occurrences.length > 0 && <span style={{background:'rgba(248,113,113,.2)',color:'#f87171',padding:'0 5px',borderRadius:'100px',fontSize:'9px',fontWeight:700}}>{occurrences.length}</span>}
                </button>
              </div>

              {/* ── INFO ── */}
              {activeTab === 'info' && (
                <div>
                  <p className="sd-desc">{station.description}</p>
                  <div className="sd-comments-box">
                    <div className="sd-comments-title">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Comentários <span style={{color:'rgba(255,255,255,.15)'}}>({reviews.length})</span>
                    </div>
                    {user ? (
                      <form onSubmit={handleSubmitReview} className="sd-comment-form">
                        <input className="sd-comment-input" value={newReview} onChange={e=>setNewReview(e.target.value)} placeholder="Escreve algo…" />
                        <button type="submit" className="sd-comment-send" disabled={submitting}><Send size={14}/></button>
                      </form>
                    ) : (
                      <div className="sd-no-auth">Faz login para participar na conversa.</div>
                    )}
                    {reviews.length === 0 && <div className="sd-empty">Sê o primeiro a comentar!</div>}
                    {reviews.map(r => (
                      <div key={r.id} className="sd-comment-item">
                        <div className="sd-comment-header">
                          <div className="sd-comment-user">
                            <div className="sd-comment-av">{(r.user_name?.[0]||'U').toUpperCase()}</div>
                            <span className="sd-comment-name">{r.user_name}</span>
                          </div>
                          {user?.is_admin && <button className="sd-comment-del" onClick={()=>handleDeleteReview(r.id)}><Trash2 size={13}/></button>}
                        </div>
                        <div className="sd-comment-text">{r.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SCHEDULES ── */}
              {activeTab === 'schedules' && (
                <div>
                  {user?.is_admin && (
                    <form onSubmit={handleAddSchedule} className="sd-add-sched">
                      <div className="sd-add-sched-title"><Plus size={12}/> Adicionar partida</div>
                      <div className="sd-sched-row">
                        <select value={newSchedule.train_type} onChange={e=>setNewSchedule({...newSchedule,train_type:e.target.value})} className="sd-sched-input sd-sched-select">
                          <option>Urbano</option><option>Regional</option><option>Intercidades</option><option>Alfa Pendular</option>
                        </select>
                        <input type="time" value={newSchedule.departure_time} onChange={e=>setNewSchedule({...newSchedule,departure_time:e.target.value})} className="sd-sched-input" style={{flex:1}} required/>
                      </div>
                      <div className="sd-sched-row">
                        <input type="text" placeholder="Destino (ex: Porto)" value={newSchedule.destination} onChange={e=>setNewSchedule({...newSchedule,destination:e.target.value})} className="sd-sched-input sd-sched-dest" required/>
                        <button type="submit" disabled={submitting} className="sd-sched-save">Gravar</button>
                      </div>
                    </form>
                  )}
                  {schedules.length === 0
                    ? <div className="sd-no-schedules">Sem partidas previstas.</div>
                    : schedules.map(s => (
                      <div key={s.id} className="sd-sched-item">
                        <div>
                          <div className="sd-sched-dest-name">{s.destination}</div>
                          <div className="sd-sched-type">{s.train_type}</div>
                        </div>
                        <div className="sd-sched-right">
                          <div style={{textAlign:'right'}}>
                            <div className="sd-sched-time">{s.departure_time.slice(0,5)}</div>
                            <span className="sd-sched-status">Previsto</span>
                          </div>
                          {user?.is_admin && <button className="sd-sched-del" onClick={()=>handleDeleteSchedule(s.id)}><Trash2 size={15}/></button>}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* ── OCCURRENCES ── */}
              {activeTab === 'occurrences' && (
                <div>
                  <div className="sd-occ-report">
                    <div className="sd-occ-report-title"><TriangleAlert size={12}/> Reportar Problema</div>
                    <div className="sd-occ-hint">A tua localização GPS será anexada automaticamente ao relatório.</div>
                    {user ? (
                      <form onSubmit={handleReportOccurrence}>
                        <textarea className="sd-occ-textarea" value={newOccurrence} onChange={e=>setNewOccurrence(e.target.value)} placeholder="Ex: Máquina de bilhetes nº 2 avariada…" rows={3} />
                        <button type="submit" className="sd-occ-submit" disabled={submitting}><MapPin size={14}/> Enviar via GPS</button>
                      </form>
                    ) : (
                      <div className="sd-occ-no-auth">Inicia sessão para reportar problemas.</div>
                    )}
                  </div>

                  <div className="sd-occ-history-title">Histórico Técnico</div>
                  {occurrences.length === 0 && <div className="sd-empty">Sem ocorrências ativas nesta estação.</div>}
                  {occurrences.map(o => (
                    <div key={o.id} className="sd-occ-item">
                      <div className="sd-occ-meta">
                        <span className="sd-occ-user">{o.user_name}</span>
                        <span className="sd-occ-coords">{Number(o.latitude||0).toFixed(4)}, {Number(o.longitude||0).toFixed(4)}</span>
                      </div>
                      <div className="sd-occ-desc">{o.description}</div>
                      {user?.is_admin && (
                        <button className="sd-occ-resolve" onClick={()=>handleDeleteOccurrence(o.id)} title="Marcar como resolvido"><CircleCheck size={13}/></button>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── SUB-COMPONENTS ──────────────────────────────────────── */
function ToastBox({ toast, setToast }) {
  const icons = { success:<CircleCheck size={18}/>, error:<CircleX size={18}/>, info:<Info size={18}/>, warning:<TriangleAlert size={18}/> };
  return (
    <div className={`sd-toast sd-toast-${toast.type}`}>
      <span style={{flexShrink:0}}>{icons[toast.type]}</span>
      <span style={{flex:1}}>{toast.message}</span>
      <button className="sd-toast-close" onClick={()=>setToast(null)}><X size={15}/></button>
    </div>
  );
}

function DialogBox({ dialog, closeDialog }) {
  return (
    <div className="sd-dialog-bg">
      <div className="sd-dialog">
        <div className={`sd-dialog-icon ${dialog.type==='danger'?'sd-dialog-icon-danger':'sd-dialog-icon-success'}`}>
          {dialog.type==='danger' ? <TriangleAlert size={20}/> : <CircleCheck size={20}/>}
        </div>
        <h3>{dialog.title}</h3>
        <p>{dialog.message}</p>
        <div className="sd-dialog-btns">
          <button className="sd-dialog-cancel" onClick={closeDialog}>Cancelar</button>
          <button
            className={dialog.type==='danger'?'sd-dialog-confirm-danger':'sd-dialog-confirm-success'}
            onClick={()=>{ dialog.onConfirm(); closeDialog(); }}
          >Confirmar</button>
        </div>
      </div>
    </div>
  );
}

export default StationDetails;