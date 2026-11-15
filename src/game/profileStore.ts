/**
 * Project Artemis / ORBY: Local Player Profile & Progress Store
 * Uses localStorage with safe fallback handling.
 */

export interface OrbyProfile {
  callsign: string;
  credits: number;
  streak: number;
  stars: number;
  readiness: number; // 0 - 100%
  bestScore: number;
  completedMissions: number;
  lastDailyGiftTimestamp: number | null;
}

const STORAGE_KEY = 'orby.profile.v1';

const DEFAULT_PROFILE: OrbyProfile = {
  callsign: 'VALKYRIE-1',
  credits: 3,
  streak: 3,
  stars: 3,
  readiness: 72,
  bestScore: 14850,
  completedMissions: 2,
  lastDailyGiftTimestamp: null,
};

let inMemoryProfile: OrbyProfile = { ...DEFAULT_PROFILE };

export function getProfile(): OrbyProfile {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...inMemoryProfile };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
      };
    } catch {
      return { ...inMemoryProfile };
    }
  }
  return { ...inMemoryProfile };
}

export function saveProfile(profile: Partial<OrbyProfile>): OrbyProfile {
  const current = getProfile();
  const updated: OrbyProfile = {
    ...current,
    ...profile,
  };
  inMemoryProfile = { ...updated };
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  }
  return updated;
}

export function claimDailyGift(): { success: boolean; newCredits: number; message: string } {
  const profile = getProfile();
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  if (profile.lastDailyGiftTimestamp && now - profile.lastDailyGiftTimestamp < ONE_DAY_MS) {
    const remainingHours = Math.ceil(
      (ONE_DAY_MS - (now - profile.lastDailyGiftTimestamp)) / (1000 * 60 * 60)
    );
    return {
      success: false,
      newCredits: profile.credits,
      message: `Daily gift already claimed! Next gift in ${remainingHours}h.`,
    };
  }

  const bonus = 2;
  const updatedCredits = profile.credits + bonus;
  saveProfile({
    credits: updatedCredits,
    lastDailyGiftTimestamp: now,
  });

  return {
    success: true,
    newCredits: updatedCredits,
    message: `Daily Gift Claimed! +${bonus} Credits added to your balance.`,
  };
}
