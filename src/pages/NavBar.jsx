/* eslint-disable react/prop-types */

import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto flex justify-center gap-6 py-4 text-sm tracking-wide">
        <NavItem to="/" label="Home" />
        <NavItem to="/flashcard-quiz" label="Flashcards" />
        <NavItem to="/multchoice-quiz" label="Multiple Choice" />
        <NavItem to="/kanji-dictionary" label="Dictionary" />
        <NavItem to="/stroke-order" label="Stroke Order (WIP)" />
      </div>
    </nav>
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
