import { kanjiByLevel } from '@data/kanjiData';

import { clearAllUserData, importAllData } from '@utils/localStorageHandler';

import type {
  BackupData,
  DailyStats,
  JLPTLevel,
  Kanji,
  KanjiStats,
  SRSCard,
  SRSData,
} from '@/types';

const DEMO_MODE_KEY = 'kanji_shishou_demo_mode';
const DEMO_PROMPT_SEEN_KEY = 'kanji_shishou_demo_prompt_seen';

type DemoProfile = {
  level: JLPTLevel;
  studyRate: number;
  seenMin: number;
  seenMax: number;
  accuracyMean: number;
  accuracySpread: number;
};

const DEMO_PROFILES: DemoProfile[] = [
  {
    level: '5',
    studyRate: 0.92,
    seenMin: 10,
    seenMax: 42,
    accuracyMean: 0.9,
    accuracySpread: 0.08,
  },
  {
    level: '4',
    studyRate: 0.74,
    seenMin: 8,
    seenMax: 32,
    accuracyMean: 0.84,
    accuracySpread: 0.1,
  },
  {
    level: '3',
    studyRate: 0.48,
    seenMin: 5,
    seenMax: 24,
    accuracyMean: 0.77,
    accuracySpread: 0.12,
  },
  {
    level: '2',
    studyRate: 0.24,
    seenMin: 3,
    seenMax: 15,
    accuracyMean: 0.68,
    accuracySpread: 0.14,
  },
  {
    level: '1',
    studyRate: 0.1,
    seenMin: 1,
    seenMax: 9,
    accuracyMean: 0.58,
    accuracySpread: 0.16,
  },
];

const todayISO = () => new Date().toISOString().split('T')[0];

const daysAgoISO = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const createSeededRandom = (seed: number) => {
  let t = seed;

  return () => {
    t += 0x6d2b79f5;

    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);

    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (random: () => number, min: number, max: number) => {
  return Math.floor(random() * (max - min + 1)) + min;
};

const sampleArray = <T>(
  random: () => number,
  values: T[],
  count: number
): T[] => {
  const copy = [...values];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, count);
};

const getKanjiForLevel = (level: JLPTLevel): Kanji[] => {
  return kanjiByLevel[level] ?? [];
};

const createKanjiStat = (
  seen: number,
  accuracy: number,
  lastSeen: string,
  random: () => number
) => {
  const correct = Math.round(seen * accuracy);
  const incorrect = Math.max(0, seen - correct);

  const srsSeen = Math.max(1, Math.round(seen * (0.45 + random() * 0.35)));
  const srsCorrect = Math.round(srsSeen * clamp(accuracy - 0.03, 0.35, 0.98));
  const srsIncorrect = Math.max(0, srsSeen - srsCorrect);

  return {
    seen,
    correct,
    incorrect,
    lastSeen,
    srs: {
      seen: srsSeen,
      correct: srsCorrect,
      incorrect: srsIncorrect,
      lastSeen,
    },
  };
};

const createSRSCard = (
  accuracy: number,
  lastReviewed: string,
  random: () => number
): SRSCard => {
  const strongCard = accuracy >= 0.82;
  const weakCard = accuracy < 0.65;

  const phase = weakCard || random() < 0.22 ? 'learning' : 'review';

  if (phase === 'learning') {
    return {
      phase,
      step: randomInt(random, 0, 2),
      repetitions: randomInt(random, 0, 3),
      interval: 0,
      easeFactor: Number((2.1 + random() * 0.5).toFixed(2)),
      nextReview: daysAgoISO(random() < 0.35 ? 0 : -1),
      lastReviewed,
    };
  }

  const interval = strongCard
    ? randomInt(random, 7, 42)
    : randomInt(random, 2, 14);

  const dueOffset = random() < 0.28 ? randomInt(random, 0, 3) : -interval;

  return {
    phase,
    step: 0,
    repetitions: randomInt(random, 2, 12),
    interval,
    easeFactor: Number((2.2 + accuracy * 0.7 + random() * 0.25).toFixed(2)),
    nextReview: daysAgoISO(dueOffset),
    lastReviewed,
  };
};

