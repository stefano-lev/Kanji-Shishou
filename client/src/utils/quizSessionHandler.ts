import type {
  FlashcardSession,
  MultichoiceSession,
  QuizSession,
  QuizSessionType,
} from '@/types';

const FLASHCARD_SESSION_KEY = 'flashcardSession';
const MULTICHOICE_SESSION_KEY = 'multichoiceSession';

type SessionByType<T extends QuizSessionType> = T extends 'flashcard'
  ? FlashcardSession
  : MultichoiceSession;

const getKey = (type: QuizSessionType) =>
  type === 'flashcard' ? FLASHCARD_SESSION_KEY : MULTICHOICE_SESSION_KEY;

export const loadSession = <T extends QuizSessionType>(
  type: T
): SessionByType<T> | null => {
  const data = localStorage.getItem(getKey(type));
  if (!data) return null;

  try {
    return JSON.parse(data) as SessionByType<T>;
  } catch {
    return null;
  }
};

export const saveSession = (type: QuizSessionType, session: QuizSession) => {
  localStorage.setItem(getKey(type), JSON.stringify(session));
};

export const clearSession = (type: QuizSessionType) => {
  localStorage.removeItem(getKey(type));
};
