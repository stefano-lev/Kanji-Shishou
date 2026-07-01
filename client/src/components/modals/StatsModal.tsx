import { useState } from 'react';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';

import { kanjiByUid } from '@data/kanjiLookup';

import { getTotalStudyTimeSeconds } from '@utils/dailyStatsHandler';
import {
  createAppBackupPayload,
  restoreAppBackupPayload,
} from '@utils/backupPayload';
import { loadStats } from '@utils/localStorageHandler';
import { formatStudyTime } from '@utils/timeFormatter';
import { loadSRS } from '@utils/srsHandler';
import { loadStatsPreferences } from '@utils/statsPreferences';

import StatsPreferencesModal from '@components/modals/StatsPreferencesModal';
import SnapshotModal from '@components/modals/SnapshotModal';
import CloudBackupModal from '@components/modals/CloudBackupModal';

import type { JLPTLevel, KanjiStat, SRSStat } from '@/types';

type StatsMode = 'global' | 'srs';
type StatsSort = 'uid' | 'seen' | 'low-accuracy' | 'high-accuracy';
type StatsLevelFilter = JLPTLevel | 'all';

interface StatsModalProps {
  onClose: () => void;
  initialLevel?: StatsLevelFilter;
  initialMode?: StatsMode;
}

const StatsModal = ({
  onClose,
  initialLevel = 'all',
  initialMode = 'global',
}: StatsModalProps) => {
  const stats = loadStats() || {};
  const srsData = loadSRS();

  const [statsMode, setStatsMode] = useState<StatsMode>(initialMode);
  const [prefs, setPrefs] = useState(loadStatsPreferences());
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showCloudBackup, setShowCloudBackup] = useState(false);

  const entries = Object.entries(stats);

  const handleExport = () => {
    const payload = createAppBackupPayload();

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanji-shishou-backup-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;

        if (typeof result !== 'string') {
          throw new Error('Backup file could not be read as text.');
        }

        const payload = JSON.parse(result);

        restoreAppBackupPayload(payload);

        alert('Backup restored! Reloading...');
        window.location.reload();
      } catch {
        alert('Invalid backup file.');
      }
    };

    reader.readAsText(file);
  };

  const getSource = (data: KanjiStat): KanjiStat | SRSStat => {
    if (statsMode === 'srs') {
      return data.srs ?? { seen: 0, correct: 0, incorrect: 0, lastSeen: null };
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

  const [sortBy, setSortBy] = useState<StatsSort>('uid');
  const [filterLevel, setFilterLevel] =
    useState<StatsLevelFilter>(initialLevel);

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

    return String(kanjiByUid[uid]?.misc.jlpt) === filterLevel;
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-2 sm:p-4"
      onClick={(e: MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#11110f] text-zinc-100 sm:max-h-[85vh] sm:rounded-xl">
        <div className="relative border-b border-zinc-800 p-4 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
                Study Ledger
              </p>

              <h2 className="text-2xl font-bold">
                {statsMode === 'srs'
                  ? 'SRS Review Statistics'
                  : 'All Study Statistics'}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Review your kanji history, export local data, or sync progress
                through cloud backup.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ToolbarButton
                label="Cloud Backup"
                onClick={() => setShowCloudBackup(true)}
              >
                ☁
              </ToolbarButton>

              <ToolbarButton label="Export Backup" onClick={handleExport}>
                ↓
              </ToolbarButton>

              <label
                title="Import Backup"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-lg font-semibold text-zinc-400 transition hover:border-red-900/70 hover:text-red-200"
              >
                ↑
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <ToolbarButton
                label="View Snapshots"
                onClick={() => setShowSnapshots(true)}
              >
                ▣
              </ToolbarButton>

              <ToolbarButton
                label="Preferences"
                onClick={() => setShowPrefsModal(true)}
              >
                ⚙
              </ToolbarButton>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
            <StatBox label="Total Reviews" value={totalSeen} />
            <StatBox label="Accuracy" value={`${overallAccuracy}%`} />
            <StatBox label="Kanji Studied" value={studiedCount} />
            <StatBox
              label="Study Time"
              value={formatStudyTime(totalStudyTime)}
            />
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StatsSort)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-red-900"
            >
              <option value="low-accuracy">Lowest Accuracy</option>
              <option value="high-accuracy">Highest Accuracy</option>
              <option value="seen">Most Seen</option>
              <option value="uid">UID</option>
            </select>

            <select
              value={statsMode}
              onChange={(e) => setStatsMode(e.target.value as StatsMode)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-red-900"
            >
              <option value="global">All Study</option>
              <option value="srs">SRS Only</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) =>
                setFilterLevel(e.target.value as StatsLevelFilter)
              }
              className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-red-900"
            >
              <option value="all">All Levels</option>
              <option value="5">JLPT N5</option>
              <option value="4">JLPT N4</option>
              <option value="3">JLPT N3</option>
              <option value="2">JLPT N2</option>
              <option value="1">JLPT N1</option>
            </select>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="border-l-2 border-red-900 bg-zinc-950 p-5 text-sm text-zinc-500">
              No data found.
            </div>
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

                const accuracyClass =
                  accuracy >= 85
                    ? 'text-emerald-300'
                    : accuracy >= 60
                      ? 'text-amber-300'
                      : 'text-red-300';

                return (
                  <div
                    key={uid}
                    className="relative overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-red-900/70 hover:bg-[#151512]"
                  >
                    {/* <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-6xl font-black text-zinc-900/70">
                      {uid}
                    </div> */}

                    <div className="relative grid grid-cols-[48px_1fr] gap-3 sm:grid-cols-[64px_1fr_auto] sm:items-center sm:gap-4">
                      <div className="text-4xl font-bold text-zinc-100">
                        {kanjiByUid[uid]?.literal ?? '？'}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                          Kanji UID
                        </p>

                        <p className="font-mono text-sm text-zinc-400">
                          N{uid}
                        </p>

                        {statsMode === 'srs' && srsData[uid] && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                            {prefs.showPhase && (
                              <span
                                className={[
                                  'rounded border px-2 py-0.5 font-semibold uppercase tracking-wide',
                                  srsData[uid].phase === 'learning'
                                    ? 'border-amber-900 bg-amber-950/40 text-amber-200'
                                    : 'border-red-900 bg-red-950/40 text-red-200',
                                ].join(' ')}
                              >
                                {srsData[uid].phase}
                              </span>
                            )}

                            {prefs.showInterval && (
                              <span>
                                {srsData[uid].phase === 'learning'
                                  ? `Step ${srsData[uid].step + 1}`
                                  : `Interval ${srsData[uid].interval}d`}
                              </span>
                            )}

                            {prefs.showEaseFactor && (
                              <span>
                                EF {srsData[uid].easeFactor.toFixed(2)}
                              </span>
                            )}

                            {prefs.showRepetitions && (
                              <span>Rep {srsData[uid].repetitions}</span>
                            )}

                            {prefs.showNextReview && (
                              <span>
                                Next{' '}
                                {new Date(
                                  srsData[uid].nextReview
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 border-t border-zinc-800 pt-3 text-left tabular-nums sm:col-span-1 sm:border-t-0 sm:pt-0 sm:text-right">
                        <div className="text-sm text-zinc-500">
                          Seen:{' '}
                          <span className="font-semibold text-zinc-200">
                            {source.seen}
                          </span>
                        </div>

                        <div
                          className={`text-sm font-semibold ${accuracyClass}`}
                        >
                          {accuracy}% accuracy
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative border-t border-zinc-800 bg-zinc-950 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-md border border-red-800 bg-red-900 px-4 py-3 font-semibold text-red-50 transition hover:bg-red-800"
          >
            Close
          </button>
        </div>
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

      {showSnapshots && (
        <SnapshotModal onClose={() => setShowSnapshots(false)} />
      )}

      {showCloudBackup && (
        <CloudBackupModal onClose={() => setShowCloudBackup(false)} />
      )}
    </div>
  );
};

interface ToolbarButtonProps {
  label: string;
  children: ReactNode;
  onClick: () => void;
}

const ToolbarButton = ({ label, children, onClick }: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    title={label}
    className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-lg font-semibold text-zinc-400 transition hover:border-red-900/70 hover:text-red-200"
  >
    {children}
  </button>
);

interface StatBoxProps {
  label: string;
  value: ReactNode;
}

const StatBox = ({ label, value }: StatBoxProps) => (
  <div className="border-l-2 border-red-900 bg-zinc-950 p-4">
    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
      {label}
    </div>

    <div className="mt-2 text-2xl font-bold text-zinc-100">{value}</div>
  </div>
);

export default StatsModal;
