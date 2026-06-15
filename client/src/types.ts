import type { ReactNode } from 'react';

export type JLPTLevel = '5' | '4' | '3' | '2' | '1';
export type LevelSelection = JLPTLevel[];

export interface KanjiReading {
  '@r_type'?: string;
  '#text': string;
}

export interface RadicalValue {
  '@rad_type'?: string;
  '#text': string;
}

export interface DictionaryReference {
  '@dr_type'?: string;
  '#text': string;
}

export interface Kanji {
  uid: string;
  id?: string | number;
  level?: number;
  literal: string;
  reading_meaning: {
    rmgroup: {
      reading: KanjiReading[];
      meaning: string[];
    };
    nanori?: string | string[];
  };
  misc: {
    stroke_count?: number | string | Array<number | string>;
    freq?: number | string;
    jlpt?: number | string;
    grade?: number | string;
  };
  radical?: {
    rad_value?: RadicalValue | RadicalValue[];
  };
  dic_number?: {
    dic_ref?: DictionaryReference | DictionaryReference[];
  };
  _stat?: KanjiStat;
  _accuracy?: number;
}

export type KanjiByLevel = Record<JLPTLevel, Kanji[]>;

export interface SRSStat {
  seen: number;
  correct: number;
  incorrect: number;
  lastSeen: string | null;
}

export interface KanjiStat extends SRSStat {
  srs: SRSStat;
}

export type KanjiStats = Record<string, KanjiStat>;

export interface DailyStat {
  uniqueKanji: string[];
  totalSeen: number;
  correct: number;
  incorrect: number;
  studyTimeSeconds: number;
}

export type DailyStats = Record<string, DailyStat>;

export interface DailyStudyEntry {
  uid: string;
  correct?: boolean | null;
  durationSeconds: number;
}

export interface DailySRSProgress {
  date: string;
  newStudied: number;
  reviewsStudied: number;
}

export type SRSPhase = 'learning' | 'review';

export interface SRSCard {
  phase: SRSPhase;
  step: number;
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReview: string;
  lastReviewed: string | null;
}

export type SRSData = Record<string, SRSCard>;

export interface SRSConfig {
  unlockedLevels: JLPTLevel[];
  newCardsPerDay: number;
  maxReviewsPerDay: number;
}

export interface HomePreferences {
  showOverviewStats: boolean;
  showCalendar: boolean;
  showAllTimeStats: boolean;
}

export interface StatsPreferences {
  showPhase: boolean;
  showInterval: boolean;
  showEaseFactor: boolean;
  showRepetitions: boolean;
  showNextReview: boolean;
}

export type QuizSessionType = 'flashcard' | 'multichoice';

export interface FlashcardSession {
  selectedLevels?: JLPTLevel[];
  selectedLevel?: JLPTLevel;
  currentIndex?: number;
  randomOrder?: boolean;
  deckOrder?: string[];
  quizStarted?: boolean;
}

export interface MultichoiceSession {
  selectedLevels: JLPTLevel[];
  repeatIncorrect?: boolean;
  kanjiPool: string[];
  currentRound: number;
  correctCount: number;
  incorrectCount: number;
  percentageCorrect: number;
  quizCompleted: boolean;
}

export type QuizSession = FlashcardSession | MultichoiceSession;

export interface BackupData {
  kanjiStats?: KanjiStats;
  kanjiSRS?: SRSData;
  kanji_daily_stats?: DailyStats;
  kanji_srs_daily_progress?: DailySRSProgress;
  favorites?: string[];
  [key: string]: unknown;
}

export interface Snapshot {
  date: string;
  data: BackupData;
}

export interface ToggleProps {
  label: string;
  value: boolean;
  onChange: () => void;
}

export interface ChildrenProps {
  children: ReactNode;
}
