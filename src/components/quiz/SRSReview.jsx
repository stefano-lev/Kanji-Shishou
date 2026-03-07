import { useEffect, useState } from 'react';

import { kanjiByLevel } from '@data/kanjiData';

import { recordResult } from '@utils/statsHandler';
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

const EXTRA_BATCH_SIZE = 15;

const SRSReview = () => {
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [srsData, setSrsData] = useState({});
  const [srsOnboarding, setSrsOnboarding] = useState(false);
  const [dailyProgressState, setDailyProgressState] = useState(
    loadDailyProgress() ?? { newStudied: 0, reviewsStudied: 0 }
  );

  const currentUid = sessionQueue[currentIndex] ?? null;
  const currentCardData = currentUid ? srsData[currentUid] : null;

  const buildSessionQueue = (config, ignoreDailyLimits = false) => {
    const due = getDueCards();
    const newCards = getAvailableNewCards();

    let remainingNew = config.newCardsPerDay;
    let remainingReviews = config.maxReviewsPerDay;

    if (!ignoreDailyLimits) {
      const progress = loadDailyProgress() ?? {
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
    setIsFinished(queue.length === 0);
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
    const today = new Date().toISOString().split('T')[0];

    const existingNotDue = Object.entries(srs)
      .filter(([, data]) => data.nextReview > today)
      .map(([uid]) => uid);

    const newCards = getAvailableNewCards();

    const remainingExtra = [...existingNotDue, ...newCards].filter(
      (uid) => !sessionQueue.includes(uid)
    );

    if (remainingExtra.length === 0) return;

    const nextBatch = remainingExtra.slice(0, EXTRA_BATCH_SIZE);

    setSessionQueue((prev) => [...prev, ...nextBatch]);
    setIsFinished(false);
  };

  const moveToNextCard = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= sessionQueue.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleAnswer = (quality) => {
    const isNew = !srsData[currentUid];
    reviewCard(currentUid, quality);

    if (isNew) incrementNewStudied();
    else incrementReviewStudied();

    setDailyProgressState(loadDailyProgress());
    setSrsData(loadSRS());

    recordResult(currentUid);
    recordDailyStudy({ kanji: currentUid, correct: quality >= 3 });

    moveToNextCard();
  };

  const previewInterval = (quality) => {
    const baseCard = currentCardData ?? {
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
    };
    const simulated = simulateReview(baseCard, quality);
    return `${simulated.interval} day${simulated.interval > 1 ? 's' : ''}`;
  };

  const currentKanji = currentUid
    ? Object.values(kanjiByLevel)
        .flat()
        .find((k) => k.uid === currentUid)
    : null;

  useEffect(() => {
    const config = loadSRSConfig();

    if (!config) {
      setSrsOnboarding(true);
      return;
    }

    initializeSession(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <Card className="max-w space-y-2 text-center">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-start tracking-tight">
          SRS Review
        </h1>

        {!srsOnboarding && !isFinished && currentKanji && (
          <div className="text-center flex flex-col items-center space-y-2">
            <p className="text-lg font-bold text-center">
              Card {currentIndex + 1} / {sessionQueue.length}
            </p>

            <ProgressBar
              value={currentIndex + 1}
              max={sessionQueue.length}
            ></ProgressBar>
          </div>
        )}

        {!srsOnboarding && !isFinished && currentKanji && (
          <Button variant="danger" onClick={() => setIsFinished(true)}>
            End Session
          </Button>
        )}
      </div>

      {srsOnboarding ? (
        <SRSOnboarding
          onComplete={(config) => {
            setSrsOnboarding(false);
            initializeSession(config);
          }}
        />
      ) : isFinished ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl p-10 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Session Complete</h2>
          <p className="text-zinc-400">
            You reviewed{' '}
            {dailyProgressState.newStudied + dailyProgressState.reviewsStudied}{' '}
            cards today.
          </p>

          {hasExtraStudy() && (
            <Button variant="primary" onClick={handleExtraStudy}>
              Continue Studying Anyway
            </Button>
          )}
        </div>
      ) : currentKanji ? (
        <>
          <div className="w-full max-w-md mx-auto bg-zinc-900/70 border border-white/10 rounded-2xl py-12 flex items-center justify-center shadow-inner">
            <span className="text-7xl sm:text-8xl font-bold tracking-wide">
              {currentKanji.literal}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoBlock title="Kun-yomi">
              {currentKanji.reading_meaning.rmgroup.reading
                .filter((r) => r['@r_type'] === 'ja_kun')
                .map((r) => r['#text'])
                .join(', ') || 'None'}
            </InfoBlock>
            <InfoBlock title="On-yomi">
              {currentKanji.reading_meaning.rmgroup.reading
                .filter((r) => r['@r_type'] === 'ja_on')
                .map((r) => r['#text'])
                .join(', ') || 'None'}
            </InfoBlock>
          </div>

          <InfoBlock title="Meanings">
            {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') || 'None'}
          </InfoBlock>

          <div className="grid grid-cols-4 gap-4">
            {answerOptions.map((option) => (
              <Button
                key={option.value}
                variant={option.variant}
                className="rounded-xl shadow-lg"
                onClick={() => handleAnswer(option.value)}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs opacity-70 mt-1">
                  {previewInterval(option.value)}
                </div>
              </Button>
            ))}
          </div>
        </>
      ) : null}
    </Card>
  );
};

export default SRSReview;
