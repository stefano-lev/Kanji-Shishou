import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import StatsModal from '@components/modals/StatsModal';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/flashcard-quiz', label: 'Flashcards' },
  { to: '/multchoice-quiz', label: 'Multiple Choice' },
  { to: '/srs-review', label: 'SRS Review' },
  { to: '/kanji-dictionary', label: 'Dictionary' },
];

const NavBar = () => {
  const [showStats, setShowStats] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-[#0d0d0c]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-3 py-2 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="group flex min-w-0 items-baseline gap-2"
          >
            <span className="truncate text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">
              Kanji Shishou
            </span>

            <span className="hidden text-sm font-medium text-zinc-500 group-hover:text-zinc-400 xs:inline">
              漢字師匠
            </span>
          </NavLink>

          <div className="hidden items-center gap-2 text-sm font-medium lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}

            <button
              onClick={() => setShowStats(true)}
              className="rounded-md border border-zinc-800 px-3 py-2 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
            >
              Stats
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-800 bg-[#0d0d0c] px-3 py-3 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  onClick={closeMenu}
                />
              ))}

              <button
                onClick={() => {
                  setShowStats(true);
                  closeMenu();
                }}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-left text-sm font-semibold text-zinc-300 transition hover:border-red-900/70 hover:text-red-200"
              >
                Stats
              </button>
            </div>
          </div>
        )}
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

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

const MobileNavItem = ({ to, label, onClick }: MobileNavItemProps) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      [
        'rounded-md border px-3 py-3 text-sm font-semibold transition',
        isActive
          ? 'border-red-900/70 bg-red-950/30 text-red-100'
          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900',
      ].join(' ')
    }
  >
    {label}
  </NavLink>
);

export default NavBar;
