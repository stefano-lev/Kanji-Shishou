import type { ReactNode } from 'react';

import Card from '@components/ui/Card';
import Button from '@components/ui/Button';

import type { JLPTLevel } from '@/types';

interface QuizConfigProps {
  title: string;
  selectedLevels: JLPTLevel[];
  toggleLevel: (level: JLPTLevel) => void;
  children: ReactNode;
  onStart: () => void;
}

const QuizConfig = ({
  title,
  selectedLevels,
  toggleLevel,
  children,
  onStart,
}: QuizConfigProps) => {
  return (
    <Card size="sm" className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
          Session Setup
        </p>
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
      </div>

      <div className="border-t border-zinc-800 pt-5 text-left">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Select JLPT Levels
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(['5', '4', '3', '2', '1'] as JLPTLevel[]).map((level) => {
            const active = selectedLevels.includes(level);

            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleLevel(level)}
                className={[
                  'rounded-md border px-3 py-3 text-sm font-semibold transition',
                  active
                    ? 'border-red-800 bg-red-950/60 text-red-100'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200',
                ].join(' ')}
              >
                N{level}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 border-t border-zinc-800 pt-5 text-zinc-300">
        {children}
      </div>

      <Button variant="primary" onClick={onStart} className="w-full">
        Start Quiz
      </Button>
    </Card>
  );
};

export default QuizConfig;
