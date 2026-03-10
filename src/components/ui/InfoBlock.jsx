/* eslint-disable react/prop-types */
const InfoBlock = ({ title, children, height = 'h-24', className = '' }) => (
  <div
    className={`${height} ${className} bg-white/5 border border-white/10 rounded-xl p-3 text-center flex flex-col`}
  >
    <p className="text-zinc-400 mb-1 text-sm">{title}</p>
    <div className="flex-1 overflow-y-auto text-sm leading-relaxed px-1">
      {children}
    </div>
  </div>
);

export default InfoBlock;
