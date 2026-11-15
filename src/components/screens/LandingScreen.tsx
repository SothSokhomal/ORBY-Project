import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Rocket, Users, Trophy, Compass, UserCheck } from 'lucide-react';
import { GoldButton } from '../common/GoldButton.tsx';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';

interface LandingScreenProps {
  onGetStarted: () => void;
  onNavigateToMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenCrewRoster: () => void;
  onOpenSignIn: () => void;
}

interface SlideContent {
  pill: string;
  title: string;
  subtitle: string;
}

const CAROUSEL_SLIDES: SlideContent[] = [
  {
    pill: 'SEASON 01 · NOW LIVE',
    title: 'WELCOME TO ORBY',
    subtitle: "Train for the cosmos. Complete missions. Become the galaxy's finest astronaut.",
  },
  {
    pill: 'EXPEDITION ARCHITECTURE',
    title: 'CHOOSE YOUR MISSIONS',
    subtitle: "From the Moon's South Pole to deep Martian craters. Master closed-loop ECLSS survival.",
  },
  {
    pill: 'ELITE ACES CREW',
    title: 'COMMAND 4 ASTRONAUTS',
    subtitle: 'Assign specialists to EVA repair, hydroponics, nuclear power, and emergency shelters.',
  },
  {
    pill: '90-DAY MISSION',
    title: 'SURVIVE POLAR DARKNESS',
    subtitle: 'Manage the Kilopower fission reactor and battery banks when solar arrays go dark.',
  },
  {
    pill: 'GLOBAL RANKINGS',
    title: "BECOME GALAXY'S FINEST",
    subtitle: 'Compete in ranked missions with seeded hazards and climb the Commander leaderboards.',
  },
];

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onGetStarted,
  onNavigateToMissions,
  onOpenLeaderboard,
  onOpenCrewRoster,
  onOpenSignIn,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-play carousel every 6s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    spatialAudio.playUiClick(750);
    setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    spatialAudio.playUiClick(850);
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const activeSlide = CAROUSEL_SLIDES[currentSlide];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#030408] select-none flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Deep Cosmic Starfield */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-900/15 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-950/20 blur-3xl" />
        {/* Generative Twinkling Stars */}
        <div className="absolute top-12 left-[15%] w-1.5 h-1.5 rounded-full bg-white star-twinkle-fast" />
        <div className="absolute top-36 left-[38%] w-1 h-1 rounded-full bg-sky-200 star-twinkle-medium" />
        <div className="absolute top-20 right-[25%] w-1.5 h-1.5 rounded-full bg-amber-100 star-twinkle-slow" />
        <div className="absolute bottom-48 left-[22%] w-1.5 h-1.5 rounded-full bg-white star-twinkle-medium" />
        <div className="absolute bottom-32 right-[18%] w-2 h-2 rounded-full bg-purple-200 star-twinkle-fast" />
        <div className="absolute top-2/3 right-[35%] w-1 h-1 rounded-full bg-sky-100 star-twinkle-slow" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto pointer-events-auto">
        {/* Left: ORBY Logo */}
        <div
          onClick={onGetStarted}
          className="flex items-center gap-3 cursor-pointer group"
          title="ORBY Exploration Systems"
        >
          {/* Gradient Orb Icon */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-pink-500 shadow-lg shadow-orange-500/40 border border-amber-300/60 group-hover:scale-105 transition-transform" />
          <span className="font-display font-black text-2xl tracking-[0.2em] text-white group-hover:text-amber-200 transition-colors">
            ORBY
          </span>
        </div>

        {/* Right Nav Links */}
        <nav className="flex items-center gap-7">
          <button
            onClick={() => {
              spatialAudio.playUiClick(800);
              onNavigateToMissions();
            }}
            className="text-slate-300 hover:text-white text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            Missions
          </button>

          <button
            onClick={() => {
              spatialAudio.playUiClick(800);
              onOpenLeaderboard();
            }}
            className="text-slate-300 hover:text-white text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            Leaderboard
          </button>

          <button
            onClick={() => {
              spatialAudio.playUiClick(800);
              onOpenCrewRoster();
            }}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Crew</span>
          </button>

          <button
            onClick={() => {
              spatialAudio.playUiClick(800);
              onOpenSignIn();
            }}
            className="px-5 py-1.5 rounded-full border border-purple-500/60 text-purple-200 hover:text-white hover:border-purple-400 text-sm font-sans font-medium transition-all cursor-pointer bg-purple-950/20 hover:bg-purple-900/30"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* HERO SECTION WITH FLOATING ARTWORK */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto w-full text-center">
        {/* Floating Space Illustrations */}
        <div className="relative w-full max-w-2xl h-56 flex items-center justify-center">
          {/* Left: Floating Satellite */}
          <div className="absolute left-0 bottom-4 animate-float hidden sm:block">
            <svg className="w-24 h-24 text-sky-400 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
              {/* Solar Array Left */}
              <rect x="5" y="42" width="28" height="16" rx="2" fill="#38bdf8" fillOpacity="0.8" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="14" y1="42" x2="14" y2="58" stroke="#0369a1" strokeWidth="1" />
              <line x1="23" y1="42" x2="23" y2="58" stroke="#0369a1" strokeWidth="1" />
              {/* Satellite Body */}
              <rect x="36" y="36" width="28" height="28" rx="8" fill="#64748b" stroke="#cbd5e1" strokeWidth="2" />
              <circle cx="50" cy="50" r="7" fill="#0284c7" />
              <circle cx="50" cy="50" r="3" fill="#38bdf8" />
              {/* Antenna */}
              <line x1="50" y1="36" x2="50" y2="24" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="50" cy="22" r="2.5" fill="#f59e0b" />
              {/* Solar Array Right */}
              <rect x="67" y="42" width="28" height="16" rx="2" fill="#38bdf8" fillOpacity="0.8" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="76" y1="42" x2="76" y2="58" stroke="#0369a1" strokeWidth="1" />
              <line x1="85" y1="42" x2="85" y2="58" stroke="#0369a1" strokeWidth="1" />
            </svg>
          </div>

          {/* Center: Main Rocket Hero with Animated Plume */}
          <div className="relative flex flex-col items-center">
            {/* Rocket SVG */}
            <svg className="w-36 h-48 drop-shadow-2xl" viewBox="0 0 120 180" fill="none">
              {/* Left Booster */}
              <path d="M22 80 C22 65, 30 75, 30 90 L30 140 L18 148 L18 100 Z" fill="#7c3aed" stroke="#c084fc" strokeWidth="1.5" />
              <polygon points="18,148 24,142 30,140" fill="#f59e0b" />
              {/* Right Booster */}
              <path d="M98 80 C98 65, 90 75, 90 90 L90 140 L102 148 L102 100 Z" fill="#7c3aed" stroke="#c084fc" strokeWidth="1.5" />
              <polygon points="102,148 96,142 90,140" fill="#f59e0b" />
              {/* Main Fuselage */}
              <path
                d="M60 12 C44 45, 34 85, 34 136 L86 136 C86 85, 76 45, 60 12 Z"
                fill="url(#fuselageGrad)"
                stroke="#e2e8f0"
                strokeWidth="2.5"
              />
              {/* Nosecone Gold Accent */}
              <path d="M60 12 C54 28, 48 42, 44 54 L76 54 C72 42, 66 28, 60 12 Z" fill="#f59e0b" />
              {/* Porthole */}
              <circle cx="60" cy="80" r="14" fill="#0f172a" stroke="#fbbf24" strokeWidth="3" />
              <circle cx="60" cy="80" r="10" fill="#38bdf8" fillOpacity="0.85" />
              <circle cx="56" cy="76" r="3" fill="#ffffff" fillOpacity="0.9" />
              {/* Lower Body Decals */}
              <rect x="44" y="106" width="32" height="6" rx="2" fill="#7c3aed" />
              <rect x="46" y="118" width="28" height="4" rx="1" fill="#f59e0b" />
              {/* Nozzle */}
              <polygon points="46,136 74,136 70,148 50,148" fill="#475569" stroke="#94a3b8" strokeWidth="1" />

              <defs>
                <linearGradient id="fuselageGrad" x1="34" y1="12" x2="86" y2="136" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="0.5" stopColor="#e2e8f0" />
                  <stop offset="1" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Animated Fiery Thruster Plume */}
            <div className="absolute top-[138px] animate-thruster pointer-events-none">
              <svg className="w-16 h-28" viewBox="0 0 60 100" fill="none">
                {/* Outer Flame (Orange) */}
                <path
                  d="M16 0 C10 35, 12 60, 30 95 C48 60, 50 35, 44 0 Z"
                  fill="url(#outerFlame)"
                  filter="drop-shadow(0 0 16px rgba(245, 158, 11, 0.9))"
                />
                {/* Inner Core Flame (Bright Yellow/White) */}
                <path
                  d="M22 0 C18 25, 20 45, 30 70 C40 45, 42 25, 38 0 Z"
                  fill="url(#innerFlame)"
                />
                <defs>
                  <linearGradient id="outerFlame" x1="30" y1="0" x2="30" y2="95" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f59e0b" />
                    <stop offset="0.6" stopColor="#ef4444" />
                    <stop offset="1" stopColor="#b91c1c" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="innerFlame" x1="30" y1="0" x2="30" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="0.4" stopColor="#fef08a" />
                    <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right: Floating Orange Landing Capsule */}
          <div className="absolute right-0 bottom-4 animate-float-delayed hidden sm:block">
            <svg className="w-24 h-24 text-amber-500 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
              {/* Top Dome */}
              <ellipse cx="50" cy="52" rx="30" ry="24" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />
              <ellipse cx="50" cy="46" rx="22" ry="16" fill="#f59e0b" />
              {/* Viewport */}
              <circle cx="50" cy="46" r="8" fill="#0f172a" stroke="#fef08a" strokeWidth="2" />
              <circle cx="50" cy="46" r="5" fill="#38bdf8" />
              {/* Top Hatch Handle */}
              <rect x="46" y="26" width="8" height="4" rx="2" fill="#fef08a" />
              <line x1="50" y1="26" x2="50" y2="20" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="50" cy="18" r="2.5" fill="#ef4444" />
              {/* Landing Legs */}
              <line x1="26" y1="68" x2="16" y2="82" stroke="#78350f" strokeWidth="3" />
              <circle cx="15" cy="83" r="4" fill="#fbbf24" />
              <line x1="74" y1="68" x2="84" y2="82" stroke="#78350f" strokeWidth="3" />
              <circle cx="85" cy="83" r="4" fill="#fbbf24" />
              <line x1="50" y1="72" x2="50" y2="84" stroke="#78350f" strokeWidth="3" />
              <circle cx="50" cy="85" r="4" fill="#fbbf24" />
            </svg>
          </div>
        </div>

        {/* Carousel Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-mono tracking-widest uppercase mb-4 mt-2 shadow-lg shadow-purple-950/40">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{activeSlide.pill}</span>
        </div>

        {/* Big Futuristic Title (Matches Mockup 1) */}
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-wider text-white uppercase drop-shadow-2xl max-w-4xl leading-tight">
          {activeSlide.title}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans max-w-2xl leading-relaxed">
          {activeSlide.subtitle}
        </p>

        {/* Carousel Controls: Arrows + Dots */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/80 hover:border-purple-400 text-purple-200 flex items-center justify-center cursor-pointer transition-all"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2.5">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  spatialAudio.playUiClick(900);
                  setCurrentSlide(idx);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-3 h-3 bg-amber-400 shadow-md shadow-amber-500/80 scale-110'
                    : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/80 hover:border-purple-400 text-purple-200 flex items-center justify-center cursor-pointer transition-all"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Glowing Gold CTA Button */}
        <div className="mt-8 mb-4">
          <GoldButton onClick={onGetStarted}>
            GET STARTED
          </GoldButton>
        </div>
      </main>

      {/* Bottom Footer Credits */}
      <footer className="relative z-10 py-4 text-center text-xs font-mono text-slate-500 border-t border-slate-900/80 pointer-events-auto">
        <span>ORBY Deep Space Directive · Lunar Surface Simulation · Press [Space] or click Get Started</span>
      </footer>
    </div>
  );
};
