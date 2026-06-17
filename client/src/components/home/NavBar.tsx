import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import StatsModal from '@components/modals/StatsModal';

const NavBar = () => {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-[#0d0d0c]/95">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <NavLink to="/" className="group flex items-baseline gap-3">
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              Kanji Shishou
            </span>
            <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-400">
              漢字師匠
            </span>
          </NavLink>

          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <NavItem to="/" label="Home" />
            <NavItem to="/flashcard-quiz" label="Flashcards" />
            <NavItem to="/multchoice-quiz" label="Multiple Choice" />
            <NavItem to="/srs-review" label="SRS Review" />
            <NavItem to="/kanji-dictionary" label="Dictionary" />
            {/* <NavItem to="/stroke-order" label="Stroke Order" /> */}

            <button
              onClick={() => setShowStats(true)}
              className="rounded-md border border-zinc-800 px-3 py-2 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
            >
              Stats
            </button>
          </div>
        </div>
      </nav>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
};

interface NavItemProps {
  to: string;
  label: string;
}

const NavItem = ({ to, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        'rounded-md border px-3 py-2 transition',
        isActive
          ? 'border-red-900/70 bg-red-950/30 text-red-100'
          : 'border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100',
      ].join(' ')
    }
  >
    {label}
  </NavLink>
);

export default NavBar;
