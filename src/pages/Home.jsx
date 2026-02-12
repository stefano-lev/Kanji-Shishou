/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-10 max-w-2xl w-full text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Kanji Shishou
        </h1>
        <h2 className="text-2xl text-zinc-400 mb-2">漢字師匠</h2>
        <p className="text-zinc-400 mb-10">
          Master kanji with focused, data-driven practice.
        </p>

        <div className="grid gap-4">
          <NavCard to="/flashcard-quiz" label="Flashcard Quiz" />
          <NavCard to="/multchoice-quiz" label="Multiple Choice Quiz" />
          <NavCard to="/kanji-dictionary" label="Kanji Dictionary" />
          <NavCard to="/stroke-order" label="Stroke Order Quiz (WIP)" />
        </div>
      </motion.div>
    </div>
  );
};

const NavCard = ({ to, label }) => (
  <Link
    to={to}
    className="block rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 py-4 text-lg font-medium tracking-wide"
  >
    {label}
  </Link>
);

export default Home;
