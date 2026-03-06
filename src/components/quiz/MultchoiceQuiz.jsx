import { useEffect, useState, useCallback, useRef } from 'react';

import Card from '../ui/Card';

import InfoBlock from '../ui/InfoBlock';

import Button from '../ui/Button';

import { getKanjiByLevels, buildDeck } from '../../utils/deckBuilder';

import QuizConfig from '../quiz/QuizConfig';

import QuizSummary from '../quiz/QuizSummary';

import { recordResult } from '../../utils/statsHandler';

import { recordDailyStudy } from '../../utils/dailyStatsHandler';

import {
  loadSession,
  saveSession,
  clearSession,
} from '../../utils/quizSessionHandler';

import useQuizDeckConfig from '../../hooks/useQuizDeckConfig';

const MultchoiceQuiz = () => {
  const [kanjiData, setKanjiData] = useState([]);

  const [currentKanji, setCurrentKanji] = useState(null);
  const [choices, setChoices] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [percentageCorrect, setPercentageCorrect] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [repeatIncorrect, setRepeatIncorrect] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

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

  const questionStartRef = useRef(null);
  const roundTimeoutRef = useRef(null);
  const [sessionTime, setSessionTime] = useState(0);

  const generateChoices = useCallback((correctKanji, allKanji) => {
    const randomChoices = allKanji
      .filter((k) => k !== correctKanji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 7);

    randomChoices.push(correctKanji);
    randomChoices.sort(() => 0.5 - Math.random());
    setChoices(randomChoices);
  }, []);

  const startQuiz = useCallback(
    (data) => {
      setCurrentRound(0);
      setQuizCompleted(false);
      setCorrectCount(0);
      setIncorrectCount(0);
      setPercentageCorrect(0);
      setCurrentKanji(data[0]);
      generateChoices(data[0], data);
    },
    [generateChoices]
  );

  const restoreSession = useCallback(
    (session) => {
      const fullData = getKanjiByLevels(session.selectedLevels);

      const reconstructedPool = session.kanjiPool
        .map((uid) => fullData.find((k) => k.uid === uid))
        .filter(Boolean);

      setRepeatIncorrect(session.repeatIncorrect ?? true);
      setKanjiData(reconstructedPool);
      setCurrentRound(session.currentRound);
      setCorrectCount(session.correctCount);
      setIncorrectCount(session.incorrectCount);
      setPercentageCorrect(session.percentageCorrect);
      setQuizCompleted(session.quizCompleted);
      const restoredKanji =
        reconstructedPool[session.currentRound] ?? reconstructedPool[0] ?? null;

      setCurrentKanji(restoredKanji);

      if (restoredKanji) {
        generateChoices(restoredKanji, reconstructedPool);
      }
    },
    [generateChoices]
  );

  useEffect(() => {
    const saved = loadSession('multichoice');

    if (saved) {
      restoreSession(saved);
      setQuizStarted(true);
    }
  }, [restoreSession]);

  useEffect(() => {
    if (!currentKanji) return;

    saveSession('multichoice', {
      selectedLevels,
      repeatIncorrect,
      kanjiPool: kanjiData.map((k) => k.uid),
      currentRound,
      correctCount,
      incorrectCount,
      percentageCorrect,
      quizCompleted,
    });
  }, [
    kanjiData,
    currentRound,
    correctCount,
    incorrectCount,
    percentageCorrect,
    quizCompleted,
    currentKanji,
    selectedLevels,
    repeatIncorrect,
  ]);

  useEffect(() => {
    if (maxCards > maxPossibleCards) {
      setMaxCards(maxPossibleCards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPossibleCards]);

  useEffect(() => {
    if (currentKanji && !quizCompleted) {
      questionStartRef.current = Date.now();
    }
  }, [currentKanji, quizCompleted]);

  useEffect(() => {
    return () => {
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
      }
    };
  }, []);

  const startFreshQuiz = () => {
    clearSession('multichoice');

    const deck = buildDeck({
      levels: selectedLevels,
      randomOrder: true,
      maxAccuracy: maxAccuracyEnabled ? maxAccuracy : null,
      maxCards: maxCardsEnabled ? maxCards : null,
    });

    setKanjiData(deck);

    if (deck.length > 0) {
      startQuiz(deck);
      setQuizStarted(true);
    }
  };

  const reAddKanjiToPool = (kanji) => {
    const index = Math.floor(Math.random() * kanjiData.length);
    const updated = [...kanjiData];
    updated.splice(index, 0, kanji);
    setKanjiData(updated);
  };

  const nextRound = () => {
    const nextIndex = currentRound + 1;
    if (nextIndex < kanjiData.length) {
      setCurrentRound(nextIndex);
      setCurrentKanji(kanjiData[nextIndex]);
      generateChoices(kanjiData[nextIndex], kanjiData);
      setIsCorrect(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleAnswer = (choice) => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);

    let correct = false;

    if (choice === currentKanji) {
      correct = true;
      setIsCorrect(true);
      setCorrectCount((c) => c + 1);
    } else {
      setIsCorrect(false);
    }

    if (!correct) {
      setIncorrectCount((c) => c + 1);

      if (repeatIncorrect) {
        reAddKanjiToPool(currentKanji);
      }
    }

    recordResult(currentKanji.uid, correct);

    const durationSeconds = Math.floor(
      (Date.now() - questionStartRef.current) / 1000
    );

    setSessionTime((t) => t + durationSeconds);

    recordDailyStudy({
      uid: currentKanji.uid,
      correct,
      durationSeconds,
    });

    const answered = currentRound + 1;
    setPercentageCorrect(
      Math.round(((correctCount + (correct ? 1 : 0)) / answered) * 100) || 0
    );

    roundTimeoutRef.current = setTimeout(() => {
      nextRound();
      setIsButtonDisabled(false);
    }, 500);
  };

  if (!quizStarted) {
    return (
      <QuizConfig
        title="Configure Multiple Choice Quiz"
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
            checked={repeatIncorrect}
            onChange={() => setRepeatIncorrect((v) => !v)}
          />
          Repeat Incorrect Cards
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

  if (quizCompleted) {
    return (
      <QuizSummary
        title="Quiz Complete"
        total={correctCount + incorrectCount}
        correct={correctCount}
        incorrect={incorrectCount}
        time={sessionTime}
        onRestart={() => {
          clearSession('multichoice');
          setQuizStarted(false);
        }}
      />
    );
  }

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Multiple Choice Quiz</h1>

        <Button
          variant="danger"
          onClick={() => {
            clearSession('multichoice');
            setQuizStarted(false);
          }}
        >
          End
        </Button>
      </div>

      <div className="text-sm font-semibold text-zinc-400 mb-2">
        <p>
          Correct: {correctCount} | Incorrect: {incorrectCount} | Total:{' '}
          {kanjiData.length}
        </p>
        <p>Accuracy: {percentageCorrect}%</p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-center mb-2">
          Round {currentRound + 1}
        </h2>

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
            {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') || 'None'}
          </InfoBlock>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 pt-2">
        <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto">
          {choices.map((choice, idx) => (
            <button
              key={idx}
              disabled={isButtonDisabled}
              onClick={() => handleAnswer(choice)}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 transition text-base font-semibold py-2 disabled:opacity-50"
            >
              {choice.literal}
            </button>
          ))}
        </div>

        <div className="min-h-[2rem] flex items-center justify-center mt-4">
          {isCorrect !== null && (
            <p
              className={`text-lg font-bold ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MultchoiceQuiz;
