/* eslint-disable react/prop-types */
import { importAllData } from '@utils/localStorageHandler';
import { formatStudyTime } from '@utils/timeFormatter';

const getSnapshotSummary = (data) => {
  const stats = data.kanjiStats || {};
  const daily = data.kanji_daily_stats || {};

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

const SnapshotModal = ({ onClose }) => {
  const snapshots =
    JSON.parse(localStorage.getItem('kanji_snapshots') || '[]') || [];

  const handleRestore = (snapshot) => {
    const confirmed = confirm(
      'Restore this snapshot? This will overwrite current data.'
    );

    if (!confirmed) return;

    importAllData(snapshot.data);
    window.location.reload();
  };

  const handleExportSnapshot = (snapshot) => {
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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Snapshots</h2>

        {snapshots.length === 0 ? (
          <p className="text-center text-zinc-400">No snapshots yet.</p>
        ) : (
          <div className="space-y-3">
            {snapshots
              .slice()
              .reverse()
              .map((snap, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start hover:bg-white/10 transition"
                >
                  <div className="flex flex-col text-sm text-zinc-300">
                    <span className="font-medium">
                      {new Date(snap.date).toLocaleString()}
                    </span>

                    {(() => {
                      const summary = getSnapshotSummary(snap.data);

                      return (
                        <span className="text-xs text-zinc-400 mt-1">
                          {summary.totalSeen} reviews • {summary.accuracy}%
                          accuracy
                          <br />
                          {summary.kanjiCount} kanji •{' '}
                          {formatStudyTime(summary.totalStudyTime)}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(snap)}
                      className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded"
                    >
                      Restore
                    </button>

                    <button
                      onClick={() => handleExportSnapshot(snap)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
                    >
                      Export
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 hover:bg-red-500 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SnapshotModal;
