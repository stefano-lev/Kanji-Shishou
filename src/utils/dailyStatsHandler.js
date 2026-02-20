const STORAGE_KEY = 'kanji_daily_stats';

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getDailyStats() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveDailyStats(stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordDailyStudy({ uid, correct, durationSeconds }) {
  const stats = getDailyStats();
  const today = getTodayISO();

  if (!stats[today]) {
    stats[today] = {
      uniqueKanji: [],
      totalSeen: 0,
      correct: 0,
      incorrect: 0,
      studyTimeSeconds: 0,
    };
  }

  const day = stats[today];

  if (!day.uniqueKanji.includes(uid)) {
    day.uniqueKanji.push(uid);
  }

  day.totalSeen += 1;
  day.studyTimeSeconds += durationSeconds;

  if (correct) {
    day.correct += 1;
  } else {
    day.incorrect += 1;
  }

  saveDailyStats(stats);
}
