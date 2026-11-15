import React from 'react';
import { Heart } from 'lucide-react';
import { MetalButton } from '../common/MetalButton.tsx';
import { CounterChips } from '../common/CounterChips.tsx';
import { OrbyProfile } from '../../game/profileStore.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface MenuScreenProps {
  profile: OrbyProfile;
  onGameStart: () => void;
  onPractice: () => void;
  onSolarSystem: () => void;
  onCompete: () => void;
  onClaimGift: () => void;
  onBackToLanding?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  profile,
  onGameStart,
  onPractice,
  onSolarSystem,
  onCompete,
  onClaimGift,
  onBackToLanding,
}) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030408] select-none flex flex-col justify-between">
      {/* Background Deep Space Nebula & Planetary Art */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Distant Colorful Planets */}
        <div className="absolute top-12 left-1/4 w-44 h-44 rounded-full bg-gradient-to-tr from-rose-900 via-amber-700 to-yellow-500 opacity-60 blur-xs" />
        <div className="absolute top-8 left-[38%] w-64 h-64 rounded-full bg-gradient-to-tr from-sky-900 via-emerald-700 to-teal-400 opacity-75 blur-xs border border-teal-300/30" />
        <div className="absolute top-4 right-[16%] w-80 h-80 rounded-full bg-gradient-to-tr from-purple-900 via-indigo-700 to-violet-500 opacity-70 blur-xs" />

        {/* Deep Nebula Hues */}
        <div className="absolute top-0 inset-x-0 h-2/3 bg-radial from-purple-900/30 via-indigo-950/20 to-transparent" />

        {/* Twinkling Stars */}
        <div className="absolute top-16 left-[10%] w-1.5 h-1.5 rounded-full bg-white star-twinkle-fast" />
        <div className="absolute top-28 left-[28%] w-1 h-1 rounded-full bg-sky-200 star-twinkle-medium" />
        <div className="absolute top-10 right-[30%] w-2 h-2 rounded-full bg-amber-200 star-twinkle-slow" />
        <div className="absolute top-40 right-[12%] w-1.5 h-1.5 rounded-full bg-purple-200 star-twinkle-fast" />

        {/* Bottom Moon Regolith Ground Horizon */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-900 via-slate-950 to-transparent">
          {/* Stylized Lunar Crater Skyline Silhouette */}
          <svg className="w-full h-full text-slate-800/80 preserve-3d" viewBox="0 0 1200 160" fill="currentColor">
            <path d="M0,160 L0,80 Q100,50 200,75 Q320,110 420,60 Q520,30 620,65 Q740,95 860,50 Q980,35 1100,70 L1200,60 L1200,160 Z" />
            <ellipse cx="250" cy="115" rx="45" ry="12" fill="#0f172a" />
            <ellipse cx="680" cy="120" rx="70" ry="16" fill="#0f172a" />
            <ellipse cx="1020" cy="110" rx="55" ry="14" fill="#0f172a" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER BAR: Counters & Gift */}
      <div className="relative z-20">
        <CounterChips
          profile={profile}
          showExtraIcons={false}
          onClaimGift={onClaimGift}
        />
      </div>

      {/* CENTERPIECE: Menu Glass Panel with 4 Metallic Buttons */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 w-full max-w-6xl mx-auto">
        <div className="w-full flex items-center justify-between">
          {/* Left Decorative Illustration: Waving Astronaut */}
          <div className="hidden lg:flex flex-col items-center justify-end w-64 h-96 pointer-events-none">
            <div className="relative w-56 h-80 rounded-2xl bg-gradient-to-b from-purple-950/60 to-slate-900/80 border border-purple-500/30 p-3 shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Astronaut Character Graphic */}
              <svg className="w-48 h-72 drop-shadow-xl" viewBox="0 0 120 180" fill="none">
                {/* Waving Right Hand */}
                <circle cx="104" cy="50" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                <path d="M84 75 L102 54" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                {/* Left Arm Resting */}
                <path d="M36 75 L20 110" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                <circle cx="18" cy="114" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                {/* Backpack */}
                <rect x="32" y="55" width="56" height="60" rx="10" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                {/* Torso */}
                <rect x="38" y="65" width="44" height="52" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
                {/* NASA Chest Badge */}
                <rect x="46" y="74" width="14" height="10" rx="2" fill="#0284c7" />
                <circle cx="70" cy="79" r="4" fill="#ef4444" />
                {/* Belt */}
                <rect x="40" y="102" width="40" height="6" rx="2" fill="#f59e0b" />
                {/* Legs */}
                <rect x="42" y="116" width="14" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="64" y="116" width="14" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                {/* Boots */}
                <rect x="38" y="152" width="20" height="12" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
                <rect x="62" y="152" width="20" height="12" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
                {/* Helmet Head */}
                <circle cx="60" cy="42" r="26" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
                {/* Reflective Visor */}
                <ellipse cx="60" cy="42" rx="19" ry="16" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
                <ellipse cx="60" cy="42" rx="16" ry="13" fill="#38bdf8" fillOpacity="0.85" />
                <circle cx="53" cy="37" r="4" fill="#ffffff" fillOpacity="0.8" />
              </svg>
            </div>
          </div>

          {/* Center Main Action Panel */}
          <div className="flex-1 max-w-md mx-auto flex flex-col items-center">
            {/* Embossed Metallic Header Plate */}
            <div className="relative mb-6 px-10 py-3 rounded-2xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-2 border-slate-400 shadow-xl shadow-black/60 flex items-center justify-center">
              <span className="font-display font-black text-2xl sm:text-3xl tracking-widest text-slate-800 uppercase drop-shadow-sm">
                Launch Mission
              </span>
            </div>

            {/* Glass Panel Housing 4 Metallic Buttons */}
            <div className="w-full p-6 sm:p-8 rounded-3xl orby-glass flex flex-col gap-4">
              {/* 1. GAME START */}
              <MetalButton
                onClick={onGameStart}
                className="w-full py-4 text-base sm:text-lg"
              >
                GAME START
              </MetalButton>

              {/* 2. PRACTICE */}
              <MetalButton
                onClick={onPractice}
                className="w-full py-4 text-base sm:text-lg"
              >
                PRACTICE
              </MetalButton>

              {/* 3. SOLAR SYSTEM */}
              <MetalButton
                onClick={onSolarSystem}
                className="w-full py-4 text-base sm:text-lg"
              >
                SOLAR SYSTEM
              </MetalButton>

              {/* 4. COMPETE */}
              <MetalButton
                onClick={onCompete}
                className="w-full py-4 text-base sm:text-lg"
              >
                COMPETE
              </MetalButton>

              {/* Commander Readiness Bar */}
              <div className="mt-3 flex items-center gap-3 px-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500 shrink-0" />
                <div
                  className="flex-1 h-3.5 rounded-full bg-slate-950/80 border border-slate-700/80 p-0.5 overflow-hidden"
                  title={`Commander Readiness: ${profile.readiness}%`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 shadow-sm transition-all duration-500"
                    style={{ width: `${profile.readiness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Decorative Illustration: Rocket Launching */}
          <div className="hidden lg:flex flex-col items-center justify-end w-64 h-96 pointer-events-none">
            <div className="relative w-56 h-80 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900/80 border border-indigo-500/30 p-3 shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Launch Shuttle Illustration */}
              <svg className="w-48 h-72 drop-shadow-2xl" viewBox="0 0 120 180" fill="none">
                {/* Smoke Plume */}
                <ellipse cx="60" cy="165" rx="50" ry="18" fill="#e2e8f0" fillOpacity="0.4" />
                <ellipse cx="60" cy="155" rx="35" ry="14" fill="#f59e0b" fillOpacity="0.6" />
                {/* Thrust Fire */}
                <polygon points="50,110 70,110 60,160" fill="#f59e0b" />
                <polygon points="54,110 66,110 60,145" fill="#fef08a" />
                {/* Rocket SLS Orange Tank */}
                <rect x="52" y="35" width="16" height="75" rx="4" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
                <polygon points="52,35 68,35 60,20" fill="#ea580c" />
                {/* Left White Solid Booster */}
                <rect x="40" y="45" width="8" height="65" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <polygon points="40,45 48,45 44,32" fill="#f8fafc" />
                {/* Right White Solid Booster */}
                <rect x="72" y="45" width="8" height="65" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <polygon points="72,45 80,45 76,32" fill="#f8fafc" />
                {/* Orion Capsule on Top */}
                <polygon points="54,20 66,20 60,8" fill="#f8fafc" />
                <line x1="60" y1="8" x2="60" y2="0" stroke="#f8fafc" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER: Optional Back to Landing */}
      <footer className="relative z-20 px-8 py-4 flex items-center justify-between text-xs font-mono text-slate-500 pointer-events-auto">
        {onBackToLanding && (
          <button
            onClick={() => {
              spatialAudio.playUiClick(700);
              onBackToLanding();
            }}
            className="text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            ← Back to Landing
          </button>
        )}
        <span className="ml-auto">
          ORBY Version 1.0 · Season 01
        </span>
      </footer>
    </div>
  );
};
