import type { ReactNode } from 'react';

type CardSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface CardProps {
  children: ReactNode;
  className?: string;
  size?: CardSize;
  padded?: boolean;
}

const sizeClasses: Record<CardSize, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

export default function Card({
  children,
  className = '',
  size = 'md',
  padded = true,
}: CardProps) {
  return (
    <div
      className={`
        mx-auto w-full ${sizeClasses[size]}
        rounded-xl border border-zinc-800 bg-[#11110f]
        ${padded ? 'p-3 sm:p-5 lg:p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
