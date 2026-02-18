/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo, useCallback } from 'react';

import * as storageHandler from '../utils/localStorageHandler';

import { kanjiByLevel, allKanji } from '../data/kanjiData';

import { recordSeen, getAllStats } from '../utils/statsHandler';

function normalizeStrokeCount(stroke) {
  if (Array.isArray(stroke)) {
    return Number(stroke[0]);
  }
  return Number(stroke);
}

function normalizeToArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractReadings(kanji) {
  const readings = kanji.reading_meaning?.rmgroup?.reading ?? [];

  const on = [];
  const kun = [];
  const other = [];

  readings.forEach((r) => {
    if (r['@r_type'] === 'ja_on') on.push(r['#text']);
    else if (r['@r_type'] === 'ja_kun') kun.push(r['#text']);
    else other.push(r);
  });

  return { on, kun, other };
}

function extractRadical(kanji) {
  const rad = kanji.radical?.rad_value;

  if (Array.isArray(rad)) return rad[0]['#text'];
  if (rad?.['#text']) return rad['#text'];
  return null;
}

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-zinc-400">{label}</p>
      <p className="font-medium">{children}</p>
    </div>
  );
}

const KanjiGrid = React.memo(function KanjiGrid({
  kanjiData,
  sortKey,
  onSelect,
}) {
  console.log('Grid rendered');

  function getInfoboxValue(kanji, sortKey) {
    switch (sortKey) {
      case 'accuracy':
        return kanji._accuracy != null
          ? `${Math.round(kanji._accuracy * 100)}%`
          : null;

      case 'seen':
        return kanji._stat?.seen ?? 0;

      case 'stroke':
        return normalizeStrokeCount(kanji.misc?.stroke_count);

      case 'freq':
        return kanji.misc?.freq ?? null;

      case 'jlpt':
        return kanji.misc?.jlpt ?? null;

      case 'lastSeen':
        return kanji._stat?.lastSeen
          ? new Date(kanji._stat.lastSeen).toLocaleDateString()
          : null;

      default:
        return null;
    }
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-5xl mx-auto px-8">
      {kanjiData.map((kanji) => {
        const infobox = getInfoboxValue(kanji, sortKey);

        return (
          <button
            key={kanji.uid}
            onClick={() => onSelect(kanji)}
            className="relative h-24 rounded-xl bg-white/5 border border-white/10 text-2xl font-bold hover:bg-white/10"
          >
            {kanji.literal}

            <span className="absolute bottom-2 right-3 text-xs text-zinc-400">
              {'N' + kanji.uid}
            </span>

            {infobox != null && (
              <span className="absolute top-2 right-2 text-xs bg-white/10 px-2 py-0.5 rounded-md text-zinc-300">
                {infobox}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

const KanjiDictionary = () => {
  const [selectedLevel, setSelectedLevel] = useState('0');
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortKey, setSortKey] = useState('none');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const getKanjiByLevel = (level) => {
    if (level === '0') return allKanji;
    return kanjiByLevel[level] || [];
  };

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const allStats = useMemo(() => getAllStats(), []);

  const kanjiData = useMemo(() => {
    let data = getKanjiByLevel(selectedLevel);

    if (filterFavorites) {
      data = data.filter((k) => favoriteSet.has(k.uid));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      data = data.filter((k) => {
        const literalMatch = k.literal.includes(query);

        const meanings = k.reading_meaning?.rmgroup?.meaning ?? [];
        const meaningMatch = meanings.some((m) =>
          m.toLowerCase().includes(query)
        );

        const readings = k.reading_meaning?.rmgroup?.reading ?? [];
        const readingMatch = readings.some((r) =>
          r['#text'].toLowerCase().includes(query)
        );

        return literalMatch || meaningMatch || readingMatch;
      });
    }

    return data;
  }, [selectedLevel, filterFavorites, favoriteSet, searchQuery]);

  const sortedKanjiData = useMemo(() => {
    if (sortKey === 'none') return kanjiData;

    const withStats = kanjiData.map((k) => {
      const stat = allStats[k.uid] ?? {
        seen: 0,
        correct: 0,
        incorrect: 0,
        lastSeen: null,
      };

      const accuracy = stat.seen > 0 ? stat.correct / stat.seen : 0;

      return {
        ...k,
        _stat: stat,
        _accuracy: accuracy,
      };
    });

    withStats.sort((a, b) => {
      let valA, valB;

      switch (sortKey) {
        case 'accuracy':
          valA = a._accuracy;
          valB = b._accuracy;
          break;
        case 'seen':
          valA = a._stat.seen;
          valB = b._stat.seen;
          break;
        case 'stroke':
          valA = normalizeStrokeCount(a.misc.stroke_count);
          valB = normalizeStrokeCount(b.misc.stroke_count);
          break;
        case 'freq':
          valA = Number(a.misc.freq ?? 9999);
          valB = Number(b.misc.freq ?? 9999);
          break;
        case 'jlpt':
          valA = Number(a.misc.jlpt ?? 0);
          valB = Number(b.misc.jlpt ?? 0);
          break;
        case 'lastSeen':
          valA = new Date(a._stat.lastSeen ?? 0);
          valB = new Date(b._stat.lastSeen ?? 0);
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return withStats;
  }, [kanjiData, sortKey, sortDirection, allStats]);

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
    <div className="min-h-[100svh] px-6 py-24 text-white">
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

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2"
        >
          <option value="none">Sort: Default</option>
          <option value="accuracy">Accuracy</option>
          <option value="seen">Times Seen</option>
          <option value="stroke">Stroke Count</option>
          <option value="freq">Frequency</option>
          <option value="jlpt">JLPT</option>
          <option value="lastSeen">Last Seen</option>
        </select>

        <button
          onClick={() =>
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
          }
          className="px-3 py-2 rounded-lg bg-white/10"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>

        <input
          type="text"
          placeholder="Search kanji, meaning, or reading..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 w-72"
        />

        <button
          onClick={() => setFilterFavorites((f) => !f)}
          className={`text-2xl transition ${
            filterFavorites ? 'text-red-400' : 'text-zinc-400'
          }`}
        >
          ❤︎⁠
        </button>
      </div>

      <KanjiGrid
        kanjiData={sortedKanjiData}
        sortKey={sortKey}
        onSelect={handleSelectKanji}
      />

      {selectedKanji && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedKanji(null)
          }
        >
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 w-[500px] max-h-[80vh] overflow-y-auto">
            {/* HEADER */}
            <div className="text-center mb-6">
              <h2 className="text-6xl font-bold">{selectedKanji.literal}</h2>

              <p className="mt-3 text-zinc-300 text-lg">
                {selectedKanji.reading_meaning.rmgroup.meaning?.join(', ')}
              </p>
            </div>

            {/* CORE INFO GRID */}
            <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
              <InfoRow label="Strokes">
                {normalizeStrokeCount(selectedKanji.misc.stroke_count)}
              </InfoRow>

              <InfoRow label="JLPT">N{selectedKanji.misc.jlpt ?? '-'}</InfoRow>

              <InfoRow label="Frequency">
                {selectedKanji.misc.freq ?? '-'}
              </InfoRow>

              <InfoRow label="Grade">{selectedKanji.misc.grade ?? '-'}</InfoRow>

              <InfoRow label="Radical">{extractRadical(selectedKanji)}</InfoRow>
            </div>

            {/* READINGS */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">
                Readings
              </h3>

              {(() => {
                const { on, kun } = extractReadings(selectedKanji);

                return (
                  <div className="space-y-2 text-sm">
                    {on.length > 0 && (
                      <p>
                        <span className="text-zinc-400">On:</span>{' '}
                        {on.join(', ')}
                      </p>
                    )}
                    {kun.length > 0 && (
                      <p>
                        <span className="text-zinc-400">Kun:</span>{' '}
                        {kun.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* NANORI */}
            {normalizeToArray(selectedKanji.reading_meaning?.nanori).length >
              0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">
                  Name Readings (Nanori)
                </h3>
                <p className="text-sm">
                  {normalizeToArray(selectedKanji.reading_meaning?.nanori).join(
                    ', '
                  )}
                </p>
              </div>
            )}

            {/* DICTIONARY REFERENCES */}
            {selectedKanji.dic_number?.dic_ref && (
              <details className="mt-6 border-t border-white/10 pt-4 text-sm">
                <summary className="cursor-pointer text-zinc-400 hover:text-white">
                  Dictionary References
                </summary>
                <div className="mt-2 space-y-1">
                  {(Array.isArray(selectedKanji.dic_number.dic_ref)
                    ? selectedKanji.dic_number.dic_ref
                    : [selectedKanji.dic_number.dic_ref]
                  ).map((ref, i) => (
                    <p key={i}>
                      {ref['@dr_type']}: {ref['#text']}
                    </p>
                  ))}
                </div>
              </details>
            )}

            {/* BUTTONS */}
            <div className="flex justify-center gap-6 mt-6">
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
