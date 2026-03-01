/* eslint-disable react/prop-types */

import { useState } from 'react';
import { saveSRSConfig } from '../utils/srsPreferences';

const SRSOnboarding = ({ onComplete }) => {
  const [level, setLevel] = useState('5');
  const [intensity, setIntensity] = useState('moderate');

  const intensityMap = {
    light: { newCardsPerDay: 5, maxReviewsPerDay: 30 },
    moderate: { newCardsPerDay: 10, maxReviewsPerDay: 60 },
    intense: { newCardsPerDay: 20, maxReviewsPerDay: 120 },
  };

  const handleStart = () => {
    const config = {
      unlockedLevels: [level],
      ...intensityMap[intensity],
    };

    saveSRSConfig(config);
    onComplete(config);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
      <h2 className="text-2xl font-bold text-center">SRS Onboarding</h2>

      <div>
        <p className="mb-2 font-semibold">Starting JLPT Level</p>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-zinc-800 p-2 rounded w-full"
        >
          <option value="5">JLPT N5</option>
          <option value="4">JLPT N4</option>
          <option value="3">JLPT N3</option>
          <option value="2">JLPT N2</option>
          <option value="1">JLPT N1</option>
        </select>
      </div>

      <div>
        <p className="mb-2 font-semibold">Daily Study Intensity</p>
        <div className="space-y-2">
          <div>
            <label>
              <input
                type="radio"
                value="light"
                checked={intensity === 'light'}
                onChange={() => setIntensity('light')}
              />{' '}
              Light (5 new/day)
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="moderate"
                checked={intensity === 'moderate'}
                onChange={() => setIntensity('moderate')}
              />{' '}
              Moderate (10 new/day)
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                value="intense"
                checked={intensity === 'intense'}
                onChange={() => setIntensity('intense')}
              />{' '}
              Intense (20 new/day)
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-6 py-3 w-full"
      >
        Begin Studying
      </button>
    </div>
  );
};

export default SRSOnboarding;
