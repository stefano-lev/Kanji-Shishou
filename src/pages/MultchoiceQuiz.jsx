/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from 'react';

import { kanjiByLevel } from '../data/kanjiData';

const MultchoiceQuiz = () => {
  const [kanjiData, setKanjiData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('5');
  const [currentKanji, setCurrentKanji] = useState(null);
  const [choices, setChoices] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [percentageCorrect, setPercentageCorrect] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const getKanjiByLevel = (level) => kanjiByLevel[level] || [];

  const generateChoices = (correctKanji, allKanji) => {
    const randomChoices = allKanji
      .filter((k) => k !== correctKanji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 7);

    randomChoices.push(correctKanji);
    randomChoices.sort(() => 0.5 - Math.random());
    setChoices(randomChoices);
  };

  const startQuiz = useCallback((data) => {
    setCurrentRound(0);
    setQuizCompleted(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setPercentageCorrect(0);
    setCurrentKanji(data[0]);
    generateChoices(data[0], data);
  }, []);

  useEffect(() => {
    const data = getKanjiByLevel(selectedLevel);
    setKanjiData(data);
    if (data.length > 0) startQuiz(data);
  }, [selectedLevel, startQuiz]);

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
      setIsCorrect(true);
      setCorrectCount((c) => c + 1);
      correct = true;
    } else {
      setIsCorrect(false);
      setIncorrectCount((c) => c + 1);
      reAddKanjiToPool(currentKanji);
    }

    const answered = currentRound + 1;
    setPercentageCorrect(
      Math.round(((correctCount + (correct ? 1 : 0)) / answered) * 100) || 0
    );

    setTimeout(() => {
      nextRound();
      setIsButtonDisabled(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          Multiple Choice Quiz
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2"
          >
            <option value="5">JLPT N5</option>
            <option value="4">JLPT N4</option>
            <option value="3">JLPT N3</option>
            <option value="2">JLPT N2</option>
            <option value="1">JLPT N1</option>
          </select>
        </div>

        <div className="text-center text-zinc-400 mb-4">
          <p>
            Correct: {correctCount} | Incorrect: {incorrectCount} | Total:{' '}
            {kanjiData.length}
          </p>
          <p>Accuracy: {percentageCorrect}%</p>
        </div>

        {quizCompleted ? (
          <div className="text-center mt-8">
            <h2 className="text-2xl font-semibold mb-2">Quiz Complete 🎉</h2>
            <p>You’ve finished this JLPT level.</p>
          </div>
        ) : (
          currentKanji && (
            <>
              <h2 className="text-xl text-center mb-4">
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {choices.map((choice, idx) => (
                  <button
                    key={idx}
                    disabled={isButtonDisabled}
                    onClick={() => handleAnswer(choice)}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 transition text-xl font-bold py-4 disabled:opacity-50"
                  >
                    {choice.literal}
                  </button>
                ))}
              </div>

              <div className="min-h-[2rem] flex items-center justify-center mt-6">
                {isCorrect !== null && (
                  <p
                    className={`text-xl font-bold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </p>
                )}
              </div>
            </>
          )
        )}
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

export default MultchoiceQuiz;
