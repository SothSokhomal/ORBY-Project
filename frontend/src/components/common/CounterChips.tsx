import React from 'react';
import { Gift, Key, Trophy } from 'lucide-react';
import { OrbyProfile } from '../../game/profileStore.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface CounterChipsProps {
  profile: OrbyProfile;
  showExtraIcons?: boolean;
  onClaimGift?: () => void;
  onOpenKey?: () => void;
  onOpenTrophy?: () => void;
}

export const CounterChips: React.FC<CounterChipsProps> = ({
  profile,
  showExtraIcons = false,
  onClaimGift,
  onOpenKey,
  onOpenTrophy,
}) => {
  return (
    <div className="w-full flex items-center justify-between p-6 pointer-events-auto select-none">
      {/* Top Left Counters */}
      <div className="flex flex-col gap-2">
        {/* Credits */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 border border-sky-300 shadow-md flex items-center justify-center text-[13px] font-black text-amber-300">
            🪙
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-slate-100">
            x{profile.credits}
          </span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-orange-400 to-red-600 border border-orange-300 shadow-md flex items-center justify-center text-[13px]">
            🔥
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-slate-100">
            x{profile.streak}
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-300 to-yellow-600 border border-yellow-200 shadow-md flex items-center justify-center text-[13px]">
            ⭐
          </div>
          <span className="font-display text-sm font-bold tracking-wider text-slate-100">
            x{profile.stars}
          </span>
        </div>
      </div>

      {/* Top Right Action Icons */}
      <div className="flex items-center gap-3">
        {onClaimGift && (
          <button
            onClick={() => {
              spatialAudio.playUiClick(1200);
              onClaimGift();
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-400 to-teal-700 border border-emerald-300 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Claim Daily Supply Drop"
          >
            <Gift className="w-5 h-5 text-amber-200" />
          </button>
        )}

        {showExtraIcons && onOpenKey && (
          <button
            onClick={() => {
              spatialAudio.playUiClick(1000);
              onOpenKey();
            }}
            className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-600 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform text-amber-300"
            title="Unlockables & Seasonal Badges"
          >
            <Key className="w-5 h-5" />
          </button>
        )}

        {showExtraIcons && onOpenTrophy && (
          <button
            onClick={() => {
              spatialAudio.playUiClick(1000);
              onOpenTrophy();
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-yellow-700 border border-amber-300 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform text-slate-900"
            title="Global Leaderboard & Rankings"
          >
            <Trophy className="w-5 h-5 fill-slate-900" />
          </button>
        )}
      </div>
    </div>
  );
};
