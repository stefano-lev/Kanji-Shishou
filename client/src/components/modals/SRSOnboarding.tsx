import { useState } from 'react';

import { saveSRSConfig } from '@utils/srsPreferences';

import type { JLPTLevel, SRSConfig } from '@/types';

type Intensity = 'light' | 'moderate' | 'intense';

interface SRSOnboardingProps {
  onComplete: (config: SRSConfig) => void;
}

const SRSOnboarding = ({ onComplete }: SRSOnboardingProps) => {
  const [level, setLevel] = useState<JLPTLevel>('5');
  const [intensity, setIntensity] = useState<Intensity>('moderate');

  const intensityMap: Record<
    Intensity,
    Pick<SRSConfig, 'newCardsPerDay' | 'maxReviewsPerDay'>
  > = {
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
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#11110f] p-8">
      <div className="relative space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
            First-Time Setup
          </p>

          <h2 className="text-2xl font-bold text-zinc-100">SRS Onboarding</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Choose where to begin and how many reviews you want Kanji Shishou to
            schedule each day.
          </p>
        </div>

        <div className="border-t border-zinc-800 pt-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Starting JLPT Level
          </p>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as JLPTLevel)}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-200 outline-none transition focus:border-red-900"
          >
            <option value="5">JLPT N5</option>
            <option value="4">JLPT N4</option>
            <option value="3">JLPT N3</option>
            <option value="2">JLPT N2</option>
            <option value="1">JLPT N1</option>
          </select>
        </div>

        <div className="border-t border-zinc-800 pt-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Daily Study Intensity
          </p>

          <div className="grid gap-3">
            <IntensityOption
              label="Light"
              description="5 new cards/day • up to 30 reviews"
              active={intensity === 'light'}
              onClick={() => setIntensity('light')}
            />

            <IntensityOption
              label="Moderate"
              description="10 new cards/day • up to 60 reviews"
              active={intensity === 'moderate'}
              onClick={() => setIntensity('moderate')}
            />

            <IntensityOption
              label="Intense"
              description="20 new cards/day • up to 120 reviews"
              active={intensity === 'intense'}
              onClick={() => setIntensity('intense')}
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full rounded-md border border-red-800 bg-red-900 px-6 py-3 font-semibold text-red-50 transition hover:bg-red-800"
        >
          Begin Studying
        </button>
      </div>
    </div>
  );
};

interface IntensityOptionProps {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

const IntensityOption = ({
  label,
  description,
  active,
  onClick,
}: IntensityOptionProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'border px-4 py-3 text-left transition',
      active
        ? 'border-red-800 bg-red-950/40'
        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900',
    ].join(' ')}
  >
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-zinc-100">{label}</span>
      <span
        className={[
          'h-3 w-3 border',
          active ? 'border-red-500 bg-red-500' : 'border-zinc-700',
        ].join(' ')}
      />
    </div>

    <p className="mt-1 text-sm text-zinc-500">{description}</p>
  </button>
);

export default SRSOnboarding;
