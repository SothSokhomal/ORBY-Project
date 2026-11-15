/**
 * Project Artemis: Outcome-Matched Status Modals
 * Pause, Victory (90-Day Completion), and Defeat modals per game craft guidelines.
 */

import React, { useState } from 'react';
import { Play, RotateCcw, Home, Pause } from 'lucide-react';
import { GameSimulationState, GameLevel } from '../../types/game.ts';
import { spatialAudio } from '../../audio/SpatialAudioManager.ts';
import { VictoryStoryModal } from './VictoryStoryModal.tsx';
import { MissionOutcomeDashboard } from './MissionOutcomeDashboard.tsx';

interface StatusModalsProps {
  gameState: GameSimulationState;
  onResume: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
  onRestartToLanding?: () => void;
  onSetLevel?: (level: GameLevel) => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  gameState,
  onResume,
  onRestart,
  onReturnToTitle,
  onRestartToLanding,
  onSetLevel,
}) => {
  const [showStory, setShowStory] = useState(false);
  const { mode, missionOutcome, callsign } = gameState;

  if (mode === 'playing') return null;

  // ================= PAUSE MODAL =================
  if (mode === 'paused') {
    // If an active event card is handling the crisis, let the Event Card modal present choices
    if (gameState.activeCrisis && !gameState.activeCrisis.resolved) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 pointer-events-auto font-mono text-white overflow-y-auto">
        <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Pause className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight uppercase">MISSION PAUSED</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Callsign: {callsign} · Day {gameState.day} / 90
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                spatialAudio.playUiClick();
                onResume();
              }}
              className="w-full py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME FLIGHT</span>
            </button>

            <button
              onClick={() => {
                spatialAudio.playUiClick();
                onRestart();
              }}
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART SIMULATION</span>
            </button>

            {onRestartToLanding && (
              <button
                onClick={() => {
                  spatialAudio.playUiClick();
                  onRestartToLanding();
                }}
                className="w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Home className="w-4 h-4" />
                <span>RESTART TO LANDING PAGE</span>
              </button>
            )}

            <button
              onClick={() => {
                spatialAudio.playUiClick();
                onReturnToTitle();
              }}
              className="w-full py-2.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= GAME OVER: VICTORY or DEFEAT =================
  if (mode === 'gameover') {
    // Story overlay sits on top of the dashboard for VICTORY outcomes
    if (showStory && missionOutcome === 'VICTORY') {
      return (
        <VictoryStoryModal
          gameState={gameState}
          onRestart={onRestart}
          onRestartToLanding={onRestartToLanding}
          onSetLevel={onSetLevel}
        />
      );
    }

    return (
      <MissionOutcomeDashboard
        gameState={gameState}
        onRestart={onRestart}
        onReturnToTitle={onReturnToTitle}
        onRestartToLanding={onRestartToLanding}
        onViewStory={missionOutcome === 'VICTORY' ? () => setShowStory(true) : undefined}
      />
    );
  }

  return null;
};
