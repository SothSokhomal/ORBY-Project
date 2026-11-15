/**
 * Project Artemis: Cinematic Storytelling Victory Sequence
 * Chapter-based interactive story for children and non-scientists.
 * Follows the 4 astronauts from the cozy Hab Command celebration
 * all the way through liftoff, space transit, and Earth ocean splashdown.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  RotateCcw,
  Globe,
  Award,
  Crown,
  Heart,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { GameSimulationState, GameLevel } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface VictoryStoryModalProps {
  gameState: GameSimulationState;
  onRestart: () => void;
  onRestartToLanding?: () => void;
  onSetLevel?: (level: GameLevel) => void;
}

export const VictoryStoryModal: React.FC<VictoryStoryModalProps> = ({
  gameState,
  onRestart,
  onRestartToLanding,
  onSetLevel,
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const { crew, highScore, callsign } = gameState;

  const aliveCrew = crew.filter((c) => c.health > 0);
  const allSurvived = aliveCrew.length === 4;

  // Change 3D scene matching the chapter story!
  useEffect(() => {
    if (!onSetLevel) return;

    if (currentChapter === 0 || currentChapter === 1) {
      // Inside the cozy Habitation Command Dome
      onSetLevel('LEVEL_HAB_INTERIOR');
    } else if (currentChapter === 2) {
      // Blasting off and seeing Earth in space!
      onSetLevel('LEVEL_ORRERY');
      spatialAudio.playRocketRumble(0, 0, 0, 3.5);
    } else if (currentChapter === 3 || currentChapter === 4) {
      // Looking at Earth / Homecoming
      onSetLevel('LEVEL_ORRERY');
    }
  }, [currentChapter, onSetLevel]);

  const goToChapter = (idx: number) => {
    spatialAudio.playUiClick(1050);
    setCurrentChapter(idx);
  };

  const chapters = [
    // CHAPTER 1: Inside the Cozy Hab
    {
      id: 0,
      badge: 'CHAPTER 1 OF 5 · HAB CELEBRATION',
      badgeColor: 'bg-emerald-600',
      title: 'The Golden Sunrise Inside Hab Command!',
      subtitle: 'Artemis Base Camp · Shackleton Crater',
      sceneTag: '3D VIEW: Inside the Cozy Habitat Dome',
      emoji: '🏡',
      story: (
        <div className="space-y-2.5 text-slate-200 leading-relaxed text-xs md:text-sm">
          <p>
            The golden rays of Day 90 peek over the frozen rim of Shackleton Crater! Inside the warm, pressurized
            Artemis Habitation Dome, the emergency warning klaxons finally fall silent.
          </p>
          <p>
            All 4 astronauts gather by the central holographic console with huge smiles, cheers, and high-fives!
            Against all odds—freezing polar dark periods, solar storms, and space dust—your crew did it:
            <strong> 90 full days on the Moon!</strong>
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/40 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-orange-400 font-bold shrink-0">🧡 Cmdr. Chen:</span>
              <span className="text-slate-300">
                “Crew, we just made history! We proved that human beings can build a warm home on another world.”
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">💚 Dr. Vance:</span>
              <span className="text-slate-300">
                “Look at these fresh strawberries from our greenhouse! The plants survived every cold night!”
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold shrink-0">💙 Dr. Rostova:</span>
              <span className="text-slate-300">
                “Our oxygen filters and water recycler held up 100%. We are all breathing easy!”
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0">💛 Lt. Hayes:</span>
              <span className="text-slate-300">
                “Nuclear power and battery banks delivered uninterrupted warmth. Time to pack our bags!”
              </span>
            </div>
          </div>
        </div>
      ),
    },

    // CHAPTER 2: Packing Samples & Boarding Orion
    {
      id: 1,
      badge: 'CHAPTER 2 OF 5 · PACKING THE MOON GEMS',
      badgeColor: 'bg-cyan-600',
      title: 'Packing Up & Saying Goodbye to the Base',
      subtitle: 'Artemis Airlock Gateway',
      sceneTag: '3D VIEW: Habitat Command Center',
      emoji: '🎒',
      story: (
        <div className="space-y-2.5 text-slate-200 leading-relaxed text-xs md:text-sm">
          <p>
            It is time to get ready for the journey home! The astronauts carefully seal titanium sample boxes filled
            with sparkling crystals from the crater floor, ancient lunar ice cores, and plant seedlings grown in lunar regolith.
          </p>
          <p>
            They zip up their bright orange NASA ACES spacesuits, fasten their golden visors, and take one last look around
            the cozy dome that protected them through months of space adventures.
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-xs">
            <p className="italic text-cyan-200">
              “Thank you, little base,” whispers Dr. Elena Rostova as she taps the airlock wall. “You kept us safe.
              The next explorers who land here will find the lights still on for them.”
            </p>
            <p className="mt-2 text-slate-300">
              Commander Sarah Chen leads the team across the gantry and into the silver <strong>Orion Starship</strong>.
              Hatch sealed! All systems ready for Earth return!
            </p>
          </div>
        </div>
      ),
    },

    // CHAPTER 3: Liftoff & Journey to the Blue Marble
    {
      id: 2,
      badge: 'CHAPTER 3 OF 5 · JOURNEY HOME',
      badgeColor: 'bg-indigo-600',
      title: 'Blasting Off to the Blue Planet!',
      subtitle: 'Cruising through Deep Space towards Earth',
      sceneTag: '3D VIEW: Solar System & Planet Earth in Space',
      emoji: '🚀',
      story: (
        <div className="space-y-2.5 text-slate-200 leading-relaxed text-xs md:text-sm">
          <p className="font-bold text-amber-300">
            3... 2... 1... IGNITION! 🚀
          </p>
          <p>
            The ascent rocket roars with bright golden flame! Orion lifts off from the Moon, sailing high above the craters
            and arcing into the silent starry void of deep space.
          </p>
          <p>
            Through the spacecraft window, the Moon shrinks into a silvery orb behind them. And ahead, floating like a radiant
            sapphire jewel in the black velvet sky, is <strong>Earth</strong>!
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/40 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <Globe className="w-4 h-4" />
              <span>Look at that beautiful Blue Marble:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Deep blue oceans, swirling white cloud spirals, green continents, and cozy city lights shining in the night.
              Every person you know, every playground, and everyone on Earth is waiting to welcome the astronauts home!
            </p>
          </div>
        </div>
      ),
    },

    // CHAPTER 4: Splashdown in the Ocean!
    {
      id: 3,
      badge: 'CHAPTER 4 OF 5 · WELCOME HOME!',
      badgeColor: 'bg-sky-600',
      title: 'Splashdown in the Pacific Ocean!',
      subtitle: 'Planet Earth · Pacific Recovery Fleet',
      sceneTag: '3D VIEW: Planet Earth Homecoming',
      emoji: '🌊',
      story: (
        <div className="space-y-2.5 text-slate-200 leading-relaxed text-xs md:text-sm">
          <p>
            With a bright fiery glow through the upper atmosphere, Orion returns to Earth's warm embrace!
          </p>
          <p>
            <strong>POP!</strong> Three massive red-and-white parachutes blossom like giant flowers in the bright morning sky,
            drifting gently down toward the shimmering ocean waves!
          </p>
          <p className="font-bold text-cyan-300 text-sm">
            SPLASH! 💦
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/40 text-xs space-y-1.5">
            <p className="text-slate-200">
              The capsule bobs peacefully in the warm Pacific water. Naval recovery boats and helicopters circle overhead.
              Over the radio, cheers erupt from Houston to every classroom in the world:
            </p>
            <p className="text-amber-300 font-bold italic">
              “Welcome home, Artemis crew! You did it! You showed the whole human race that we can live on the Moon!”
            </p>
          </div>
        </div>
      ),
    },

    // CHAPTER 5: The Artemis Golden Trophy & Medals
    {
      id: 4,
      badge: 'CHAPTER 5 OF 5 · VICTORY TROPHY',
      badgeColor: 'bg-amber-500 text-black font-extrabold',
      title: 'The Artemis Golden Trophy of Honor!',
      subtitle: `Awarded to Commander ${callsign} & The 4 Artemis Heroes`,
      sceneTag: '3D VIEW: The Solar System Celebrates',
      emoji: '🏆',
      story: (
        <div className="space-y-3 text-slate-200 leading-relaxed text-xs md:text-sm">
          <p>
            Congratulations, Commander! Thanks to your smart choices with oxygen, water, power, and storm protection,
            humanity has successfully established its first permanent lunar foothold!
          </p>

          {/* 4 Astronaut Honor Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-[#202538] border border-orange-500/50 text-center">
              <div className="text-xl">🧡</div>
              <div className="font-bold text-white text-xs mt-1">Cmdr. Sarah Chen</div>
              <div className="text-[10px] text-orange-400 font-mono">Leadership Medal</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202538] border border-emerald-500/50 text-center">
              <div className="text-xl">🌱</div>
              <div className="font-bold text-white text-xs mt-1">Dr. Marcus Vance</div>
              <div className="text-[10px] text-emerald-400 font-mono">Master Botanist</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202538] border border-cyan-500/50 text-center">
              <div className="text-xl">💧</div>
              <div className="font-bold text-white text-xs mt-1">Dr. Elena Rostova</div>
              <div className="text-[10px] text-cyan-400 font-mono">Life Support Shield</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202538] border border-amber-500/50 text-center">
              <div className="text-xl">⚡</div>
              <div className="font-bold text-white text-xs mt-1">Lt. Tyler Hayes</div>
              <div className="text-[10px] text-amber-400 font-mono">Grid Master</div>
            </div>
          </div>

          {/* Final Metrics Banner */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 text-center font-mono">
            <div>
              <div className="text-[10px] text-slate-400">MISSION DAYS</div>
              <div className="text-base font-bold text-white">90 / 90</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">ASTRONAUTS SAVED</div>
              <div className="text-base font-bold text-emerald-400">{allSurvived ? '4 / 4 Safe!' : `${aliveCrew.length} / 4`}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">NASA HIGH SCORE</div>
              <div className="text-base font-bold text-amber-300">{highScore}</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const chapter = chapters[currentChapter];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-3xl rounded-3xl bg-[#181b2a]/95 border-2 border-emerald-500/70 shadow-2xl p-5 md:p-7 relative flex flex-col max-h-[94vh] text-white overflow-hidden">
        
        {/* TOP STORY HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2d334d] pb-4 gap-2 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${chapter.badgeColor}`}>
                {chapter.badge}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 hidden sm:inline">
                {chapter.sceneTag}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <span>{chapter.emoji}</span>
              <span>{chapter.title}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {chapter.subtitle}
            </p>
          </div>

          {/* Chapter dots navigation */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {chapters.map((_, i) => (
              <button
                key={i}
                onClick={() => goToChapter(i)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  currentChapter === i
                    ? 'bg-amber-400 scale-125 ring-2 ring-amber-400/50'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Jump to Chapter ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* STORY BODY CONTENT */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {chapter.story}
        </div>

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div className="border-t border-[#2d334d] pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Left: Previous Chapter or Scene Exploration Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentChapter > 0 ? (
              <button
                onClick={() => goToChapter(currentChapter - 1)}
                className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Chapter</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Press "Next Chapter" to follow the journey!
              </span>
            )}

            {/* Quick 3D Scene Toggles */}
            {onSetLevel && (
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => onSetLevel('LEVEL_HAB_INTERIOR')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer"
                  title="View Hab Command in 3D"
                >
                  🏡 Hab View
                </button>
                <button
                  onClick={() => onSetLevel('LEVEL_ORRERY')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 cursor-pointer"
                  title="View Earth & Space in 3D"
                >
                  🌍 Earth View
                </button>
              </div>
            )}
          </div>

          {/* Right: Next Chapter or End Game Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentChapter < chapters.length - 1 ? (
              <button
                onClick={() => goToChapter(currentChapter + 1)}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950 transition-all active:scale-95"
              >
                <span>Next Chapter</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    spatialAudio.playUiClick();
                    onRestart();
                  }}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again!</span>
                </button>

                {onRestartToLanding && (
                  <button
                    onClick={() => {
                      spatialAudio.playUiClick();
                      onRestartToLanding();
                    }}
                    className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

