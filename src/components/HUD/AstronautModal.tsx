/**
 * Project Artemis: Astronaut Dossier & Action Dispatch Modal
 * Detailed biometric telemetry, task assignment with briefing card confirmation.
 */

import React, { useState } from 'react';
import { X, Heart, Shield, Activity, Wrench, Sprout, Zap, Moon, FlaskConical, MapPin } from 'lucide-react';
import { AstronautCrew, CrewTask } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';
import { TaskBriefingCard, taskStationName } from './TaskBriefingCard.tsx';

interface AstronautModalProps {
  crew: AstronautCrew | null;
  onClose: () => void;
  onAssignTask: (task: CrewTask) => void;
}

// Per-crew guidance tips (plain English, grade-4 level, ≤12 words)
const CREW_TIPS: Record<string, { title: string; tips: string[] }> = {
  'crew-1': {
    title: 'Sarah keeps the lights on.',
    tips: [
      'Put Sarah on Power Grid when battery drops below 30%.',
      'Solar panels work best in sunlight — watch for dark intervals.',
      'Fission reactor runs all the time, but needs tuning.',
    ],
  },
  'crew-2': {
    title: 'Marcus keeps everyone healthy.',
    tips: [
      'Hydroponics boosts morale when fresh food is harvested.',
      'Send Marcus to rest if his health drops below 40%.',
      'Healthy crew uses less oxygen every day.',
    ],
  },
  'crew-3': {
    title: 'Elena earns research points.',
    tips: [
      'Science is cut first if power gets too low (DR-01).',
      'Elena earns bonus points for geology discoveries.',
      'Keep her researching to unlock hidden NASA findings.',
    ],
  },
  'crew-4': {
    title: 'Tyler fixes things outside.',
    tips: [
      'EVA repair cleans dust off solar panels — big power boost.',
      'Tyler gets more radiation on EVA — watch his dose.',
      'Solar storm alerts fire from DONKI data — shelter fast!',
    ],
  },
};

