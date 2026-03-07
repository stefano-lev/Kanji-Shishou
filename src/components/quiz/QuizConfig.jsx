/* eslint-disable react/prop-types */
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';

const QuizConfig = ({
  title,
  selectedLevels,
  toggleLevel,
  children,
  onStart,
}) => {
  return (
    <Card className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="text-left">
        <p className="mb-2 font-semibold">Select JLPT Levels:</p>

        {['5', '4', '3', '2', '1'].map((level) => (
          <label key={level} className="block mb-1">
            <input
              type="checkbox"
              checked={selectedLevels.includes(level)}
              onChange={() => toggleLevel(level)}
              className="mr-2"
            />
            JLPT N{level}
          </label>
        ))}
      </div>

      {children}

      <Button variant="primary" onClick={onStart}>
        Start Quiz
      </Button>
    </Card>
  );
};

export default QuizConfig;
