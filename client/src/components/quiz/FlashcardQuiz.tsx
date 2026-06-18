import { useEffect, useState, useRef } from 'react';

import useQuizDeckConfig from '@hooks/useQuizDeckConfig';

import { getKanjiByLevels, buildDeck } from '@utils/deckBuilder';
import { recordResult } from '@utils/statsHandler';
import { recordDailyStudy } from '@utils/dailyStatsHandler';
import {
  loadSession,
  saveSession,
  clearSession,
} from '@utils/quizSessionHandler';
import { getSafeKanji } from '@utils/kanjiUtils';

import Card from '@components/ui/Card';
import InfoBlock from '@components/ui/InfoBlock';
import ProgressBar from '@components/ui/ProgressBar';
import Button from '@components/ui/Button';

import QuizConfig from '@components/quiz/QuizConfig';
import QuizSummary from '@components/quiz/QuizSummary';

import type { JLPTLevel, Kanji } from '@/types';

const FlashcardQuiz = () => {
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [kanjiData, setKanjiData] = useState<Kanji[]>([]);
  const [currentKanji, setCurrentKanji] = useState<Kanji | null>(null);
  const [randomOrder, setRandomOrder] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const cardStartTimeRef = useRef(Date.now());

  const {
    selectedLevels,
    toggleLevel,

    maxAccuracyEnabled,
    setMaxAccuracyEnabled,
    maxAccuracy,
    setMaxAccuracy,

    maxCardsEnabled,
    setMaxCardsEnabled,
    maxCards,
    setMaxCards,

    maxPossibleCards,
    predictedCount,
    finalDeckSize,
  } = useQuizDeckConfig();

  useEffect(() => {
    if (currentKanji) {
      cardStartTimeRef.current = Date.now();
    }
  }, [currentKanji]);

  const handleQuizProgress = () => {
    if (!kanjiData.length || !currentKanji) return;

    const now = Date.now();
    const durationSeconds = Math.max(
      1,
      Math.floor((now - cardStartTimeRef.current) / 1000)
    );

    setSessionTime((t) => t + durationSeconds);

    recordResult(currentKanji.uid);

    recordDailyStudy({
      uid: currentKanji.uid,
      durationSeconds,
    });

    const nextIndex = currentKanjiIndex + 1;

    if (nextIndex >= kanjiData.length) {
      // Deck finished
      setQuizFinished(true);
    } else {
      setCurrentKanjiIndex(nextIndex);
      setCurrentKanji(kanjiData[nextIndex]);
    }
  };

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const saved = loadSession('flashcard');
    if (saved) {
      const restoredLevels: JLPTLevel[] =
        saved.selectedLevels ??
        (saved.selectedLevel ? [saved.selectedLevel] : ['5']);
      const fullData = getKanjiByLevels(restoredLevels);

      let reconstructedDeck = fullData;
      if (saved.deckOrder) {
        reconstructedDeck = saved.deckOrder
          .map((uid) => fullData.find((k) => k.uid === uid))
          .filter((kanji): kanji is Kanji => Boolean(kanji));
      }

      setRandomOrder(saved.randomOrder ?? false);
      setKanjiData(reconstructedDeck);
      setCurrentKanjiIndex(saved.currentIndex ?? 0);
      setCurrentKanji(reconstructedDeck[saved.currentIndex ?? 0] ?? null);

      setQuizStarted(saved.quizStarted ?? false);
    }

    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;

    if (!quizStarted) {
      const data = getKanjiByLevels(selectedLevels);
      setKanjiData(data);
      setCurrentKanjiIndex(0);
      setCurrentKanji(data[0] || null);
    }
  }, [selectedLevels, restored, quizStarted]);

  useEffect(() => {
    if (!currentKanji) return;

    saveSession('flashcard', {
      selectedLevels,
      currentIndex: currentKanjiIndex,
      randomOrder,
      deckOrder: kanjiData.map((k) => k.uid),
      quizStarted,
    });
  }, [
    selectedLevels,
    currentKanjiIndex,
    randomOrder,
    kanjiData,
    currentKanji,
    quizStarted,
  ]);

  useEffect(() => {
    if (maxCards > maxPossibleCards) {
      setMaxCards(maxPossibleCards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPossibleCards]);

  const startFreshQuiz = () => {
    clearSession('flashcard');

    const finalDeck = buildDeck({
      levels: selectedLevels,
      randomOrder,
      maxAccuracy: maxAccuracyEnabled ? maxAccuracy : null,
      maxCards: maxCardsEnabled ? maxCards : null,
    });

    setKanjiData(finalDeck);
    setCurrentKanjiIndex(0);
    setCurrentKanji(finalDeck[0] || null);
    setQuizStarted(true);
  };

  if (!restored) {
    return null;
  }

  if (!quizStarted) {
    return (
      <QuizConfig
        title="Configure Flashcard Session"
        selectedLevels={selectedLevels}
        toggleLevel={toggleLevel}
        onStart={() => {
          if (selectedLevels.length === 0) return;
          startFreshQuiz();
        }}
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={randomOrder}
            onChange={() => setRandomOrder((r) => !r)}
          />
          Random Order
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={maxAccuracyEnabled}
            onChange={() => setMaxAccuracyEnabled((v) => !v)}
          />
          Filter by Accuracy (seen)
        </label>

        {maxAccuracyEnabled && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">
              Max Accuracy: {maxAccuracy}%
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={maxAccuracy}
              onChange={(e) => setMaxAccuracy(Number(e.target.value))}
            />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={maxCardsEnabled}
            onChange={() => setMaxCardsEnabled((v) => !v)}
          />
          Limit Deck Size
        </label>

        {maxCardsEnabled && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">Max Cards: {maxCards}</span>

            <input
              type="range"
              min="1"
              max={maxPossibleCards}
              value={maxCards}
              onChange={(e) => setMaxCards(Number(e.target.value))}
            />
          </div>
        )}

        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Deck Preview
        </p>

        <div className="text-sm text-zinc-400 border-t border-white/10 pt-3 space-y-1">
          <p>Total cards (levels): {maxPossibleCards}</p>

          {maxAccuracyEnabled && <p>After accuracy filter: {predictedCount}</p>}

          {maxCardsEnabled && <p>Deck limit: {maxCards}</p>}

          <p className="font-semibold text-white">
            Final quiz size: {finalDeckSize}
          </p>
        </div>
      </QuizConfig>
    );
  }

  if (quizFinished) {
    return (
      <QuizSummary
        title="Flashcard Session Complete"
        total={kanjiData.length}
        correct={null}
        incorrect={null}
        time={sessionTime}
        onRestart={() => {
          setQuizStarted(false);
          setQuizFinished(false);
        }}
      />
    );
  }

  const safeKanji = getSafeKanji(currentKanji);

  return (
    <Card size="xl" className="overflow-hidden p-0">
      <div className="border-b border-zinc-800 bg-zinc-950/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
              Flashcard Session
            </p>

            <h1 className="text-2xl font-bold text-zinc-100">
              Kanji Flashcard Quiz
            </h1>
          </div>

          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => {
                setQuizStarted(false);
              }}
            >
              End
            </Button>

            <Button variant="primary" onClick={handleQuizProgress}>
              Next Card
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.05fr_0.95fr] lg:p-6">
        <section className="flex min-h-[420px] flex-col">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-400">
                Card {currentKanjiIndex + 1} / {kanjiData.length}
              </p>
            </div>

            <div className="w-full max-w-xs">
              <ProgressBar
                value={currentKanjiIndex + 1}
                max={kanjiData.length}
              />
            </div>
          </div>

          {safeKanji && (
            <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
              <span className="relative text-[8rem] font-bold leading-none tracking-wide text-zinc-100 sm:text-[10rem] lg:text-[12rem]">
                {safeKanji.literal}
              </span>
            </div>
          )}
        </section>

        {safeKanji && (
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-zinc-800 bg-[#0b0b0a] p-5">
              <p className="mb-4 border-b border-zinc-800 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Reading Reference
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <InfoBlock title="Kun-yomi" height="min-h-28">
                  {safeKanji.reading_meaning.rmgroup.reading
                    .filter((r) => r['@r_type'] === 'ja_kun')
                    .map((r) => r['#text'])
                    .join(', ') || 'None'}
                </InfoBlock>

                <InfoBlock title="On-yomi" height="min-h-28">
                  {safeKanji.reading_meaning.rmgroup.reading
                    .filter((r) => r['@r_type'] === 'ja_on')
                    .map((r) => r['#text'])
                    .join(', ') || 'None'}
                </InfoBlock>
              </div>
            </div>

            <InfoBlock title="Meanings" height="min-h-32">
              {safeKanji.reading_meaning.rmgroup.meaning?.join(', ') || 'None'}
            </InfoBlock>
          </aside>
        )}
      </div>
    </Card>
  );
};

export default FlashcardQuiz;
