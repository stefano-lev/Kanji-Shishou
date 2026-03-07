/* eslint-disable react/prop-types */
import { useState } from 'react';

import { kanjiByUid } from '@data/kanjiLookup';

import { getTotalStudyTimeSeconds } from '@utils/dailyStatsHandler';
import * as storageHandler from '@utils/localStorageHandler';
import { formatStudyTime } from '@utils/timeFormatter';

const StatsModal = ({ onClose }) => {
  const stats = storageHandler.loadStats() || {};
  const entries = Object.entries(stats);

  const totalSeen = entries.reduce((sum, [, d]) => sum + d.seen, 0);
  const totalCorrect = entries.reduce((sum, [, d]) => sum + d.correct, 0);
  const totalIncorrect = entries.reduce((sum, [, d]) => sum + d.incorrect, 0);

  const totalStudyTime = getTotalStudyTimeSeconds();

  const overallAccuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

  const [sortBy, setSortBy] = useState('uid');
  const [filterLevel, setFilterLevel] = useState('all');

  const sortedEntries = [...entries].sort((a, b) => {
    const [, dataA] = a;
    const [, dataB] = b;

    switch (sortBy) {
      case 'seen':
        return dataB.seen - dataA.seen;

      case 'low-accuracy': {
        const accA = dataA.correct / (dataA.correct + dataA.incorrect || 1);
        const accB = dataB.correct / (dataB.correct + dataB.incorrect || 1);
        return accA - accB;
      }

      case 'high-accuracy': {
        const accA = dataA.correct / (dataA.correct + dataA.incorrect || 1);
        const accB = dataB.correct / (dataB.correct + dataB.incorrect || 1);
        return accB - accA;
      }

      case 'uid':
        return Number(a[0]) - Number(b[0]);

      default:
        return 0;
    }
  });

  const filteredEntries = sortedEntries.filter(([uid]) => {
    if (filterLevel === 'all') return true;
    return kanjiByUid[uid]?.misc.jlpt === filterLevel;
  });

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Study Statistics
        </h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <StatBox label="Total Reviews" value={totalSeen} />
          <StatBox label="Accuracy" value={`${overallAccuracy}%`} />
          <StatBox label="Kanji Studied" value={entries.length} />
          <StatBox label="Study Time" value={formatStudyTime(totalStudyTime)} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white"
          >
            <option value="low-accuracy">Lowest Accuracy</option>
            <option value="high-accuracy">Highest Accuracy</option>
            <option value="seen">Most Seen</option>
            <option value="uid">UID</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white"
          >
            <option value="all">All Levels</option>
            <option value="5">JLPT N5</option>
            <option value="4">JLPT N4</option>
            <option value="3">JLPT N3</option>
            <option value="2">JLPT N2</option>
            <option value="1">JLPT N1</option>
          </select>
        </div>

        {/* Stats List */}
        {filteredEntries.length === 0 ? (
          <p className="text-center text-zinc-400 mt-6">No data found.</p>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map(([uid, data]) => {
              const accuracy =
                data.correct + data.incorrect > 0
                  ? Math.round(
                      (data.correct / (data.correct + data.incorrect)) * 100
                    )
                  : 0;

              return (
                <div
                  key={uid}
                  className="relative grid grid-cols-[80px_1fr_120px] items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm overflow-hidden hover:bg-white/10 transition"
                >
                  <div className="text-3xl font-bold text-white">
                    {kanjiByUid[uid]?.literal ?? '？'}
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl font-bold text-white/5">
                    {uid}
                  </div>

                  <div className="text-right text-zinc-400 tabular-nums">
                    <div>Seen: {data.seen}</div>
                    <div>Accuracy: {accuracy}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-red-600 hover:bg-red-500 transition py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <div className="text-zinc-400 text-sm">{label}</div>
    <div className="text-white text-2xl font-bold">{value}</div>
  </div>
);

export default StatsModal;
