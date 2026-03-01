const SRS_KEY = 'kanjiSRS';

export const loadSRS = () => {
  const data = localStorage.getItem(SRS_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveSRS = (data) => {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
};

export const createNewSRSCard = () => ({
  repetitions: 0,
  interval: 0,
  easeFactor: 2.5,
  nextReview: new Date().toISOString().split('T')[0],
  lastReviewed: null,
});

export const getDueCards = () => {
  const srs = loadSRS();
  const today = new Date().toISOString().split('T')[0];

  return Object.entries(srs)
    .filter(([, data]) => data.nextReview <= today)
    .map(([uid]) => uid);
};

export const simulateReview = (card, quality) => {
  let { repetitions, interval, easeFactor } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;

    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (easeFactor < 1.3) easeFactor = 1.3;
  }

  return { repetitions, interval, easeFactor };
};

export const reviewCard = (uid, quality) => {
  const srs = loadSRS();
  const today = new Date();

  const existingCard = srs[uid] ?? createNewSRSCard();

  const updated = simulateReview(existingCard, quality);

  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(today.getDate() + updated.interval);

  srs[uid] = {
    ...updated,
    nextReview: nextReviewDate.toISOString().split('T')[0],
    lastReviewed: today.toISOString(),
  };

  saveSRS(srs);
};
