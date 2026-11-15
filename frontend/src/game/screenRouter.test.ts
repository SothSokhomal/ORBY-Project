import test from 'node:test';
import assert from 'node:assert/strict';
import { getHashForRoute, ROUTE_HASH_MAP } from '../types/screens.ts';
import { getProfile, saveProfile, claimDailyGift } from './profileStore.ts';

test('getHashForRoute generates correct hash routes', () => {
  assert.equal(getHashForRoute({ screen: 'LANDING' }), '#/landing');
  assert.equal(getHashForRoute({ screen: 'MENU' }), '#/menu');
  assert.equal(getHashForRoute({ screen: 'ENTER_NAME' }), '#/name');
  assert.equal(getHashForRoute({ screen: 'BRIEFING', briefingStep: 1 }), '#/briefing/1');
  assert.equal(getHashForRoute({ screen: 'BRIEFING', briefingStep: 3 }), '#/briefing/3');
  assert.equal(getHashForRoute({ screen: 'BRIEFING', exploreMode: true }), '#/explore');
  assert.equal(getHashForRoute({ screen: 'GEAR' }), '#/gear');
  assert.equal(getHashForRoute({ screen: 'HANGAR' }), '#/hangar');
  assert.equal(getHashForRoute({ screen: 'LUNAR_OUTPOST' }), '#/outpost');
});

test('ROUTE_HASH_MAP maps hash routes to correct states', () => {
  assert.equal(ROUTE_HASH_MAP['#/landing'].screen, 'LANDING');
  assert.equal(ROUTE_HASH_MAP['#/menu'].screen, 'MENU');
  assert.equal(ROUTE_HASH_MAP['#/name'].screen, 'ENTER_NAME');
  assert.equal(ROUTE_HASH_MAP['#/briefing/2'].screen, 'BRIEFING');
  assert.equal(ROUTE_HASH_MAP['#/briefing/2'].briefingStep, 2);
  assert.equal(ROUTE_HASH_MAP['#/gear'].screen, 'GEAR');
});

test('profileStore fallback handles empty storage and updates gracefully', () => {
  const profile = getProfile();
  assert.ok(profile.credits >= 3);
  assert.ok(profile.streak >= 3);
  assert.ok(profile.stars >= 3);
  assert.ok(profile.readiness >= 50);

  const updated = saveProfile({ callsign: 'ORBY-TESTER' });
  assert.equal(updated.callsign, 'ORBY-TESTER');
});

test('claimDailyGift enforces rate limits and increments credits', () => {
  const initial = getProfile();
  const giftResult = claimDailyGift();
  assert.ok(giftResult.newCredits >= initial.credits);

  // Subsequent claim within 24h should return rate-limit notice
  const secondAttempt = claimDailyGift();
  assert.equal(secondAttempt.success, false);
});
