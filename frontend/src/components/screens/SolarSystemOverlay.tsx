import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Globe,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  Compass,
  Thermometer,
  Shield,
  Rocket,
  ChevronRight,
  Menu,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';
import { SOLAR_SYSTEM_DATA, CelestialBodyData } from '../../data/solarSystemData.ts';

interface SolarSystemOverlayProps {
  onBackToLanding: () => void;
  onSelectTarget: (targetName: string) => void;
  onSelectSpeed: (speed: number) => void;
  onToggleMute: () => void;
  onProceedToHangar?: () => void;
  onEstablishOutpost?: (destination: 'Moon' | 'Mars') => void;
  isMuted: boolean;
  selectedTargetName?: string;
}

const CELESTIAL_TARGETS = [
  { id: 'Sun', label: 'Sun', color: 'text-amber-400' },
  { id: 'Mercury', label: 'Mercury', color: 'text-slate-300' },
  { id: 'Venus', label: 'Venus', color: 'text-yellow-300' },
  { id: 'Earth', label: 'Earth', color: 'text-sky-300' },
  { id: 'Moon (Artemis)', label: 'Moon (Artemis)', color: 'text-cyan-300' },
  { id: 'Mars', label: 'Mars', color: 'text-orange-400' },
  { id: 'Jupiter', label: 'Jupiter', color: 'text-amber-500' },
  { id: 'Saturn', label: 'Saturn', color: 'text-yellow-500' },
];

