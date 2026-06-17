import { useState } from 'react';
import type { MouseEvent } from 'react';

import { saveStatsPreferences } from '@utils/statsPreferences';

import type { StatsPreferences, ToggleProps } from '@/types';

interface StatsPreferencesModalProps {
  onClose: (updatedPrefs?: StatsPreferences) => void;
  currentPrefs: StatsPreferences;
}

const StatsPreferencesModal = ({
  onClose,
  currentPrefs,
}: StatsPreferencesModalProps) => {
  const [prefs, setPrefs] = useState(currentPrefs);

  const toggle = (key: keyof StatsPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    saveStatsPreferences(prefs);
    onClose(prefs);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
      onClick={(e: MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-[#11110f] p-6 text-zinc-100">
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
            Statistics Display
          </p>

          <h2 className="text-2xl font-bold">Stats Preferences</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Control which SRS details appear in the statistics panel.
          </p>

          <div className="mt-6 space-y-3 border-y border-zinc-800 py-5 text-sm">
            <Toggle
              label="[SRS] Show Phase Tag"
              value={prefs.showPhase}
              onChange={() => toggle('showPhase')}
            />

            <Toggle
              label="[SRS] Show Interval / Step"
              value={prefs.showInterval}
              onChange={() => toggle('showInterval')}
            />

            <Toggle
              label="[SRS] Show Ease Factor"
              value={prefs.showEaseFactor}
              onChange={() => toggle('showEaseFactor')}
            />

            <Toggle
              label="[SRS] Show Repetitions"
              value={prefs.showRepetitions}
              onChange={() => toggle('showRepetitions')}
            />

            <Toggle
              label="[SRS] Show Next Review"
              value={prefs.showNextReview}
              onChange={() => toggle('showNextReview')}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onClose()}
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex-1 rounded-md border border-red-800 bg-red-900 px-4 py-3 font-semibold text-red-50 transition hover:bg-red-800"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, value, onChange }: ToggleProps) => (
  <div className="flex items-center justify-between gap-4 border-l-2 border-red-900 bg-zinc-950 px-4 py-3">
    <span className="text-zinc-300">{label}</span>

    <button
      onClick={onChange}
      className={[
        'relative h-6 w-12 border transition',
        value ? 'border-red-800 bg-red-950/70' : 'border-zinc-800 bg-[#0b0b0a]',
      ].join(' ')}
      aria-pressed={value}
    >
      <div
        className={[
          'absolute top-1/2 h-4 w-4 -translate-y-1/2 bg-zinc-200 transition',
          value ? 'left-6' : 'left-1',
        ].join(' ')}
      />
    </button>
  </div>
);

export default StatsPreferencesModal;
