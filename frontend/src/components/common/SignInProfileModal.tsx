import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { OrbyProfile, saveProfile } from '../../game/profileStore.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface SignInProfileModalProps {
  profile: OrbyProfile;
  onUpdateProfile: (updated: OrbyProfile) => void;
  onClose: () => void;
}

export const SignInProfileModal: React.FC<SignInProfileModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [callsign, setCallsign] = useState(profile.callsign);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = callsign.trim().toUpperCase() || 'VALKYRIE-1';
    const updated = saveProfile({ callsign: clean });
    onUpdateProfile(updated);
    spatialAudio.playUiClick(1000);
    setSavedMsg(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-950/95 border border-purple-500/50 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-[10px] tracking-widest text-cyan-400 uppercase">
              LOCAL COMMANDER PROFILE
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              ORBY IDENTITY
            </h2>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Commander Callsign
            </label>
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value.toUpperCase())}
              maxLength={16}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-display font-bold text-sm tracking-wider focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">CREDITS</div>
              <div className="font-display font-bold text-amber-400 text-base">
                {profile.credits}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">STREAK</div>
              <div className="font-display font-bold text-orange-400 text-base">
                {profile.streak}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-mono">STARS</div>
              <div className="font-display font-bold text-yellow-300 text-base">
                {profile.stars}
              </div>
            </div>
          </div>

          {savedMsg && (
            <div className="p-2 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono text-center">
              Profile updated successfully!
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display text-xs uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-display text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-900/40"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