const buildDemoStats = (random: () => number) => {
  const kanjiStats: KanjiStats = {};
  const kanjiSRS: SRSData = {};
  const studiedUids: string[] = [];

  DEMO_PROFILES.forEach((profile) => {
    const levelKanji = getKanjiForLevel(profile.level);

    levelKanji.forEach((kanji) => {
      if (random() > profile.studyRate) return;

      const seen = randomInt(random, profile.seenMin, profile.seenMax);

      const accuracy = clamp(
        profile.accuracyMean + (random() - 0.5) * 2 * profile.accuracySpread,
        0.35,
        0.98
      );

      const lastSeen = new Date(
        Date.now() - randomInt(random, 0, 35) * 24 * 60 * 60 * 1000
      ).toISOString();

      kanjiStats[kanji.uid] = createKanjiStat(seen, accuracy, lastSeen, random);

      studiedUids.push(kanji.uid);

      if (random() < 0.68) {
        kanjiSRS[kanji.uid] = createSRSCard(accuracy, lastSeen, random);
      }
    });
  });

  return {
    kanjiStats,
    kanjiSRS,
    studiedUids,
  };
};

const buildDemoDailyStats = (
  studiedUids: string[],
  random: () => number
): DailyStats => {
  const dailyStats: DailyStats = {};
  const daysToGenerate = 56;

  for (let daysAgo = daysToGenerate - 1; daysAgo >= 0; daysAgo--) {
    const isRecent = daysAgo < 14;
    const isWeekendLike = daysAgo % 7 === 0 || daysAgo % 7 === 6;

    const studyChance = isRecent ? 0.84 : isWeekendLike ? 0.52 : 0.68;

    if (random() > studyChance) continue;

    const date = daysAgoISO(daysAgo);

    const totalSeen = isRecent
      ? randomInt(random, 22, 76)
      : randomInt(random, 10, 52);

    const accuracy = clamp(0.78 + (random() - 0.5) * 0.2, 0.55, 0.94);
    const correct = Math.round(totalSeen * accuracy);
    const incorrect = totalSeen - correct;

    const uniqueCount = clamp(
      randomInt(random, Math.ceil(totalSeen / 6), Math.ceil(totalSeen / 2)),
      1,
      Math.min(studiedUids.length, 40)
    );

    dailyStats[date] = {
      uniqueKanji: sampleArray(random, studiedUids, uniqueCount),
      totalSeen,
      correct,
      incorrect,
      studyTimeSeconds: totalSeen * randomInt(random, 18, 45),
    };
  }

  const today = todayISO();

  if (!dailyStats[today]) {
    dailyStats[today] = {
      uniqueKanji: sampleArray(random, studiedUids, 14),
      totalSeen: 32,
      correct: 27,
      incorrect: 5,
      studyTimeSeconds: 32 * 28,
    };
  }

  return dailyStats;
};

export const createDemoBackupData = (): BackupData => {
  const random = createSeededRandom(20260617);

  const { kanjiStats, kanjiSRS, studiedUids } = buildDemoStats(random);
  const dailyStats = buildDemoDailyStats(studiedUids, random);

  const favorites = sampleArray(random, studiedUids, 12);

  return {
    kanjiStats,
    kanjiSRS,
    kanji_daily_stats: dailyStats,
    kanji_srs_daily_progress: {
      date: todayISO(),
      newStudied: 7,
      reviewsStudied: 26,
    },
    favorites,
  };
};

export const hasMeaningfulUserData = () => {
  const keysToCheck = [
    'kanjiStats',
    'kanjiSRS',
    'kanji_daily_stats',
    'favorites',
  ];

  return keysToCheck.some((key) => {
    const value = localStorage.getItem(key);

    if (!value) return false;

    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) return parsed.length > 0;
      if (parsed && typeof parsed === 'object') {
        return Object.keys(parsed).length > 0;
      }

      return Boolean(parsed);
    } catch {
      return Boolean(value);
    }
  });
};

export const isDemoMode = () => {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

export const hasSeenDemoPrompt = () => {
  return localStorage.getItem(DEMO_PROMPT_SEEN_KEY) === 'true';
};

export const markDemoPromptSeen = () => {
  localStorage.setItem(DEMO_PROMPT_SEEN_KEY, 'true');
};

export const startDemoMode = () => {
  clearAllUserData();

  const demoData = createDemoBackupData();

  importAllData(demoData);

  localStorage.setItem(DEMO_MODE_KEY, 'true');
  localStorage.setItem(DEMO_PROMPT_SEEN_KEY, 'true');

  localStorage.setItem(
    'kanji_srs_preferences',
    JSON.stringify({
      unlockedLevels: ['5', '4', '3'],
      newCardsPerDay: 10,
      maxReviewsPerDay: 60,
    })
  );
};

export const endDemoMode = () => {
  clearAllUserData();

  localStorage.removeItem(DEMO_MODE_KEY);

  localStorage.setItem(DEMO_PROMPT_SEEN_KEY, 'true');
};

export const resetDemoPrompt = () => {
  localStorage.removeItem(DEMO_PROMPT_SEEN_KEY);
};
