/* eslint-disable react/prop-types */

import { useState } from 'react';
import { saveHomePreferences } from '../utils/homePreferences';

const HomePreferencesModal = ({ onClose, currentPrefs }) => {
  const [prefs, setPrefs] = useState(currentPrefs);

  const toggle = (key) => {
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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-center">Home Preferences</h2>

        <div className="space-y-4 text-sm">
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

export default HomePreferencesModal;
