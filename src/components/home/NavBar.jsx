/* eslint-disable react/prop-types */

import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import StatsModal from '../modals/StatsModal';

const NavBar = () => {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-black/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3 py-4 text-xs sm:text-sm tracking-wide">
          <NavItem to="/" label="Home" />
          <NavItem to="/flashcard-quiz" label="Flashcards" />
          <NavItem to="/multchoice-quiz" label="Multiple Choice Quiz" />
          <NavItem to="/srs-review" label="SRS Review (Beta)" />
          <NavItem to="/kanji-dictionary" label="Dictionary" />
          <NavItem to="/stroke-order" label="Stroke Order (WIP)" />
          <button
            onClick={() => setShowStats(true)}
            className="text-zinc-400 hover:text-white transition"
          >
            Stats
          </button>
        </div>
      </nav>
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
};

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `transition-colors duration-300 ${
        isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
      }`
    }
  >
    {label}
  </NavLink>
);

export default NavBar;
