const FLASHCARD_SESSION_KEY = 'flashcardSession';
const MULTICHOICE_SESSION_KEY = 'multichoiceSession';

const getKey = (type) =>
  type === 'flashcard' ? FLASHCARD_SESSION_KEY : MULTICHOICE_SESSION_KEY;

export const loadSession = (type) => {
  const data = localStorage.getItem(getKey(type));
  return data ? JSON.parse(data) : null;
};

export const saveSession = (type, session) => {
  localStorage.setItem(getKey(type), JSON.stringify(session));
};

export const clearSession = (type) => {
  localStorage.removeItem(getKey(type));
};
