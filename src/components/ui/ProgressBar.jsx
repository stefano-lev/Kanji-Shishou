/* eslint-disable react/prop-types */
const ProgressBar = ({ value, max }) => {
  const percent = (value / max) * 100;

  return (
    <div className="w-full max-w-sm bg-zinc-800 h-2 rounded mx-auto">
      <div
        className="bg-indigo-500 h-2 rounded transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default ProgressBar;
