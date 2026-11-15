/**
 * Project Artemis: Mission Gear & Equipment Loadout Bay
 * Definitive modular loadout selection interface matching NASA mission standards.
 * Features 9 interchangeable lunar modules with weight budgets and real-time survival implications.
 */

import React, { useState } from 'react';
import {
  Zap,
  Heart,
  Shield,
  Cpu,
  LayoutGrid,
  Check,
  Plus,
  ArrowLeft,
  ArrowRight,
  Package,
} from 'lucide-react';
import { GearLoadout } from '../../types/game.ts';
import {
  MISSION_MODULES,
  getDefaultPackedModuleIds,
} from '../../game/gearSystem.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface GearSelectorModalProps {
  currentLoadout: GearLoadout;
  onConfirmLoadout: (loadout: GearLoadout) => void;
  onClose: () => void;
}

type CategoryFilter = 'ALL' | 'POWER' | 'LIFE_SUPPORT' | 'SAFETY' | 'SYSTEMS';

export const GearSelectorModal: React.FC<GearSelectorModalProps> = ({
  currentLoadout,
  onConfirmLoadout,
  onClose,
}) => {
  // Initialize packed modules from currentLoadout or defaults
  const [packedIds, setPackedIds] = useState<string[]>(() => {
    if (currentLoadout.packedModuleIds && currentLoadout.packedModuleIds.length > 0) {
      return [...currentLoadout.packedModuleIds];
    }
    return getDefaultPackedModuleIds();
  });

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [inspectedModuleId, setInspectedModuleId] = useState<string | null>(null);
  const [capWarning, setCapWarning] = useState<string | null>(null);

  // Calculate total packed payload mass
  const totalMassKg = MISSION_MODULES.filter((m) => packedIds.includes(m.id)).reduce(
    (sum, m) => sum + m.weightKg,
    0
  );

  // Toggle packed state for a module with strict 1,800 kg cap enforcement (Decision D-06)
  const togglePackModule = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isPacked = packedIds.includes(id);
    if (!isPacked) {
      const mod = MISSION_MODULES.find((m) => m.id === id);
      const modMass = mod?.weightKg || 0;
      if (totalMassKg + modMass > 1800) {
        spatialAudio.playUiClick(400);
        setCapWarning(`Cannot pack ${mod?.name}: Exceeds 1,800 kg payload budget (would be ${totalMassKg + modMass} kg).`);
        return;
      }
    }
    setCapWarning(null);
    spatialAudio.playUiClick(1150);
    setPackedIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Filter modules based on selected category
  const filteredModules = MISSION_MODULES.filter((m) => {
    if (activeCategory === 'ALL') return true;
    return m.category === activeCategory;
  });

  // Save and continue
  const handleConfirm = () => {
    spatialAudio.playUiClick(950);

    // Map packed modules into compatible legacy loadout ids
    let eclssId = 'eclss_standard';
    if (packedIds.includes('o2_generator')) eclssId = 'eclss_cryo';
    if (packedIds.includes('water_recycler')) eclssId = 'eclss_ice';

    let powerId = 'power_standard';
    if (packedIds.includes('kilopower')) powerId = 'power_highflux';
    else if (packedIds.includes('battery_bank')) powerId = 'power_graphene';

    let suitId = 'suit_standard';
    if (packedIds.includes('storm_shelter')) suitId = 'suit_bismuth';
    else if (packedIds.includes('avionics_kit')) suitId = 'suit_servos';

    let payloadId = 'payload_radar';
    if (packedIds.includes('hydroponics')) payloadId = 'payload_algae';
    else if (packedIds.includes('water_recycler')) payloadId = 'payload_compressor';

    const updatedLoadout: GearLoadout = {
      packedModuleIds: packedIds,
      eclssId,
      powerId,
      suitId,
      payloadId,
    };

    onConfirmLoadout(updatedLoadout);
    onClose();
  };

  // Category navigation tabs
  const categories: {
    id: CategoryFilter;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      id: 'ALL',
      label: 'All gear',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      count: MISSION_MODULES.length,
    },
    {
      id: 'POWER',
      label: 'Power',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      count: MISSION_MODULES.filter((m) => m.category === 'POWER').length,
    },
    {
      id: 'LIFE_SUPPORT',
      label: 'Life support',
      icon: <Heart className="w-3.5 h-3.5 text-rose-400" />,
      count: MISSION_MODULES.filter((m) => m.category === 'LIFE_SUPPORT').length,
    },
    {
      id: 'SAFETY',
      label: 'Safety',
      icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />,
      count: MISSION_MODULES.filter((m) => m.category === 'SAFETY').length,
    },
    {
      id: 'SYSTEMS',
      label: 'Systems',
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" />,
      count: MISSION_MODULES.filter((m) => m.category === 'SYSTEMS').length,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-5xl rounded-3xl bg-[#1b1e2c]/95 border border-[#30354a] shadow-2xl p-5 md:p-7 relative flex flex-col max-h-[94vh] text-white overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-[#2b3044] pb-4 gap-3 shrink-0">
          <div>
            <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#888ea6] font-semibold">
              PREPARE FOR THE MOON
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              Choose your mission gear.
            </h1>
            <p className="text-xs md:text-sm text-[#9ca3af] mt-1 font-normal">
              Build your loadout. Pack the systems your crew will depend on.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-[11px] font-mono tracking-wider uppercase text-[#8f96af] font-semibold">
              MOON · SOUTH POLE
            </div>
            <div className="text-xs md:text-sm text-[#cbd5e1] font-medium mt-0.5">
              4 astronauts · 90 days
            </div>
          </div>
        </div>

        {/* MAIN BODY: SIDEBAR + 3x3 GRID */}
        <div className="flex flex-col md:flex-row gap-5 mt-5 flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT SIDEBAR: CATEGORIES */}
          <div className="w-full md:w-48 shrink-0 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#727993] font-bold mb-2 px-1">
                CATEGORIES
              </div>

              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      spatialAudio.playUiClick();
                      setActiveCategory(cat.id);
                    }}
                    className={`w-full h-9 rounded-xl px-3 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#2d3247] border border-[#484f6e] text-white shadow-sm'
                        : 'bg-transparent hover:bg-[#25293d]/60 text-[#8c93ad] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-mono">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Bottom Banner: Every module matters */}
            <div className="mt-4 p-3 rounded-2xl bg-[#232738]/60 border border-[#30354a] text-left hidden md:block">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Package className="w-4 h-4 text-[#9ca3af]" />
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                Every module matters.
              </div>
              <div className="text-[11px] text-[#82889e] leading-snug mt-1">
                Balance power, life support and safety for your crew.
              </div>
            </div>
          </div>

          {/* RIGHT 3x3 GRID */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredModules.map((module) => {
                const isPacked = packedIds.includes(module.id);
                const isInspected = inspectedModuleId === module.id;

                return (
                  <div
                    key={module.id}
                    onClick={() => setInspectedModuleId(isInspected ? null : module.id)}
                    className={`rounded-2xl bg-[#232738]/80 hover:bg-[#272b3e] border transition-all relative flex flex-col justify-between p-3 min-h-[118px] cursor-pointer group ${
                      isPacked
                        ? 'border-[#3e455f] ring-1 ring-cyan-500/20'
                        : 'border-[#30364c] hover:border-[#464e6b]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 3D Module Image Thumbnail */}
                      <div className="w-16 h-20 shrink-0 flex items-center justify-center relative">
                        <img
                          src={module.image}
                          alt={module.name}
                          className="w-full h-full object-contain filter drop-shadow select-none pointer-events-none transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Info & Name */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs md:text-[13px] font-bold text-white leading-snug line-clamp-2">
                          {module.name}
                        </h3>

                        {/* Weight */}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#8f96af] mt-1">
                          <span className="text-[9px] text-[#8f96af]">▲</span>
                          <span>{module.weightKg} kg</span>
                        </div>

                        {/* Module Action Button */}
                        <div className="mt-2.5">
                          {isPacked ? (
                            <button
                              onClick={(e) => togglePackModule(module.id, e)}
                              className="px-3 py-1 rounded-full bg-[#1e2130] hover:bg-rose-950/40 border border-[#3a4057] hover:border-rose-500/40 text-[#a5aec8] hover:text-rose-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>PACKED</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => togglePackModule(module.id, e)}
                              className="px-3.5 py-1 rounded-full bg-[#e3e6ee] hover:bg-white text-[#161824] hover:text-black text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-cyan-500/20 transition-all"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>PACK</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable/Inspected survival benefit tooltip */}
                    {isInspected && (
                      <div className="mt-2 pt-2 border-t border-[#343b52] text-[10px] text-cyan-300 bg-slate-950/50 p-2 rounded-lg font-mono">
                        <div className="font-bold text-amber-300 mb-0.5">
                          ✦ {module.shortBenefit}
                        </div>
                        <div className="text-slate-300 font-sans leading-tight">
                          {module.detailedEffect}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="border-t border-[#2e3347] pt-4 mt-4 flex items-center justify-between shrink-0">
          {/* Back Button */}
          <button
            onClick={() => {
              spatialAudio.playUiClick();
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-[#c8ccd9] hover:bg-white text-[#151722] font-bold text-xs md:text-sm tracking-wide transition-all shadow cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back</span>
          </button>

          {/* Center Instruction & Mass Tracker */}
          <div className="text-center hidden sm:block">
            {capWarning ? (
              <p className="text-xs text-rose-400 font-mono font-bold animate-pulse">
                ⚠️ {capWarning}
              </p>
            ) : (
              <p className="text-xs text-[#7e859f] font-mono">
                Select Pack to add a module. Select Packed to remove it. (1,800 kg max)
              </p>
            )}
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Packed Modules: <span className="text-white font-bold">{packedIds.length}</span>/12 · Total Mass:{' '}
              <span className={`font-bold ${totalMassKg > 1800 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {totalMassKg} kg
              </span>{' '}
              / 1,800 kg cap
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded-full bg-[#e3e6ee] hover:bg-white text-[#151722] font-extrabold text-xs md:text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
};
