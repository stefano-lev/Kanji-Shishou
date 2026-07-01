import { useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

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
import Button from '@components/ui/Button';

import QuizConfig from '@components/quiz/QuizConfig';
import QuizSummary from '@components/quiz/QuizSummary';

import type { Kanji, MultichoiceSession } from '@/types';

const MultchoiceQuiz = () => {
  const [kanjiData, setKanjiData] = useState<Kanji[]>([]);

  const [currentKanji, setCurrentKanji] = useState<Kanji | null>(null);
  const [choices, setChoices] = useState<Kanji[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
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

  const questionStartRef = useRef<number | null>(null);
  const roundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sessionTime, setSessionTime] = useState(0);

  const generateChoices = useCallback(
    (correctKanji: Kanji, allKanji: Kanji[]) => {
      const randomChoices = allKanji
        .filter((k) => k !== correctKanji)
        .sort(() => 0.5 - Math.random())
        .slice(0, 7);

      randomChoices.push(correctKanji);
      randomChoices.sort(() => 0.5 - Math.random());
      setChoices(randomChoices);
    },
    []
  );

  const startQuiz = useCallback(
    (data: Kanji[]) => {
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
    (session: MultichoiceSession) => {
      const fullData = getKanjiByLevels(session.selectedLevels);

      const reconstructedPool = session.kanjiPool
        .map((uid) => fullData.find((k) => k.uid === uid))
        .filter((kanji): kanji is Kanji => Boolean(kanji));

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

  const reAddKanjiToPool = (kanji: Kanji) => {
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

  const handleAnswer = (choice: Kanji) => {
    if (isButtonDisabled || !currentKanji) return;
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
      (Date.now() - (questionStartRef.current ?? Date.now())) / 1000
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

  const safeKanji = getSafeKanji(currentKanji);

  return (
    <Card
      size="xl"
      padded={false}
      className="overflow-hidden lg:h-[calc(100dvh-7.5rem)]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-zinc-800 bg-zinc-950/60 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
                Recognition Drill
              </p>

              <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">
                Multiple Choice Quiz
              </h1>
            </div>

            <Button
              variant="danger"
              className="py-2"
              onClick={() => {
                clearSession('multichoice');
                setQuizStarted(false);
              }}
            >
              End
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:p-4">
          <section className="grid shrink-0 gap-2 sm:grid-cols-4">
            <QuizMetric label="Round" value={currentRound + 1} />
            <QuizMetric label="Correct" value={correctCount} />
            <QuizMetric label="Incorrect" value={incorrectCount} />
            <QuizMetric label="Accuracy" value={`${percentageCorrect}%`} />
          </section>

          <section className="shrink-0 rounded-lg border border-zinc-800 bg-[#0b0b0a] p-3">
            <div className="mb-3 flex flex-col gap-2 border-b border-zinc-800 pb-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
                  Identify the Kanji
                </p>
              </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              <QuizHintBlock title="Kun-yomi">
                {safeKanji.reading_meaning.rmgroup.reading
                  .filter((r) => r['@r_type'] === 'ja_kun')
                  .map((r) => r['#text'])
                  .join(', ') || 'None'}
              </QuizHintBlock>

              <QuizHintBlock title="On-yomi">
                {safeKanji.reading_meaning.rmgroup.reading
                  .filter((r) => r['@r_type'] === 'ja_on')
                  .map((r) => r['#text'])
                  .join(', ') || 'None'}
              </QuizHintBlock>

              <QuizHintBlock title="Meanings" className="lg:col-span-2">
                {safeKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                  'None'}
              </QuizHintBlock>
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-300">
                  Answer Choices
                </p>

                <p className="text-xs text-zinc-600">
                  Total cards in queue: {kanjiData.length}
                </p>
              </div>

              <div className="min-h-6 text-sm font-semibold">
                {isCorrect !== null ? (
                  <span
                    className={isCorrect ? 'text-emerald-300' : 'text-red-300'}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </span>
                ) : (
                  <span className="text-zinc-600">
                    Round {currentRound + 1} of {kanjiData.length}
                  </span>
                )}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              {choices.map((choice, idx) => {
                const safeChoice = getSafeKanji(choice);

                return (
                  <button
                    key={idx}
                    disabled={isButtonDisabled}
                    onClick={() => handleAnswer(choice)}
                    className="relative flex min-h-16 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 text-3xl font-bold text-zinc-100 transition hover:border-red-900/70 hover:bg-[#151512] disabled:opacity-50 sm:min-h-24 sm:text-5xl lg:min-h-0 lg:text-6xl"
                  >
                    <span className="relative">{safeChoice.literal}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
};

interface QuizMetricProps {
  label: string;
  value: string | number;
}

const QuizMetric = ({ label, value }: QuizMetricProps) => (
  <div className="border-l-2 border-red-900 bg-zinc-950 px-3 py-2">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600 sm:text-xs">
      {label}
    </p>

    <p className="mt-1 text-xl font-bold text-zinc-100 sm:text-2xl">{value}</p>
  </div>
);

interface QuizHintBlockProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const QuizHintBlock = ({
  title,
  children,
  className = '',
}: QuizHintBlockProps) => (
  <div
    className={`flex min-h-20 flex-col border-l-2 border-red-900 bg-zinc-950 px-4 py-3 ${className}`}
  >
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 sm:text-xs">
      {title}
    </p>

    <div className="flex flex-1 items-center text-sm leading-6 text-zinc-200 sm:text-base">
      {children}
    </div>
  </div>
);

export default MultchoiceQuiz;
