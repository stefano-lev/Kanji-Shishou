import type { MouseEvent } from 'react';

import { importAllData } from '@utils/localStorageHandler';
import { formatStudyTime } from '@utils/timeFormatter';

import type { BackupData, Snapshot } from '@/types';

const getSnapshotSummary = (data: BackupData) => {
  const stats = data.kanjiStats ?? {};
  const daily = data.kanji_daily_stats ?? {};

  const entries = Object.values(stats);

  const totalSeen = entries.reduce((sum, d) => sum + (d.seen || 0), 0);
  const totalCorrect = entries.reduce((sum, d) => sum + (d.correct || 0), 0);
  const totalIncorrect = entries.reduce(
    (sum, d) => sum + (d.incorrect || 0),
    0
  );

  const accuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

  const totalStudyTime = Object.values(daily).reduce(
    (sum, day) => sum + (day.studyTimeSeconds || 0),
    0
  );

  return {
    totalSeen,
    accuracy,
    kanjiCount: Object.keys(stats).length,
    totalStudyTime,
  };
};

interface SnapshotModalProps {
  onClose: () => void;
}

const SnapshotModal = ({ onClose }: SnapshotModalProps) => {
  const snapshots = (JSON.parse(
    localStorage.getItem('kanji_snapshots') || '[]'
  ) || []) as Snapshot[];

  const handleRestore = (snapshot: Snapshot) => {
    const confirmed = confirm(
      'Restore this snapshot? This will overwrite current data.'
    );

    if (!confirmed) return;

    importAllData(snapshot.data);
    window.location.reload();
  };

  const handleExportSnapshot = (snapshot: Snapshot) => {
    const blob = new Blob([JSON.stringify(snapshot.data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot-${snapshot.date}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
      onClick={(e: MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-[#11110f] text-zinc-100">
        <div className="pointer-events-none absolute -right-4 -top-10 text-9xl font-black text-zinc-950">
          記
        </div>

        <div className="relative border-b border-zinc-800 p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
            Local Recovery
          </p>

          <h2 className="text-2xl font-bold">Snapshots</h2>

          <p className="mt-2 text-sm text-zinc-500">
            Restore or export automatically saved local backup points.
          </p>
        </div>

        <div className="relative max-h-[52vh] overflow-y-auto p-6">
          {snapshots.length === 0 ? (
            <div className="border-l-2 border-red-900 bg-zinc-950 p-5 text-sm text-zinc-500">
              No snapshots yet.
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots
                .slice()
                .reverse()
                .map((snap, i) => {
                  const summary = getSnapshotSummary(snap.data);

                  return (
                    <div
                      key={i}
                      className="border border-zinc-800 bg-zinc-950 p-4 transition hover:border-red-900/70 hover:bg-[#151512]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-100">
                            {new Date(snap.date).toLocaleString()}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-zinc-500">
                            {summary.totalSeen} reviews • {summary.accuracy}%
                            accuracy
                            <br />
                            {summary.kanjiCount} kanji •{' '}
                            {formatStudyTime(summary.totalStudyTime)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore(snap)}
                            className="rounded-md border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm font-semibold text-red-200 transition hover:border-red-800 hover:bg-red-950"
                          >
                            Restore
                          </button>

                          <button
                            onClick={() => handleExportSnapshot(snap)}
                            className="rounded-md border border-zinc-800 bg-[#0b0b0a] px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
                          >
                            Export
                          </button>
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
    </div>
  );
};

export default SnapshotModal;
