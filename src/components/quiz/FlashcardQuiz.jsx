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

import Card from '@components/ui/Card';
import InfoBlock from '@components/ui/InfoBlock';
import ProgressBar from '@components/ui/ProgressBar';
import Button from '@components/ui/Button';

import QuizConfig from '@components/quiz/QuizConfig';
import QuizSummary from '@components/quiz/QuizSummary';

const FlashcardQuiz = () => {
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [kanjiData, setKanjiData] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);
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
      const restoredLevels = saved.selectedLevels ??
        saved.selectedLevel ?? ['5'];
      const fullData = getKanjiByLevels(restoredLevels);

      let reconstructedDeck = fullData;
      if (saved.deckOrder) {
        reconstructedDeck = saved.deckOrder
          .map((uid) => fullData.find((k) => k.uid === uid))
          .filter(Boolean);
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
      <Card className="max-w-md space-y-6 text-center">
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
      </Card>
    );
  }

  return (
    <Card className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Kanji Flashcard Quiz</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      <div className="text-center flex flex-col items-center space-y-2">
        <p className="text-lg font-bold text-center">
          Card {currentKanjiIndex + 1} / {kanjiData.length}
        </p>

        <ProgressBar
          value={currentKanjiIndex + 1}
          max={kanjiData.length}
        ></ProgressBar>
      </div>

      {currentKanji && (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-full max-w-md mx-auto bg-zinc-900/70 border border-white/10 rounded-2xl py-12 flex items-center justify-center shadow-inner">
            <span className="text-7xl sm:text-8xl font-bold tracking-wide">
              {currentKanji.literal}
            </span>
          </div>

          <div className="w-full max-w-md mx-auto space-y-3">
            <div className="grid grid-cols-2 gap-4 items-stretch">
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
              {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                'None'}
            </InfoBlock>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FlashcardQuiz;
