import Card from '@components/ui/Card';
import Button from '@components/ui/Button';

interface QuizSummaryProps {
  title: string;
  total: number;
  correct: number | null;
  incorrect: number | null;
  time: number;
  onRestart: () => void;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const QuizSummary = ({
  title,
  total,
  correct,
  incorrect,
  time,
  onRestart,
}: QuizSummaryProps) => {
  const hasScoreData =
    correct !== null &&
    incorrect !== null &&
    correct !== undefined &&
    incorrect !== undefined;

  const accuracy =
    hasScoreData && correct + incorrect > 0
      ? Math.round((correct / (correct + incorrect)) * 100)
      : null;

  return (
    <Card size="sm" className="space-y-6 text-center">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
          Session Complete
        </p>
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
      </div>

      <div className="grid gap-3 border-y border-zinc-800 py-5 text-left">
        <SummaryRow label="Total Reviewed" value={total} />

        {hasScoreData && (
          <>
            <SummaryRow
              label="Correct"
              value={correct}
              valueClass="text-emerald-300"
            />
            <SummaryRow
              label="Incorrect"
              value={incorrect}
              valueClass="text-red-300"
            />
            <SummaryRow
              label="Accuracy"
              value={`${accuracy}%`}
              valueClass="text-amber-300"
            />
          </>
        )}

        <SummaryRow label="Study Time" value={formatTime(time)} />
      </div>

      <Button variant="primary" onClick={onRestart}>
        Return to Quiz Setup
      </Button>
    </Card>
  );
};

interface SummaryRowProps {
  label: string;
  value: string | number | null;
  valueClass?: string;
}

const SummaryRow = ({
  label,
  value,
  valueClass = 'text-zinc-100',
}: SummaryRowProps) => (
  <div className="flex items-center justify-between border-l-2 border-red-900 bg-zinc-950 px-4 py-3">
    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
      {label}
    </span>
    <span className={`text-lg font-bold ${valueClass}`}>{value}</span>
  </div>
);

export default QuizSummary;
