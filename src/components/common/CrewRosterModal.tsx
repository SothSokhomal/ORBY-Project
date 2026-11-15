import React from 'react';
import { X, Shield, Award, Heart, Activity } from 'lucide-react';
import { createInitialCrew } from '../../game/survivalRules.ts';

interface CrewRosterModalProps {
  onClose: () => void;
}

export const CrewRosterModal: React.FC<CrewRosterModalProps> = ({ onClose }) => {
  const crew = createInitialCrew();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-950/95 border border-purple-500/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-600/30 border border-orange-500 flex items-center justify-center text-orange-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-xs tracking-widest text-orange-400 uppercase">
              NASA ACES ASTRONAUT ROSTER
            </div>
            <h2 className="font-display text-xl font-black text-white">
              ARTEMIS-III EXPEDITION CREW
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {crew.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-base font-bold text-white">
                    {member.name}
                  </div>
                  <div className="text-xs font-mono text-cyan-400">
                    {member.role} · Callsign: {member.callsign}
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-orange-950/70 border border-orange-500/50 text-[10px] font-mono font-bold text-orange-300">
                  ACES FIT
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                {member.bio}
              </p>

              <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Vitals: 100%
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> {member.specialty}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-display text-xs uppercase tracking-wider cursor-pointer"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
