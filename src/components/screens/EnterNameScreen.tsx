import React, { useState, useEffect } from 'react';
import { CounterChips } from '../common/CounterChips.tsx';
import { MetalButton } from '../common/MetalButton.tsx';
import { OrbyProfile, saveProfile } from '../../game/profileStore.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface EnterNameScreenProps {
  profile: OrbyProfile;
  onStart: (callsign: string) => void;
  onBack: () => void;
  onClaimGift: () => void;
  onOpenKey: () => void;
  onOpenTrophy: () => void;
}

export const EnterNameScreen: React.FC<EnterNameScreenProps> = ({
  profile,
  onStart,
  onBack,
  onClaimGift,
  onOpenKey,
  onOpenTrophy,
}) => {
  const [callsign, setCallsign] = useState(profile.callsign || 'VALKYRIE-1');
  const [error, setError] = useState<string | null>(null);

  // Validate callsign: 2 - 16 characters, letters, digits, spaces, hyphens
  const isValidCallsign = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.length < 2 || trimmed.length > 16) return false;
    return /^[A-Z0-9 -]+$/i.test(trimmed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase();
    setCallsign(upper);
    if (!isValidCallsign(upper)) {
      setError('2-16 characters (letters, numbers, hyphens only)');
    } else {
      setError(null);
    }
  };

  const handleConfirm = () => {
    const trimmed = callsign.trim().toUpperCase();
    if (!isValidCallsign(trimmed)) {
      setError('Please enter a valid callsign (2-16 characters)');
      return;
    }
    spatialAudio.playUiClick(1000);
    saveProfile({ callsign: trimmed });
    onStart(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  const isValid = isValidCallsign(callsign);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030408] select-none flex flex-col justify-between">
      {/* Background Deep Space Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Distant Colorful Planets */}
        <div className="absolute top-16 left-[18%] w-44 h-44 rounded-full bg-gradient-to-tr from-rose-900 via-amber-700 to-yellow-500 opacity-60 blur-xs" />
        <div className="absolute top-10 left-[34%] w-68 h-68 rounded-full bg-gradient-to-tr from-sky-900 via-emerald-700 to-teal-400 opacity-75 blur-xs border border-teal-300/30" />
        <div className="absolute top-6 right-[12%] w-84 h-84 rounded-full bg-gradient-to-tr from-purple-900 via-indigo-700 to-violet-500 opacity-70 blur-xs" />

        {/* Twinkling Stars */}
        <div className="absolute top-20 left-[12%] w-1.5 h-1.5 rounded-full bg-white star-twinkle-fast" />
        <div className="absolute top-36 left-[45%] w-1 h-1 rounded-full bg-sky-200 star-twinkle-medium" />
        <div className="absolute top-14 right-[28%] w-2 h-2 rounded-full bg-amber-200 star-twinkle-slow" />

        {/* Moon Regolith Ground Horizon */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-slate-900 via-slate-950 to-transparent">
          <svg className="w-full h-full text-slate-800/80 preserve-3d" viewBox="0 0 1200 160" fill="currentColor">
            <path d="M0,160 L0,80 Q100,50 200,75 Q320,110 420,60 Q520,30 620,65 Q740,95 860,50 Q980,35 1100,70 L1200,60 L1200,160 Z" />
            <ellipse cx="300" cy="115" rx="55" ry="14" fill="#0f172a" />
            <ellipse cx="780" cy="120" rx="60" ry="15" fill="#0f172a" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER: Counters, Gift, Key, Trophy */}
      <div className="relative z-20">
        <CounterChips
          profile={profile}
          showExtraIcons={true}
          onClaimGift={onClaimGift}
          onOpenKey={onOpenKey}
          onOpenTrophy={onOpenTrophy}
        />
      </div>

      {/* CENTERPIECE: ENTER NAME BOX & START BUTTON */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-lg mx-auto">
        <div className="w-full flex flex-col items-center">
          {/* Glass Card Container */}
          <div className="w-full p-8 rounded-3xl orby-glass flex flex-col items-center">
            {/* Embossed Metallic Pill Header Plate */}
            <div className="w-full max-w-sm py-3.5 px-6 rounded-2xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-2 border-slate-400 shadow-xl shadow-black/60 flex items-center justify-center mb-6">
              <span className="font-display font-black text-xl sm:text-2xl tracking-widest text-slate-800 uppercase">
                ENTER NAME:
              </span>
            </div>

            {/* Input Field */}
            <div className="w-full max-w-sm">
              <input
                type="text"
                value={callsign}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={16}
                placeholder="VALKYRIE-1"
                autoFocus
                className="w-full px-5 py-3.5 rounded-xl bg-slate-950/80 border-2 border-slate-600 focus:border-amber-400 text-center font-display font-black text-xl sm:text-2xl text-amber-300 tracking-widest uppercase outline-none shadow-inner transition-colors"
              />

              {/* Inline Validation Error */}
              {error ? (
                <p className="mt-2 text-xs font-mono text-rose-400 text-center animate-pulse">
                  {error}
                </p>
              ) : (
                <p className="mt-2 text-[11px] font-mono text-slate-400 text-center">
                  This callsign will identify your crew on the Lunar Frontier.
                </p>
              )}
            </div>

            {/* Center Start Button */}
            <div className="w-full max-w-xs mt-6">
              <MetalButton
                onClick={handleConfirm}
                disabled={!isValid}
                className="w-full py-4 text-xl tracking-widest"
              >
                Start
              </MetalButton>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM CONTROL BAR: Back & Next */}
      <footer className="relative z-20 px-8 py-6 w-full max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Back Button */}
        <MetalButton
          onClick={onBack}
          className="px-8 py-3 text-sm sm:text-base font-bold"
        >
          ← Back
        </MetalButton>

        {/* Next Button (Enabled when valid) */}
        <MetalButton
          onClick={handleConfirm}
          disabled={!isValid}
          className="px-8 py-3 text-sm sm:text-base font-bold"
        >
          Next →
        </MetalButton>
      </footer>
    </div>
  );
};
