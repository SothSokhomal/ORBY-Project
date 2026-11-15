import React, { useEffect, useState } from 'react';
import { Rocket, FastForward, AlertCircle, Radio, Home } from 'lucide-react';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface LaunchPadOverlayProps {
  countdownTime?: number;
  onSkipToOutpost: () => void;
  onRestartToLanding: () => void;
}

export const LaunchPadOverlay: React.FC<LaunchPadOverlayProps> = ({
  onSkipToOutpost,
  onRestartToLanding,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStageMessage = () => {
    if (secondsRemaining > 3) {
      return { status: 'COUNTDOWN', text: 'UMBILICAL GANTRY ARMS RETRACTING...', color: 'text-amber-400' };
    }
    if (secondsRemaining > 1) {
      return { status: 'IGNITION', text: 'RS-25 MAIN ENGINES IGNITED · CORE STAGE FIRING', color: 'text-orange-400' };
    }
    return { status: 'LIFTOFF', text: 'LIFTOFF CONFIRMED · ASCENDING TO LUNAR INJECTION', color: 'text-emerald-400' };
  };

  const stage = getStageMessage();

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-4 sm:p-6 font-mono text-white">
      {/* TOP HEADER */}
      <div className="pointer-events-auto flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-orange-500/60 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
          <span className="text-xs font-bold text-orange-300 tracking-wider">
            LEVEL 2: ARTEMIS LAUNCH PAD (KENNEDY SPACE CENTER)
          </span>
        </div>

        <button
          onClick={() => {
            spatialAudio.playUiClick(700);
            onRestartToLanding();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-md"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Landing</span>
        </button>
      </div>

      {/* CENTER TELEMETRY: Cinematic Countdown HUD */}
      <div className="self-center flex flex-col items-center gap-3 text-center pointer-events-auto">
        <div className="px-6 py-4 rounded-3xl bg-slate-950/85 backdrop-blur-md border border-orange-500/40 shadow-2xl flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest mb-1">
            <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>ARTEMIS-III MISSION CLOCK</span>
          </div>

          <div className="text-4xl sm:text-6xl font-black font-display tracking-wider text-white tabular-nums drop-shadow-lg">
            T-00:00:0{secondsRemaining}
          </div>

          <div className={`mt-2 text-xs sm:text-sm font-bold tracking-wide uppercase ${stage.color}`}>
            {stage.text}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION: Skip to Outpost button */}
      <div className="pointer-events-auto self-center flex items-center gap-3 mb-2">
        <button
          onClick={() => {
            spatialAudio.playUiClick(1100);
            onSkipToOutpost();
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg flex items-center gap-2"
        >
          <span>Skip to Lunar Outpost</span>
          <FastForward className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
