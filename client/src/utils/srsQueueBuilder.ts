import { kanjiByLevel } from '@data/kanjiData';

import { loadSRS } from './srsHandler';
import { loadSRSConfig, saveSRSConfig } from './srsPreferences';

import type { JLPTLevel } from '@/types';

const LEVEL_ORDER: JLPTLevel[] = ['5', '4', '3', '2', '1'];

export const getAvailableNewCards = (): string[] => {
  const srs = loadSRS();
  const config = loadSRSConfig();

  if (!config || !config.unlockedLevels) {
    return [];
  }

  let unlocked = [...config.unlockedLevels];

  const highestUnlocked = unlocked[unlocked.length - 1] ?? '5';
  const levelIndex = LEVEL_ORDER.indexOf(highestUnlocked);

  if (levelIndex < LEVEL_ORDER.length - 1) {
    const currentLevelKanji = kanjiByLevel[highestUnlocked] ?? [];

    const introducedCount = currentLevelKanji.filter((k) => srs[k.uid]).length;

    if (introducedCount >= currentLevelKanji.length) {
      const nextLevel = LEVEL_ORDER[levelIndex + 1];

      unlocked.push(nextLevel);

      const updatedConfig = {
        ...config,
        unlockedLevels: unlocked,
      };

      saveSRSConfig(updatedConfig);
    }
  }

  const allUnlockedKanji = unlocked.flatMap((lvl) => kanjiByLevel[lvl] || []);

  return allUnlockedKanji.filter((k) => !srs[k.uid]).map((k) => k.uid);
};
