import type { ReactNode } from 'react';

interface InfoBlockProps {
  title: string;
  children: ReactNode;
  height?: string;
  className?: string;
}

const InfoBlock = ({
  title,
  children,
  height = 'h-24',
  className = '',
}: InfoBlockProps) => (
  <div
    className={`${height} ${className} flex flex-col border-l-2 border-red-900 bg-zinc-950 p-3 text-center sm:p-4`}
  >
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
      {title}
    </p>

    <div className="flex-1 overflow-y-auto px-1 text-sm leading-relaxed text-zinc-300 sm:text-base">
      {children}
    </div>
  </div>
);

export default InfoBlock;
