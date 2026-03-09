const SRS_KEY = 'kanjiSRS';

export const loadSRS = () => {
  const data = localStorage.getItem(SRS_KEY);
  return data ? JSON.parse(data) : {};
};

export const saveSRS = (data) => {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
};

const LEARNING_STEPS = [
  10 * 60 * 1000, // 10 minutes
  60 * 60 * 1000, // 1 hour
];

export const createNewSRSCard = () => ({
  phase: 'learning', // learning | review
  step: 0,
  repetitions: 0,
  interval: 0,
  easeFactor: 2.5,
  nextReview: new Date().toISOString(),
  lastReviewed: null,
});

export const getDueCards = () => {
  const srs = loadSRS();
  const now = new Date();

  return Object.entries(srs)
    .filter(([, data]) => new Date(data.nextReview) <= now)
    .map(([uid]) => uid);
};

export const simulateReview = (card, quality) => {
  let { phase, step, repetitions, interval, easeFactor } = card;

  if (phase === 'learning') {
    if (quality < 3) {
      step = 0;
    } else {
      step += 1;
    }

    if (step >= LEARNING_STEPS.length) {
      phase = 'review';
      repetitions = 1;
      interval = 1;
    }

    return { phase, step, repetitions, interval, easeFactor };
  }

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;

    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (easeFactor < 1.3) easeFactor = 1.3;
  }

  return { phase, step, repetitions, interval, easeFactor };
};

export const reviewCard = (uid, quality) => {
  const srs = loadSRS();
  const now = new Date();

  const existingCard = srs[uid] ?? createNewSRSCard();

  const updated = simulateReview(existingCard, quality);

  let nextReview;

  if (updated.phase === 'learning') {
    const stepDelay = LEARNING_STEPS[updated.step] ?? 0;
    nextReview = new Date(now.getTime() + stepDelay);
  } else {
    nextReview = new Date(now);
    nextReview.setDate(now.getDate() + updated.interval);
  }

  srs[uid] = {
    ...existingCard,
    ...updated,
    nextReview: nextReview.toISOString(),
    lastReviewed: now.toISOString(),
  };

  saveSRS(srs);
};
