/**
 * Project Artemis / ORBY: Screen State Machine & Route Types
 */

export type ScreenType =
  | 'LANDING'
  | 'MENU'
  | 'ENTER_NAME'
  | 'BRIEFING'
  | 'GEAR'
  | 'HANGAR'
  | 'DESTINATION'
  | 'LAUNCH_PAD'
  | 'LUNAR_OUTPOST'
  | 'HAB_COMMAND'
  | 'RESULT'
  | 'LEADERBOARD'
  | 'PRACTICE'
  | 'COMPETE';

export interface RouteState {
  screen: ScreenType;
  briefingStep?: number; // 1 | 2 | 3 | 4
  exploreMode?: boolean;
}

export const ROUTE_HASH_MAP: Record<string, RouteState> = {
  '#/landing': { screen: 'LANDING' },
  '#/menu': { screen: 'MENU' },
  '#/name': { screen: 'ENTER_NAME' },
  '#/briefing': { screen: 'BRIEFING', briefingStep: 1 },
  '#/briefing/1': { screen: 'BRIEFING', briefingStep: 1 },
  '#/briefing/2': { screen: 'BRIEFING', briefingStep: 2 },
  '#/briefing/3': { screen: 'BRIEFING', briefingStep: 3 },
  '#/briefing/4': { screen: 'BRIEFING', briefingStep: 4 },
  '#/gear': { screen: 'GEAR' },
  '#/hangar': { screen: 'HANGAR' },
  '#/destination': { screen: 'DESTINATION' },
  '#/launch': { screen: 'LAUNCH_PAD' },
  '#/outpost': { screen: 'LUNAR_OUTPOST' },
  '#/hab': { screen: 'HAB_COMMAND' },
  '#/result': { screen: 'RESULT' },
  '#/leaderboard': { screen: 'LEADERBOARD' },
  '#/explore': { screen: 'BRIEFING', exploreMode: true },
  '#/solar-system': { screen: 'BRIEFING', exploreMode: true },
  '#/orrery': { screen: 'BRIEFING', exploreMode: true },
  '#/practice': { screen: 'PRACTICE' },
  '#/compete': { screen: 'COMPETE' },
};

export function getHashForRoute(state: RouteState): string {
  switch (state.screen) {
    case 'LANDING':
      return '#/landing';
    case 'MENU':
      return '#/menu';
    case 'ENTER_NAME':
      return '#/name';
    case 'BRIEFING':
      return state.exploreMode ? '#/explore' : `#/briefing/${state.briefingStep || 1}`;
    case 'GEAR':
      return '#/gear';
    case 'HANGAR':
      return '#/hangar';
    case 'DESTINATION':
      return '#/destination';
    case 'LAUNCH_PAD':
      return '#/launch';
    case 'LUNAR_OUTPOST':
      return '#/outpost';
    case 'HAB_COMMAND':
      return '#/hab';
    case 'RESULT':
      return '#/result';
    case 'LEADERBOARD':
      return '#/leaderboard';
    case 'PRACTICE':
      return '#/practice';
    case 'COMPETE':
      return '#/compete';
    default:
      return '#/landing';
  }
}
