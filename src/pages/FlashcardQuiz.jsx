/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';

import { kanjiByLevel } from '../data/kanjiData';

const FlashcardQuiz = () => {
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [kanjiData, setKanjiData] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('5');
  //const [isLoading, setIsLoading] = useState(false);

  const getKanjiByLevel = (level) => kanjiByLevel[level] || [];

  useEffect(() => {
    const data = getKanjiByLevel(selectedLevel);
    setKanjiData(data);
    setCurrentKanjiIndex(0);
    setCurrentKanji(data[0] || null);
  }, [selectedLevel]);

  const handleQuizProgress = () => {
    const nextIndex = (currentKanjiIndex + 1) % kanjiData.length;
    setCurrentKanjiIndex(nextIndex);
    setCurrentKanji(kanjiData[nextIndex]);
  };

  //if (isLoading) {
  //return <div>Loading kanji data...</div>;
  //}

  return (
    <div className="min-h-screen flex justify-center items-center px-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          Kanji Flashcard Quiz
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

          <button
            onClick={handleQuizProgress}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 transition px-6 py-2 font-medium"
          >
            Next Card
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
