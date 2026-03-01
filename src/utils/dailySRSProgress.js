const DAILY_KEY = 'kanji_srs_daily_progress';

const todayString = () => new Date().toISOString().split('T')[0];

export const loadDailyProgress = () => {
  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) return null;

  const data = JSON.parse(raw);

  if (data.date !== todayString()) {
    return {
      date: todayString(),
      newStudied: 0,
      reviewsStudied: 0,
    };
  }

  return data;
};

export const saveDailyProgress = (progress) => {
  localStorage.setItem(DAILY_KEY, JSON.stringify(progress));
};

export const incrementNewStudied = () => {
  const progress = loadDailyProgress() ?? {
    date: todayString(),
    newStudied: 0,
    reviewsStudied: 0,
  };

  progress.newStudied += 1;

  saveDailyProgress(progress);
};

export const incrementReviewStudied = () => {
  const progress = loadDailyProgress() ?? {
    date: todayString(),
    newStudied: 0,
    reviewsStudied: 0,
  };

  progress.reviewsStudied += 1;

  saveDailyProgress(progress);
};
