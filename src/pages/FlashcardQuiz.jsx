/* eslint-disable react/prop-types */

import { useEffect, useState, useRef } from 'react';

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
  const [selectedLevel, setSelectedLevel] = useState('5');
  const [randomOrder, setRandomOrder] = useState(false);

  const cardStartTimeRef = useRef(Date.now());

  useEffect(() => {
    if (currentKanji) {
      cardStartTimeRef.current = Date.now();
    }
  }, [currentKanji]);

  const getKanjiByLevel = (level) => kanjiByLevel[level] || [];

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
      correct: false,
      durationSeconds,
    });

    const nextIndex =
      currentKanjiIndex + 1 >= kanjiData.length ? 0 : currentKanjiIndex + 1;

    setCurrentKanjiIndex(nextIndex);
    setCurrentKanji(kanjiData[nextIndex]);
  };

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const saved = loadSession('flashcard');
    if (!saved) return;

    const fullData = getKanjiByLevel(saved.selectedLevel);

    let reconstructedDeck = fullData;

    if (saved.deckOrder) {
      reconstructedDeck = saved.deckOrder
        .map((uid) => fullData.find((k) => k.uid === uid))
        .filter(Boolean);
    }

    setSelectedLevel(saved.selectedLevel);
    setRandomOrder(saved.randomOrder ?? false);
    setKanjiData(reconstructedDeck);
    setCurrentKanjiIndex(saved.currentIndex);
    setCurrentKanji(reconstructedDeck[saved.currentIndex] || null);
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) return;

    const data = getKanjiByLevel(selectedLevel);
    setKanjiData(data);
    setCurrentKanjiIndex(0);
    setCurrentKanji(data[0] || null);
  }, [selectedLevel, restored]);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const saved = loadSession('flashcard');
    if (!saved) return;

    const fullData = getKanjiByLevel(saved.selectedLevel);

    let reconstructedDeck = fullData;

    if (saved.deckOrder) {
      reconstructedDeck = saved.deckOrder
        .map((uid) => fullData.find((k) => k.uid === uid))
        .filter(Boolean);
    }

    setSelectedLevel(saved.selectedLevel);
    setRandomOrder(saved.randomOrder ?? false);
    setKanjiData(reconstructedDeck);
    setCurrentKanjiIndex(saved.currentIndex);
    setCurrentKanji(reconstructedDeck[saved.currentIndex] || null);
  }, []);

  useEffect(() => {
    if (!currentKanji) return;

    saveSession('flashcard', {
      selectedLevel,
      currentIndex: currentKanjiIndex,
      randomOrder,
      deckOrder: kanjiData.map((k) => k.uid),
    });
  }, [selectedLevel, currentKanjiIndex, randomOrder, kanjiData, currentKanji]);

  const resetQuiz = () => {
    clearSession('flashcard');

    const data = getKanjiByLevel(selectedLevel);
    setKanjiData(data);
    setCurrentKanjiIndex(0);
    setCurrentKanji(data[0] || null);
    setRandomOrder(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          Kanji Flashcard Quiz
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4 items-center">
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setRandomOrder(false);
              setRestored(false);
            }}
            className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2"
          >
            <option value="5">JLPT N5</option>
            <option value="4">JLPT N4</option>
            <option value="3">JLPT N3</option>
            <option value="2">JLPT N2</option>
            <option value="1">JLPT N1</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={randomOrder}
              onChange={() => {
                setRandomOrder((prev) => {
                  const newValue = !prev;

                  if (newValue && kanjiData.length > 0) {
                    const seen = kanjiData.slice(0, currentKanjiIndex + 1);
                    const unseen = kanjiData.slice(currentKanjiIndex + 1);
                    const shuffledUnseen = shuffleArray(unseen);
                    setKanjiData([...seen, ...shuffledUnseen]);
                  }

                  return newValue;
                });
              }}
            />
            Random Order
          </label>

          <button
            onClick={handleQuizProgress}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 transition px-6 py-2 font-medium"
          >
            Next Card
          </button>

          <button
            onClick={resetQuiz}
            className="rounded-lg bg-red-600 hover:bg-red-500 transition px-4 py-2 font-medium"
          >
            Reset
          </button>
        </div>

        <p className="text-center text-zinc-400 mb-4">
          {currentKanjiIndex + 1} / {kanjiData.length}
        </p>

        {currentKanji && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-7xl font-bold py-10">
              {currentKanji.literal}
            </div>

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
        )}
      </div>
    </div>
  );
};

const InfoBlock = ({ title, children }) => (
  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center">
    <p className="text-zinc-400 mb-1">{title}</p>
    <p className="text-white">{children}</p>
  </div>
);

export default FlashcardQuiz;
