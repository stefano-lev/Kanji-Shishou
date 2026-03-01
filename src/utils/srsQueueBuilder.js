import { kanjiByLevel } from '../data/kanjiData';
import { loadSRS } from './srsHandler';
import { loadSRSConfig } from './srsPreferences';

export const getAvailableNewCards = () => {
  const srs = loadSRS();
  const config = loadSRSConfig();

  if (!config || !config.unlockedLevels) {
    return [];
  }

  const unlocked = config.unlockedLevels;

  const allUnlockedKanji = unlocked.flatMap((lvl) => kanjiByLevel[lvl] || []);

  return allUnlockedKanji.filter((k) => !srs[k.uid]).map((k) => k.uid);
};
