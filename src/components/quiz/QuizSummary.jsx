/* eslint-disable react/prop-types */
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const QuizSummary = ({ title, total, correct, incorrect, time, onRestart }) => {
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
    <Card className="max-w-md space-y-6 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="space-y-2 text-lg">
        <p>Total reviewed: {total}</p>

        {hasScoreData && (
          <>
            <p className="text-green-400">Correct: {correct}</p>
            <p className="text-red-400">Incorrect: {incorrect}</p>
            <p className="font-bold">Accuracy: {accuracy}%</p>
          </>
        )}

        <p className="text-blue-400">Study Time: {formatTime(time)}</p>
      </div>

      <Button variant="primary" onClick={onRestart}>
        Return to Quiz Setup
      </Button>
    </Card>
  );
};

export default QuizSummary;
