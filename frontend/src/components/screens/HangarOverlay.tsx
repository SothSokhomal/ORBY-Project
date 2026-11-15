import React from 'react';
import { ChevronRight, Rocket, Info, ArrowLeft, Home, X } from 'lucide-react';
import { AstronautCrew } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface HangarOverlayProps {
  crew: AstronautCrew[];
  selectedCrewId: string | null;
  callsign: string;
  onSelectCrew: (crewId: string | null) => void;
  onOpenCrewDetails: (crewId: string) => void;
  onEngageMission: () => void;
  onBackToBriefing: () => void;
  onRestartToLanding: () => void;
}

export const HangarOverlay: React.FC<HangarOverlayProps> = ({
  crew,
  selectedCrewId,
  callsign,
  onSelectCrew,
  onOpenCrewDetails,
  onEngageMission,
  onBackToBriefing,
  onRestartToLanding,
}) => {
  const selectedMember = selectedCrewId
    ? crew.find((c) => c.id === selectedCrewId) || null
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-4 sm:p-6 font-mono text-white">
      {/* TOP HEADER: Hangar Title & Navigation */}
      <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-800/80 shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300 tracking-wider">
              LEVEL 1: PRE-FLIGHT HANGAR BAY
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-xs text-amber-400 font-bold">
              CMDR: {callsign}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any astronaut to inspect vitals or click central console to launch</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              spatialAudio.playUiClick(700);
              onBackToBriefing();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Briefing</span>
          </button>

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
      </div>

      {/* CENTER CREW DISPLAY:
          1. Default state: Do NOT display the 4 detail cards.
          2. When clicked: Displays the single card matching Photo 1.
          3. Clicking the single card opens the full health & vitals modal (Photo 2).
      */}
      <div className="pointer-events-auto self-center w-full max-w-md mt-2 flex flex-col items-center">
        {selectedMember ? (
          /* PHOTO 1 COMPACT CARD: Shown when an astronaut is clicked */
          <div className="w-full max-w-[340px] sm:max-w-[370px] animate-in fade-in slide-in-from-top-3 duration-200">
            {/* Header above card */}
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between px-1">
              <span>ORBY MISSION CREW (ACES SUITS)</span>
              <button
                onClick={() => {
                  spatialAudio.playUiClick(700);
                  onSelectCrew(null);
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-[10px] flex items-center gap-1 font-mono"
                title="Deselect Astronaut"
              >
                <span>Close</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Photo 1 Interactive Card (Click to open Photo 2 Details) */}
            <button
              onClick={() => {
                spatialAudio.playRadioSquawk();
                onOpenCrewDetails(selectedMember.id);
              }}
              className="w-full p-4 sm:p-5 rounded-2xl bg-[#070b14]/90 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_22px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] hover:border-cyan-300 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Top Row: Suit Color Dot & HP */}
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: selectedMember.suitColor }}
                />
                <span className="text-xs text-cyan-400 font-mono font-bold tracking-wide">
                  {Math.round(selectedMember.health)}% HP
                </span>
              </div>

              {/* Middle Row: Astronaut Name */}
              <div className="font-mono font-bold text-white text-lg sm:text-xl tracking-tight group-hover:text-cyan-200 transition-colors">
                {selectedMember.name}
              </div>

              {/* Bottom Row: Role & Click Cue */}
              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center justify-between w-full">
                <span>{selectedMember.role}</span>
                <span className="text-[10px] text-cyan-400/90 group-hover:text-cyan-300 flex items-center gap-0.5 font-sans font-medium">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          </div>
        ) : null}
      </div>

      {/* BOTTOM CONTROLS: Launch pad dispatch button */}
      <div className="pointer-events-auto flex flex-col items-center justify-center gap-2 mb-2">
        <div className="px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 text-center shadow-lg">
          ⚡ Ready for departure. Click the glowing 3D terminal button or press below:
        </div>

        <button
          onClick={() => {
            spatialAudio.playUiClick(1200);
            onEngageMission();
          }}
          className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:via-orange-400 hover:to-rose-500 text-slate-950 font-black text-sm sm:text-base tracking-widest uppercase shadow-xl shadow-orange-950/50 hover:shadow-orange-900/80 transition-all cursor-pointer flex items-center gap-3 border-2 border-amber-300/60 active:scale-98"
        >
          <Rocket className="w-5 h-5 text-slate-950 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          <span>LAUNCH TO ARTEMIS PAD</span>
          <ChevronRight className="w-5 h-5 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
