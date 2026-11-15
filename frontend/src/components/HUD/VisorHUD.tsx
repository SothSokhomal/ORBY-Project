/**
 * Project Artemis: Level 4 Visor HUD
 * Sleek, realistic aerospace glass interface inspired by NASA Artemis and Orion glass cockpits.
 * Fully aligned with locked specifications in docs/ (v1.1):
 * - Decision D-02: Mission Day clock (DAY X / 90, strictly Day on the Moon, never Sol)
 * - Decision D-04: Continuous 10-minute mission clock (10:00 countdown, speeds 1x to 2x, Pause [P], auto-pause on event cards)
 * - Decision D-05: 4 Lifelines (Oxygen, Water, Food, Power/heat) feeding 4 Summary Meters (Life Support, Power, Shielding, Crew Health)
 * - Section 3.1 & 3.4: 6 Continuous Standing Orders with the 4 designated crew roles
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Radio,
  Zap,
  Play,
  Pause,
  Compass,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Sliders,
  Volume2,
  VolumeX,
  BookOpen,
  Home,
  HelpCircle,
  X,
  Droplets,
  Wind,
  Shield,
  Apple,
  HeartPulse,
  Users,
  Info,
  ArrowRight,
} from 'lucide-react';
import { TutorialGuide } from './TutorialGuide.tsx';
import { taskStationName } from './TaskBriefingCard.tsx';
import {
  GameSimulationState,
  GameLevel,
  CrewTask,
} from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';
import { CLOCK_SPEEDS } from '../../config/clock.ts';

interface VisorHUDProps {
  gameState: GameSimulationState;
  onAdvanceDay?: (days: number) => void;
  onSetLevel: (level: GameLevel) => void;
  onSelectCrew: (crewId: string) => void;
  onAssignTask: (crewId: string, task: CrewTask) => void;
  onCompleteTask?: (crewId: string) => void;
  onShelterAll: () => void;
  onTogglePause: () => void;
  onSetSpeed?: (speed: number) => void;
  onResolveCrisis?: (optionId: string) => void;
  onToggleMute: () => void;
  onPanCamera?: (direction: 'left' | 'right' | 'up' | 'down' | 'zoom_in' | 'zoom_out' | 'reset') => void;
  onOpenGearModal?: () => void;
  onOpenManualModal?: () => void;
  onRestartToLanding?: () => void;
  isMuted: boolean;
}

export const VisorHUD: React.FC<VisorHUDProps> = ({
  gameState,
  onSetLevel,
  onSelectCrew,
  onAssignTask,
  onCompleteTask,
  onShelterAll,
  onTogglePause,
  onSetSpeed,
  onResolveCrisis,
  onPanCamera,
  onOpenGearModal,
  onOpenManualModal,
  onRestartToLanding,
  onToggleMute,
  isMuted,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isGuideDismissed, setIsGuideDismissed] = useState(false);
  // Show tutorial carousel on every new outpost landing (VisorHUD re-mounts each mission)
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [selectedEventOption, setSelectedEventOption] = useState<number>(0);
  const [completionToasts, setCompletionToasts] = useState<{ id: string; name: string; task: string }[]>([]);

  // Derive early so hooks can reference them (declared before any useEffect)
  const _livingCrew = gameState.crew.filter((c) => c.health > 0);
  // Only nag when ALL living crew are idle AND at least one hasn't done their task today
  const _allCrewIdle = _livingCrew.length > 0 &&
    _livingCrew.every((c) => c.task === 'idle' || (c.taskDurationSeconds === 0 && c.task !== 'storm_shelter')) &&
    _livingCrew.some((c) => c.lastCompletedDay !== gameState.day);
  const _batteryPct = gameState.resources.batteryMax > 0
    ? Math.round((gameState.resources.batteryKwh / gameState.resources.batteryMax) * 100)
    : 0;
  const _o2Pct = gameState.resources.oxygenMax > 0
    ? Math.round((gameState.resources.oxygenKg / gameState.resources.oxygenMax) * 100)
    : 0;

  // Re-surface guidance bar when a new urgent situation appears (overrides previous dismiss)
  useEffect(() => {
    if (_allCrewIdle || _batteryPct <= 20 || _o2Pct <= 20 || (gameState.activeCrisis && !gameState.activeCrisis?.resolved)) {
      setIsGuideDismissed(false);
    }
  }, [_allCrewIdle, _batteryPct, _o2Pct, gameState.activeCrisis]);

  // Auto-complete tasks when timer expires; fire completion toast
  useEffect(() => {
    if (!onCompleteTask || gameState.mode !== 'playing') return;
    gameState.crew.forEach((c) => {
      const dur = c.taskDurationSeconds ?? 0;
      if (dur > 0 && (c.taskSecondsElapsed ?? 0) >= dur && c.task !== 'idle' && c.task !== 'storm_shelter') {
        onCompleteTask(c.id);
        const shortName = c.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '');
        const taskLabel = c.task === 'eva_repair' ? 'EVA Repair' :
          c.task === 'power_grid' ? 'Power Grid' :
          c.task === 'hydroponics' ? 'Hydroponics' :
          c.task === 'research' ? 'Research' :
          c.task === 'resting' ? 'Rest' : c.task;
        const toastId = `${c.id}-${Date.now()}`;
        setCompletionToasts((prev) => [...prev, { id: toastId, name: shortName, task: taskLabel }]);
        setTimeout(() => setCompletionToasts((prev) => prev.filter((t) => t.id !== toastId)), 3500);
      }
    });
  }, [gameState.crew, gameState.mode, onCompleteTask]);

  const {
    day,
    hoursSinceLanding = 0,
    missionSecondsRemaining = 600,
    clockSpeed = 1.0,
    isPaused = false,
    mode,
    lunarPhase,
    resources,
    crew,
    activeCrisis,
    level,
  } = gameState;

  const currentDay = day ?? 1;

  // Format real-time countdown timer (10:00 countdown)
  const remainingSec = Math.max(0, missionSecondsRemaining);
  const timerMinutes = Math.floor(remainingSec / 60);
  const timerSeconds = Math.floor(remainingSec % 60);
  const timerString = `${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`;

  // Calculate 4 Lifeline percentages
  const o2Pct = Math.round((resources.oxygenKg / resources.oxygenMax) * 100);
  const waterPct = Math.round((resources.waterLiters / resources.waterMax) * 100);
  const foodPct = Math.round((resources.foodMeals / resources.foodMax) * 100);
  const batteryPct = Math.round((resources.batteryKwh / resources.batteryMax) * 100);

  // Lifeline tags: OK (>40%), LOW (10-40%), EMPTY (<=10%)
  const getLifelineTag = (pct: number) => {
    if (pct <= 10) return { label: 'EMPTY', color: 'text-red-400 bg-red-950/80 border-red-700' };
    if (pct <= 40) return { label: 'LOW', color: 'text-amber-400 bg-amber-950/80 border-amber-700' };
    return { label: 'OK', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-700' };
  };

  // Calculate 4 Summary Meters (Decision D-05)
  // 1. Life Support: composite of O2 (40%), Water (35%), Food (25%)
  const lifeSupportPct = Math.min(100, Math.round(o2Pct * 0.4 + waterPct * 0.35 + foodPct * 0.25));
  const lifeSupportStatus = lifeSupportPct > 50 ? 'OK' : lifeSupportPct > 25 ? 'WARNING' : 'CRITICAL';

  // 2. Power: composite of battery capacity and net generation
  const powerPct = Math.min(100, Math.round(batteryPct));
  const powerStatus = powerPct > 40 ? 'OK' : powerPct > 20 ? 'WARNING' : 'CRITICAL';

  // 3. Shielding: habitat sintering integrity and storm vault readiness
  const shieldingPct = Math.min(100, Math.round(resources.baseIntegrity));
  const shieldingStatus = shieldingPct > 60 ? 'OK' : shieldingPct > 30 ? 'WARNING' : 'CRITICAL';

  // 4. Crew Health: composite average health across all 4 astronauts
  const avgCrewHealth = Math.round(crew.reduce((sum, c) => sum + c.health, 0) / crew.length);
  const crewHealthStatus = avgCrewHealth > 60 ? 'OK' : avgCrewHealth > 30 ? 'WARNING' : 'CRITICAL';

  // Status badge style helper
  const getStatusBadge = (status: 'OK' | 'WARNING' | 'CRITICAL') => {
    if (status === 'CRITICAL') return 'text-red-400 bg-red-950/80 border-red-500';
    if (status === 'WARNING') return 'text-amber-300 bg-amber-950/80 border-amber-500';
    return 'text-cyan-300 bg-cyan-950/80 border-cyan-500';
  };

  // Dark interval calculation (Pilot difficulty default: 72h dark intervals)
  const cycleDay = (currentDay - 1) % 28;
  const daysUntilDark = cycleDay < 14 ? 14 - cycleDay : 0;
  const darkInfo =
    lunarPhase === 'NIGHT'
      ? 'Dark period active (72h)'
      : daysUntilDark > 0
      ? `Dark period in ${daysUntilDark}d (lasts 72h)`
      : 'Sunlit';

  // Simplified Location Navigator
  const navigationLocations: { id: GameLevel; label: string; icon: string }[] = [
    { id: 'LEVEL_LUNAR_SURFACE', label: 'Outpost', icon: '🌕' },
    { id: 'LEVEL_HAB_INTERIOR', label: 'Hab Command', icon: '🏡' },
    { id: 'LEVEL_ORRERY', label: 'Solar Orbit', icon: '🪐' },
    { id: 'LEVEL_LAUNCH_PAD', label: 'Launch Pad', icon: '🚀' },
    { id: 'LEVEL_HANGAR', label: 'Hangar', icon: '🛠️' },
  ];

  // All-living-crew idle detection (aliases of early-derived values above)
  const livingCrew = _livingCrew;
  const allCrewIdle = _allCrewIdle;

  // Dynamic contextual guidance (Decision D-15, Section 12: 7 Priority Conditions)
  const getDynamicGuidance = () => {
    // Condition 1: Solar storm with crew outside
    const crewOutside = crew.some((c) => c.task !== 'storm_shelter' && c.task !== 'resting');
    if (activeCrisis?.type === 'SOLAR_STORM' && !activeCrisis.resolved && crewOutside) {
      return {
        icon: '🛡️',
        badge: 'STORM!',
        badgeColor: 'bg-red-600 text-white animate-pulse',
        text: 'STORM coming! Get everyone inside right now.',
        actionText: 'SHELTER ALL',
        action: onShelterAll,
      };
    }

    // Condition 2: Any unresolved event
    if (activeCrisis && !activeCrisis.resolved) {
      return {
        icon: '⚠️',
        badge: 'READ ME!',
        badgeColor: 'bg-amber-600 text-white animate-pulse',
        text: 'Something happened! Read the yellow card.',
      };
    }

    // Condition 2b: ALL crew idle — player must assign tasks
    if (allCrewIdle) {
      return {
        icon: '👩‍🚀',
        badge: '⚠ ASSIGN TASKS!',
        badgeColor: 'bg-red-600 text-white animate-pulse',
        text: 'All crew are IDLE! Click a card below and give them a task.',
        actionText: 'OPEN CREW',
        action: () => onSelectCrew(livingCrew[0]?.id ?? 'crew-1'),
      };
    }

    // Condition 3: Critical lifelines
    if (batteryPct <= 20) {
      return {
        icon: '⚡',
        badge: 'POWER LOW',
        badgeColor: 'bg-red-600 text-white animate-pulse',
        text: 'Power very low! Ask Sarah to work on Power Grid.',
        actionText: 'POWER GRID',
        action: () => onAssignTask('crew-1', 'power_grid'),
      };
    }
    if (o2Pct <= 20) {
      return {
        icon: '🫧',
        badge: 'AIR LOW!',
        badgeColor: 'bg-red-600 text-white animate-pulse',
        text: 'Air is running out! Ask Tyler to do EVA repair.',
        actionText: 'EVA REPAIR',
        action: () => onAssignTask('crew-4', 'eva_repair'),
      };
    }
    if (waterPct <= 20) {
      return {
        icon: '💧',
        badge: 'WATER LOW',
        badgeColor: 'bg-amber-600 text-white',
        text: 'Water is low. Ask Marcus to tend Hydroponics.',
        actionText: 'HYDROPONICS',
        action: () => onAssignTask('crew-2', 'hydroponics'),
      };
    }

    // Condition 4: Dark period approaching with low battery
    if (daysUntilDark <= 1 && daysUntilDark > 0 && batteryPct < 50) {
      return {
        icon: '🌙',
        badge: 'DARK SOON',
        badgeColor: 'bg-amber-600 text-white',
        text: 'Dark period starts soon. Charge battery first!',
        actionText: 'POWER GRID',
        action: () => onAssignTask('crew-1', 'power_grid'),
      };
    }

    // Condition 5: Dusty panels reducing solar power
    if (lunarPhase === 'SUNLIT' && resources.solarKw < 25.0) {
      return {
        icon: '🧹',
        badge: 'DUSTY PANELS',
        badgeColor: 'bg-amber-600 text-white',
        text: 'Dust is blocking the sun. Send Tyler for a clean.',
        actionText: 'EVA CLEAN',
        action: () => onAssignTask('crew-4', 'eva_repair'),
      };
    }

    // Condition 6: Tired crew
    const tiredCrew = crew.find((c) => c.health > 0 && c.health < 45);
    if (tiredCrew) {
      const short = tiredCrew.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '');
      return {
        icon: '🛏️',
        badge: 'CREW TIRED',
        badgeColor: 'bg-purple-600 text-white',
        text: `${short} is very tired. Let them rest a bit.`,
        actionText: 'REST',
        action: () => onAssignTask(tiredCrew.id, 'resting'),
      };
    }

    // Condition 7: Nominal
    return {
      icon: '✅',
      badge: 'ALL GOOD',
      badgeColor: 'bg-emerald-600 text-white',
      text: 'All good! Keep watching the 4 bars.',
    };
  };

  const guidance = getDynamicGuidance();

  const isActuallyPaused = isPaused || mode === 'paused';

  // Event decision options for active crisis
  const getCrisisOptions = () => {
    if (!activeCrisis) return [];
    if (activeCrisis.type === 'SOLAR_STORM') {
      return [
        {
          id: 'shelter_all',
          title: 'Enter Regolith Storm Shelter Vault',
          desc: 'Order entire crew underground into sintered vault until flux subsides.',
          cost: '15 kWh life-support draw',
          costBadge: 'Low power',
          risk: 'Low risk',
          riskColor: 'text-cyan-400 border-cyan-700 bg-cyan-950/80',
          action: () => {
            onShelterAll();
            onResolveCrisis?.('shelter_all');
          },
        },
        {
          id: 'deflector_grid',
          title: 'Overcharge Magnetic Deflector Array',
          desc: 'Route full Kilopower and battery load into deflector coils.',
          cost: '80 kWh battery surge',
          costBadge: 'High battery',
          risk: 'Medium risk',
          riskColor: 'text-amber-400 border-amber-700 bg-amber-950/80',
          action: () => {
            onResolveCrisis?.('deflector_grid');
          },
        },
      ];
    }
    if (activeCrisis.type === 'RECYCLER_BURST') {
      return [
        {
          id: 'pilot_eva',
          title: 'Deploy Tyler Hayes (Pilot) on EVA Exterior Repair',
          desc: 'Pilot EVA specialist welds ruptured Sabatier sleeve with titanium collar.',
          cost: '12 kg O2 + 30 kWh suit power',
          costBadge: '12 kg O2',
          risk: 'Low risk',
          riskColor: 'text-cyan-400 border-cyan-700 bg-cyan-950/80',
          action: () => {
            onAssignTask('crew-4', 'eva_repair');
            onResolveCrisis?.('pilot_eva');
          },
        },
        {
          id: 'auto_isolation',
          title: 'Automated Loop Bypass & Cabin De-pressurize',
          desc: 'Electrically seal Module 3 and isolate loop, running on auxiliary O2 reserves.',
          cost: '-20% O2 generation efficiency',
          costBadge: 'Yield drop',
          risk: 'Medium risk',
          riskColor: 'text-amber-400 border-amber-700 bg-amber-950/80',
          action: () => {
            onResolveCrisis?.('auto_isolation');
          },
        },
      ];
    }
    return [
      {
        id: 'dispatch_repair',
        title: 'Dispatch EVA Repair Specialist',
        desc: 'Send astronaut to inspect and calibrate external mechanism.',
        cost: '5 kg O2 + 20 kWh',
        costBadge: 'Nominal',
        risk: 'Low risk',
        riskColor: 'text-cyan-400 border-cyan-700 bg-cyan-950/80',
        action: () => {
          onAssignTask('crew-4', 'eva_repair');
          onResolveCrisis?.('dispatch_repair');
        },
      },
      {
        id: 'recalibrate',
        title: 'Emergency Autonomous Reset',
        desc: 'Attempt software servo reboot from Hab Command desk.',
        cost: 'Grid calibration delay',
        costBadge: 'Time loss',
        risk: 'Medium risk',
        riskColor: 'text-amber-400 border-amber-700 bg-amber-950/80',
        action: () => {
          onResolveCrisis?.('recalibrate');
        },
      },
    ];
  };

  const crisisOptions = getCrisisOptions();

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden font-mono text-white">
      {/* Subtle Aerospace Visor Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 120px rgba(0, 160, 255, 0.05), inset 0 0 30px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* ── Hazard / Crisis Overlay — animated tint when danger is high ───── */}
      {(activeCrisis && !activeCrisis.resolved) && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            boxShadow: activeCrisis.severity === 'CRITICAL'
              ? 'inset 0 0 160px rgba(239,68,68,0.28)'
              : 'inset 0 0 120px rgba(251,146,60,0.22)',
            background: activeCrisis.severity === 'CRITICAL'
              ? 'radial-gradient(ellipse at center, transparent 50%, rgba(239,68,68,0.08) 100%)'
              : 'radial-gradient(ellipse at center, transparent 55%, rgba(251,146,60,0.06) 100%)',
          }}
        />
      )}
      {(!activeCrisis || activeCrisis.resolved) && o2Pct <= 15 && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            boxShadow: 'inset 0 0 140px rgba(56,189,248,0.25)',
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(56,189,248,0.06) 100%)',
          }}
        />
      )}
      {(!activeCrisis || activeCrisis.resolved) && batteryPct <= 15 && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            boxShadow: 'inset 0 0 140px rgba(251,191,36,0.22)',
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(251,191,36,0.06) 100%)',
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP UNIFIED AEROSPACE NAVIGATION BAR (DECISIONS D-02, D-04, D-05)      */}
      {/* ========================================================================= */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-auto z-30 flex-nowrap overflow-visible">
        
        {/* LEFT: MISSION DAY CLOCK (DECISION D-02) */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-700/60">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black tracking-tight text-white tabular-nums">DAY {currentDay}</span>
              <span className="text-[10px] text-slate-400 font-normal">/ 90</span>
            </div>
            <div className="h-4 w-px bg-slate-700 mx-0.5" />
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              {lunarPhase === 'SUNLIT' ? (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-300">SUNLIT</span>
                </>
              ) : lunarPhase === 'NIGHT' ? (
                <>
                  <Moon className="w-3 h-3 text-sky-400" />
                  <span className="text-sky-300">DARK</span>
                </>
              ) : (
                <span className="text-orange-300">{lunarPhase}</span>
              )}
            </div>
          </div>

          {/* Dark Interval Tracker — only on large screens */}
          <div className="hidden xl:flex items-center text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800">
            {darkInfo}
          </div>
        </div>

        {/* CENTER: 4 SUMMARY METERS (DECISION D-05) */}
        <div className="flex flex-col items-center min-w-0 flex-1">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-cyan-800/50 backdrop-blur-md shadow-xl">
            {/* Meter 1: Life Support */}
            <div
              className="relative group flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer"
              onClick={() => setActiveTooltip(activeTooltip === 'ls' ? null : 'ls')}
              title="Click to explain Life Support meter"
            >
              <HeartPulse className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="hidden md:block text-[8px] text-slate-400 font-bold uppercase tracking-wider">LIFE SUPPORT</span>
                <span className="text-[10px] font-black text-white tabular-nums">{lifeSupportPct}%</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-extrabold px-1 rounded border ${getStatusBadge(lifeSupportStatus)}`}>
                {lifeSupportStatus}
              </span>
              <Info className="hidden lg:block w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400" />
            </div>

            {/* Meter 2: Power */}
            <div
              className="relative group flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer"
              onClick={() => setActiveTooltip(activeTooltip === 'pwr' ? null : 'pwr')}
              title="Click to explain Power meter"
            >
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="hidden md:block text-[8px] text-slate-400 font-bold uppercase tracking-wider">POWER</span>
                <span className="text-[10px] font-black text-white tabular-nums">{powerPct}%</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-extrabold px-1 rounded border ${getStatusBadge(powerStatus)}`}>
                {powerStatus}
              </span>
              <Info className="hidden lg:block w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400" />
            </div>

            {/* Meter 3: Shielding */}
            <div
              className="relative group flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 transition-all cursor-pointer"
              onClick={() => setActiveTooltip(activeTooltip === 'shld' ? null : 'shld')}
              title="Click to explain Shielding meter"
            >
              <Shield className="w-3 h-3 text-blue-400 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="hidden md:block text-[8px] text-slate-400 font-bold uppercase tracking-wider">SHIELDING</span>
                <span className="text-[10px] font-black text-white tabular-nums">{shieldingPct}%</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-extrabold px-1 rounded border ${getStatusBadge(shieldingStatus)}`}>
                {shieldingStatus}
              </span>
              <Info className="hidden lg:block w-2.5 h-2.5 text-slate-500 group-hover:text-blue-400" />
            </div>

            {/* Meter 4: Crew Health */}
            <div
              className="relative group flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer"
              onClick={() => setActiveTooltip(activeTooltip === 'crew' ? null : 'crew')}
              title="Click to explain Crew Health meter"
            >
              <Users className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="hidden md:block text-[8px] text-slate-400 font-bold uppercase tracking-wider">CREW HEALTH</span>
                <span className="text-[10px] font-black text-white tabular-nums">{avgCrewHealth}%</span>
              </div>
              <span className={`hidden lg:inline-block text-[8px] font-extrabold px-1 rounded border ${getStatusBadge(crewHealthStatus)}`}>
                {crewHealthStatus}
              </span>
              <Info className="hidden lg:block w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400" />
            </div>
          </div>

          <div className="hidden lg:block text-[8px] text-cyan-400/80 font-mono tracking-widest mt-0.5">
            4 SUMMARY METERS · FED BY 4 LIFELINES
          </div>

          {/* Explain Tooltip Popover */}
          {activeTooltip && (
            <div className="absolute top-14 p-2.5 rounded-xl bg-slate-950/95 border border-cyan-500 shadow-2xl max-w-sm text-xs z-50 animate-in fade-in">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-cyan-300 uppercase text-[10px]">
                  {activeTooltip === 'ls'
                    ? 'Summary Meter: Life Support (ECLSS)'
                    : activeTooltip === 'pwr'
                    ? 'Summary Meter: Power Grid'
                    : activeTooltip === 'shld'
                    ? 'Summary Meter: Radiation & Habitat Shielding'
                    : 'Summary Meter: Crew Health & Vitals'}
                </span>
                <button
                  onClick={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeTooltip === 'ls' &&
                  'Fed directly by Oxygen, Water, and Food lifelines. Sized for 90 Earth days (2,160 hours = 87.6 sols) of closed-loop recycling.'}
                {activeTooltip === 'pwr' &&
                  'Fed by Solar Tracking Arrays and Kilopower fission (12 kW). Polar dark intervals last 48h to 100h (up to 4.17 Earth days = 4.06 sols).'}
                {activeTooltip === 'shld' &&
                  'Sintered regolith vault and deflector coils protecting crew during 24h to 72h radiation storms (1 to 3 Earth days).'}
                {activeTooltip === 'crew' &&
                  'Average health across all 4 astronauts. Bunk recovery heals +8% per Earth day (24 hours).'}
              </p>
              <div className="mt-1.5 pt-1 border-t border-slate-800 text-[9px] text-slate-400 font-mono">
                DATA SOURCE: NASA Artemis ECLSS & Kilopower Design Standards (Labeled Sourced)
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: CONTINUOUS 10-MIN MISSION CLOCK & CONTROLS (DECISION D-04) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md shadow-xl shrink-0">
          {/* Real-time Countdown Timer (10:00 start) */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/40">
            <span className="hidden sm:inline text-[9px] text-amber-400/80 font-bold tracking-wider uppercase">CLOCK</span>
            <span className="text-xs font-black text-amber-300 font-mono tabular-nums">{timerString}</span>
          </div>

          {/* Pause Button ([P] shortcut) */}
          <button
            onClick={() => {
              spatialAudio.playUiClick();
              onTogglePause();
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              isActuallyPaused
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/30 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
            title="Toggle Simulation Pause [P]"
          >
            {isActuallyPaused ? (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">RESUME</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            )}
          </button>

          {/* Speed Selector Buttons: 1x, 1.25x, 1.5x, 1.75x, 2x — hidden on short screens */}
          <div className="hidden md:flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
            {CLOCK_SPEEDS.map((spd) => {
              const isActive = Math.abs(clockSpeed - spd) < 0.05;
              return (
                <button
                  key={spd}
                  onClick={() => {
                    spatialAudio.playUiClick();
                    onSetSpeed?.(spd);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={`Run simulation at ${spd}x speed`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>
          {/* Compact speed selector for small screens */}
          <div className="flex md:hidden items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
            {[1, 1.5, 2].map((spd) => {
              const isActive = Math.abs(clockSpeed - spd) < 0.3;
              return (
                <button
                  key={spd}
                  onClick={() => { spatialAudio.playUiClick(); onSetSpeed?.(spd); }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    isActive ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={`${spd}x speed`}
                >
                  {spd}x
                </button>
              );
            })}
          </div>

          {/* Tools & Views */}
          <div className="h-4 w-px bg-slate-800 mx-0.5 hidden sm:block" />

          {onOpenGearModal && (
            <button
              onClick={() => {
                spatialAudio.playUiClick();
                onOpenGearModal();
              }}
              className="hidden sm:flex p-1.5 rounded-lg bg-slate-800/70 hover:bg-cyan-950/80 border border-slate-700/60 text-cyan-300 cursor-pointer"
              title="Configure Gear Loadout [G]"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenManualModal && (
            <button
              onClick={() => {
                spatialAudio.playUiClick();
                onOpenManualModal();
              }}
              className="hidden sm:flex p-1.5 rounded-lg bg-slate-800/70 hover:bg-amber-950/80 border border-slate-700/60 text-amber-300 cursor-pointer"
              title="Flight Manual & Standing Orders [?]"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Tutorial / Help */}
          <button
            onClick={() => { spatialAudio.playUiClick(800); setShowTutorial(true); }}
            className="hidden sm:flex p-1.5 rounded-lg bg-slate-800/70 hover:bg-cyan-950/80 border border-slate-700/60 text-cyan-400 cursor-pointer"
            title="How to Play · Tutorial [?]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Audio Mute */}
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Return Home */}
          {onRestartToLanding && (
            <button
              onClick={() => {
                spatialAudio.playUiClick();
                onRestartToLanding();
              }}
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Return to Landing Page"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 3. LEFT WINGLET: 4 LIFELINES (DECISION D-05)                              */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 left-4 pointer-events-auto z-20 hidden sm:block short:hidden">
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-md shadow-xl w-52 text-[11px]">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-1.5 font-bold uppercase tracking-wider border-b border-slate-800 pb-1">
            <span>4 LIFELINES</span>
            <span className="text-[9px] text-cyan-400/80 font-normal">↳ FEEDS METERS</span>
          </div>

          <div className="space-y-2">
            {/* Lifeline 1: Oxygen */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>Oxygen</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-bold px-1 rounded border ${getLifelineTag(o2Pct).color}`}>
                    {getLifelineTag(o2Pct).label}
                  </span>
                  <span className="font-bold text-cyan-300 w-8 text-right tabular-nums">{o2Pct}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${o2Pct > 40 ? 'bg-cyan-400' : o2Pct > 10 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, o2Pct)}%` }}
                />
              </div>
              <div className="text-[8px] text-slate-500 font-mono mt-0.5 text-right">
                {Math.round(resources.oxygenKg)} kg reserve
              </div>
            </div>

            {/* Lifeline 2: Water */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span>Water</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-bold px-1 rounded border ${getLifelineTag(waterPct).color}`}>
                    {getLifelineTag(waterPct).label}
                  </span>
                  <span className="font-bold text-blue-300 w-8 text-right tabular-nums">{waterPct}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${waterPct > 40 ? 'bg-blue-400' : waterPct > 10 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, waterPct)}%` }}
                />
              </div>
              <div className="text-[8px] text-slate-500 font-mono mt-0.5 text-right">
                {Math.round(resources.waterLiters)} L reserve
              </div>
            </div>

            {/* Lifeline 3: Food */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Apple className="w-3 h-3 text-emerald-400" />
                  <span>Food</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-bold px-1 rounded border ${getLifelineTag(foodPct).color}`}>
                    {getLifelineTag(foodPct).label}
                  </span>
                  <span className="font-bold text-emerald-300 w-8 text-right tabular-nums">{foodPct}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${foodPct > 40 ? 'bg-emerald-400' : foodPct > 10 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, foodPct)}%` }}
                />
              </div>
              <div className="text-[8px] text-slate-500 font-mono mt-0.5 text-right">
                {Math.round(resources.foodMeals)} meals
              </div>
            </div>

            {/* Lifeline 4: Power / Heat */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Power / Heat</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-bold px-1 rounded border ${getLifelineTag(batteryPct).color}`}>
                    {getLifelineTag(batteryPct).label}
                  </span>
                  <span className="font-bold text-amber-300 w-8 text-right tabular-nums">{batteryPct}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${batteryPct > 30 ? 'bg-amber-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, batteryPct)}%` }}
                />
              </div>
              <div className="text-[8px] text-slate-500 font-mono mt-0.5 text-right">
                {Math.round(resources.batteryKwh)} kWh reserve
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RIGHT WINGLET: POWER & GRID TELEMETRY + CLEAN CAMERA CONTROLS          */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 right-4 pointer-events-auto z-20 flex flex-col items-end gap-2 short:bottom-2 short:right-2">
        {/* Floating Camera Controls Pill */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-lg text-slate-400">
          <button
            onClick={() => onPanCamera?.('reset')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-slate-800 hover:text-cyan-300 text-[10px] font-bold uppercase transition-all cursor-pointer"
            title="Reset Camera Framing"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Reset View</span>
          </button>
          <div className="h-3 w-px bg-slate-700" />
          <button
            onClick={() => onPanCamera?.('zoom_in')}
            className="p-1 hover:text-cyan-300 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPanCamera?.('zoom_out')}
            className="p-1 hover:text-cyan-300 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Power Telemetry Card — hidden on short screens to prevent crew dock overlap */}
        <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-xl w-48 text-[11px] hidden sm:block short:hidden">
          <div className="flex items-center justify-between text-[10px] text-amber-400 mb-1.5 font-bold uppercase tracking-wider border-b border-slate-800 pb-1">
            <span>POWER GRID</span>
            <Zap className="w-3 h-3" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Solar Gen:</span>
              <span className="font-bold text-white tabular-nums">{resources.solarKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Kilopower Fission:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{resources.fissionKw.toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Base Demand:</span>
              <span className="font-bold text-rose-300 tabular-nums">{resources.demandKw.toFixed(1)} kW</span>
            </div>
            {resources.cabinTempC !== undefined && (
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Cabin Temp:</span>
                <span className={`font-bold tabular-nums ${resources.cabinTempC < 10 ? 'text-sky-300 animate-pulse' : 'text-emerald-400'}`}>
                  {resources.cabinTempC.toFixed(1)}°C
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-300 border-t border-slate-800/60 pt-1">
              <span className="text-slate-400">Battery Reserve:</span>
              <span className="font-bold text-cyan-300 tabular-nums">{Math.round(resources.batteryKwh)} kWh</span>
            </div>
            {resources.shedLoads && resources.shedLoads.length > 0 && (
              <div className="mt-1.5 pt-1 border-t border-red-500/50">
                <div className="text-[9px] font-bold text-red-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>LOAD SHED (DR-01)</span>
                </div>
                <div className="text-[9px] text-red-300 capitalize font-sans leading-tight">
                  {resources.shedLoads.join(' > ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CENTER: 4-ASTRONAUT DOCK & STANDING ORDERS (SECTION 3.1 & 3.4)         */}
      {/* ========================================================================= */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center transition-all duration-300 z-30"
        style={{
          transform: `translateX(-50%) translateY(${isDockCollapsed ? 'calc(100% - 24px)' : '0'})`,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        {/* WHAT TO DO NOW — hidden when nominal (all good) or dismissed */}
        {!isGuideDismissed && guidance.badge !== 'ALL GOOD' && (
          <div className="relative mb-2 flex items-center gap-2.5 pl-4 pr-8 py-2 rounded-2xl max-w-[520px] w-full overflow-hidden font-mono"
            style={{
              background: 'linear-gradient(135deg, rgba(8,10,20,0.98) 0%, rgba(15,18,35,0.96) 100%)',
              boxShadow: allCrewIdle
                ? '0 0 0 1.5px rgba(251,146,60,0.7), 0 8px 32px rgba(234,88,12,0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
                : '0 0 0 1px rgba(100,116,139,0.4), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Left urgency stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-colors ${
              allCrewIdle ? 'bg-orange-500' :
              guidance.badge?.includes('LOW') || guidance.badge?.includes('EMERGENCY') ? 'bg-red-500' :
              guidance.badge?.includes('STORM') ? 'bg-red-500' :
              'bg-amber-400'
            }`} />

            {/* Icon */}
            <span className="text-base leading-none shrink-0 select-none">{guidance.icon}</span>

            {/* Badge */}
            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border shrink-0 ${
              allCrewIdle
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : guidance.badge?.includes('LOW') || guidance.badge?.includes('EMERGENCY') || guidance.badge?.includes('STORM')
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {guidance.badge}
            </span>

            {/* Message */}
            <span className="flex-1 text-[11px] text-white/90 font-medium font-sans leading-tight min-w-0">
              {guidance.text}
            </span>

            {/* Action CTA */}
            {guidance.action && guidance.actionText && (
              <button
                onClick={() => { spatialAudio.playUiClick(); guidance.action?.(); }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 border ${
                  allCrewIdle
                    ? 'bg-orange-500 hover:bg-orange-400 text-black border-orange-400 shadow-lg shadow-orange-900/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-900/40'
                }`}
              >
                {guidance.actionText}
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={() => setIsGuideDismissed(true)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-300 hover:bg-slate-800/60 cursor-pointer transition-all"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Idle-crew alert strip — hidden once any crew member has an active task */}
        {allCrewIdle && !activeCrisis && (
          <div className="relative w-full max-w-[520px] mx-auto mb-1.5 flex items-center gap-3 px-4 py-2 rounded-2xl overflow-hidden font-mono"
            style={{
              background: 'linear-gradient(135deg, rgba(28,10,2,0.97) 0%, rgba(20,8,2,0.95) 100%)',
              boxShadow: '0 0 0 1px rgba(249,115,22,0.35), 0 6px 24px rgba(249,115,22,0.12), inset 0 1px 0 rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Left accent stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-orange-500" />

            {/* Warning icon badge */}
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            </div>

            {/* Text */}
            <div className="min-w-0">
              <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest leading-none">
                NO TASKS ASSIGNED
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5 hidden sm:block leading-none">
                Click a name → pick their job
              </div>
            </div>

            {/* Crew quick-dispatch pills */}
            <div className="ml-auto flex gap-1.5 shrink-0">
              {livingCrew.slice(0, 4).map((c) => {
                const short = c.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '').split(' ')[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => { spatialAudio.playUiClick(); onSelectCrew(c.id); }}
                    className="px-2.5 py-1 min-h-[32px] rounded-xl bg-orange-500/15 hover:bg-orange-500/35 border border-orange-500/35 hover:border-orange-400/70 text-orange-200 hover:text-white text-[9px] font-bold uppercase tracking-wide cursor-pointer transition-all active:scale-95"
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily progress pill — "Day X: N / 4 Done" */}
        {(() => {
          const doneTodayCount = _livingCrew.filter((c) => c.lastCompletedDay === gameState.day).length;
          const totalCrew = _livingCrew.length;
          const allDone = doneTodayCount === totalCrew && totalCrew > 0;
          if (doneTodayCount === 0) return null;
          return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider border self-center ${
              allDone
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/70 border-slate-700/60 text-slate-400'
            }`}>
              <span>{allDone ? '✓' : '⏳'}</span>
              <span>Day {gameState.day}: {doneTodayCount} / {totalCrew} Done</span>
            </div>
          );
        })()}

        {/* Collapse / Expand Tab Toggle */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center justify-center gap-1.5 px-4 py-0.5 rounded-t-lg bg-slate-950/90 border-t border-x border-cyan-800/80 text-[10px] font-mono text-cyan-300 hover:text-white cursor-pointer shadow-lg uppercase tracking-wider font-bold self-center"
        >
          {isDockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{isDockCollapsed ? 'SHOW CREW (4)' : 'CREW COMMAND · CLICK TO ASSIGN STANDING ORDERS'}</span>
        </button>

        {/* 4 Astronaut Cards */}
        <div className="p-2 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl flex items-center gap-2 backdrop-blur-md">
          {crew.map((member, idx) => {
            const isAlive = member.health > 0;
            const shortName = member.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '');
            const colorDot =
              idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-cyan-500' : 'bg-amber-400';

            // Canonical role labels from docs/03 section 3.4
            const canonicalRole =
              idx === 0
                ? 'Flight engineer'
                : idx === 1
                ? 'Medical officer'
                : idx === 2
                ? 'Geologist'
                : 'Pilot';

            // Human-readable task title
            const taskLabel =
              member.task === 'eva_repair'
                ? 'EVA repair'
                : member.task === 'power_grid'
                ? 'Power grid'
                : member.task === 'hydroponics'
                ? 'Hydroponics'
                : member.task === 'research'
                ? 'Research'
                : member.task === 'resting'
                ? 'Resting'
                : member.task === 'storm_shelter'
                ? 'Sheltered'
                : 'Idle';

            // Task timer state
            const taskDur = member.taskDurationSeconds ?? 0;
            const taskElapsed = member.taskSecondsElapsed ?? 0;
            const hasTimer = taskDur > 0 && member.task !== 'idle' && member.task !== 'storm_shelter';
            const timerDone = hasTimer && taskElapsed >= taskDur;
            const timerRemSec = hasTimer ? Math.max(0, Math.ceil(taskDur - taskElapsed)) : 0;
            const timerPct = hasTimer ? Math.min(100, (taskElapsed / taskDur) * 100) : 0;
            const timerMM = Math.floor(timerRemSec / 60).toString().padStart(2, '0');
            const timerSS = (timerRemSec % 60).toString().padStart(2, '0');
            const completedToday = member.lastCompletedDay === currentDay && member.task === 'idle';

            // Active-task card border treatment
            const isActiveTask = hasTimer && !timerDone;
            const cardBorderClass = isActiveTask
              ? 'border-amber-500/90 ring-2 ring-amber-500/30 bg-slate-800/95 shadow-amber-900/40 shadow-lg'
              : timerDone
              ? 'border-emerald-500/80 ring-2 ring-emerald-500/30 bg-slate-800/95 animate-pulse'
              : completedToday
              ? 'border-emerald-700/60 bg-emerald-950/20'
              : gameState.selectedCrewId === member.id
              ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-slate-800/90'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50';

            return (
              <div
                key={member.id}
                onClick={() => {
                  spatialAudio.playUiClick();
                  onSelectCrew(member.id);
                }}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2.5 w-[100px] sm:w-[125px] lg:w-[145px] border ${cardBorderClass}`}
                title={`Click to assign Standing Orders to ${member.name} (${canonicalRole})`}
              >
                {/* Status Dot & Health Bar */}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${colorDot} ring-2 ring-black`} />
                  <div className="w-1.5 h-7 rounded-full bg-slate-950 overflow-hidden flex flex-col justify-end p-0.5 shrink-0">
                    <div
                      className={`w-full rounded-full transition-all ${
                        member.health > 60
                          ? 'bg-emerald-400'
                          : member.health > 25
                          ? 'bg-amber-400'
                          : 'bg-red-500'
                      }`}
                      style={{ height: `${member.health}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-white leading-tight">
                    <span className="truncate">{shortName}</span>
                    <span className={`text-[9px] font-mono ${member.health < 40 ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                      {isAlive ? `${Math.round(member.health)}%` : 'KIA'}
                    </span>
                  </div>

                  <div className="hidden sm:block text-[9px] text-cyan-300/90 font-bold uppercase tracking-wider mt-0.5 truncate">
                    {canonicalRole}
                  </div>
                  {hasTimer ? (
                    <>
                      <div className="flex items-center justify-between gap-0.5">
                        <div className={`text-[8px] font-mono font-bold uppercase truncate ${timerDone ? 'text-emerald-400' : 'text-amber-300'}`}>
                          {timerDone ? '✓ DONE' : taskLabel}
                        </div>
                        <div className={`text-[8px] font-mono tabular-nums shrink-0 ${timerDone ? 'text-emerald-400' : 'text-amber-200'}`}>
                          {timerDone ? '' : `${timerMM}:${timerSS}`}
                        </div>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 mt-0.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${timerDone ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${timerPct}%` }}
                        />
                      </div>
                      <div className="text-[7px] text-slate-600 uppercase truncate mt-0.5 hidden sm:block">
                        {taskStationName(member.task)}
                      </div>
                    </>
                  ) : completedToday ? (
                    <div className="text-[8px] truncate uppercase font-mono font-semibold text-emerald-400">
                      DONE TODAY ✓
                    </div>
                  ) : (
                    <div className={`text-[8px] truncate uppercase font-mono font-semibold ${member.task === 'idle' ? 'text-slate-500' : 'text-amber-300/90'}`}>
                      {member.task === 'idle' ? '— IDLE —' : taskLabel}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5b. TASK COMPLETION TOASTS                                                */}
      {/* ========================================================================= */}
      {completionToasts.length > 0 && (
        <div className="fixed bottom-24 right-3 z-45 flex flex-col gap-2 pointer-events-none">
          {completionToasts.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-500/80 shadow-lg shadow-emerald-950/60 font-mono animate-pulse"
            >
              <span className="text-base">✅</span>
              <div>
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">TASK COMPLETE</div>
                <div className="text-[11px] text-white font-bold">{t.name} — {t.task}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EVENT CARD MODAL (AUTO-PAUSED ON EVENT PER DECISION D-04)              */}
      {/* ========================================================================= */}
      {activeCrisis && !activeCrisis.resolved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md pointer-events-auto select-none font-mono">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-amber-500 shadow-2xl p-4 sm:p-6 text-white relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-black">
                  EVENT · {activeCrisis.severity}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/90 text-white animate-pulse">
                  SIMULATION PAUSED
                </span>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>

            <h2 className="text-lg font-black text-white mt-3">
              {activeCrisis.title}
            </h2>

            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">WHAT HAPPENED:</div>
              {activeCrisis.description}
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                CHOOSE MITIGATION PROTOCOL:
              </div>
              <div className="space-y-2">
                {crisisOptions.map((opt, idx) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedEventOption(idx)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedEventOption === idx
                        ? 'bg-cyan-950/70 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>{opt.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${opt.riskColor}`}>
                        {opt.risk}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">{opt.desc}</p>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <span className="text-slate-500">Cost:</span>
                      <span className="text-amber-300 font-semibold">{opt.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-mono">
                Costs and risks are game assumptions (D-17)
              </span>
              <button
                onClick={() => {
                  spatialAudio.playUiClick(1100);
                  const chosen = crisisOptions[selectedEventOption] || crisisOptions[0];
                  chosen?.action();
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-950 transition-all active:scale-95"
              >
                CONFIRM & RESUME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. KID-FRIENDLY TUTORIAL GUIDE (situation card + first-visit carousel)    */}
      {/* ========================================================================= */}
      <TutorialGuide
        gameState={gameState}
        onAssignTask={onAssignTask}
        onShelterAll={onShelterAll}
        isCarouselOpen={showTutorial}
        onOpenCarousel={() => setShowTutorial(true)}
        onCloseCarousel={() => setShowTutorial(false)}
      />
    </div>
  );
};
