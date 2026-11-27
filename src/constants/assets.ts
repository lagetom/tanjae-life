import type { SeoldamMood } from '../types/saju';

export const SEOLDAM_ASSETS = {
  heroPortrait: '/src/assets/images/seoldam_reaper_hero_1795739833734.jpg',
  notes: {
    calm: '/src/assets/images/seoldam_reaper_slim_calm_1795740530242.jpg',
    keen: '/src/assets/images/seoldam_reaper_slim_keen_1795740530381.jpg',
    warm: '/src/assets/images/seoldam_reaper_openfan_warm_1795783311811.jpg',
  } satisfies Record<SeoldamMood, string>,
} as const;
