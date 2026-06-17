interface ProgressBarProps {
  value: number;
  max: number;
}

const ProgressBar = ({ value, max }: ProgressBarProps) => {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="mx-auto h-2 w-full max-w-sm overflow-hidden rounded-none bg-zinc-900">
      <div
        className="h-2 bg-red-900 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default ProgressBar;