export const SolarSystemOverlay: React.FC<SolarSystemOverlayProps> = ({
  onBackToLanding,
  onSelectTarget,
  onSelectSpeed,
  onToggleMute,
  onProceedToHangar,
  onEstablishOutpost,
  isMuted,
  selectedTargetName = 'System View',
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(selectedTargetName);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTargetName && selectedTargetName !== selectedTarget) {
      setSelectedTarget(selectedTargetName);
    }
  }, [selectedTargetName]);

  const handleTargetClick = (targetId: string) => {
    spatialAudio.playUiClick(1000);
    setSelectedTarget(targetId);
    onSelectTarget(targetId);
  };

  const handleCloseDetail = () => {
    spatialAudio.playUiClick(750);
    setSelectedTarget('System View');
    onSelectTarget('System View');
  };

  const handleSpeedClick = (spd: number) => {
    spatialAudio.playUiClick(850);
    setIsPaused(false);
    setCurrentSpeed(spd);
    onSelectSpeed(spd);
  };

  const handleTogglePause = () => {
    spatialAudio.playUiClick(800);
    if (isPaused) {
      setIsPaused(false);
      onSelectSpeed(currentSpeed);
    } else {
      setIsPaused(true);
      onSelectSpeed(0);
    }
  };

  const activeBodyData: CelestialBodyData | null =
    selectedTarget !== 'System View' ? SOLAR_SYSTEM_DATA[selectedTarget] || null : null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6 z-30 font-sans">
      {/* TOP HEADER ROW */}
      <div className="w-full flex items-start justify-between gap-4">
        {/* Left Side: SimonDev Sci-Fi Holographic Info Card */}
        {activeBodyData ? (
          <div className="pointer-events-auto w-full max-w-sm sm:max-w-[390px] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl bg-[#0b1328]/88 backdrop-blur-xl border border-sky-500/40 shadow-[0_0_35px_rgba(14,165,233,0.22)] p-4 sm:p-5 flex flex-col gap-3.5 text-white animate-in fade-in slide-in-from-left-4 duration-200">
            {/* Top Navigation Row: Back, Category & Close */}
            <div className="flex items-center justify-between gap-2 border-b border-sky-900/50 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    spatialAudio.playUiClick(750);
                    onBackToLanding();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 text-[11px] font-semibold text-slate-300 hover:text-sky-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                  title="Back to Landing"
                >
                  <ArrowLeft className="w-3 h-3 text-sky-400" />
                  <span>Landing</span>
                </button>
                <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-600/40 text-[9px] font-bold uppercase tracking-wider text-sky-400 font-mono truncate max-w-[170px]">
                  {activeBodyData.tag}
                </span>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Return to System View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SimonDev Signature Header: Hamburger Menu Icon + Bold Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 transition-colors cursor-pointer"
                title="Toggle Target Menu"
              >
                <Menu className="w-5 h-5 text-sky-300" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-wide text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {activeBodyData.name.replace(/\s\(Sol\)/, '').replace(/\s\(Luna\s\/\sArtemis\)/, '')}
              </h1>
            </div>

            {/* Scientific Description Paragraph (Authentic SimonDev Text) */}
            <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">
              {activeBodyData.description}
            </p>

            {/* 4 Telemetry Metrics Grid (2x2) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Gravity */}
              <div className="p-2 rounded-xl bg-slate-900/80 border border-sky-900/60 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-sky-400 font-mono">
                  <Compass className="w-3 h-3" />
                  <span>GRAVITY</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 font-mono">
                  {activeBodyData.gravity.split('·')[0].trim()}
                </div>
              </div>

              {/* Temperature */}
              <div className="p-2 rounded-xl bg-slate-900/80 border border-sky-900/60 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                  <Thermometer className="w-3 h-3" />
                  <span>SURFACE TEMP</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 font-mono truncate" title={activeBodyData.temperature}>
                  {activeBodyData.temperature.split('/')[0].trim()}
                </div>
              </div>

              {/* Distance */}
              <div className="p-2 rounded-xl bg-slate-900/80 border border-sky-900/60 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                  <Globe className="w-3 h-3" />
                  <span>SUN DISTANCE</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 font-mono truncate">
                  {activeBodyData.distance.split('·')[0].trim()}
                </div>
              </div>

              {/* Hazard Level */}
              <div className="p-2 rounded-xl bg-slate-900/80 border border-sky-900/60 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-rose-400 font-mono">
                  <Shield className="w-3 h-3" />
                  <span>HAZARD</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 font-mono truncate" title={activeBodyData.hazardLevel}>
                  {activeBodyData.hazardLevel.split('&')[0].trim()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {activeBodyData.isMoon && onProceedToHangar && (
              <button
                onClick={() => {
                  spatialAudio.playUiClick(1200);
                  onProceedToHangar();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:via-orange-400 hover:to-rose-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-orange-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300/80 active:scale-98"
              >
                <Rocket className="w-4 h-4 text-slate-950" />
                <span>PROCEED TO HANGAR BAY</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            )}

            {activeBodyData.id === 'Mars' && (
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 border border-orange-500/30 text-orange-300/80 text-xs font-mono tracking-wide flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-orange-400/70" />
                <span>Educational Preview — Active mission: Lunar South Pole only. Mars outpost coming in Season 02.</span>
              </div>
            )}

            {/* Back to Solar Orbit Button */}
            <button
              onClick={handleCloseDetail}
              className="w-full py-2 px-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/60 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 font-mono"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              <span>Reset to System View</span>
            </button>
          </div>
        ) : (
          /* Back to Landing Button (In System View) */
          <button
            onClick={() => {
              spatialAudio.playUiClick(750);
              onBackToLanding();
            }}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b1328]/90 hover:bg-[#121c3b] border border-sky-500/40 text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-xl shadow-black/80 hover:border-sky-400 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-wide">Back to Landing</span>
          </button>
        )}

        {/* Right Side: SimonDev-Inspired Multi-Menu Bar (Scene / Targets / Speed) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2.5">
          {/* Top Quick Tabs (SimonDev Style: Scene ≡, PostFX ≡, Project ≡) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b1328]/90 backdrop-blur-md border border-slate-700/70 shadow-lg text-[11px] font-mono">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMenuOpen
                  ? 'bg-sky-500/30 text-sky-300 border border-sky-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Targets ≡</span>
            </button>

            <button
              onClick={() => handleTargetClick('System View')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedTarget === 'System View'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Overview
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                spatialAudio.playUiClick(750);
                onToggleMute();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-slate-800"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              )}
            </button>
          </div>

          {/* Collapsible Celestial Targets Drawer */}
          {(isMenuOpen || selectedTarget === 'System View') && (
            <div className="w-72 sm:w-80 rounded-2xl bg-[#0b1328]/92 backdrop-blur-xl border border-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.18)] p-3.5 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-sky-950 pb-2">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-bold tracking-widest uppercase font-mono">
                    CELESTIAL TARGET
                  </span>
                </div>
                <button
                  onClick={() => handleTargetClick('System View')}
                  className={`text-[10px] font-semibold transition-colors cursor-pointer font-mono ${
                    selectedTarget === 'System View'
                      ? 'text-sky-400 underline font-bold'
                      : 'text-slate-400 hover:text-sky-300'
                  }`}
                >
                  System View
                </button>
              </div>

              {/* Targets Grid */}
              <div className="grid grid-cols-2 gap-1.5 py-0.5">
                {CELESTIAL_TARGETS.map((target) => {
                  const isSelected = selectedTarget === target.id;
                  const isSun = target.id === 'Sun';

                  return (
                    <button
                      key={target.id}
                      onClick={() => handleTargetClick(target.id)}
                      className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-150 cursor-pointer font-medium truncate font-mono ${
                        isSelected
                          ? isSun
                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-950/60 border border-amber-300/60'
                            : 'bg-sky-500/25 text-sky-200 font-bold border border-sky-400/60 shadow-md shadow-sky-950/40'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {target.label}
                    </button>
                  );
                })}
              </div>

              {/* Simulation Orbit Speed Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-sky-950">
                <button
                  onClick={handleTogglePause}
                  className={`p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer ${
                    isPaused ? 'bg-amber-500/30 text-amber-300' : 'hover:bg-slate-800'
                  }`}
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1 font-mono">
                  {[0.5, 1, 2, 4].map((spd) => {
                    const isActive = !isPaused && currentSpeed === spd;
                    return (
                      <button
                        key={spd}
                        onClick={() => handleSpeedClick(spd)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-sky-500 text-white shadow-md font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        {spd}x
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM INSTRUCTION PILL (SimonDev Style) */}
      <div className="w-full flex justify-center mb-1">
        <div className="pointer-events-auto px-5 py-2 rounded-full bg-[#0b1328]/85 backdrop-blur-md border border-sky-500/30 text-[11px] text-slate-300 flex items-center gap-2 shadow-2xl shadow-black font-mono">
          <span>Click & Drag to Orbit Camera</span>
          <span className="text-slate-600">·</span>
          <span>Scroll to Zoom</span>
          <span className="text-slate-600">·</span>
          <span className="text-sky-400 font-semibold">
            {selectedTarget === 'Moon (Artemis)'
              ? 'Click [PROCEED TO HANGAR] to start mission'
              : 'Click any Planet or Orbit to Inspect'}
          </span>
        </div>
      </div>
    </div>
  );
};
