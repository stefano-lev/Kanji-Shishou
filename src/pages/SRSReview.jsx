/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';

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

const SRSReview = () => {
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUid, setCurrentUid] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [srsData, setSrsData] = useState({});
  const [srsOnboarding, setSrsOnboarding] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [showDebug, setShowDebug] = useState(true);

  const [dailyProgressState, setDailyProgressState] = useState(
    loadDailyProgress() ?? {
      newStudied: 0,
      reviewsStudied: 0,
    }
  );

  const currentCardData = currentUid ? srsData[currentUid] : null;

  const totalCards = dueCards.length;

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

  useEffect(() => {
    const config = loadSRSConfig();

    if (!config) {
      setSrsOnboarding(true);
      return;
    }

    const sessionQueue = buildSessionQueue(config);

    setSessionStats({
      totalDue: getDueCards().length,
      totalNewAvailable: getAvailableNewCards().length,
      reviewLimit: config.maxReviewsPerDay,
      newLimit: config.newCardsPerDay,
    });

    setSrsData(loadSRS());
    setDueCards(sessionQueue);
    setCurrentIndex(0);

    if (sessionQueue.length > 0) {
      setCurrentUid(sessionQueue[0]);
    } else {
      setIsFinished(true);
    }
  }, []);

  const initializeSession = (config, ignoreDailyLimits = false) => {
    const sessionQueue = buildSessionQueue(config, ignoreDailyLimits);

    setSrsData(loadSRS());
    setDueCards(sessionQueue);
    setCurrentIndex(0);
    setIsFinished(false);

    if (sessionQueue.length > 0) {
      setCurrentUid(sessionQueue[0]);
    } else {
      setIsFinished(true);
    }
  };

  const moveToNextCard = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= dueCards.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(nextIndex);
      setCurrentUid(dueCards[nextIndex]);
    }
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

  const handleAnswer = (quality) => {
    const isNew = !srsData[currentUid];

    reviewCard(currentUid, quality);

    if (isNew) {
      incrementNewStudied();
    } else {
      incrementReviewStudied();
    }

    setDailyProgressState(loadDailyProgress());

    const updated = loadSRS();
    setSrsData(updated);

    recordSeen(currentUid);
    recordDailyStudy({
      kanji: currentUid,
      correct: quality >= 3,
    });

    moveToNextCard();
  };

  const currentKanji = currentUid
    ? Object.values(kanjiByLevel)
        .flat()
        .find((k) => k.uid === currentUid)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white flex justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-center tracking-tight">
          SRS Review (Beta)
        </h1>

        {sessionStats && showDebug && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Due Cards:</span>
              <span>{sessionStats.totalDue}</span>
            </div>
            <div className="flex justify-between">
              <span>Total New Available:</span>
              <span>{sessionStats.totalNewAvailable}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Review Limit:</span>
              <span>{sessionStats.reviewLimit}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily New Limit:</span>
              <span>{sessionStats.newLimit}</span>
            </div>
            <button
              className="text-xs text-indigo-400 mt-2 underline"
              onClick={() => setShowDebug(false)}
            >
              Hide Debug Info
            </button>
          </div>
        )}

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
              {dailyProgressState.newStudied +
                dailyProgressState.reviewsStudied}{' '}
              cards today.
            </p>

            <button
              onClick={() => {
                const config = loadSRSConfig();
                initializeSession(config, true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-6 py-3 mt-4"
            >
              Continue Studying Anyway
            </button>
          </div>
        ) : currentKanji ? (
          <>
            <div className="text-center space-y-3">
              <p className="text-sm text-zinc-400">
                Card {currentIndex + 1} / {totalCards}
              </p>

              <div className="w-full bg-zinc-800 h-2 rounded">
                <div
                  className="bg-indigo-500 h-2 rounded transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / totalCards) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] text-center transition-transform duration-200 hover:scale-[1.01]">
              <h2 className="text-7xl font-light tracking-wide">
                {currentKanji.literal}
              </h2>
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

              <InfoBlock title="Meanings">
                {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                  'None'}
              </InfoBlock>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                className="bg-red-600/90 hover:bg-red-500 rounded-xl px-6 py-4 transition-all duration-200 shadow-lg"
                onClick={() => handleAnswer(2)}
              >
                <div className="font-semibold">Again</div>
                <div className="text-xs opacity-70 mt-1">
                  {previewInterval(2)}
                </div>
              </button>

              <button
                className="bg-amber-600/90 hover:bg-amber-500 rounded-xl px-6 py-4 transition-all duration-200 shadow-lg"
                onClick={() => handleAnswer(3)}
              >
                <div className="font-semibold">Hard</div>
                <div className="text-xs opacity-70 mt-1">
                  {previewInterval(3)}
                </div>
              </button>

              <button
                className="bg-emerald-600/90 hover:bg-emerald-500 rounded-xl px-6 py-4 transition-all duration-200 shadow-lg"
                onClick={() => handleAnswer(4)}
              >
                <div className="font-semibold">Good</div>
                <div className="text-xs opacity-70 mt-1">
                  {previewInterval(4)}
                </div>
              </button>

              <button
                className="bg-sky-600/90 hover:bg-sky-500 rounded-xl px-6 py-4 transition-all duration-200 shadow-lg"
                onClick={() => handleAnswer(5)}
              >
                <div className="font-semibold">Easy</div>
                <div className="text-xs opacity-70 mt-1">
                  {previewInterval(5)}
                </div>
              </button>
            </div>
            <button
              onClick={() => setIsFinished(true)}
              className="text-xs text-zinc-400 underline mt-6"
            >
              End Session
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

const InfoBlock = ({ title, children }) => (
  <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 text-center">
    <p className="text-zinc-400 mb-1">{title}</p>
    <p>{children}</p>
  </div>
);

export default SRSReview;
