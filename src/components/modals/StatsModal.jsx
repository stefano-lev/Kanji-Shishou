/* eslint-disable react/prop-types */
import { useState } from 'react';

import { kanjiByUid } from '@data/kanjiLookup';

import { getTotalStudyTimeSeconds } from '@utils/dailyStatsHandler';
import * as storageHandler from '@utils/localStorageHandler';
import { formatStudyTime } from '@utils/timeFormatter';
import { loadSRS } from '@utils/srsHandler';
import { loadStatsPreferences } from '@utils/statsPreferences';

import StatsPreferencesModal from '@components/modals/StatsPreferencesModal';

const StatsModal = ({
  onClose,
  initialLevel = 'all',
  initialMode = 'global',
}) => {
  const stats = storageHandler.loadStats() || {};
  const srsData = loadSRS();
  const [statsMode, setStatsMode] = useState(initialMode);
  const [prefs, setPrefs] = useState(loadStatsPreferences());
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const entries = Object.entries(stats);

  const getSource = (data) => {
    if (statsMode === 'srs') {
      return data.srs ?? { seen: 0, correct: 0, incorrect: 0 };
    }

    return data;
  };

  const totalSeen = entries.reduce((sum, [, d]) => sum + getSource(d).seen, 0);

  const totalCorrect = entries.reduce(
    (sum, [, d]) => sum + getSource(d).correct,
    0
  );

  const totalIncorrect = entries.reduce(
    (sum, [, d]) => sum + getSource(d).incorrect,
    0
  );

  const totalStudyTime = getTotalStudyTimeSeconds();

  const overallAccuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

  const [sortBy, setSortBy] = useState('uid');
  const [filterLevel, setFilterLevel] = useState(initialLevel);

  const studiedCount =
    statsMode === 'srs'
      ? entries.filter(([, d]) => (d.srs?.seen ?? 0) > 0).length
      : entries.length;

  const sortedEntries = [...entries].sort((a, b) => {
    const [, dataA] = a;
    const [, dataB] = b;

    const statA = getSource(dataA);
    const statB = getSource(dataB);

    switch (sortBy) {
      case 'seen':
        return statB.seen - statA.seen;

      case 'low-accuracy': {
        const accA = statA.correct / (statA.correct + statA.incorrect || 1);
        const accB = statB.correct / (statB.correct + statB.incorrect || 1);
        return accA - accB;
      }

      case 'high-accuracy': {
        const accA = statA.correct / (statA.correct + statA.incorrect || 1);
        const accB = statB.correct / (statB.correct + statB.incorrect || 1);
        return accB - accA;
      }

      case 'uid':
        return Number(a[0]) - Number(b[0]);

      default:
        return 0;
    }
  });

  const filteredEntries = sortedEntries.filter(([uid, data]) => {
    const source = getSource(data);

    if (statsMode === 'srs' && source.seen === 0) {
      return false;
    }

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
          {statsMode === 'srs'
            ? 'SRS Review Statistics'
            : 'All Study Statistics'}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowPrefsModal(true)}
            className="absolute -top-12 right-2 text-zinc-400 hover:text-white"
          >
            ⚙️
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-center">
          <StatBox label="Total Reviews" value={totalSeen} />
          <StatBox label="Accuracy" value={`${overallAccuracy}%`} />
          <StatBox label="Kanji Studied" value={studiedCount} />
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
            value={statsMode}
            onChange={(e) => setStatsMode(e.target.value)}
            className="bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white"
          >
            <option value="global">All Study</option>
            <option value="srs">SRS Only</option>
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
              const source = getSource(data);

              const accuracy =
                source.correct + source.incorrect > 0
                  ? Math.round(
                      (source.correct / (source.correct + source.incorrect)) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={uid}
                  className="relative grid grid-cols-[70px_1fr_160px] items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm overflow-hidden hover:bg-white/10 hover:scale-[1.01] transition"
                >
                  <div className="text-3xl font-bold text-white">
                    {kanjiByUid[uid]?.literal ?? '？'}
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl font-bold text-white/5">
                    {uid}
                  </div>

                  <div className="text-right text-zinc-400 tabular-nums">
                    <div>Seen: {source.seen}</div>
                    <div
                      className={
                        accuracy >= 85
                          ? 'text-green-400'
                          : accuracy >= 60
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      Accuracy: {accuracy}%
                    </div>
                    {statsMode === 'srs' && srsData[uid] && (
                      <div className="text-xs text-zinc-500 mt-1 flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          {prefs.showPhase && (
                            <span
                              className={`px-2 py-[2px] rounded text-[10px] font-semibold uppercase tracking-wide
                              ${
                                srsData[uid].phase === 'learning'
                                  ? 'bg-yellow-400/20 text-yellow-300'
                                  : 'bg-red-400/20 text-red-300'
                              }
                            `}
                            >
                              {srsData[uid].phase}
                            </span>
                          )}
                          {prefs.showInterval && (
                            <>
                              {srsData[uid].phase === 'learning'
                                ? `Step ${srsData[uid].step + 1}`
                                : `Interval ${srsData[uid].interval}d`}
                            </>
                          )}

                          {prefs.showEaseFactor && (
                            <> • EF {srsData[uid].easeFactor.toFixed(2)}</>
                          )}

                          {prefs.showRepetitions && (
                            <> • Rep {srsData[uid].repetitions}</>
                          )}
                        </div>

                        {prefs.showNextReview && (
                          <div>
                            Next{' '}
                            {new Date(
                              srsData[uid].nextReview
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
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
      {showPrefsModal && (
        <StatsPreferencesModal
          currentPrefs={prefs}
          onClose={(updatedPrefs) => {
            if (updatedPrefs) setPrefs(updatedPrefs);
            setShowPrefsModal(false);
          }}
        />
      )}
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
