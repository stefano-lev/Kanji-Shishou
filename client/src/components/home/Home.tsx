import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { formatStudyTime } from '@utils/timeFormatter';
import { getTotalStudyTimeSeconds } from '@utils/dailyStatsHandler';
import { getAllStats } from '@utils/statsHandler';
import { getDailyStats } from '@utils/dailyStatsHandler';
import { loadHomePreferences } from '@utils/homePreferences';
import { saveSnapshot } from '@utils/localStorageHandler';

import Card from '@components/ui/Card';

import HomePreferencesModal from '@components/modals/HomePreferencesModal';

function calculateStreak(dates: string[]) {
  let streak = 0;
  const current = new Date();

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

function getLastNDays(n: number) {
  const days: string[] = [];

  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  return days.reverse();
}

const Home = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [prefs, setPrefs] = useState(loadHomePreferences());
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  const dailyStats = getDailyStats();
  const uniqueDates = Object.keys(dailyStats);
  const streak = calculateStreak(uniqueDates);
  const last14Days = getLastNDays(14);

  const dayData = selectedDay ? dailyStats[selectedDay] : null;
  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const last = localStorage.getItem('lastSnapshot');
    const now = Date.now();

    if (!last || now - Number(last) > 7 * 24 * 60 * 60 * 1000) {
      saveSnapshot();
      localStorage.setItem('lastSnapshot', String(now));
    }
  }, []);

  return (
    <Card
      size="full"
      padded={false}
      className="border-0 bg-transparent shadow-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#11110f] p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute bottom-[-2.5rem] right-8 select-none text-[11rem] font-black leading-none text-zinc-950/80 sm:text-[14rem]">
            習
          </div>

          <button
            onClick={() => setShowPrefsModal(true)}
            className="absolute right-5 top-5 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-100"
            title="Home Preferences"
          >
            ⚙
          </button>

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-6 h-1 w-16 bg-red-900" />

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Japanese Kanji Study Utility
              </p>

              <h1 className="text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
                Kanji Shishou
              </h1>

              <h2 className="mt-3 text-3xl font-semibold tracking-wide text-zinc-500">
                漢字師匠
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Focused kanji practice built around quizzes, spaced repetition,
                personal study statistics, and dictionary-driven review.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/srs-review"
                  className="rounded-md bg-red-900 px-5 py-3 text-center font-semibold text-red-50 transition hover:bg-red-800"
                >
                  Start SRS Review
                </Link>

                <Link
                  to="/kanji-dictionary"
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-5 py-3 text-center font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-900"
                >
                  Open Dictionary
                </Link>
              </div>
            </div>

            {prefs.showOverviewStats && (
              <div className="rounded-lg border border-zinc-800 bg-[#0b0b0a] p-5">
                <p className="mb-4 border-b border-zinc-800 pb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Today&apos;s Status
                </p>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <HeroMetric
                    label="Current Streak"
                    value={`${streak} day${streak !== 1 ? 's' : ''}`}
                  />
                  <HeroMetric label="Days Studied" value={uniqueDates.length} />
                  <HeroMetric
                    label="Today"
                    value={dailyStats[todayISO] ? 'Studied' : 'No Study Yet'}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-zinc-800 bg-[#11110f] p-6">
            <SectionHeader
              eyebrow="Practice Modes"
              title="Study Tools"
              description="Choose a focused study mode based on how you want to review today."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <NavCard
                to="/flashcard-quiz"
                title="Flashcard Quiz"
                jp="暗記"
                description="Review kanji cards by JLPT level and personal filters."
              />
              <NavCard
                to="/multchoice-quiz"
                title="Multiple Choice"
                jp="選択"
                description="Test recognition with randomized answer choices."
              />
              <NavCard
                to="/kanji-dictionary"
                title="Kanji Dictionary"
                jp="辞書"
                description="Search readings, meanings, references, and stroke data."
              />
              <NavCard
                to="/srs-review"
                title="SRS Review"
                jp="復習"
                description="Review due cards with spaced repetition scheduling."
                badge="Beta"
              />
            </div>
          </div>

          {prefs.showCalendar && (
            <CalendarPanel
              last14Days={last14Days}
              todayISO={todayISO}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              dailyStats={dailyStats}
              dayData={dayData}
            />
          )}
        </section>

        {prefs.showAllTimeStats && <AllTimeStats />}

        {showPrefsModal && (
          <HomePreferencesModal
            currentPrefs={prefs}
            onClose={(updatedPrefs) => {
              if (updatedPrefs) setPrefs(updatedPrefs);
              setShowPrefsModal(false);
            }}
          />
        )}
      </motion.div>
    </Card>
  );
};

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

const SectionHeader = ({ eyebrow, title, description }: SectionHeaderProps) => (
  <div className="mb-5">
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
      {eyebrow}
    </p>
    <h2 className="text-2xl font-bold text-zinc-100">{title}</h2>
    <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
  </div>
);

interface HeroMetricProps {
  label: string;
  value: ReactNode;
}

const HeroMetric = ({ label, value }: HeroMetricProps) => (
  <div className="border-l-2 border-red-900 bg-zinc-950 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
  </div>
);

interface StatCardProps {
  title: string;
  value: ReactNode;
  accent: string;
}

const StatCard = ({ title, value, accent }: StatCardProps) => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
      {title}
    </p>
    <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
  </div>
);

interface NavCardProps {
  to: string;
  title: string;
  jp: string;
  description: string;
  badge?: string;
}

const NavCard = ({ to, title, jp, description, badge }: NavCardProps) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-5 transition hover:border-red-900/70 hover:bg-[#151512]"
  >
    <div className="absolute right-4 top-3 text-4xl font-bold text-zinc-900 transition group-hover:text-red-950/50">
      {jp}
    </div>

    <div className="relative">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>

        {badge && (
          <span className="rounded border border-red-900/60 bg-red-950/40 px-2 py-0.5 text-xs font-medium text-red-200">
            {badge}
          </span>
        )}
      </div>

      <p className="max-w-sm text-sm leading-6 text-zinc-500">{description}</p>

      <div className="mt-5 text-sm font-semibold text-zinc-400 transition group-hover:text-red-300">
        Enter mode
      </div>
    </div>
  </Link>
);

interface CalendarPanelProps {
  last14Days: string[];
  todayISO: string;
  selectedDay: string | null;
  setSelectedDay: (day: string) => void;
  dailyStats: ReturnType<typeof getDailyStats>;
  dayData: ReturnType<typeof getDailyStats>[string] | null;
}

const CalendarPanel = ({
  last14Days,
  todayISO,
  selectedDay,
  setSelectedDay,
  dailyStats,
  dayData,
}: CalendarPanelProps) => (
  <div className="rounded-xl border border-zinc-800 bg-[#11110f] p-6">
    <SectionHeader
      eyebrow="Study Log"
      title="Recent Activity"
      description="Your study activity over the last 14 days."
    />

    <div className="grid grid-cols-7 gap-2">
      {last14Days.map((day) => {
        const studied = dailyStats[day];
        const isToday = day === todayISO;
        const isSelected = day === selectedDay;
        const dayNumber = day.split('-')[2];

        return (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={[
              'aspect-square rounded-md border text-xs font-semibold transition',
              studied
                ? 'border-emerald-900 bg-emerald-950 text-emerald-200 hover:border-emerald-700'
                : 'border-zinc-800 bg-zinc-950 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400',
              isToday ? 'ring-1 ring-red-800' : '',
              isSelected ? 'outline outline-1 outline-zinc-300' : '',
            ].join(' ')}
            title={day}
          >
            {dayNumber}
          </button>
        );
      })}
    </div>

    {dayData ? (
      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="mb-3 text-lg font-semibold text-zinc-100">
          {selectedDay}
        </h3>

        <div className="grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
          <div>
            Time Studied: {Math.floor(dayData.studyTimeSeconds / 60)} min
          </div>
          <div>Unique Kanji: {dayData.uniqueKanji.length}</div>
          <div>Total Seen: {dayData.totalSeen}</div>
          <div>
            Accuracy:{' '}
            {dayData.totalSeen > 0
              ? `${Math.round((dayData.correct / dayData.totalSeen) * 100)}%`
              : 'N/A'}
          </div>
        </div>
      </div>
    ) : (
      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-600">
        Select a day to view study details.
      </div>
    )}
  </div>
);

const AllTimeStats = () => {
  const stats = getAllStats();
  const entries = Object.values(stats);

  const totalSeen = entries.reduce((sum, d) => sum + d.seen, 0);
  const totalCorrect = entries.reduce((sum, d) => sum + d.correct, 0);
  const totalIncorrect = entries.reduce((sum, d) => sum + d.incorrect, 0);

  const totalStudyTime = getTotalStudyTimeSeconds();

  const accuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

  return (
    <section className="rounded-xl border border-zinc-800 bg-[#11110f] p-6">
      <SectionHeader
        eyebrow="Lifetime Record"
        title="All-Time Statistics"
        description="A compact snapshot of your accumulated study history."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Reviews"
          value={totalSeen}
          accent="text-zinc-100"
        />
        <StatCard
          title="Correct"
          value={totalCorrect}
          accent="text-emerald-300"
        />
        <StatCard
          title="Incorrect"
          value={totalIncorrect}
          accent="text-red-300"
        />
        <StatCard
          title="Accuracy"
          value={`${accuracy}%`}
          accent="text-amber-300"
        />
        <StatCard
          title="Study Time"
          value={formatStudyTime(totalStudyTime)}
          accent="text-zinc-100"
        />
      </div>
    </section>
  );
};

export default Home;
