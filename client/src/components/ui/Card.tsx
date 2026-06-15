import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`w-full max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}
