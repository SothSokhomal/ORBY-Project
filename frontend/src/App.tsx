/**
 * Project Artemis: 90 Days on the Lunar Frontier
 * AAA Interactive 3D Space Survival Game Engine
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './graphics/GameEngine.ts';
import {
  createInitialGameState,
  tickSimulation,
  assignCrewTask,
  completeCrewTask,
  orderAllToShelter,
  setGearLoadout,
} from './game/survivalRules.ts';
import { loadNasaDataset, injectNasaDataset, loadGeologyDataset, injectGeologyDataset, loadFlightEngineerDataset, injectFlightEngineerDataset, loadMedicalDataset, injectMedicalDataset } from './game/nasaDatasetAdapter.ts';
import { GameSimulationState, GameLevel, CrewTask, GearLoadout } from './types/game.ts';
import { TitleScreen } from './components/HUD/TitleScreen.tsx';
import { VisorHUD } from './components/HUD/VisorHUD.tsx';
import { AstronautModal } from './components/HUD/AstronautModal.tsx';
import { StatusModals } from './components/HUD/StatusModals.tsx';
import { GearSelectorModal } from './components/HUD/GearSelectorModal.tsx';
import { FlightManualModal } from './components/HUD/FlightManualModal.tsx';
import { spatialAudio } from './audio/SpatialAudioManager.ts';
import { ScreenType, RouteState, ROUTE_HASH_MAP, getHashForRoute } from './types/screens.ts';
import { getProfile, saveProfile, claimDailyGift, OrbyProfile } from './game/profileStore.ts';
import { LandingScreen } from './components/screens/LandingScreen.tsx';
import { MenuScreen } from './components/screens/MenuScreen.tsx';
import { EnterNameScreen } from './components/screens/EnterNameScreen.tsx';
import { SolarSystemOverlay } from './components/screens/SolarSystemOverlay.tsx';
import { BriefingScreen } from './components/screens/BriefingScreen.tsx';
import { CrewRosterModal } from './components/common/CrewRosterModal.tsx';
import { SignInProfileModal } from './components/common/SignInProfileModal.tsx';
import { Toast } from './components/common/Toast.tsx';
import { HangarOverlay } from './components/screens/HangarOverlay.tsx';
import { LaunchPadOverlay } from './components/screens/LaunchPadOverlay.tsx';

function parseRouteFromHash(): RouteState {
  const hash = window.location.hash || '#/landing';
  if (ROUTE_HASH_MAP[hash]) {
    return ROUTE_HASH_MAP[hash];
  }
  if (hash.startsWith('#/briefing/')) {
    const step = parseInt(hash.replace('#/briefing/', ''), 10) || 1;
    return { screen: 'BRIEFING', briefingStep: Math.min(4, Math.max(1, step)) };
  }
  return { screen: 'LANDING' };
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Player Profile from localStorage
  const [profile, setProfile] = useState<OrbyProfile>(() => getProfile());

  // Screen State Machine & Hash Router
  const [routeState, setRouteState] = useState<RouteState>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return { screen: 'LUNAR_OUTPOST' };
    }
    return parseRouteFromHash();
  });

  // Core Simulation State
  const [gameState, setGameState] = useState<GameSimulationState>(() => {
    const initialCallsign = getProfile().callsign || 'VALKYRIE-1';
    const state = createInitialGameState(initialCallsign);
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      state.mode = 'playing';
      state.level = 'LEVEL_LUNAR_SURFACE';
    }
    return state;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCrewRosterOpen, setIsCrewRosterOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const navigateTo = useCallback((newRoute: RouteState) => {
    const targetHash = getHashForRoute(newRoute);
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    setRouteState(newRoute);
    if (newRoute.screen === 'HANGAR') {
      setGameState((prev) => ({ ...prev, selectedCrewId: null }));
      setModalCrewId(null);
    } else {
      setModalCrewId(null);
    }
  }, []);

  // Browser Back/Forward hash listener
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseRouteFromHash();
      setRouteState(parsed);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync initial hash if bare URL
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#/landing';
    }
  }, []);

  // Load NASA baseline dataset on startup (D-10: client-only, no /api routes).
  // Reads /data/nasa-baseline.json (from scripts/normalize-dataset.ts).
  // Updates Kilopower output + storm flux from real DONKI data.
  useEffect(() => {
    loadNasaDataset().then((dataset) => {
      setGameState((prev) => injectNasaDataset(prev, dataset));
    });
  }, []);

  // Load lunar geology dataset on startup (Dr. Rostova research data).
  // Reads /data/geology-baseline.json (from scripts/normalize-geology.ts).
  // Sets research yield multiplier (1.56×) + geological discovery schedule.
  useEffect(() => {
    loadGeologyDataset().then((geology) => {
      setGameState((prev) => injectGeologyDataset(prev, geology));
    });
  }, []);

  // Load flight engineer dataset on startup (Cmdr. Sarah Chen power_grid data).
  // Reads /data/powereng-baseline.json (from scripts/normalize-powereng.ts).
  // Sets solarArrayMaxKw (45 kW VSAT), SEP degradation rate, power discoveries.
  useEffect(() => {
    loadFlightEngineerDataset().then((data) => {
      setGameState((prev) => injectFlightEngineerDataset(prev, data));
    });
  }, []);

  // Load medical officer dataset on startup (Dr. Marcus Vance hydroponics data).
  // Reads /data/medical-baseline.json (from scripts/normalize-medical.ts).
  // Sets hydroponicsYieldKgPer28Days (OSD-655), moraleBoostFromHydroponics, medical discoveries.
  useEffect(() => {
    loadMedicalDataset().then((data) => {
      setGameState((prev) => injectMedicalDataset(prev, data));
    });
  }, []);

  // Synchronize 3D level when routeState updates
  useEffect(() => {
    if (!engineRef.current) return;
    if (routeState.screen === 'HANGAR') {
      if (gameState.level !== 'LEVEL_HANGAR') {
        engineRef.current.setLevel('LEVEL_HANGAR');
        setGameState((prev) => ({ ...prev, level: 'LEVEL_HANGAR', mode: 'playing' }));
      }
    } else if (routeState.screen === 'LAUNCH_PAD') {
      if (gameState.level !== 'LEVEL_LAUNCH_PAD') {
        engineRef.current.setLevel('LEVEL_LAUNCH_PAD');
        setGameState((prev) => ({ ...prev, level: 'LEVEL_LAUNCH_PAD', mode: 'playing' }));
      }
    } else if (routeState.screen === 'LUNAR_OUTPOST') {
      if (gameState.level !== 'LEVEL_LUNAR_SURFACE') {
        engineRef.current.setLevel('LEVEL_LUNAR_SURFACE');
        setGameState((prev) => ({ ...prev, level: 'LEVEL_LUNAR_SURFACE', mode: 'playing' }));
      }
    } else if (routeState.screen === 'BRIEFING') {
      if (gameState.level !== 'LEVEL_ORRERY') {
        engineRef.current.setLevel('LEVEL_ORRERY');
        setGameState((prev) => ({ ...prev, level: 'LEVEL_ORRERY', mode: 'playing' }));
      }
    }
  }, [routeState.screen, routeState.exploreMode, gameState.level]);

  const [isMuted, setIsMuted] = useState(false);
  const [modalCrewId, setModalCrewId] = useState<string | null>(null);
  const [isGearOpen, setIsGearOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedCelestialTarget, setSelectedCelestialTarget] = useState<string>('System View');

  // Mutable state ref for 60fps game loop
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const routeRef = useRef(routeState);
  routeRef.current = routeState;

  // Sync document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = gameState.mode;
  }, [gameState.mode]);

  // Periodic spacesuit breathing ambient trigger
  useEffect(() => {
    if (gameState.mode !== 'playing') return;
    const interval = setInterval(() => {
      spatialAudio.triggerBreathingCycle();
    }, 12000);
    return () => clearInterval(interval);
  }, [gameState.mode]);

  // Continuous 10-minute mission clock (Decision D-04)
  // 600s real time at 1x for 90 days (2,160 hours).
  // 90 days / 600s = 0.15 game days per real second at 1x.
  useEffect(() => {
    if (gameState.mode !== 'playing' || gameState.isPaused) return;

    const intervalMs = 100;
    const dtRealSec = intervalMs / 1000;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.mode !== 'playing' || prev.isPaused) return prev;
        const speed = prev.clockSpeed || 1.0;
        const deltaDays = 0.15 * dtRealSec * speed;
        return tickSimulation(prev, deltaDays);
      });
    }, intervalMs);

    return () => clearInterval(interval);
    // Note: clockSpeed intentionally NOT in deps — speed is read from prev.clockSpeed inside the
    // callback (always fresh), so the interval doesn't need to restart on speed changes. Including
    // it caused a race: when the win condition reset clockSpeed to 1, the effect would re-create
    // the interval before React committed mode='gameover', allowing an extra tick past Day 90.
  }, [gameState.mode, gameState.isPaused]);

  // Mount 3D WebGL Canvas once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, stateRef.current);
    engineRef.current = engine;

    // Apply level matching routeState on mount
    if (routeState.screen === 'BRIEFING') {
      engine.setLevel('LEVEL_ORRERY');
    } else if (routeState.screen === 'HANGAR') {
      engine.setLevel('LEVEL_HANGAR');
    } else if (routeState.screen === 'LAUNCH_PAD') {
      engine.setLevel('LEVEL_LAUNCH_PAD');
    } else if (routeState.screen === 'LUNAR_OUTPOST') {
      engine.setLevel('LEVEL_LUNAR_SURFACE');
    }

    // Interactive Callbacks from 3D Viewport
    engine.onSelectCrew = (crewId: string) => {
      setGameState((prev) => ({ ...prev, selectedCrewId: crewId }));
      engine.focusAstronaut(crewId);
      if (routeRef.current.screen === 'HANGAR') {
        // In Hangar screen, selecting an astronaut displays the compact Photo 1 card first
        setModalCrewId(null);
      } else {
        setModalCrewId(crewId);
      }
    };

    engine.onSelectCelestialTarget = (targetName: string) => {
      setSelectedCelestialTarget(targetName);
    };

    engine.onEngageMission = () => {
      spatialAudio.playUiClick(1200);
      engine.setLevel('LEVEL_LAUNCH_PAD');
      setGameState((prev) => ({ ...prev, level: 'LEVEL_LAUNCH_PAD', mode: 'playing' }));
      navigateTo({ screen: 'LAUNCH_PAD' });
    };

    engine.onDestinationSelect = (destName: string) => {
      // Transitioning via hyperspace to Artemis Launch Pad
      setTimeout(() => {
        engine.setLevel('LEVEL_LAUNCH_PAD');
        setGameState((prev) => ({ ...prev, level: 'LEVEL_LAUNCH_PAD' }));
        navigateTo({ screen: 'LAUNCH_PAD' });
      }, 1800);
    };

    let animationFrameId = 0;

    const renderLoop = () => {
      if (engineRef.current) {
        engineRef.current.render(stateRef.current, (nextLevel) => {
          engineRef.current?.setLevel(nextLevel);
          setGameState((prev) => ({ ...prev, level: nextLevel }));
          if (nextLevel === 'LEVEL_LUNAR_SURFACE') {
            navigateTo({ screen: 'LUNAR_OUTPOST' });
          } else if (nextLevel === 'LEVEL_LAUNCH_PAD') {
            navigateTo({ screen: 'LAUNCH_PAD' });
          }
        });
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field (like callsign)
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.key === 'Escape') {
        if (isGearOpen) {
          setIsGearOpen(false);
          return;
        }
        if (isManualOpen) {
          setIsManualOpen(false);
          return;
        }
        if (modalCrewId) {
          setModalCrewId(null);
          return;
        }
        if (stateRef.current.mode === 'playing') {
          setGameState((prev) => ({ ...prev, mode: 'paused' }));
        } else if (stateRef.current.mode === 'paused') {
          setGameState((prev) => ({ ...prev, mode: 'playing' }));
        }
      } else if (e.key.toLowerCase() === 'p') {
        setGameState((prev) => {
          const willPause = !(prev.isPaused || prev.mode === 'paused');
          return {
            ...prev,
            isPaused: willPause,
            mode: willPause ? 'paused' : 'playing',
          };
        });
      } else if (e.key.toLowerCase() === 'g') {
        setIsGearOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v') {
        // Quick Victory story walkthrough shortcut
        setGameState((prev) => tickSimulation(prev, 90));
      } else if (e.key === '?' || (e.key === '/' && !e.shiftKey)) {
        setIsManualOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        const nextMute = spatialAudio.toggleMute();
        setIsMuted(nextMute);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const levels: GameLevel[] = [
          'LEVEL_HANGAR',
          'LEVEL_ORRERY',
          'LEVEL_LAUNCH_PAD',
          'LEVEL_LUNAR_SURFACE',
          'LEVEL_HAB_INTERIOR',
        ];
        const targetLvl = levels[parseInt(e.key, 10) - 1];
        if (targetLvl && engineRef.current) {
          engineRef.current.setLevel(targetLvl);
          setGameState((prev) => ({ ...prev, level: targetLvl }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGearOpen, isManualOpen, modalCrewId]);

  // Action Handlers
  const handleStartGame = useCallback(() => {
    spatialAudio.playUiClick(900);
    setGameState((prev) => ({
      ...prev,
      mode: 'playing',
      level: 'LEVEL_HANGAR',
    }));
    engineRef.current?.setLevel('LEVEL_HANGAR');
  }, []);

  const handleAdvanceDay = useCallback((days: number) => {
    setGameState((prev) => tickSimulation(prev, days));
  }, []);

  const handleSetLevel = useCallback((lvl: GameLevel) => {
    engineRef.current?.setLevel(lvl);
    setGameState((prev) => ({ ...prev, level: lvl }));
  }, []);

  const handleSelectCrew = useCallback((crewId: string | null) => {
    setGameState((prev) => ({ ...prev, selectedCrewId: crewId || null }));
    if (crewId) {
      engineRef.current?.focusAstronaut(crewId);
    }
    if (routeRef.current.screen === 'HANGAR') {
      setModalCrewId(null);
    } else {
      setModalCrewId(crewId);
    }
  }, []);

  const handleAssignTask = useCallback((crewId: string, task: CrewTask) => {
    setGameState((prev) => assignCrewTask(prev, crewId, task));
  }, []);

  const handleCompleteTask = useCallback((crewId: string) => {
    setGameState((prev) => completeCrewTask(prev, crewId));
  }, []);

  const handleShelterAll = useCallback(() => {
    spatialAudio.playAlarmKlaxon();
    setGameState((prev) => orderAllToShelter(prev));
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => {
      const willPause = !(prev.isPaused || prev.mode === 'paused');
      return {
        ...prev,
        isPaused: willPause,
        mode: willPause ? 'paused' : 'playing',
      };
    });
  }, []);

  const handleSetClockSpeed = useCallback((speed: number) => {
    spatialAudio.playUiClick();
    setGameState((prev) => ({ ...prev, clockSpeed: speed }));
  }, []);

  const handleResolveCrisis = useCallback((_optionId?: string) => {
    spatialAudio.playUiClick(1100);
    setGameState((prev) => {
      if (!prev.activeCrisis) return prev;
      return {
        ...prev,
        activeCrisis: { ...prev.activeCrisis, resolved: true },
        isPaused: false,
        mode: 'playing',
      };
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMute = spatialAudio.toggleMute();
    setIsMuted(nextMute);
  }, []);

  const handlePanCamera = useCallback((direction: 'left' | 'right' | 'up' | 'down' | 'zoom_in' | 'zoom_out' | 'reset') => {
    engineRef.current?.panCameraDirection(direction);
  }, []);

  const handleNameConfirmed = useCallback((newCallsign: string) => {
    const updated = saveProfile({ callsign: newCallsign });
    setProfile(updated);
    setGameState((prev) => ({
      ...prev,
      callsign: newCallsign,
      mode: 'playing',
      level: 'LEVEL_ORRERY',
    }));
    engineRef.current?.setLevel('LEVEL_ORRERY');
    navigateTo({ screen: 'BRIEFING', briefingStep: 1 });
  }, [navigateTo]);

  const handleClaimGift = useCallback(() => {
    const res = claimDailyGift();
    setProfile(getProfile());
    setToastMessage(res.message);
  }, []);

  const handleRestart = useCallback(() => {
    const newState = createInitialGameState(stateRef.current.callsign);
    newState.mode = 'playing';
    newState.level = 'LEVEL_LUNAR_SURFACE';
    engineRef.current?.setLevel('LEVEL_LUNAR_SURFACE');
    setGameState(newState);
    setModalCrewId(null);
    navigateTo({ screen: 'LUNAR_OUTPOST' });
  }, [navigateTo]);

  const handleRestartToLanding = useCallback(() => {
    spatialAudio.playUiClick(700);
    const initialCallsign = getProfile().callsign || 'VALKYRIE-1';
    const newState = createInitialGameState(initialCallsign);
    newState.mode = 'title';
    newState.level = 'LEVEL_HANGAR';
    engineRef.current?.setLevel('LEVEL_HANGAR');
    setGameState(newState);
    setModalCrewId(null);
    setIsGearOpen(false);
    setIsManualOpen(false);
    navigateTo({ screen: 'LANDING' });
  }, [navigateTo]);

  const handleReturnToTitle = useCallback(() => {
    setGameState((prev) => ({ ...prev, mode: 'title', level: 'LEVEL_HANGAR' }));
    engineRef.current?.setLevel('LEVEL_HANGAR');
    setModalCrewId(null);
    navigateTo({ screen: 'MENU' });
  }, [navigateTo]);

  const selectedCrewObj = gameState.crew.find((c) => c.id === modalCrewId) || null;
  const isPreMission2D = ['LANDING', 'MENU', 'ENTER_NAME'].includes(routeState.screen);

  return (
    <div data-screen={routeState.screen} className="relative w-screen overflow-hidden bg-black select-none" style={{ height: '100dvh' }}>
      {/* Portrait-mode guard — shown only on touch phones/tablets held vertically */}
      <div className="portrait-guard">
        <div className="portrait-guard__icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgb(34,211,238)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12" y2="18"/>
          </svg>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: 'rgb(34,211,238)', marginBottom: '8px' }}>
            ROTATE DEVICE
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(241,245,249,0.7)', maxWidth: '220px', lineHeight: 1.5 }}>
            ORBY works best in horizontal mode. Turn your device sideways!
          </p>
        </div>
      </div>
      {/* Isolated WebGL Canvas Container */}
      <div
        ref={mountRef}
        data-testid="webgl-canvas-mount"
        className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing ${isPreMission2D ? 'hidden' : ''}`}
      />

      {/* Screen 1: ORBY Landing Page */}
      {routeState.screen === 'LANDING' && (
        <LandingScreen
          onGetStarted={() => {
            spatialAudio.unlockAudio();
            // Request landscape lock on devices that support it (iOS Safari ignores gracefully)
            try { screen.orientation?.lock('landscape').catch(() => {}); } catch (_) {}
            navigateTo({ screen: 'MENU' });
          }}
          onNavigateToMissions={() => {
            spatialAudio.unlockAudio();
            navigateTo({ screen: 'MENU' });
          }}
          onOpenLeaderboard={() => {
            setToastMessage('Leaderboard: Season 01 rankings live! Survive 90 days to rank.');
          }}
          onOpenCrewRoster={() => setIsCrewRosterOpen(true)}
          onOpenSignIn={() => setIsSignInOpen(true)}
        />
      )}

      {/* Screen 2: ORBY Launch Mission Menu */}
      {routeState.screen === 'MENU' && (
        <MenuScreen
          profile={profile}
          onGameStart={() => {
            setModalCrewId(null);
            navigateTo({ screen: 'ENTER_NAME' });
          }}
          onPractice={() => {
            setToastMessage('Practice Mode: 10-Day Guided Flight Protocol loading...');
            handleStartGame();
          }}
          onSolarSystem={() => {
            spatialAudio.unlockAudio();
            setSelectedCelestialTarget('System View');
            engineRef.current?.setLevel('LEVEL_ORRERY');
            engineRef.current?.setOrreryTarget('System View');
            setGameState((prev) => ({ ...prev, level: 'LEVEL_ORRERY', mode: 'playing' }));
            navigateTo({ screen: 'BRIEFING', exploreMode: true });
          }}
          onCompete={() => {
            setToastMessage('Compete Mode: Ranked Artemis-III mission coming in Season 02!');
          }}
          onClaimGift={handleClaimGift}
          onBackToLanding={() => navigateTo({ screen: 'LANDING' })}
        />
      )}

      {/* Screen 3: ORBY Enter Name */}
      {routeState.screen === 'ENTER_NAME' && (
        <EnterNameScreen
          profile={profile}
          onStart={handleNameConfirmed}
          onBack={() => navigateTo({ screen: 'MENU' })}
          onClaimGift={handleClaimGift}
          onOpenKey={() => setToastMessage('Unlockables & Badges: Coming in Season 02!')}
          onOpenTrophy={() => setToastMessage('Commander Leaderboard: Complete a mission to rank!')}
        />
      )}

      {/* Screen 4: 3D Solar System (Orrery) with Briefing or Explore Overlay */}
      {routeState.screen === 'BRIEFING' && (
        <>
          {routeState.exploreMode ? (
            <SolarSystemOverlay
              selectedTargetName={selectedCelestialTarget}
              onBackToLanding={() => navigateTo({ screen: 'MENU' })}
              onSelectTarget={(target) => {
                setSelectedCelestialTarget(target);
                engineRef.current?.setOrreryTarget(target);
              }}
              onSelectSpeed={(spd) => engineRef.current?.setOrrerySpeed(spd)}
              onToggleMute={handleToggleMute}
              onProceedToHangar={() => {
                spatialAudio.playUiClick(1100);
                engineRef.current?.setLevel('LEVEL_HANGAR');
                setGameState((prev) => ({ ...prev, level: 'LEVEL_HANGAR', mode: 'playing' }));
                navigateTo({ screen: 'HANGAR' });
              }}
              onEstablishOutpost={(dest) => {
                spatialAudio.playUiClick(1100);
                setToastMessage(`Destination locked: Artemis Outpost (${dest}). Entering Hyperspace...`);
                engineRef.current?.orreryScene.triggerHyperspace();
                setTimeout(() => {
                  engineRef.current?.setLevel('LEVEL_LAUNCH_PAD');
                  setGameState((prev) => ({ ...prev, level: 'LEVEL_LAUNCH_PAD' }));
                  navigateTo({ screen: 'LAUNCH_PAD' });
                }, 1500);
              }}
              isMuted={isMuted}
            />
          ) : (
            <BriefingScreen
              currentStep={routeState.briefingStep || 1}
              onNext={() => {
                const cur = routeState.briefingStep || 1;
                if (cur < 4) {
                  navigateTo({ screen: 'BRIEFING', briefingStep: cur + 1 });
                } else {
                  spatialAudio.playUiClick(1100);
                  engineRef.current?.setLevel('LEVEL_HANGAR');
                  setGameState((prev) => ({ ...prev, level: 'LEVEL_HANGAR', mode: 'playing' }));
                  navigateTo({ screen: 'HANGAR' });
                }
              }}
              onBack={() => {
                const cur = routeState.briefingStep || 1;
                if (cur > 1) {
                  navigateTo({ screen: 'BRIEFING', briefingStep: cur - 1 });
                } else {
                  navigateTo({ screen: 'ENTER_NAME' });
                }
              }}
              onJumpToStep={(step) => navigateTo({ screen: 'BRIEFING', briefingStep: step })}
              onBackToLanding={handleRestartToLanding}
            />
          )}
        </>
      )}

      {/* Screen 5: 3D Pre-Flight Hangar Bay Overlay */}
      {routeState.screen === 'HANGAR' && (
        <HangarOverlay
          crew={gameState.crew}
          selectedCrewId={gameState.selectedCrewId || null}
          callsign={gameState.callsign}
          onSelectCrew={handleSelectCrew}
          onOpenCrewDetails={(crewId) => {
            spatialAudio.playUiClick(1000);
            setModalCrewId(crewId);
          }}
          onEngageMission={() => {
            spatialAudio.playUiClick(1200);
            engineRef.current?.setLevel('LEVEL_LAUNCH_PAD');
            setGameState((prev) => ({ ...prev, level: 'LEVEL_LAUNCH_PAD', mode: 'playing' }));
            navigateTo({ screen: 'LAUNCH_PAD' });
          }}
          onBackToBriefing={() => navigateTo({ screen: 'BRIEFING', briefingStep: 4 })}
          onRestartToLanding={handleRestartToLanding}
        />
      )}

      {/* Screen 6: 3D Artemis Launch Pad Sequence Overlay */}
      {routeState.screen === 'LAUNCH_PAD' && (
        <LaunchPadOverlay
          onSkipToOutpost={() => {
            spatialAudio.playUiClick(1100);
            engineRef.current?.setLevel('LEVEL_LUNAR_SURFACE');
            setGameState((prev) => ({ ...prev, level: 'LEVEL_LUNAR_SURFACE', mode: 'playing' }));
            navigateTo({ screen: 'LUNAR_OUTPOST' });
          }}
          onRestartToLanding={handleRestartToLanding}
        />
      )}

      {/* Screen 7: In-Game Visor HUD (Active when on Lunar Outpost or Hab) */}
      {!isPreMission2D &&
        routeState.screen !== 'BRIEFING' &&
        routeState.screen !== 'HANGAR' &&
        routeState.screen !== 'LAUNCH_PAD' &&
        (gameState.mode === 'playing' || gameState.mode === 'paused') && (
          <VisorHUD
            gameState={gameState}
            onAdvanceDay={handleAdvanceDay}
            onSetLevel={handleSetLevel}
            onSelectCrew={handleSelectCrew}
            onAssignTask={handleAssignTask}
            onCompleteTask={handleCompleteTask}
            onShelterAll={handleShelterAll}
            onTogglePause={handleTogglePause}
            onSetSpeed={handleSetClockSpeed}
            onResolveCrisis={handleResolveCrisis}
            onToggleMute={handleToggleMute}
            onPanCamera={handlePanCamera}
            onOpenGearModal={() => setIsGearOpen(true)}
            onOpenManualModal={() => setIsManualOpen(true)}
            onRestartToLanding={handleRestartToLanding}
            isMuted={isMuted}
          />
        )}

      {/* Astronaut Dossier Modal (Only during active gameplay or Hangar inspection) */}
      {modalCrewId && selectedCrewObj && ['HANGAR', 'LUNAR_OUTPOST', 'HAB_COMMAND'].includes(routeState.screen) && (
        <AstronautModal
          crew={selectedCrewObj}
          onClose={() => setModalCrewId(null)}
          onAssignTask={(task) => handleAssignTask(selectedCrewObj.id, task)}
        />
      )}

      {/* Crew Roster Modal (From Landing "• Crew") */}
      {isCrewRosterOpen && (
        <CrewRosterModal onClose={() => setIsCrewRosterOpen(false)} />
      )}

      {/* Sign In Profile Modal (From Landing "Sign In") */}
      {isSignInOpen && (
        <SignInProfileModal
          profile={profile}
          onUpdateProfile={setProfile}
          onClose={() => setIsSignInOpen(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Gear & Loadout Picker Modal */}
      {isGearOpen && (
        <GearSelectorModal
          currentLoadout={gameState.gearLoadout}
          onClose={() => setIsGearOpen(false)}
          onConfirmLoadout={(newLoadout: GearLoadout) => {
            setGameState((prev) => setGearLoadout(prev, newLoadout));
            setIsGearOpen(false);
          }}
        />
      )}

      {/* Flight Manual & Step-by-Step Guide Modal */}
      {isManualOpen && (
        <FlightManualModal
          onClose={() => setIsManualOpen(false)}
          onOpenGearModal={() => {
            setIsManualOpen(false);
            setIsGearOpen(true);
          }}
        />
      )}

      {/* Outcome-Matched Status Modals (Pause, Victory Storytelling, Defeat) */}
      <StatusModals
        gameState={gameState}
        onResume={() => setGameState((prev) => ({ ...prev, mode: 'playing' }))}
        onRestart={handleRestart}
        onReturnToTitle={handleReturnToTitle}
        onRestartToLanding={handleRestartToLanding}
        onSetLevel={handleSetLevel}
      />
    </div>
  );
}
