import { useEffect, useState, useRef } from 'react';

import Card from './ui/Card';

import InfoBlock from './ui/InfoBlock';

import ProgressBar from './ui/ProgressBar';

import Button from './ui/Button';

import { kanjiByLevel } from '../data/kanjiData';

import { recordSeen } from '../utils/statsHandler';

import { recordDailyStudy } from '../utils/dailyStatsHandler';

import {
  loadSession,
  saveSession,
  clearSession,
} from '../utils/quizSessionHandler';

const FlashcardQuiz = () => {
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [kanjiData, setKanjiData] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState(['5']);
  const [randomOrder, setRandomOrder] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const cardStartTimeRef = useRef(Date.now());

  useEffect(() => {
    if (currentKanji) {
      cardStartTimeRef.current = Date.now();
    }
  }, [currentKanji]);

  const getKanjiByLevels = (levels) => {
    // Sort levels descending:
    const sortedLevels = [...levels].sort((a, b) => Number(b) - Number(a));

    return sortedLevels.flatMap((level) => {
      const kanji = kanjiByLevel[level] || [];
      // Sort by UID
      return [...kanji].sort((a, b) =>
        a.uid.localeCompare(b.uid, undefined, { numeric: true })
      );
    });
  };

  const handleQuizProgress = () => {
    if (!kanjiData.length || !currentKanji) return;

    const now = Date.now();
    const durationSeconds = Math.max(
      1,
      Math.floor((now - cardStartTimeRef.current) / 1000)
    );

    recordSeen(currentKanji.uid);

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

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const saved = loadSession('flashcard');
    if (!saved) return;

    const restoredLevels = saved.selectedLevels ?? saved.selectedLevel ?? ['5'];
    const fullData = getKanjiByLevels(restoredLevels);

    let reconstructedDeck = fullData;
    if (saved.deckOrder) {
      reconstructedDeck = saved.deckOrder
        .map((uid) => fullData.find((k) => k.uid === uid))
        .filter(Boolean);
    }

    setSelectedLevels(restoredLevels);
    setRandomOrder(saved.randomOrder ?? false);
    setKanjiData(reconstructedDeck);
    setCurrentKanjiIndex(saved.currentIndex ?? 0);
    setCurrentKanji(reconstructedDeck[saved.currentIndex ?? 0] ?? null);

    setQuizStarted(saved.quizStarted ?? false);

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

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

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

  const startFreshQuiz = () => {
    clearSession('flashcard');

    const sortedDeck = getKanjiByLevels(selectedLevels);
    const finalDeck = randomOrder ? shuffleArray(sortedDeck) : sortedDeck;

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
      <Card className="max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Configure Flashcard Session</h1>

        <div className="text-left">
          <p className="mb-2 font-semibold">Select JLPT Levels:</p>
          {['5', '4', '3', '2', '1'].map((level) => (
            <label key={level} className="block mb-1">
              <input
                type="checkbox"
                checked={selectedLevels.includes(level)}
                onChange={() => toggleLevel(level)}
                className="mr-2"
              />
              JLPT N{level}
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={randomOrder}
            onChange={() => setRandomOrder((r) => !r)}
          />
          Random Order
        </label>

        <Button
          variant="primary"
          onClick={() => {
            if (selectedLevels.length === 0) return;

            startFreshQuiz();
            setQuizStarted(true);
          }}
        >
          Start Quiz
        </Button>
      </Card>
    );
  }
  if (quizFinished) {
    return (
      <Card className="max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">Quiz Complete!</h1>
        <p className="text-lg">
          You have finished all {kanjiData.length} cards.
        </p>

        <Button
          variant="primary"
          onClick={() => {
            // Reset quiz states to show pre-quiz config
            setQuizStarted(false);
            setQuizFinished(false);
            setCurrentKanjiIndex(0);
            setCurrentKanji(kanjiData[0] || null);
          }}
        >
          Return to Quiz Setup
        </Button>
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
