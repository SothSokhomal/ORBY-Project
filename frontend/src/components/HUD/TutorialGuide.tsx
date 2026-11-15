/**
 * ORBY Tutorial Guide
 * Kid-friendly, grade-4 reading level (≤12 words per line).
 * Shows:
 *   1. First-visit carousel (5 steps, auto-opens on first outpost entry)
 *   2. Persistent "Now Happening" situation card — always visible during play
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { GameSimulationState, CrewTask } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

const TUTORIAL_SEEN_KEY = 'orby.tutorial.v1';

// ─── Carousel step definitions ───────────────────────────────────────────────

interface TutorialStep {
  emoji: string;
  headline: string;    // ≤10 words, big text
  detail: string;      // ≤12 words, smaller text
  lookAt: string;      // "Look at…" pointer, ≤12 words
  color: string;       // Tailwind accent color class
}

const STEPS: TutorialStep[] = [
  {
    emoji: '🎒',
    headline: 'Step 1: Check your gear!',
    detail: 'You packed modules before launch. Check the Gear button.',
    lookAt: 'Look at the GEAR button at the top right.',
    color: 'text-cyan-400',
  },
  {
    emoji: '👩‍🚀',
    headline: 'Step 2: Assign crew tasks!',
    detail: 'All crew start idle. Click a card and pick a job.',
    lookAt: 'Look at the 4 crew cards at the BOTTOM.',
    color: 'text-orange-400',
  },
  {
    emoji: '⏱️',
    headline: 'Step 3: Watch the timers!',
    detail: 'Each job has a countdown. Done? Pick the next task.',
    lookAt: 'Watch the progress bar on each crew card.',
    color: 'text-amber-400',
  },
  {
    emoji: '🏆',
    headline: 'Step 4: Survive to Day 90!',
    detail: 'Keep 3 or more crew alive. You can do it!',
    lookAt: 'Watch the DAY counter at the TOP LEFT.',
    color: 'text-emerald-400',
  },
];

// ─── Kid-friendly situation summary ──────────────────────────────────────────

interface KidSituation {
  emoji: string;
  badge: string;    // 1–3 word label
  tip: string;      // ≤12 words, what's happening
  hint: string;     // ≤12 words, what to do
  urgent: boolean;
  actionLabel?: string;
  actionFn?: () => void;
}

function getKidSituation(
  gameState: GameSimulationState,
  onAssignTask: (id: string, task: CrewTask) => void,
  onShelterAll: () => void,
): KidSituation {
  const { activeCrisis, resources, crew, day, lunarPhase } = gameState;
  const o2Pct   = Math.round((resources.oxygenKg   / resources.oxygenMax)   * 100);
  const waterPct = Math.round((resources.waterLiters / resources.waterMax)   * 100);
  const battPct  = Math.round((resources.batteryKwh  / resources.batteryMax) * 100);

  const crewOutside = crew.some((c) => c.task !== 'storm_shelter' && c.task !== 'resting');

  // 1. Solar storm with crew outside → urgent
  if (activeCrisis?.type === 'SOLAR_STORM' && !activeCrisis.resolved && crewOutside) {
    return {
      emoji: '🛡️',
      badge: 'DANGER!',
      tip: 'A solar storm is coming right now!',
      hint: 'Bring everyone inside the shelter.',
      urgent: true,
      actionLabel: '⬇ Shelter All',
      actionFn: onShelterAll,
    };
  }

  // 2. Any unresolved crisis
  if (activeCrisis && !activeCrisis.resolved) {
    return {
      emoji: '⚠️',
      badge: 'READ ME!',
      tip: 'Something went wrong at the base!',
      hint: 'Read the yellow card and pick an answer.',
      urgent: true,
    };
  }

  // 3. Battery critically low
  if (battPct <= 10) {
    return {
      emoji: '🔋',
      badge: 'EMERGENCY!',
      tip: 'Almost no power left!',
      hint: 'Ask Sarah to work on the Power Grid.',
      urgent: true,
      actionLabel: '⚡ Power Grid',
      actionFn: () => onAssignTask('crew-1', 'power_grid'),
    };
  }

  // 4. Oxygen low
  if (o2Pct <= 20) {
    return {
      emoji: '🫧',
      badge: 'AIR LOW!',
      tip: 'Air is running out fast!',
      hint: 'Ask Tyler to do an EVA repair.',
      urgent: true,
      actionLabel: '🔧 EVA Repair',
      actionFn: () => onAssignTask('crew-4', 'eva_repair'),
    };
  }

  // 5. Power low
  if (battPct <= 20) {
    return {
      emoji: '⚡',
      badge: 'POWER LOW',
      tip: 'Power is very low right now.',
      hint: 'Ask Sarah to work on the Power Grid.',
      urgent: true,
      actionLabel: '⚡ Power Grid',
      actionFn: () => onAssignTask('crew-1', 'power_grid'),
    };
  }

  // 6. Water low
  if (waterPct <= 20) {
    return {
      emoji: '💧',
      badge: 'WATER LOW',
      tip: 'Water reserve is getting low.',
      hint: 'Ask Marcus to tend the Hydroponics garden.',
      urgent: false,
      actionLabel: '🌿 Hydroponics',
      actionFn: () => onAssignTask('crew-2', 'hydroponics'),
    };
  }

  // 7. Crew tired
  const tiredCrew = crew.find((c) => c.health > 0 && c.health < 40);
  if (tiredCrew) {
    const short = tiredCrew.name.replace(/^(Cmdr\.|Dr\.|Lt\.)\s*/, '');
    return {
      emoji: '🛏️',
      badge: 'CREW TIRED',
      tip: `${short} is very tired. They need rest.`,
      hint: 'Click their card → pick "Rest & recover".',
      urgent: false,
      actionLabel: '😴 Rest',
      actionFn: () => onAssignTask(tiredCrew.id, 'resting'),
    };
  }

  // 8. Night period active
  if (lunarPhase === 'NIGHT') {
    return {
      emoji: '🌑',
      badge: 'DARK TIME',
      tip: 'No sunlight right now. Use the battery.',
      hint: 'Keep power use low until sun returns.',
      urgent: false,
    };
  }

  // 9. Day 1 — game just started
  if (day === 1) {
    return {
      emoji: '🚀',
      badge: 'DAY 1!',
      tip: 'Your mission just started! Assign jobs now.',
      hint: 'Click each astronaut and give them a task.',
      urgent: false,
    };
  }

  // 10. Nominal
  return {
    emoji: '✅',
    badge: 'ALL GOOD',
    tip: `Day ${day} of 90. Everything looks fine!`,
    hint: 'Keep watching the 4 bars on the left.',
    urgent: false,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TutorialGuideProps {
  gameState: GameSimulationState;
  onAssignTask: (crewId: string, task: CrewTask) => void;
  onShelterAll: () => void;
  isCarouselOpen: boolean;
  onOpenCarousel: () => void;
  onCloseCarousel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  gameState,
  onAssignTask,
  onShelterAll,
  isCarouselOpen,
  onOpenCarousel,
  onCloseCarousel,
}) => {
  const [step, setStep] = useState(0);

  const situation = getKidSituation(gameState, onAssignTask, onShelterAll);
  const { mode } = gameState;
  const isActive = mode === 'playing' || mode === 'paused';

  // Mark tutorial as seen when it closes
  const handleClose = () => {
    try { localStorage.setItem(TUTORIAL_SEEN_KEY, '1'); } catch (_) {}
    spatialAudio.playUiClick(900);
    onCloseCarousel();
    setStep(0);
  };

  if (!isActive) return null;

  return (
    <>
      {/* ══ PERSISTENT SITUATION CARD ══════════════════════════════════════════ */}
      {/* Floats just below the top bar on the left side */}
      <div
        className={`absolute top-16 left-3 z-25 max-w-[220px] pointer-events-auto select-none`}
        style={{ fontFamily: 'var(--font-body, sans-serif)' }}
      >
        <div
          className={`rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 ${
            situation.urgent
              ? 'bg-red-950/90 border-red-500/80 shadow-red-900/40 animate-pulse'
              : 'bg-slate-950/85 border-slate-700/70'
          }`}
        >
          {/* Badge row */}
          <div className="flex items-center justify-between gap-1 px-3 pt-2.5 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">{situation.emoji}</span>
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${
                  situation.urgent ? 'text-red-300' : 'text-cyan-400'
                }`}
              >
                {situation.badge}
              </span>
            </div>
            <button
              onClick={() => { spatialAudio.playUiClick(800); onOpenCarousel(); }}
              title="Open tutorial guide"
              className="text-slate-500 hover:text-cyan-300 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Situation text */}
          <div className="px-3 pb-1">
            <p className={`text-xs font-bold leading-tight ${situation.urgent ? 'text-white' : 'text-slate-200'}`}>
              {situation.tip}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{situation.hint}</p>
          </div>

          {/* Quick action button */}
          {situation.actionLabel && situation.actionFn && (
            <div className="px-3 pb-2.5">
              <button
                onClick={() => { spatialAudio.playUiClick(1000); situation.actionFn?.(); }}
                className={`w-full py-1 px-2 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95 ${
                  situation.urgent
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-cyan-600/80 hover:bg-cyan-500 text-white'
                }`}
              >
                {situation.actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ CAROUSEL OVERLAY ═══════════════════════════════════════════════════ */}
      {isCarouselOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto select-none"
          style={{ background: 'rgba(0,4,16,0.90)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="relative w-full max-w-[360px] rounded-3xl flex flex-col items-center text-center overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0f1424 0%, #12192e 100%)',
              boxShadow: '0 0 0 1.5px rgba(34,211,238,0.35), 0 0 60px rgba(34,211,238,0.08), 0 32px 64px rgba(0,0,0,0.7)',
              fontFamily: 'var(--font-body, sans-serif)',
            }}
          >
            {/* Top cyan glow line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-300 hover:bg-slate-800/60 cursor-pointer transition-all z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="px-6 pt-6 pb-5 flex flex-col items-center w-full">
              {/* Step counter */}
              <div className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-5">
                HOW TO PLAY · STEP {step + 1} OF {STEPS.length}
              </div>

              {/* Big emoji */}
              <div
                className="text-7xl mb-5 select-none leading-none"
                role="img"
                style={{ filter: 'drop-shadow(0 4px 20px rgba(34,211,238,0.25))' }}
              >
                {STEPS[step].emoji}
              </div>

              {/* Headline */}
              <h2
                className={`text-[26px] font-black leading-tight mb-2 ${STEPS[step].color}`}
                style={{ fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '-0.01em' }}
              >
                {STEPS[step].headline}
              </h2>

              {/* Detail */}
              <p className="text-sm text-slate-300 leading-relaxed mb-4 max-w-[260px]">
                {STEPS[step].detail}
              </p>

              {/* Look-at chip */}
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl mb-6 max-w-[280px]"
                style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.7)' }}
              >
                <span className="text-sm leading-none shrink-0">👀</span>
                <span className="text-[11px] text-cyan-300 font-semibold leading-tight text-left">
                  {STEPS[step].lookAt}
                </span>
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-2 mb-6">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full cursor-pointer transition-all duration-300 ${
                      i === step
                        ? 'w-6 h-2.5 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                        : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2 w-full">
                {step > 0 ? (
                  <button
                    onClick={() => { spatialAudio.playUiClick(700); setStep((s) => s - 1); }}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-full text-slate-400 hover:text-white text-xs font-bold uppercase cursor-pointer transition-all hover:bg-slate-800/60 active:scale-95"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex-1" />

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => { spatialAudio.playUiClick(900); setStep((s) => s + 1); }}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-black uppercase cursor-pointer transition-all active:scale-95"
                    style={{ boxShadow: '0 4px 20px rgba(34,211,238,0.3)' }}
                  >
                    NEXT
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase cursor-pointer transition-all active:scale-95"
                    style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Let's go!
                  </button>
                )}
              </div>
            </div>

            {/* Bottom glow line */}
            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
};