export const AstronautModal: React.FC<AstronautModalProps> = ({
  crew,
  onClose,
  onAssignTask,
}) => {
  const [pendingTask, setPendingTask] = useState<CrewTask | null>(null);

  if (!crew) return null;

  // Task timer state
  const taskDur = crew.taskDurationSeconds ?? 0;
  const taskElapsed = crew.taskSecondsElapsed ?? 0;
  const isBusy = taskDur > 0 && taskElapsed < taskDur && crew.task !== 'idle' && crew.task !== 'storm_shelter';
  const timerRemSec = isBusy ? Math.max(0, Math.ceil(taskDur - taskElapsed)) : 0;
  const timerMM = Math.floor(timerRemSec / 60).toString().padStart(2, '0');
  const timerSS = (timerRemSec % 60).toString().padStart(2, '0');
  const timerPct = taskDur > 0 ? Math.min(100, (taskElapsed / taskDur) * 100) : 0;

  const crewTip = CREW_TIPS[crew.id];
  const shortName = crew.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '');

  const tasks: { id: CrewTask; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'eva_repair',
      label: 'EVA Exterior Repair',
      icon: <Wrench className="w-4 h-4 text-orange-400" />,
      desc: 'Go outside. Fix solar panels and base systems.',
    },
    {
      id: 'power_grid',
      label: 'Power Grid Calibration',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      desc: 'Tune the Kilopower reactor. Boost battery power.',
    },
    {
      id: 'hydroponics',
      label: 'Hydroponic Cultivation',
      icon: <Sprout className="w-4 h-4 text-emerald-400" />,
      desc: 'Tend the greenhouse. Grow food for the crew.',
    },
    {
      id: 'research',
      label: 'Scientific Research',
      icon: <FlaskConical className="w-4 h-4 text-purple-400" />,
      desc: 'Map lunar ice and soil. Earn mission points.',
    },
    {
      id: 'resting',
      label: 'Rest & Bunk Recovery',
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      desc: 'Sleep to recover health and lift morale.',
    },
    {
      id: 'storm_shelter',
      label: 'Enter Storm Shelter',
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
      desc: 'Go to the bunker. Stop radiation damage.',
    },
  ];

  const handleTaskClick = (taskId: CrewTask) => {
    spatialAudio.playUiClick(800);
    setPendingTask(taskId);
  };

  const handleConfirm = () => {
    if (!pendingTask) return;
    onAssignTask(pendingTask);
    onClose();
  };

  const handleCancelBriefing = () => {
    setPendingTask(null);
  };

  return (
    <>
      {/* Task Briefing Card — shown when a task is clicked */}
      {pendingTask && (
        <TaskBriefingCard
          task={pendingTask}
          crew={crew}
          onConfirm={handleConfirm}
          onCancel={handleCancelBriefing}
          isReassign={isBusy && pendingTask !== crew.task}
        />
      )}

      <div className="absolute inset-0 z-40 flex items-center justify-center p-3 bg-black/60 pointer-events-auto select-none font-mono overflow-y-auto">
        <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-cyan-800/80 shadow-2xl p-4 sm:p-6 text-white relative my-auto">
          {/* Close Button */}
          <button
            onClick={() => { spatialAudio.playUiClick(); onClose(); }}
            className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-11 h-11 rounded-lg bg-orange-600/20 border border-orange-500/50 flex items-center justify-center text-orange-400 text-lg font-bold shrink-0">
              {crew.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-orange-400 uppercase tracking-widest truncate">
                NASA ACES · CALLSIGN {crew.callsign}
              </div>
              <div className="text-lg font-bold text-white leading-tight">{crew.name}</div>
              <div className="text-xs text-cyan-400">{crew.role}</div>
            </div>
          </div>

          {/* Active task / station row */}
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border ${
            isBusy
              ? 'bg-amber-950/50 border-amber-600/60'
              : crew.task === 'idle'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-slate-900 border-slate-700'
          }`}>
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isBusy ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-[10px] text-slate-500 uppercase font-bold">STATION:</span>
            <span className={`text-[10px] font-black uppercase ${isBusy ? 'text-amber-300' : 'text-slate-400'}`}>
              {crew.task === 'idle' ? 'Base Camp — Ready' : taskStationName(crew.task)}
            </span>
            {isBusy && (
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-14 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${timerPct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-amber-300 tabular-nums">{timerMM}:{timerSS}</span>
              </div>
            )}
          </div>

          {/* Bio & Specialty */}
          <div className="mt-3 p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">SPECIALTY: {crew.specialty}</div>
            {crew.bio}
          </div>

          {/* Per-crew tip panel */}
          {crewTip && (
            <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">COMMANDER TIP</div>
              <p className="text-[11px] text-cyan-200 font-semibold mb-1">{crewTip.title}</p>
              <ul className="space-y-0.5">
                {crewTip.tips.map((tip, i) => (
                  <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                    <span className="text-cyan-600 mt-px shrink-0">›</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vitals Telemetry */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-slate-800/70 border border-slate-700">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <Heart className="w-3 h-3 text-emerald-400" />
                <span>HEALTH</span>
              </div>
              <div className={`text-base font-bold tabular-nums ${crew.health < 40 ? 'text-red-400' : 'text-white'}`}>
                {Math.round(crew.health)}%
              </div>
            </div>

            <div className="p-2 rounded bg-slate-800/70 border border-slate-700">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>MORALE</span>
              </div>
              <div className="text-base font-bold tabular-nums text-white">
                {Math.round(crew.morale)}%
              </div>
            </div>

            <div className="p-2 rounded bg-slate-800/70 border border-slate-700">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>RADIATION</span>
              </div>
              <div className="text-base font-bold tabular-nums text-amber-300">
                {crew.radiationDose.toFixed(1)}<span className="text-[9px] font-normal ml-0.5">mSv</span>
              </div>
            </div>
          </div>

          {/* Duty Assignment Selection */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                ASSIGN TASK — {shortName}:
              </div>
              <div className="text-[10px] text-slate-600 uppercase">Click to preview</div>
            </div>
            <div className="space-y-1.5">
              {tasks.map((t) => {
                const isCurrentTask = crew.task === t.id;
                const isDispatched = isCurrentTask && isBusy;

                return (
                  <button
                    key={t.id}
                    onClick={() => handleTaskClick(t.id)}
                    className={`w-full p-2.5 min-h-[44px] rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                      isDispatched
                        ? 'bg-amber-950/50 border-amber-500/80 ring-1 ring-amber-500/40'
                        : isCurrentTask
                        ? 'bg-cyan-950/60 border-cyan-500/70 ring-1 ring-cyan-500/30'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded border ${
                        isDispatched ? 'bg-amber-950/60 border-amber-700/60' :
                        isCurrentTask ? 'bg-cyan-950/60 border-cyan-700/60' :
                        'bg-slate-900 border-slate-700'
                      }`}>
                        {t.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{t.label}</div>
                        <div className="text-[10px] text-slate-400">{t.desc}</div>
                      </div>
                    </div>

                    {isDispatched ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded border text-amber-300 bg-amber-900/60 border-amber-700 whitespace-nowrap ml-2">
                        BUSY
                      </span>
                    ) : isCurrentTask ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded border text-cyan-300 bg-cyan-900/60 border-cyan-700 whitespace-nowrap ml-2">
                        ACTIVE
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
