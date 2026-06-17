import type { MouseEvent } from 'react';

import { markDemoPromptSeen, startDemoMode } from '@utils/demoMode';

interface DemoOnboardingModalProps {
  onClose: () => void;
}

const DemoOnboardingModal = ({ onClose }: DemoOnboardingModalProps) => {
  const handleStartDemo = () => {
    startDemoMode();
    window.location.reload();
  };

  const handleSkip = () => {
    markDemoPromptSeen();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
      onClick={(e: MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && handleSkip()
      }
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 bg-[#11110f] p-6 text-zinc-100">
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
            First Visit
          </p>

          <h2 className="text-2xl font-bold">
            Try Kanji Shishou with demo data?
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Demo mode fills the app with realistic study history, SRS progress,
            recent activity, favorites, and statistics so you can explore the
            dashboard without manually completing quizzes first.
          </p>

          <div className="mt-6 grid gap-3 border-y border-zinc-800 py-5 sm:grid-cols-3">
            <DemoMetric label="Study Days" value="40+" />
            <DemoMetric label="Tracked Reviews" value="2k+" />
            <DemoMetric label="JLPT Spread" value="N5–N1" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSkip}
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              Start Blank
            </button>

            <button
              onClick={handleStartDemo}
              className="flex-1 rounded-md border border-red-800 bg-red-900 px-4 py-3 font-semibold text-red-50 transition hover:bg-red-800"
            >
              Enable Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DemoMetricProps {
  label: string;
  value: string;
}

const DemoMetric = ({ label, value }: DemoMetricProps) => (
  <div className="border-l-2 border-red-900 bg-zinc-950 p-4">
    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
      {label}
    </div>

    <div className="mt-1 text-xl font-bold text-zinc-100">{value}</div>
  </div>
);

export default DemoOnboardingModal;
