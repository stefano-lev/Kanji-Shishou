import { endDemoMode } from '@utils/demoMode';

const DemoModeBanner = () => {
  const handleEndDemo = () => {
    const confirmed = window.confirm(
      'End demo mode? This will clear the seeded demo progress and return Kanji Shishou to a blank state.'
    );

    if (!confirmed) return;

    endDemoMode();
    window.location.reload();
  };

  return (
    <div className="rounded-xl border border-red-900/70 bg-red-950/30 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-300/80">
            Demo Mode Active
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            You are viewing seeded study data. You can explore the app freely or
            clear the demo state whenever you want.
          </p>
        </div>

        <button
          onClick={handleEndDemo}
          className="rounded-md border border-red-800 bg-red-900 px-4 py-3 text-sm font-semibold text-red-50 transition hover:bg-red-800"
        >
          End Demo
        </button>
      </div>
    </div>
  );
};

export default DemoModeBanner;
