/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllStats } from '../utils/statsHandler';
import { getDailyStats } from '../utils/dailyStatsHandler';
import { useState } from 'react';

import { loadHomePreferences } from '../utils/homePreferences';
import HomePreferencesModal from './HomePreferencesModal';

function calculateStreak(dates) {
  let streak = 0;
  let current = new Date();

  while (true) {
    const iso = current.toISOString().split('T')[0];
    if (dates.includes(iso)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getLastNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days.reverse();
}

const Home = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [prefs, setPrefs] = useState(loadHomePreferences());
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  const dailyStats = getDailyStats();
  const uniqueDates = Object.keys(dailyStats);
  const streak = calculateStreak(uniqueDates);
  const last30Days = getLastNDays(30);

  const dayData = selectedDay ? dailyStats[selectedDay] : null;

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-10"
      >
        {/* Header */}
        <div className="relative text-center space-y-2 p-8">
          <button
            onClick={() => setShowPrefsModal(true)}
            className="absolute right-4 top-4 text-zinc-400 hover:text-white transition"
          >
            ⚙️
          </button>

          <h1 className="text-5xl font-bold tracking-tight">Kanji Shishou</h1>
          <h2 className="text-2xl text-zinc-400 mb-2">漢字師匠</h2>
          <p className="text-zinc-400 text-lg">
            Master kanji with focused, data-driven practice.
          </p>
        </div>

        {/* Stats */}
        {prefs.showOverviewStats && (
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Current Streak"
              value={`${streak} day${streak !== 1 ? 's' : ''}`}
              accent="text-orange-400"
            />
            <StatCard
              title="Days Studied"
              value={uniqueDates.length}
              accent="text-green-400"
            />
            <StatCard
              title="Today"
              value={dailyStats[todayISO] ? 'Studied' : 'No Study History'}
              accent="text-blue-400"
            />
          </div>
        )}

        {/* Component Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <NavCard to="/flashcard-quiz" label="Flashcard Quiz" />
          <NavCard to="/multchoice-quiz" label="Multiple Choice Quiz" />
          <NavCard to="/kanji-dictionary" label="Kanji Dictionary" />
          <NavCard to="/stroke-order" label="Stroke Order Quiz (WIP)" />
        </div>

        {/* Calendar */}
        {prefs.showCalendar && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Last 30 Days</h2>

            <div className="grid grid-cols-7 gap-2">
              {last30Days.map((day) => {
                const studied = dailyStats[day];
                const isToday = day === todayISO;
                const isSelected = day === selectedDay;
                const dayNumber = day.split('-')[2];

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`
                    aspect-square rounded-lg text-xs flex items-center justify-center
                    cursor-pointer transition relative
                    ${studied ? 'bg-green-500/80 hover:bg-green-400' : 'bg-zinc-800'}
                    ${isToday ? 'ring-2 ring-blue-400' : ''}
                    ${isSelected ? 'border border-white' : ''}
                  `}
                  >
                    {dayNumber}
                  </div>
                );
              })}
            </div>

            {dayData && (
              <div className="mt-6 p-5 bg-zinc-900 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-2">{selectedDay}</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-300">
                  <div>
                    Time Studied: {Math.floor(dayData.studyTimeSeconds / 60)}{' '}
                    min
                  </div>
                  <div>Unique Kanji: {dayData.uniqueKanji.length}</div>
                  <div>Total Seen: {dayData.totalSeen}</div>
                  <div>
                    Accuracy:{' '}
                    {Math.round((dayData.correct / dayData.totalSeen) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showPrefsModal && (
          <HomePreferencesModal
            currentPrefs={prefs}
            onClose={(updatedPrefs) => {
              if (updatedPrefs) setPrefs(updatedPrefs);
              setShowPrefsModal(false);
            }}
          />
        )}

        {prefs.showAllTimeStats && <AllTimeStats />}
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, accent }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
    <p className="text-zinc-400 text-sm mb-2">{title}</p>
    <p className={`text-2xl font-bold ${accent}`}>{value}</p>
  </div>
);

const NavCard = ({ to, label }) => (
  <Link
    to={to}
    className="block rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 p-6 text-lg font-medium text-center"
  >
    {label}
  </Link>
);

const AllTimeStats = () => {
  const stats = getAllStats();
  const entries = Object.values(stats);

  const totalSeen = entries.reduce((sum, d) => sum + d.seen, 0);
  const totalCorrect = entries.reduce((sum, d) => sum + d.correct, 0);
  const totalIncorrect = entries.reduce((sum, d) => sum + d.incorrect, 0);

  const accuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">All-Time Statistics</h2>

      <div className="grid md:grid-cols-4 gap-4 text-center">
        <StatCard
          title="Total Reviews"
          value={totalSeen}
          accent="text-purple-400"
        />
        <StatCard
          title="Correct"
          value={totalCorrect}
          accent="text-green-400"
        />
        <StatCard
          title="Incorrect"
          value={totalIncorrect}
          accent="text-red-400"
        />
        <StatCard
          title="Accuracy"
          value={`${accuracy}%`}
          accent="text-blue-400"
        />
      </div>
    </div>
  );
};

export default Home;
