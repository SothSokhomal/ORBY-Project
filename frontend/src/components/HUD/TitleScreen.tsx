/**
 * Project Artemis: Title Screen & Game Shell
 * Inline bespoke SVG title lockup, atmospheric start sequence,
 * and zero-clutter control hint line.
 */

import React, { useEffect } from 'react';
import { Play, Sparkles, Volume2, Shield, Sliders, BookOpen } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  callsign: string;
  onChangeCallsign: (val: string) => void;
  onOpenManual?: () => void;
  onOpenGear?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  callsign,
  onChangeCallsign,
  onOpenManual,
  onOpenGear,
}) => {
  // Listen for Enter or Space to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-8 pointer-events-none select-none text-white">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-600/30 border border-orange-500/60 flex items-center justify-center text-orange-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] tracking-widest text-orange-400 font-mono uppercase">
              NASA EXPLORATION SYSTEMS · DEEP SPACE DIRECTIVE
            </div>
            <div className="text-xs text-slate-400 font-mono">
              STAGE 4 ARCHITECTURE · LUNAR EXPEDITION 2026+
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded border border-slate-700 bg-slate-900/60 text-[11px] font-mono text-slate-300">
          SYS STATUS: <span className="text-emerald-400 font-bold">NOMINAL</span>
        </div>
      </div>

      {/* Main Title Centerpiece Lockup */}
      <div className="max-w-2xl my-auto ml-4 md:ml-12 pointer-events-auto">
        {/* Custom Inline SVG Emblem */}
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-12 h-12 text-orange-500" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4L6 54L32 44L58 54L32 4Z"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="rgba(255, 85, 0, 0.15)"
            />
            <circle cx="32" cy="28" r="8" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M24 38L32 16L40 38" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="text-xs font-mono tracking-[0.25em] text-orange-400 uppercase">
            Project Artemis III
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white uppercase drop-shadow-md">
          90 DAYS ON THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-sky-300">
            LUNAR FRONTIER
          </span>
        </h1>

        <p className="mt-4 text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
          Lead a 4-person ACES astronaut crew through a 90-day mission on the Moon's South Pole.
          Balance closed-loop ECLSS life support, survive freezing polar dark intervals, manage the Kilopower
          nuclear grid, and repel coronal mass ejection solar storms.
        </p>

        {/* Commander Callsign Input & Start CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-slate-900/80 border border-slate-700">
            <span className="text-xs font-mono text-slate-400 uppercase">CALLSIGN:</span>
            <input
              type="text"
              value={callsign}
              onChange={(e) => onChangeCallsign(e.target.value.toUpperCase())}
              maxLength={14}
              className="bg-transparent border-none outline-none font-mono font-bold text-orange-400 w-32 text-sm tracking-wider"
              placeholder="ARTEMIS-III"
            />
          </div>

          <button
            data-start="true"
            onClick={onStartGame}
            className="flex items-center justify-center gap-3 px-8 py-3.5 rounded bg-orange-600 hover:bg-orange-500 active:scale-95 transition-all text-white font-mono font-bold tracking-wider uppercase shadow-lg shadow-orange-950/50 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>COMMENCE MISSION</span>
          </button>

          {onOpenGear && (
            <button
              onClick={onOpenGear}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono font-bold tracking-wider uppercase text-xs cursor-pointer transition-all"
              title="Pick Mission Gear Loadout [G]"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>GEAR LOADOUT [G]</span>
            </button>
          )}

          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-mono font-bold tracking-wider uppercase text-xs cursor-pointer transition-all"
              title="How to Play & Step-by-Step Flight Manual [?]"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>HOW TO PLAY [?]</span>
            </button>
          )}
        </div>
      </div>

      {/* Flat Control Hints Line at Bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-4 pointer-events-auto">
        <div className="flex items-center gap-4 flex-wrap">
          <span>Click 3D Objects · WASD / Drag Camera · [G] Gear Loadout · [?] Flight Manual · [H] HUD</span>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Press [Space] or [Enter] to Engage</span>
        </div>
      </div>
    </div>
  );
};
