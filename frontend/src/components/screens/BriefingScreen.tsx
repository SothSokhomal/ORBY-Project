import React from 'react';
import { Shield, Check, Compass, BatteryCharging, Wind, Flame } from 'lucide-react';
import { MetalButton } from '../common/MetalButton.tsx';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface BriefingScreenProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onJumpToStep?: (step: number) => void;
  onBackToLanding?: () => void;
}

export const BriefingScreen: React.FC<BriefingScreenProps> = ({
  currentStep,
  onNext,
  onBack,
  onJumpToStep,
  onBackToLanding,
}) => {
  const steps = [
    { num: 1, label: 'Your mission' },
    { num: 2, label: 'Stay supplied' },
    { num: 3, label: 'Plan ahead' },
    { num: 4, label: 'Get ready' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center p-4 sm:p-6 z-40 font-sans">
      {/* Semi-transparent dark cosmic backdrop container */}
      <div className="pointer-events-auto w-full max-w-5xl rounded-3xl bg-[#0d111d]/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[540px]">
        
        {/* HEADER: Step Counter & Progress Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-sm tracking-wide">
              Step {currentStep} of 4
            </span>
            {onBackToLanding && (
              <button
                onClick={() => {
                  spatialAudio.playUiClick(700);
                  onBackToLanding();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer ml-2"
              >
                Back to Landing
              </button>
            )}
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((st) => {
              const isCompleted = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <button
                  key={st.num}
                  onClick={() => onJumpToStep?.(st.num)}
                  disabled={!onJumpToStep}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950'
                      : isCompleted
                      ? 'bg-purple-950/80 text-purple-200 border border-purple-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-slate-950 text-amber-400'
                        : isCompleted
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : st.num}
                  </span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT SWITCHER */}
        <div className="py-6 flex-1 flex flex-col justify-center">
          {/* ================= STEP 2: STAY SUPPLIED (MATCHES SCREENSHOT 3) ================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-purple-400 uppercase font-mono">
                  YOUR FOUR LIFELINES
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wide mt-1">
                  Keep every resource above zero.
                </h2>
              </div>

              {/* 4 Lifeline Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {/* 1. Oxygen */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="w-full h-36 rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-950/80 flex items-center justify-center relative overflow-hidden">
                    {/* Illustrated Twin Oxygen Tanks */}
                    <svg className="w-24 h-28 drop-shadow-lg" viewBox="0 0 100 120" fill="none">
                      <rect x="22" y="24" width="22" height="68" rx="8" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                      <rect x="56" y="24" width="22" height="68" rx="8" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                      <rect x="28" y="16" width="10" height="8" rx="2" fill="#64748b" />
                      <rect x="62" y="16" width="10" height="8" rx="2" fill="#64748b" />
                      <path d="M33 16 L33 10 L67 10 L67 16" stroke="#94a3b8" strokeWidth="3" />
                      <circle cx="50" cy="8" r="4" fill="#38bdf8" />
                      <rect x="18" y="44" width="64" height="6" rx="2" fill="#334155" />
                      <rect x="18" y="70" width="64" height="6" rx="2" fill="#334155" />
                    </svg>
                  </div>
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 font-mono">O₂</span>
                      <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        ))}
                      </div>
                    </div>
                    <div className="font-bold text-white text-base mt-1">Oxygen</div>
                    <div className="text-xs text-slate-400">Air to breathe.</div>
                  </div>
                </div>

                {/* 2. Water */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="w-full h-36 rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-950/80 flex items-center justify-center relative overflow-hidden">
                    {/* Crystalline Water Droplet */}
                    <svg className="w-24 h-28 drop-shadow-xl" viewBox="0 0 100 120" fill="none">
                      <defs>
                        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7dd3fc" />
                          <stop offset="60%" stopColor="#0284c7" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M50 16 C50 16, 20 64, 20 84 C20 100, 33 112, 50 112 C67 112, 80 100, 80 84 C80 64, 50 16, 50 16 Z"
                        fill="url(#waterGrad)"
                        stroke="#bae6fd"
                        strokeWidth="2"
                      />
                      <ellipse cx="40" cy="74" rx="8" ry="16" fill="#ffffff" fillOpacity="0.45" transform="rotate(-25 40 74)" />
                    </svg>
                  </div>
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 font-mono">H₂O</span>
                      <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        ))}
                      </div>
                    </div>
                    <div className="font-bold text-white text-base mt-1">Water</div>
                    <div className="text-xs text-slate-400">Drinking water.</div>
                  </div>
                </div>

                {/* 3. Food */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="w-full h-36 rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-950/80 flex items-center justify-center relative overflow-hidden">
                    {/* Delicious Food Rations Graphic */}
                    <svg className="w-28 h-28 drop-shadow-lg" viewBox="0 0 120 120" fill="none">
                      {/* Burger */}
                      <path d="M30 65 Q50 48 70 65 Z" fill="#d97706" />
                      <rect x="28" y="66" width="44" height="4" rx="2" fill="#22c55e" />
                      <rect x="30" y="71" width="40" height="5" rx="2" fill="#78350f" />
                      <path d="M30 77 Q50 82 70 77 Z" fill="#d97706" />
                      {/* Pizza slice */}
                      <path d="M72 50 L102 68 L68 76 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                      <circle cx="82" cy="62" r="3" fill="#dc2626" />
                      <circle cx="90" cy="70" r="2.5" fill="#dc2626" />
                      {/* Drink cup */}
                      <polygon points="12,54 26,54 22,86 16,86" fill="#ef4444" />
                      <line x1="19" y1="54" x2="19" y2="44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-mono">FOOD</span>
                      <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ))}
                      </div>
                    </div>
                    <div className="font-bold text-white text-base mt-1">Food</div>
                    <div className="text-xs text-slate-400">Meals for the crew.</div>
                  </div>
                </div>

                {/* 4. Power / Heat */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="w-full h-36 rounded-xl bg-gradient-to-b from-slate-800/50 to-slate-950/80 flex items-center justify-center relative overflow-hidden">
                    {/* Glowing Filament Light Bulb */}
                    <svg className="w-24 h-28 drop-shadow-xl" viewBox="0 0 100 120" fill="none">
                      <circle cx="50" cy="48" r="26" fill="#fef08a" fillOpacity="0.4" stroke="#facc15" strokeWidth="2.5" />
                      <circle cx="50" cy="48" r="14" fill="#fde047" fillOpacity="0.6" />
                      {/* Glowing filament */}
                      <path d="M44 58 L46 44 L54 44 L56 58" stroke="#ca8a04" strokeWidth="2" fill="none" />
                      <rect x="42" y="74" width="16" height="12" rx="2" fill="#64748b" />
                      <rect x="44" y="86" width="12" height="6" rx="2" fill="#475569" />
                    </svg>
                  </div>
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 font-mono">PWR</span>
                      <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="font-bold text-white text-base mt-1">Power / heat</div>
                    <div className="text-xs text-slate-400">Energy and warmth.</div>
                  </div>
                </div>
              </div>

              {/* Bottom Rule Tip */}
              <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Four resources. One rule: don't let any run out.</span>
              </div>
            </div>
          )}

          {/* ================= STEP 1: YOUR MISSION ================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-sky-400 uppercase font-mono">
                  ARTEMIS DIRECTIVE · 90 DAYS
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wide mt-1">
                  Establish humanity's first lunar foothold.
                </h2>
              </div>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                You are tasked with leading Artemis Base Camp at Shackleton Crater on the Moon's South Pole.
                Your mission spans 90 lunar days across deep sub-zero dark intervals and continuous polar sunlight.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-sky-400 text-xs font-mono font-bold">DAY 01 - 30</div>
                  <div className="text-white font-bold mt-1">Landing & Assembly</div>
                  <div className="text-xs text-slate-400 mt-1">Deploy solar arrays, drill regolith ice, and calibrate life-support.</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-amber-400 text-xs font-mono font-bold">DAY 31 - 60</div>
                  <div className="text-white font-bold mt-1">Dark Period Survival</div>
                  <div className="text-xs text-slate-400 mt-1">Endure polar shadow intervals relying on battery reserves and Kilopower.</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-emerald-400 text-xs font-mono font-bold">DAY 61 - 90</div>
                  <div className="text-white font-bold mt-1">Permanent Habitability</div>
                  <div className="text-xs text-slate-400 mt-1">Validate permanent human presence and secure the colony for future crews.</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PLAN AHEAD ================= */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase font-mono">
                  SPACE HAZARDS & WEATHER
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wide mt-1">
                  Anticipate crises before they strike.
                </h2>
              </div>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                The lunar frontier is unforgiving. Keep a sharp eye on telemetry alarms and assign your crew strategically.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                    <Flame className="w-4 h-4" />
                    <span>SOLAR FLARES</span>
                  </div>
                  <div className="text-white font-bold mt-1">Radiation Storms</div>
                  <div className="text-xs text-slate-400 mt-1">Order all astronauts to the underground regolith storm shelter immediately.</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold">
                    <Wind className="w-4 h-4" />
                    <span>REGOLITH DUST</span>
                  </div>
                  <div className="text-white font-bold mt-1">Electrostatic Clinging</div>
                  <div className="text-xs text-slate-400 mt-1">Abrasive silica coats solar panels, reducing electrical generation by up to 40%.</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold">
                    <BatteryCharging className="w-4 h-4" />
                    <span>BATTERY DEPLETION</span>
                  </div>
                  <div className="text-white font-bold mt-1">Sub-Zero Freeze</div>
                  <div className="text-xs text-slate-400 mt-1">Prioritize habitat thermal heaters before core temperatures drop below critical.</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: GET READY ================= */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
                  FINAL CHECKLIST
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-wide mt-1">
                  All systems go. Proceed to Hangar.
                </h2>
              </div>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Your spacecraft is fueled on the Artemis launch pad. Inspect your 4 crew members in the pressurized hangar bay, verify spacesuit telemetry, and commence liftoff!
              </p>
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900/80 border border-purple-500/40 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-lg">Hangar Bay Access Granted</div>
                  <div className="text-xs text-slate-300 mt-1">Meet Cmdr. Chen, Dr. Vance, Dr. Rostova, and Tyler Morgan in full 3D.</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
                  ✓
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: Pagination Dots & Metallic Back / Next Buttons (Matches Screenshot 3) */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {/* Back Button */}
          <MetalButton
            onClick={() => {
              spatialAudio.playUiClick(750);
              onBack();
            }}
            className="w-32 py-2.5 text-xs sm:text-sm font-bold tracking-wider"
          >
            ← Back
          </MetalButton>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                className={`h-2 rounded-full transition-all ${
                  dot === currentStep
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <MetalButton
            onClick={() => {
              spatialAudio.playUiClick(950);
              onNext();
            }}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wider min-w-[120px]"
          >
            {currentStep === 4 ? 'Proceed to Hangar →' : 'Next →'}
          </MetalButton>
        </div>

      </div>
    </div>
  );
};
