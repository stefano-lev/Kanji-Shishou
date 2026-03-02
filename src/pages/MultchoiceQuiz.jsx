/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useRef } from 'react';

import Card from './ui/Card';

import { kanjiByLevel } from '../data/kanjiData';

import { recordResult } from '../utils/statsHandler';

import { recordDailyStudy } from '../utils/dailyStatsHandler';

import {
  loadSession,
  saveSession,
  clearSession,
} from '../utils/quizSessionHandler';

const MultchoiceQuiz = () => {
  const [kanjiData, setKanjiData] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState(['5']);

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

  const questionStartRef = useRef(null);

  const getKanjiByLevels = (levels) => {
    return levels.flatMap((level) => kanjiByLevel[level] || []);
  };

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

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

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const restoreSession = useCallback(
    (session) => {
      const fullData = getKanjiByLevels(session.selectedLevels);

      const reconstructedPool = session.kanjiPool
        .map((uid) => fullData.find((k) => k.uid === uid))
        .filter(Boolean);

      setSelectedLevels(session.selectedLevels);
      setRepeatIncorrect(session.repeatIncorrect ?? true);
      setKanjiData(reconstructedPool);
      setCurrentRound(session.currentRound);
      setCorrectCount(session.correctCount);
      setIncorrectCount(session.incorrectCount);
      setPercentageCorrect(session.percentageCorrect);
      setQuizCompleted(session.quizCompleted);
      const restoredKanji = reconstructedPool[session.currentRound];

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
    if (currentKanji && !quizCompleted) {
      questionStartRef.current = Date.now();
    }
  }, [currentKanji, quizCompleted]);

  const startFreshQuiz = () => {
    clearSession('multichoice');

    const combined = getKanjiByLevels(selectedLevels);
    const shuffled = shuffleArray(combined);

    setKanjiData(shuffled);

    if (shuffled.length > 0) {
      startQuiz(shuffled);
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

    recordDailyStudy({
      uid: currentKanji.uid,
      correct,
      durationSeconds,
    });

    const answered = currentRound + 1;
    setPercentageCorrect(
      Math.round(((correctCount + (correct ? 1 : 0)) / answered) * 100) || 0
    );

    setTimeout(() => {
      nextRound();
      setIsButtonDisabled(false);
    }, 500);
  };

  if (!quizStarted) {
    return (
      <Card className="max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Configure Quiz</h1>

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

        <div className="text-left">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={repeatIncorrect}
              onChange={() => setRepeatIncorrect((r) => !r)}
            />
            Repeat incorrect answers
          </label>
        </div>

        <button
          onClick={() => {
            if (selectedLevels.length === 0) return;
            startFreshQuiz();
            setQuizStarted(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 rounded-lg px-6 py-2 mt-4"
        >
          Start Quiz
        </button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Multiple Choice Quiz</h1>

        <button
          onClick={() => {
            clearSession('multichoice');
            setQuizStarted(false);
          }}
          className="bg-red-600 hover:bg-red-500 rounded-lg px-3 py-1 text-sm"
        >
          End
        </button>
      </div>

      <div className="text-sm font-semibold text-zinc-400 mb-2">
        <p>
          Correct: {correctCount} | Incorrect: {incorrectCount} | Total:{' '}
          {kanjiData.length}
        </p>
        <p>Accuracy: {percentageCorrect}%</p>
      </div>

      {/* Main content (scrollable) */}
      <div className="mb-4">
        {quizCompleted ? (
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold mb-2">Quiz Complete 🎉</h2>
            <p>You’ve finished this JLPT level.</p>
          </div>
        ) : (
          currentKanji && (
            <>
              <h2 className="text-lg font-bold text-center mb-2">
                Round {currentRound + 1}
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
            </>
          )
        )}
      </div>

      {/* Footer */}
      {!quizCompleted && currentKanji && (
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
      )}
    </Card>
  );
};

const InfoBlock = ({ title, children }) => (
  <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
    <p className="text-zinc-400 mb-1">{title}</p>
    <p>{children}</p>
  </div>
);

export default MultchoiceQuiz;
