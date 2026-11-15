/**
 * Task Briefing Card
 * Shown before confirming a crew task assignment.
 * Grade-4 reading level, ≤12 words per line, 44px+ touch targets.
 */

import React from 'react';
import { X, CheckCircle2, Clock, Star } from 'lucide-react';
import { CrewTask, AstronautCrew } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface TaskBriefing {
  emoji: string;
  title: string;
  tutorial: string;
  tacticalTip: string;
  duration: string;
  durationSec: number;
  rewards: string[];
  stationName: string;
  accentClass: string;
  borderClass: string;
  badgeClass: string;
}

const TASK_BRIEFINGS: Record<string, TaskBriefing> = {
  eva_repair: {
    emoji: '🔧',
    title: 'EVA Exterior Repair',
    tutorial:
      'The astronaut suits up and goes outside. They fix solar panels, patch conduits, and clean dust.',
    tacticalTip:
      'Do after a storm or when power is dropping. Dusty panels lose up to 40% output. High radiation risk on EVA.',
    duration: '3:00',
    durationSec: 180,
    rewards: ['+5 Health', 'Solar panels restored', '+Power generation'],
    stationName: 'Solar Array',
    accentClass: 'text-orange-400',
    borderClass: 'border-orange-500/70',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-600/50',
  },
  power_grid: {
    emoji: '⚡',
    title: 'Power Grid Calibration',
    tutorial:
      'The astronaut tunes the Kilopower reactor and checks the solar battery storage. More power = more safety.',
    tacticalTip:
      'Use when battery drops below 30%. If power fails, science cuts first (DR-01), then heating. Act early!',
    duration: '2:30',
    durationSec: 150,
    rewards: ['+3 Health', '+Grid efficiency', 'Battery stabilised'],
    stationName: 'Reactor Bay',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500/70',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-600/50',
  },
  hydroponics: {
    emoji: '🌿',
    title: 'Hydroponic Cultivation',
    tutorial:
      'The astronaut tends the lunar greenhouse. Fresh crops reduce food rations and boost morale for everyone.',
    tacticalTip:
      'Each 28-day harvest cycle gives a morale boost for all 4 crew. Keep Marcus here often for the best base mood.',
    duration: '2:00',
    durationSec: 120,
    rewards: ['+8 Morale', 'Fresh food harvest', 'Morale boost for crew'],
    stationName: 'Greenhouse Bay',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/70',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-600/50',
  },
  research: {
    emoji: '🔬',
    title: 'Scientific Research',
    tutorial:
      'The astronaut maps lunar ice and soil samples. Every session earns mission score points and may unlock a discovery.',
    tacticalTip:
      'Research is cut first if power is low (DR-01). Keep battery above 40% so science stays online.',
    duration: '3:00',
    durationSec: 180,
    rewards: ['+4 Morale', '+Research score', 'Geology discoveries unlocked'],
    stationName: 'Science Lab',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500/70',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-600/50',
  },
  resting: {
    emoji: '😴',
    title: 'Rest & Bunk Recovery',
    tutorial:
      'The astronaut sleeps in their quarters. Rest heals injuries and lifts morale. A rested crew uses less air.',
    tacticalTip:
      'Send crew to rest when health drops below 40%. Never let health hit zero — the mission fails.',
    duration: '2:00',
    durationSec: 120,
    rewards: ['+10 Health', '+6 Morale', 'Lower oxygen use'],
    stationName: 'Crew Quarters',
    accentClass: 'text-blue-400',
    borderClass: 'border-blue-500/70',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-600/50',
  },
  storm_shelter: {
    emoji: '🛡️',
    title: 'Storm Shelter',
    tutorial:
      'The astronaut runs to the underground bunker. This stops all radiation damage during a solar storm.',
    tacticalTip:
      'Solar storm alerts come from real NASA DONKI data. Shelter fast — radiation builds up every second outside.',
    duration: 'Until storm clears',
    durationSec: 0,
    rewards: ['Stops radiation damage', 'Crew protected'],
    stationName: 'Bunker',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/70',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-600/50',
  },
};

interface TaskBriefingCardProps {
  task: CrewTask;
  crew: AstronautCrew;
  onConfirm: () => void;
  onCancel: () => void;
  isReassign: boolean; // true if crew already has an active task
}

export const TaskBriefingCard: React.FC<TaskBriefingCardProps> = ({
  task,
  crew,
  onConfirm,
  onCancel,
  isReassign,
}) => {
  const b = TASK_BRIEFINGS[task];
  if (!b) return null;

  const shortName = crew.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 pointer-events-auto select-none font-mono"
      style={{ background: 'rgba(0,4,16,0.92)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className={`w-full max-w-sm rounded-2xl bg-slate-950 border shadow-2xl text-white relative overflow-y-auto max-h-[90dvh] ${b.borderClass}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none">{b.emoji}</span>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">TASK BRIEFING</div>
              <div className={`text-sm font-black ${b.accentClass}`}>{b.title}</div>
            </div>
          </div>
          <button
            onClick={() => { spatialAudio.playUiClick(); onCancel(); }}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Reassign warning */}
          {isReassign && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-700/60 text-[11px] text-red-300">
              <span className="font-black text-red-400 uppercase">Warning: </span>
              {shortName} is busy. Confirming cancels their current task.
            </div>
          )}

          {/* How it works */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">HOW IT WORKS</div>
            <p className="text-xs text-slate-200 leading-relaxed">{b.tutorial}</p>
          </div>

          {/* Tactical tip */}
          <div className={`p-3 rounded-xl border ${b.badgeClass}`} style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${b.accentClass}`}>⚠ TACTICAL TIP</div>
            <p className="text-xs text-slate-200 leading-relaxed">{b.tacticalTip}</p>
          </div>

          {/* Duration & Rewards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold mb-1">
                <Clock className="w-3 h-3" />
                DURATION
              </div>
              <div className={`text-sm font-black tabular-nums ${b.accentClass}`}>{b.duration}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold mb-1">
                <Star className="w-3 h-3" />
                REWARDS
              </div>
              <ul className="space-y-0.5">
                {b.rewards.map((r, i) => (
                  <li key={i} className="text-[10px] text-emerald-400 font-bold">+ {r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Station indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">DISPATCH TO:</span>
            <span className={`text-[10px] font-black uppercase tracking-wide ${b.accentClass}`}>{b.stationName}</span>
          </div>

          {/* Action buttons — 44px+ touch targets */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { spatialAudio.playUiClick(); onCancel(); }}
              className="flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95 border border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => { spatialAudio.playUiClick(1000); onConfirm(); }}
              className={`flex-1 min-h-[44px] rounded-xl text-white text-xs font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg ${
                isReassign
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isReassign ? 'Reassign' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Station name for a given task — used by crew cards */
export function taskStationName(task: CrewTask): string {
  return TASK_BRIEFINGS[task]?.stationName ?? 'Base Camp';
}
