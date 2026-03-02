/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';

import Card from './ui/Card';
import { kanjiByLevel } from '../data/kanjiData';
import { recordSeen } from '../utils/statsHandler';
import { recordDailyStudy } from '../utils/dailyStatsHandler';
import {
  incrementNewStudied,
  incrementReviewStudied,
  loadDailyProgress,
} from '../utils/dailySRSProgress';
import SRSOnboarding from './SRSOnboarding';
import {
  getDueCards,
  reviewCard,
  loadSRS,
  simulateReview,
} from '../utils/srsHandler';
import { getAvailableNewCards } from '../utils/srsQueueBuilder';
import { loadSRSConfig } from '../utils/srsPreferences';

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

    recordSeen(currentUid);
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

  return (
    <Card className="max-w space-y-4 text-center">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-start tracking-tight">
          SRS Review
        </h1>

        {!srsOnboarding && !isFinished && currentKanji && (
          <div className="text-center flex flex-col items-center space-y-2">
            <p className="text-lg font-bold text-center">
              Card {currentIndex + 1} / {sessionQueue.length}
            </p>
            <div className="w-full max-w-sm bg-zinc-800 h-1 rounded mx-auto">
              <div
                className="bg-indigo-500 h-2 rounded transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / sessionQueue.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {!srsOnboarding && !isFinished && currentKanji && (
          <button
            onClick={() => setIsFinished(true)}
            className="rounded-lg bg-red-600 hover:bg-red-500 px-2 py-1"
          >
            End Session
          </button>
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
            <button
              className="rounded-lg bg-blue-600 hover:bg-blue-500 transition px-6 py-2 font-medium"
              onClick={handleExtraStudy}
            >
              Continue Studying Anyway
            </button>
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
            {[2, 3, 4, 5].map((q) => (
              <button
                key={q}
                className={`${
                  q === 2
                    ? 'bg-red-600/90 hover:bg-red-500'
                    : q === 3
                      ? 'bg-amber-600/90 hover:bg-amber-500'
                      : q === 4
                        ? 'bg-emerald-600/90 hover:bg-emerald-500'
                        : 'bg-sky-600/90 hover:bg-sky-500'
                } rounded-xl px-4 py-2 transition-all duration-200 shadow-lg`}
                onClick={() => handleAnswer(q)}
              >
                <div className="font-semibold">
                  {q === 2
                    ? 'Again'
                    : q === 3
                      ? 'Hard'
                      : q === 4
                        ? 'Good'
                        : 'Easy'}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {previewInterval(q)}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </Card>
  );
};

const InfoBlock = ({ title, children }) => (
  <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-2 text-center">
    <p className="text-zinc-400 mb-1">{title}</p>
    <p>{children}</p>
  </div>
);

export default SRSReview;
