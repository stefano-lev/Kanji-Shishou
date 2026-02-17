/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo, useCallback } from 'react';

import * as storageHandler from '../utils/localStorageHandler';

import { kanjiByLevel, allKanji } from '../data/kanjiData';

import { recordSeen } from '../utils/statsHandler';

const KanjiGrid = React.memo(function KanjiGrid({ kanjiData, onSelect }) {
  console.log('Grid rendered');

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-5xl mx-auto px-8">
      {kanjiData.map((kanji) => (
        <button
          key={kanji.uid}
          onClick={() => onSelect(kanji)}
          className="relative h-24 rounded-xl bg-white/5 border border-white/10 text-2xl font-bold hover:bg-white/10"
        >
          {kanji.literal}
          <span className="absolute bottom-2 right-3 text-xs text-zinc-400">
            {'N' + kanji.uid}
          </span>
        </button>
      ))}
    </div>
  );
});

const KanjiDictionary = () => {
  const [selectedLevel, setSelectedLevel] = useState('0');
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filterFavorites, setFilterFavorites] = useState(false);

  const getKanjiByLevel = (level) => {
    if (level === '0') return allKanji;
    return kanjiByLevel[level] || [];
  };

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const kanjiData = useMemo(() => {
    let data = getKanjiByLevel(selectedLevel);

    if (filterFavorites) {
      return data.filter((k) => favoriteSet.has(k.uid));
    }

    return data;
  }, [selectedLevel, filterFavorites, favoriteSet]);

  useEffect(() => {
    setFavorites(storageHandler.getFavorites() || []);
  }, []);

  const toggleFavorite = (kanji) => {
    const updated = favorites.includes(kanji.uid)
      ? favorites.filter((uid) => uid !== kanji.uid)
      : [...favorites, kanji.uid];

    setFavorites(updated);
    storageHandler.saveFavorites(updated);
  };

  const handleSelectKanji = useCallback((kanji) => {
    setSelectedKanji(kanji);
    recordSeen(kanji.uid);
  }, []);

  return (
    <div className="min-h-screen px-6 py-24 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white">
      <h1 className="text-4xl font-bold text-center mb-6">Kanji Dictionary</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2"
        >
          <option value="0">All Levels</option>
          <option value="5">JLPT N5</option>
          <option value="4">JLPT N4</option>
          <option value="3">JLPT N3</option>
          <option value="2">JLPT N2</option>
          <option value="1">JLPT N1</option>
        </select>

        <button
          onClick={() => setFilterFavorites((f) => !f)}
          className={`text-2xl transition ${
            filterFavorites ? 'text-yellow-400' : 'text-zinc-400'
          }`}
        >
          ★
        </button>
      </div>

      <KanjiGrid kanjiData={kanjiData} onSelect={handleSelectKanji} />

      {selectedKanji && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedKanji(null)
          }
        >
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-80 text-center">
            <h2 className="text-4xl mb-2">{selectedKanji.literal}</h2>
            <p>ID: {selectedKanji.id}</p>
            <p>Strokes: {selectedKanji.misc.stroke_count}</p>
            <p>Frequency: {selectedKanji.misc.freq}</p>

            <p className="mt-2 text-sm text-zinc-400">
              {selectedKanji.reading_meaning.rmgroup.meaning?.join(', ')}
            </p>

            <div className="flex justify-center gap-6 mt-4">
              <button
                onClick={() => toggleFavorite(selectedKanji)}
                className="text-2xl"
              >
                {favorites.includes(selectedKanji.uid) ? '❤️' : '🖤'}
              </button>

              <button
                onClick={() => setSelectedKanji(null)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanjiDictionary;
