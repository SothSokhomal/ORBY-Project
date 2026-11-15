/**
 * ORBY Mission Outcome Dashboard
 * Full-screen modal shown on VICTORY (YOU WIN) and DEFEAT (YOU LOSE).
 * Matches the ORBY design language: Orbitron display font, JetBrains Mono HUD
 * font, orby-glass panels, metal-btn / gold-btn controls, dark navy palette.
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertTriangle,
  Heart,
  Skull,
  Zap,
  Droplets,
  Wind,
  Utensils,
  Clock,
  Calendar,
  Users,
  Star,
  Award,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import { GameSimulationState, GameLevel } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface MissionOutcomeDashboardProps {
  gameState: GameSimulationState;
  onRestart: () => void;
  onReturnToTitle: () => void;
  onRestartToLanding?: () => void;
  onViewStory?: () => void;
  onSetLevel?: (level: GameLevel) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function pct(val: number, max: number): number {
  return max > 0 ? Math.min(100, Math.round((val / max) * 100)) : 0;
}

function calcStarRating(
  isVictory: boolean,
  aliveCount: number,
  resources: GameSimulationState['resources'],
  highScore: number
): 1 | 2 | 3 {
  if (!isVictory) return 1;
  const resourceAvg = (
    pct(resources.oxygenKg, resources.oxygenMax) +
    pct(resources.waterLiters, resources.waterMax) +
    pct(resources.foodMeals, resources.foodMax) +
    pct(resources.batteryKwh, resources.batteryMax)
  ) / 4;
  if (aliveCount === 4 && resourceAvg >= 40 && highScore >= 2000) return 3;
  if (aliveCount >= 3 && resourceAvg >= 20) return 2;
  return 1;
}

const STAR_LABELS: Record<1 | 2 | 3, { label: string; desc: string }> = {
  1: { label: '1 Star — Survived', desc: 'You kept the outpost alive under tough conditions. Try again for a higher rating!' },
  2: { label: '2 Stars — Good Work', desc: 'Solid management! Resources held and most crew made it home safely.' },
  3: { label: '3 Stars — Excellent', desc: 'Outstanding mission! All crew survived with strong resources and science data.' },
};

// ─── Crew card colours matched to survivalRules.ts roster ───────────────────

const CREW_PALETTE: Record<string, { ring: string; text: string; badge: string; icon: string }> = {
  'crew-1': { ring: 'border-orange-500/70', text: 'text-orange-400', badge: 'bg-orange-500/15', icon: '🧡' },
  'crew-2': { ring: 'border-emerald-500/70', text: 'text-emerald-400', badge: 'bg-emerald-500/15', icon: '💚' },
  'crew-3': { ring: 'border-cyan-500/70', text: 'text-cyan-400', badge: 'bg-cyan-500/15', icon: '💙' },
  'crew-4': { ring: 'border-amber-500/70', text: 'text-amber-400', badge: 'bg-amber-500/15', icon: '💛' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const MissionOutcomeDashboard: React.FC<MissionOutcomeDashboardProps> = ({
  gameState,
  onRestart,
  onReturnToTitle,
  onRestartToLanding,
  onViewStory,
}) => {
  const [showResources, setShowResources] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const {
    missionOutcome,
    victoryType,
    defeatReason,
    crew,
    day,
    missionSecondsRemaining,
    highScore,
    callsign,
    resources,
  } = gameState;

  const isVictory = missionOutcome === 'VICTORY';
  const aliveCrew = crew.filter((c) => c.health > 0);
  const aliveCount = aliveCrew.length;
  const stars = calcStarRating(isVictory, aliveCount, resources, highScore);
  const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Outcome text ──────────────────────────────────────────────────────────
  const headlineText = isVictory ? 'YOU WIN' : 'YOU LOSE';

  const subtitleText = isVictory
    ? victoryType === 'FULL_CREW'
      ? 'Full Crew Survival — All 4 Astronauts Reached Day 90!'
      : 'Minimum Crew Survival — 3 of 4 Astronauts Reached Day 90.'
    : defeatReason || 'The outpost could not sustain operations.';

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const borderColor = isVictory ? 'border-emerald-500/80' : 'border-red-600/80';
  const headlineColor = isVictory ? 'text-emerald-400' : 'text-red-400';
  const glowClass = isVictory
    ? 'shadow-[0_0_60px_-10px_rgba(52,211,153,0.35)]'
    : 'shadow-[0_0_60px_-10px_rgba(239,68,68,0.35)]';
  const badgeBg = isVictory ? 'bg-emerald-600/20 border border-emerald-500/50' : 'bg-red-900/30 border border-red-600/50';
  const restartBg = isVictory
    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
    : 'bg-red-600 hover:bg-red-500 shadow-red-950';

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-3 md:p-6 bg-black/88 backdrop-blur-md pointer-events-auto select-none overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl bg-[#181b2a]/97 border-2 ${borderColor} ${glowClass} p-4 sm:p-5 md:p-7 flex flex-col text-white my-auto`}
        style={{ fontFamily: 'var(--font-body)' }}
      >

        {/* ══ HEADER BANNER ══════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center border-b border-slate-700/60 pb-3 mb-3 shrink-0">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${badgeBg}`}
               style={{ fontFamily: 'var(--font-hud)' }}>
            {isVictory ? <Trophy className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{isVictory ? 'Mission Complete' : 'Mission Terminated'}</span>
          </div>

          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase ${headlineColor}`}
            style={{ fontFamily: 'var(--font-display)', textShadow: isVictory ? '0 0 30px rgba(52,211,153,0.5)' : '0 0 30px rgba(239,68,68,0.5)' }}
          >
            {headlineText}
          </h1>

          <p className="text-sm text-slate-300 mt-2 max-w-lg leading-snug">
            {subtitleText}
          </p>

          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Callsign: {callsign}
          </p>
        </div>

        {/* ══ MISSION SUMMARY METRICS ════════════════════════════════════════ */}
        <div className="shrink-0 mb-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-mono">Mission Summary</p>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* Days Completed */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-slate-400 uppercase mb-1">
                <Calendar className="w-3 h-3" />
                <span>Days</span>
              </div>
              <div className="text-lg sm:text-xl font-black tabular-nums" style={{ fontFamily: 'var(--font-hud)' }}>
                <span className={isVictory ? 'text-emerald-400' : 'text-white'}>{day}</span>
                <span className="text-slate-500 text-xs sm:text-sm"> / 90</span>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-slate-400 uppercase mb-1">
                <Clock className="w-3 h-3" />
                <span>Time Left</span>
              </div>
              <div className="text-lg sm:text-xl font-black tabular-nums text-slate-200" style={{ fontFamily: 'var(--font-hud)' }}>
                {formatClock(missionSecondsRemaining)}
              </div>
            </div>

            {/* Surviving Crew */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-slate-400 uppercase mb-1">
                <Users className="w-3 h-3" />
                <span>Crew</span>
              </div>
              <div className="text-lg sm:text-xl font-black tabular-nums" style={{ fontFamily: 'var(--font-hud)' }}>
                <span className={aliveCount >= 3 ? 'text-emerald-400' : 'text-red-400'}>{aliveCount}</span>
                <span className="text-slate-500 text-xs sm:text-sm"> / 4</span>
              </div>
            </div>

            {/* Science Points */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-slate-400 uppercase mb-1">
                <Star className="w-3 h-3" />
                <span>Science Pts</span>
              </div>
              <div className="text-lg sm:text-xl font-black tabular-nums text-amber-300" style={{ fontFamily: 'var(--font-hud)' }}>
                {highScore.toLocaleString()}
              </div>
            </div>

            {/* Battery */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-slate-400 uppercase mb-1">
                <Zap className="w-3 h-3" />
                <span>Battery</span>
              </div>
              <div className="text-lg sm:text-xl font-black tabular-nums text-yellow-400" style={{ fontFamily: 'var(--font-hud)' }}>
                {pct(resources.batteryKwh, resources.batteryMax)}
                <span className="text-slate-500 text-xs sm:text-sm">%</span>
              </div>
            </div>

            {/* Power Status */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-slate-400 uppercase mb-1">
                <Zap className="w-3 h-3" />
                <span>Gen kW</span>
              </div>
              <div className="text-lg sm:text-xl font-black tabular-nums text-cyan-400" style={{ fontFamily: 'var(--font-hud)' }}>
                {Math.round(resources.solarKw + resources.fissionKw)}
                <span className="text-slate-500 text-xs sm:text-sm"> kW</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ CREW ROSTER STATUS ═════════════════════════════════════════════ */}
        <div className="shrink-0 mb-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-mono">Crew Roster</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {crew.map((member) => {
              const survived = member.health > 0;
              const palette = CREW_PALETTE[member.id] ?? CREW_PALETTE['crew-1'];
              return (
                <div
                  key={member.id}
                  className={`p-2.5 rounded-xl ${survived ? palette.badge : 'bg-slate-900/60'} border ${survived ? palette.ring : 'border-red-900/50'} text-center`}
                >
                  <div className="text-lg mb-0.5">{survived ? palette.icon : '💀'}</div>
                  <div className="font-bold text-white text-[11px] leading-tight">{member.name}</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${survived ? palette.text : 'text-red-400'}`}>
                    {member.role}
                  </div>
                  <div className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${survived ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                    {survived ? <Heart className="w-2.5 h-2.5" /> : <Skull className="w-2.5 h-2.5" />}
                    <span>{survived ? `${Math.round(member.health)}% HP` : 'Lost'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ REVIEW OUTPOST STATE (TOGGLE) ══════════════════════════════════ */}
        <div className="shrink-0 mb-4">
          <button
            onClick={() => setShowResources((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-hud)' }}
          >
            <span className="uppercase tracking-wider">Review Outpost State</span>
            {showResources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showResources && (
            <div className="mt-2 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-700/40">
              {/* O2 */}
              <ResourceMeter
                icon={<Wind className="w-3 h-3" />}
                label="O₂"
                value={resources.oxygenKg}
                max={resources.oxygenMax}
                unit="kg"
                color="text-cyan-400"
              />
              {/* Water */}
              <ResourceMeter
                icon={<Droplets className="w-3 h-3" />}
                label="Water"
                value={resources.waterLiters}
                max={resources.waterMax}
                unit="L"
                color="text-blue-400"
              />
              {/* Food */}
              <ResourceMeter
                icon={<Utensils className="w-3 h-3" />}
                label="Food"
                value={resources.foodMeals}
                max={resources.foodMax}
                unit="meals"
                color="text-amber-400"
              />
            </div>
          )}
        </div>

        {/* ══ STAR RATING ════════════════════════════════════════════════════ */}
        <div className="shrink-0 mb-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${n <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                  />
                ))}
                <span className="ml-1.5 text-xs font-bold text-amber-300" style={{ fontFamily: 'var(--font-hud)' }}>
                  {STAR_LABELS[stars].label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug max-w-xs">{STAR_LABELS[stars].desc}</p>
            </div>
            <button
              onClick={() => { spatialAudio.playUiClick(900); setShowCertificate(true); }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              style={{ fontFamily: 'var(--font-hud)' }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </button>
          </div>
        </div>

        {/* ══ ACTION CONTROLS ════════════════════════════════════════════════ */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2 border-t border-slate-700/60 pt-3">
          {/* Primary: Play Again */}
          <button
            onClick={() => { spatialAudio.playUiClick(1000); onRestart(); }}
            className={`flex-1 w-full sm:w-auto py-3 px-6 rounded-full font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg ${restartBg} text-white`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isVictory ? 'Play Again' : 'Try Again'}</span>
          </button>

          {/* Secondary: Read Story (WIN only) */}
          {isVictory && onViewStory && (
            <button
              onClick={() => { spatialAudio.playUiClick(900); onViewStory(); }}
              className="flex-1 w-full sm:w-auto py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/50"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Trophy className="w-4 h-4" />
              <span>Read Mission Story</span>
            </button>
          )}

          {/* Tertiary: Landing Page */}
          {onRestartToLanding && (
            <button
              onClick={() => { spatialAudio.playUiClick(700); onRestartToLanding(); }}
              className="w-full sm:w-auto py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Home className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
          )}
        </div>

      </div>
    </div>

    {/* ══ CERTIFICATE OVERLAY ══════════════════════════════════════════════ */}
    {showCertificate && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md pointer-events-auto select-none">
        <div
          id="orby-certificate"
          className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #0d1117 0%, #161b2e 40%, #0d1117 100%)',
            border: '2px solid rgba(251,191,36,0.6)',
            boxShadow: '0 0 60px rgba(251,191,36,0.15)',
          }}
        >
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

          <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
            {/* NASA-style seal */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-800/10 border-2 border-amber-400/60 flex items-center justify-center shadow-inner">
              <Award className="w-8 h-8 text-amber-400" />
            </div>

            {/* Header */}
            <div>
              <p className="text-[9px] font-black tracking-[0.3em] text-amber-400/80 uppercase font-mono">
                ARTEMIS III — ORBY SPACE PROGRAM
              </p>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white mt-1"
                  style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
                Mission Certificate
              </h2>
            </div>

            {/* Body text */}
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              This certifies that
            </p>
            <p className="text-lg sm:text-xl font-black text-amber-300 tracking-widest"
               style={{ fontFamily: 'var(--font-display)' }}>
              {callsign}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {isVictory
                ? `successfully commanded Artemis Base Camp at the Lunar South Pole for ${day} of 90 days, with ${aliveCount} of 4 crew surviving.`
                : `demonstrated bravery and leadership at the Lunar South Pole, reaching Day ${day} of 90 before the mission was discontinued.`}
            </p>

            {/* Mission label */}
            <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold font-mono tracking-widest uppercase">
              90-Day Lunar South Pole Mission
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-7 h-7 ${n <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                    style={n <= stars ? { filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' } : {}}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-amber-300" style={{ fontFamily: 'var(--font-hud)' }}>
                {STAR_LABELS[stars].label}
              </p>
            </div>

            {/* Score + Date */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Final Score</p>
                <p className="text-base font-black text-white tabular-nums" style={{ fontFamily: 'var(--font-hud)' }}>
                  {highScore.toLocaleString()}
                </p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Date</p>
                <p className="text-xs font-bold text-slate-200">{completionDate}</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Status</p>
                <p className={`text-xs font-black ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isVictory ? 'COMPLETE' : 'INCOMPLETE'}
                </p>
              </div>
            </div>

            {/* Footer rule */}
            <div className="w-full border-t border-amber-500/20 pt-3 flex gap-3 justify-center">
              <button
                onClick={() => { spatialAudio.playUiClick(); window.print(); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save</span>
              </button>
              <button
                onClick={() => { spatialAudio.playUiClick(700); setShowCertificate(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

// ─── Tiny Resource Meter sub-component ───────────────────────────────────────

interface ResourceMeterProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

const ResourceMeter: React.FC<ResourceMeterProps> = ({ icon, label, value, max, unit, color }) => {
  const p = pct(value, max);
  const barColor = p > 50 ? 'bg-emerald-500' : p > 20 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1 ${color}`}>
        {icon}
        <span className="uppercase font-mono">{label}</span>
      </div>
      <div className="text-sm font-bold tabular-nums text-white" style={{ fontFamily: 'var(--font-hud)' }}>
        {Math.round(value)}
        <span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${p}%` }} />
      </div>
      <div className="text-[9px] text-slate-500 mt-0.5">{p}%</div>
    </div>
  );
};
