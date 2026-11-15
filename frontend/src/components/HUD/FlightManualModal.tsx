/**
 * Project Artemis: Mission Flight Manual & Step-by-Step User Flow Guide
 * In-game interactive flight manual explaining the core loop, crew dispatch,
 * gear picking, crisis mitigation, and survival strategies.
 */

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Compass,
  Shield,
  Zap,
  Users,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface FlightManualModalProps {
  onClose: () => void;
  onOpenGearModal: () => void;
}

export const FlightManualModal: React.FC<FlightManualModalProps> = ({
  onClose,
  onOpenGearModal,
}) => {
  const [activeTab, setActiveTab] = useState<'FLOW' | 'CONTROLS' | 'CRISIS' | 'TIPS'>('FLOW');

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto select-none font-mono text-white">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-cyan-800 shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            spatialAudio.playUiClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-3 mb-4 pr-10">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-orange-400 uppercase">
            <BookOpen className="w-4 h-4" />
            <span>NASA Flight Operations Manual · Artemis III</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white mt-0.5">
            STEP-BY-STEP MISSION FLIGHT MANUAL
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete guide to surviving 90 days on the Moon's South Pole, picking gear, managing life support, and commanding the crew.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => {
              spatialAudio.playUiClick();
              setActiveTab('FLOW');
            }}
            className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'FLOW'
                ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Game Flow
          </button>
          <button
            onClick={() => {
              spatialAudio.playUiClick();
              setActiveTab('CONTROLS');
            }}
            className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'CONTROLS'
                ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Controls
          </button>
          <button
            onClick={() => {
              spatialAudio.playUiClick();
              setActiveTab('CRISIS');
            }}
            className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'CRISIS'
                ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Crisis Protocols
          </button>
          <button
            onClick={() => {
              spatialAudio.playUiClick();
              setActiveTab('TIPS');
            }}
            className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'TIPS'
                ? 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Survival Strategy
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'FLOW' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-cyan-400 font-bold uppercase text-xs mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-[10px]">1</span>
                  Phase 1: Pre-Flight Hangar Bay & Gear Selection
                </div>
                <p>
                  Start in the pressurized hangar bay. Select your expedition gear loadout (ECLSS scrubber,
                  fission power core, spacesuit weaves, and scientific tools). Click the 4 ACES astronauts to inspect their
                  biometric vitals and specializations. When ready, click the illuminated 3D <strong>"ENGAGE MISSION"</strong> switch.
                </p>
                <div className="mt-2.5">
                  <button
                    onClick={() => {
                      onOpenGearModal();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Gear & Equipment Bay</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-cyan-400 font-bold uppercase text-xs mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-[10px]">2</span>
                  Phase 2: Deep-Space Orrery & Planetary Navigation
                </div>
                <p>
                  Look out from the command deck at an active 3D Solar System. Orbit the camera to view Mercury, Venus, Earth with orbiting Moon,
                  Mars, Jupiter, and Saturn. Click <strong>The Moon</strong> or <strong>Mars</strong> to trigger the hyperspace camera dive
                  transitioning directly into the flight sequence.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-cyan-400 font-bold uppercase text-xs mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-[10px]">3</span>
                  Phase 3: Artemis Launch Pad Liftoff
                </div>
                <p>
                  Watch the nighttime launch gantry at Complex 39B. At T-3s, the umbilical swing arms release.
                  At T-1.5s, engine sparkers flood the terrain with bright orange plume light. Watch the massive SLS rocket
                  ascend into orbit with simulated acoustic rumble and screen vibration.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-cyan-400 font-bold uppercase text-xs mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center text-[10px]">4</span>
                  Phase 4: 90-Day Lunar Surface Survival (Core Gameplay)
                </div>
                <p>
                  Deploy your 4 astronauts at Artemis Base Camp. Monitor the dark periods and sunlight cycles.
                  Direct sunlight charges the 500 kWh battery grid via solar arrays, while your Kilopower fission reactor
                  and battery reserves sustain life support through dark intervals!
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-emerald-400 font-bold uppercase text-xs mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Phase 5: Day 90 Victory Condition
                </div>
                <p>
                  Reach Day 90 with at least 1 living crew member and intact habitat integrity. Your final score is calculated
                  from crew health, remaining oxygen, water, and food rations.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'CONTROLS' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="font-bold text-white uppercase mb-1">MOUSE & TRACKPAD</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Left Click Drag</strong>: Orbit camera left, right, up, and down around the 3D subject.</li>
                  <li><strong>Right Click Drag / Shift + Drag</strong>: Pan the camera position laterally.</li>
                  <li><strong>Scroll Wheel</strong>: Zoom in and zoom out.</li>
                  <li><strong>Clicking 3D Objects</strong>: Click astronauts to inspect bio, click Moon/Mars in Orrery to navigate.</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="font-bold text-white uppercase mb-1">KEYBOARD SHORTCUTS</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><code>WASD / Arrows</code>: Orbit & Pitch</div>
                  <div><code>Q / E</code>: Zoom In / Zoom Out</div>
                  <div><code>H</code>: Toggle Zen View (Hide Dock)</div>
                  <div><code>G</code>: Open Gear Bay Modal</div>
                  <div><code>M</code>: Toggle Audio Mute</div>
                  <div><code>Esc / P</code>: Pause Simulation</div>
                  <div><code>1, 2, 3, 4, 5</code>: Quick Level Jumps</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="font-bold text-white uppercase mb-1">ON-SCREEN D-PAD</div>
                <p>
                  The lower-right corner of the HUD features a clickable directional cross (▲, ▼, ◀, ▶),
                  a center reset button (⟲), and ZOOM +/- buttons for touch and trackpad convenience.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'CRISIS' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-700/60">
                <div className="font-bold text-red-300 uppercase mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Crisis 1: Class-X Coronal Mass Ejection (Day 42)
                </div>
                <p className="text-red-100/90">
                  <strong>Threat</strong>: A massive solar flare barrage hits the base. Unshielded crew will absorb over 800 mSv of lethal radiation!
                </p>
                <p className="mt-1 text-red-200">
                  <strong>Countermeasure</strong>: Immediately click <strong>"SHELTER CREW"</strong> on the red warning banner, or open each astronaut dossier and order them into <strong>"Enter Storm Shelter"</strong> before the radiation storm peaks.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-700/60">
                <div className="font-bold text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Crisis 2: Sabatier Recycler Steam Rupture (Day 18)
                </div>
                <p className="text-amber-100/90">
                  <strong>Threat</strong>: A high-pressure life-support conduit bursts on Module 3, rapidly venting oxygen into the vacuum.
                </p>
                <p className="mt-1 text-amber-200">
                  <strong>Countermeasure</strong>: Dispatch Cmdr. Sarah Chen or Dr. Marcus Vance to <strong>"EVA Exterior Repair"</strong> to conduct an emergency spacewalk weld before base integrity collapses.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-950/40 border border-sky-700/60">
                <div className="font-bold text-sky-300 uppercase mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Crisis 3: Dark Interval Brownout Deficit
                </div>
                <p className="text-sky-100/90">
                  <strong>Threat</strong>: If battery storage hits 0% during the polar dark interval, base heating shuts down and crew health drops rapidly.
                </p>
                <p className="mt-1 text-sky-200">
                  <strong>Countermeasure</strong>: Assign Lt. Tyler Hayes to <strong>"Power Grid Calibration"</strong> (+15% efficiency) and equip the High-Flux Stirling Core or Ultra-Capacitive Graphene Bank in your gear loadout.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'TIPS' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="font-bold text-cyan-300 uppercase mb-1">PRO-TIP: HYDROPONICS CONSERVATION</div>
                <p>
                  Assigning Dr. Marcus Vance to Hydroponic Cultivation reduces base food consumption by 30% and water burn by 20%. Pair this with the Bioluminescent Spirulina Vats gear for maximum efficiency.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="font-bold text-cyan-300 uppercase mb-1">PRO-TIP: BUNK RECOVERY</div>
                <p>
                  If an astronaut takes radiation or dehydration damage, assign them to <strong>"Rest & Bunk Recovery"</strong>. Resting replenishes 8% health and 10% morale per day.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="font-bold text-cyan-300 uppercase mb-1">PRO-TIP: DEAD SPACE SPINE LED STRIPS</div>
                <p>
                  Each 3D astronaut has a vertical LED spine strip on their backpack. Look at their 3D models in the viewport: Green = nominal health, Amber = caution (&lt;60%), Red = critical (&lt;25%).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Press [?] or click Flight Manual anytime to open this guide.
          </div>

          <button
            onClick={() => {
              spatialAudio.playUiClick();
              onClose();
            }}
            className="px-6 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            DISMISS MANUAL
          </button>
        </div>
      </div>
    </div>
  );
};
