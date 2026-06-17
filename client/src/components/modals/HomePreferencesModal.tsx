import { useState } from 'react';
import type { MouseEvent } from 'react';

import { saveHomePreferences } from '@utils/homePreferences';

import type { HomePreferences, ToggleProps } from '@/types';

interface HomePreferencesModalProps {
  onClose: (updatedPrefs?: HomePreferences) => void;
  currentPrefs: HomePreferences;
}

const HomePreferencesModal = ({
  onClose,
  currentPrefs,
}: HomePreferencesModalProps) => {
  const [prefs, setPrefs] = useState(currentPrefs);

  const toggle = (key: keyof HomePreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    saveHomePreferences(prefs);
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
        <div className="pointer-events-none absolute -right-4 -top-8 text-8xl font-black text-zinc-950">
          設
        </div>

        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
            Display Settings
          </p>

          <h2 className="text-2xl font-bold">Home Preferences</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Choose which dashboard sections appear on the home screen.
          </p>

          <div className="mt-6 space-y-3 border-y border-zinc-800 py-5 text-sm">
            <Toggle
              label="Show Overview Stats"
              value={prefs.showOverviewStats}
              onChange={() => toggle('showOverviewStats')}
            />
            <Toggle
              label="Show Calendar"
              value={prefs.showCalendar}
              onChange={() => toggle('showCalendar')}
            />
            <Toggle
              label="Show All-Time Stats"
              value={prefs.showAllTimeStats}
              onChange={() => toggle('showAllTimeStats')}
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

export default HomePreferencesModal;
