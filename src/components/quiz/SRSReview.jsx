import { useEffect, useState, useMemo, useRef } from 'react';

import { kanjiByLevel } from '@data/kanjiData';

import { recordResult, recordSRSResult } from '@utils/statsHandler';
import { recordDailyStudy } from '@utils/dailyStatsHandler';
import {
  incrementNewStudied,
  incrementReviewStudied,
  loadDailyProgress,
} from '@utils/dailySRSProgress';
import {
  getDueCards,
  reviewCard,
  loadSRS,
  simulateReview,
} from '@utils/srsHandler';
import { getAvailableNewCards } from '@utils/srsQueueBuilder';
import { loadSRSConfig } from '@utils/srsPreferences';

import Card from '@components/ui/Card';
import InfoBlock from '@components/ui/InfoBlock';
import ProgressBar from '@components/ui/ProgressBar';
import Button from '@components/ui/Button';

import SRSOnboarding from '@components/modals/SRSOnboarding';
import StatsModal from '@components/modals/StatsModal';

const EXTRA_BATCH_SIZE = 15;
const MODES = {
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
  REVIEW: 'review',
  FINISHED: 'finished',
};

const SRSReview = () => {
  const [config, setConfig] = useState(null);
  const [mode, setMode] = useState(MODES.DASHBOARD);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [srsData, setSrsData] = useState({});
  const [dailyProgressState, setDailyProgressState] = useState(
    loadDailyProgress() ?? { newStudied: 0, reviewsStudied: 0 }
  );

  const currentUid = sessionQueue[currentIndex] ?? null;
  const currentCardData = currentUid ? srsData[currentUid] : null;
  const [revealed, setRevealed] = useState(false);

  const [statsLevelFilter, setStatsLevelFilter] = useState(null);

  const cardStartTimeRef = useRef(Date.now());

  const kanjiMap = useMemo(() => {
    return Object.values(kanjiByLevel)
      .flat()
      .reduce((acc, k) => {
        acc[k.uid] = k;
        return acc;
      }, {});
  }, []);

  const buildSessionQueue = (config, ignoreDailyLimits = false) => {
    const srs = loadSRS();

    const due = getDueCards().sort(
      (a, b) => new Date(srs[a]?.nextReview) - new Date(srs[b]?.nextReview)
    );
    const newCards = getAvailableNewCards();

    let remainingNew = config.newCardsPerDay;
    let remainingReviews = config.maxReviewsPerDay;

    if (!ignoreDailyLimits) {
      const progress = dailyProgressState ?? {
        newStudied: 0,
        reviewsStudied: 0,
      };
      remainingNew -= progress.newStudied;
      remainingReviews -= progress.reviewsStudied;
    }

    remainingNew = Math.max(0, remainingNew);
    remainingReviews = Math.max(0, remainingReviews);

    const limitedReviews = due.slice(0, remainingReviews);
    const limitedNew = newCards.slice(0, remainingNew);

    return [...limitedReviews, ...limitedNew];
  };

  const initializeSession = (config) => {
    const queue = buildSessionQueue(config);

    setSrsData(loadSRS());
    setSessionQueue(queue);
    setCurrentIndex(0);

    if (queue.length === 0) {
      setMode(MODES.FINISHED);
    } else {
      setMode(MODES.REVIEW);
    }
  };

  const hasExtraStudy = () => {
    const srs = loadSRS();
    const today = new Date().toISOString().split('T')[0];

    const existingNotDue = Object.entries(srs)
      .filter(([, data]) => data.nextReview > today)
      .map(([uid]) => uid);

    const newCards = getAvailableNewCards();

    return existingNotDue.length + newCards.length > 0;
  };

  const handleExtraStudy = () => {
    const srs = loadSRS();

    const due = getDueCards();

    const learningCards = Object.entries(srs)
      .filter(([, card]) => card.phase === 'learning')
      .map(([uid]) => uid);

    const newCards = getAvailableNewCards();

    const inSession = new Set(sessionQueue);

    const extraDue = due.filter((uid) => !inSession.has(uid));
    const extraLearning = learningCards.filter((uid) => !inSession.has(uid));
    const extraNew = newCards.filter((uid) => !inSession.has(uid));

    const combined = [...extraDue, ...extraLearning, ...extraNew];

    if (combined.length === 0) return;

    const nextBatch = combined.slice(0, EXTRA_BATCH_SIZE);

    if (mode === MODES.REVIEW && sessionQueue.length > 0) {
      setSessionQueue((prev) => [...prev, ...nextBatch]);
    } else {
      setSrsData(loadSRS());
      setSessionQueue(nextBatch);
      setCurrentIndex(0);
      setMode(MODES.REVIEW);
    }
  };

  const moveToNextCard = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= sessionQueue.length) {
      setMode(MODES.FINISHED);
    } else {
      setCurrentIndex(nextIndex);
      setRevealed(false);
    }
  };

  const reinsertCardLater = (uid) => {
    const insertionOffset = 5;

    setSessionQueue((prev) => {
      const newQueue = [...prev];

      const insertIndex = Math.min(
        currentIndex + insertionOffset,
        newQueue.length
      );

      newQueue.splice(insertIndex, 0, uid);

      return newQueue;
    });
  };

  const handleAnswer = (quality) => {
    const durationSeconds = Math.max(
      1,
      Math.floor((Date.now() - cardStartTimeRef.current) / 1000)
    );

    const isCorrect = quality >= 3;
    const isNew = !srsData[currentUid];

    reviewCard(currentUid, quality);

    if (quality === 2) {
      reinsertCardLater(currentUid);
    }

    if (isNew) {
      incrementNewStudied();
    } else {
      incrementReviewStudied();
    }

    setDailyProgressState(loadDailyProgress());
    setSrsData(loadSRS());

    recordResult(currentUid, isCorrect); // global stats
    recordSRSResult(currentUid, isCorrect); // SRS-only stats

    recordDailyStudy({
      kanji: currentUid,
      correct: isCorrect,
      durationSeconds,
    });

    moveToNextCard();
  };

  const previewInterval = (quality) => {
    const baseCard = currentCardData ?? {
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
    };

    const simulated = simulateReview(baseCard, quality);

    if (simulated.interval === 0) return 'Soon';

    return `${simulated.interval} day${simulated.interval > 1 ? 's' : ''}`;
  };

  const dashboardStats = useMemo(() => {
    if (!config) return null;

    const progress = loadDailyProgress() ?? {
      newStudied: 0,
      reviewsStudied: 0,
    };

    const dueTotal = getDueCards().length;
    const newTotal = getAvailableNewCards().length;

    const reviewsRemaining = Math.max(
      0,
      config.maxReviewsPerDay - progress.reviewsStudied
    );

    const newRemaining = Math.max(
      0,
      config.newCardsPerDay - progress.newStudied
    );

    const srs = loadSRS();

    const learningCount = Object.values(srs).filter(
      (c) => c.phase === 'learning'
    ).length;

    return {
      dueCount: Math.min(dueTotal, reviewsRemaining),
      newCount: Math.min(newTotal, newRemaining),
      learningCount,
      studiedToday: progress.newStudied + progress.reviewsStudied,
      totalCards: Object.keys(srs).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, dailyProgressState, srsData]);

  const levelProgress = useMemo(() => {
    const srs = loadSRS();

    return Object.entries(kanjiByLevel)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([level, kanjiList]) => {
        const total = kanjiList.length;

        const learned = kanjiList.filter((k) => srs[k.uid]).length;

        return {
          level,
          learned,
          total,
          percent: Math.round((learned / total) * 100),
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srsData]);

  const currentKanji = kanjiMap[currentUid];

  useEffect(() => {
    const storedConfig = loadSRSConfig();

    if (!storedConfig) {
      setMode(MODES.ONBOARDING);
    } else {
      setConfig(storedConfig);
      setMode(MODES.DASHBOARD);
    }
  }, []);

  useEffect(() => {
    if (currentUid) {
      cardStartTimeRef.current = Date.now();
    }
  }, [currentUid]);

  const answerOptions = [
    {
      value: 2,
      label: 'Again',
      variant: 'danger',
    },
    {
      value: 3,
      label: 'Hard',
      variant: 'warning',
    },
    {
      value: 4,
      label: 'Good',
      variant: 'success',
    },
    {
      value: 5,
      label: 'Easy',
      variant: 'primary',
    },
  ];

  const startSession = () => {
    if (!config) return;
    initializeSession(config);
  };

  return (
    <Card
      className={`flex flex-col ${mode === MODES.REVIEW ? 'max-w-5xl' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold ">SRS Review</h1>

        {mode === MODES.REVIEW && currentKanji && (
          <Button variant="danger" onClick={() => setMode(MODES.FINISHED)}>
            End Session
          </Button>
        )}
      </div>

      {mode === MODES.ONBOARDING && (
        <SRSOnboarding
          onComplete={(newConfig) => {
            setConfig(newConfig);
            setMode(MODES.DASHBOARD);
          }}
        />
      )}

      {mode === MODES.DASHBOARD && (
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-semibold">Daily Review</h2>

          <div className="grid grid-cols-3 gap-3">
            <InfoBlock title="Reviews Due" height="h-20">
              {dashboardStats?.dueCount ?? 0}
            </InfoBlock>
            <InfoBlock title="Learning" height="h-20">
              {dashboardStats?.learningCount ?? 0}
            </InfoBlock>
            <InfoBlock title="New Cards Today" height="h-20">
              {dashboardStats?.newCount ?? 0}
            </InfoBlock>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock title="Studied Today" height="h-20">
              {dashboardStats?.studiedToday ?? 0}
            </InfoBlock>

            <InfoBlock title="Total Cards" height="h-20">
              {dashboardStats?.totalCards ?? 0}
            </InfoBlock>
          </div>

          {(dashboardStats?.dueCount ?? 0) + (dashboardStats?.newCount ?? 0) ===
          0 ? (
            <div className="space-y-4">
              <p className="text-zinc-400 font-bold underline">
                You have completed all reviews for today.
              </p>

              {hasExtraStudy() && (
                <Button variant="success" onClick={handleExtraStudy}>
                  Study Extra Cards
                </Button>
              )}
            </div>
          ) : (
            <Button variant="primary" onClick={startSession}>
              Start Review (
              {(dashboardStats?.dueCount ?? 0) +
                (dashboardStats?.newCount ?? 0)}
              )
            </Button>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">JLPT Level Progress</h3>

            <div className="text-sm text-zinc-400 border-t border-white/10 pt-3 space-y-1">
              <div className="grid grid-cols-2 gap-3">
                {levelProgress.map((lvl, index) => (
                  <div
                    key={lvl.level}
                    onClick={() => setStatsLevelFilter(lvl.level)}
                    className={`cursor-pointer bg-zinc-900/60 border border-white/10 rounded-xl p-5 hover:bg-zinc-800 transition ${
                      index === 4 ? 'col-span-2' : ''
                    }`}
                  >
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>JLPT N{lvl.level}</span>
                      <span>
                        {lvl.learned}/{lvl.total}
                      </span>
                    </div>

                    <ProgressBar value={lvl.learned} max={lvl.total} />

                    <div className="text-xs text-zinc-400 mt-1">
                      {lvl.percent}% learned
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {mode === MODES.REVIEW && currentKanji && (
        <div
          key={currentUid}
          className="flex flex-col items-center text-center gap-2"
        >
          <div className="text-center flex flex-col items-center">
            <p className="text-lg font-bold text-center">
              Card {currentIndex + 1} / {sessionQueue.length}
            </p>

            <ProgressBar
              value={currentIndex + 1}
              max={sessionQueue.length}
            ></ProgressBar>
          </div>

          <div className="w-full max-w-md mx-auto bg-zinc-900/70 border border-white/10 rounded-2xl py-4 flex items-center justify-center shadow-inner animate-fade-in">
            <span className="text-[4rem] sm:text-[5rem] md:text-[6rem] font-bold tracking-wide">
              {currentKanji.literal}
            </span>
          </div>

          <div className="w-full max-w-md mx-auto flex flex-col gap-4">
            <div
              className={`space-y-4 w-full transition-opacity duration-200 ${revealed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock title="Kun-yomi" height="h-24">
                  {currentKanji.reading_meaning.rmgroup.reading
                    .filter((r) => r['@r_type'] === 'ja_kun')
                    .map((r) => r['#text'])
                    .join(', ') || 'None'}
                </InfoBlock>

                <InfoBlock title="On-yomi" height="h-24">
                  {currentKanji.reading_meaning.rmgroup.reading
                    .filter((r) => r['@r_type'] === 'ja_on')
                    .map((r) => r['#text'])
                    .join(', ') || 'None'}
                </InfoBlock>
              </div>

              <InfoBlock title="Meanings" height="h-24">
                {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                  'None'}
              </InfoBlock>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-h-[72px]">
              {!revealed ? (
                <Button
                  variant="primary"
                  className="col-span-2 sm:col-span-4 py-5 rounded-xl shadow-lg font-semibold"
                  onClick={() => setRevealed(true)}
                >
                  Reveal Answer
                </Button>
              ) : (
                answerOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={option.variant}
                    className="rounded-xl shadow-lg py-3"
                    onClick={() => handleAnswer(option.value)}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {previewInterval(option.value)}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {mode === MODES.FINISHED && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl p-10 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Session Complete</h2>

          <p className="text-zinc-400">
            You reviewed{' '}
            {dailyProgressState.newStudied + dailyProgressState.reviewsStudied}{' '}
            cards today.
          </p>

          <div className="items-center justify-center flex flex-col gap-3">
            <Button variant="primary" onClick={() => setMode(MODES.DASHBOARD)}>
              Back to Dashboard
            </Button>

            {hasExtraStudy() && (
              <Button variant="success" onClick={handleExtraStudy}>
                Continue Studying Anyway
              </Button>
            )}
          </div>
        </div>
      )}

      {statsLevelFilter && (
        <StatsModal
          initialLevel={statsLevelFilter}
          initialMode="srs"
          onClose={() => setStatsLevelFilter(null)}
        />
      )}
    </Card>
  );
};

export default SRSReview;
