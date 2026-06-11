/* eslint-disable react/prop-types */
import { useState } from 'react';
import { saveStatsPreferences } from '@utils/statsPreferences';

const StatsPreferencesModal = ({ onClose, currentPrefs }) => {
  const [prefs, setPrefs] = useState(currentPrefs);

  const toggle = (key) => {
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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-center">
          Stats Preferences
        </h2>

        <div className="space-y-4 text-sm">
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

        <button
          onClick={handleSave}
          className="mt-6 w-full rounded-lg bg-blue-600 hover:bg-blue-500 transition py-2"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const Toggle = ({ label, value, onChange }) => (
  <div className="flex justify-between items-center">
    <span>{label}</span>

    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition ${
        value ? 'bg-green-500' : 'bg-zinc-700'
      }`}
    >
      <div
        className={`h-6 w-6 bg-white rounded-full transform transition ${
          value ? 'translate-x-6' : ''
        }`}
      />
    </button>
  </div>
);

export default StatsPreferencesModal;
