import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'success' | 'warning' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) => {
  const base =
    'rounded-md border px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'border-red-800 bg-red-900 text-red-50 hover:border-red-700 hover:bg-red-800',
    danger: 'border-red-900/70 bg-red-950 text-red-200 hover:bg-red-950/50',
    success:
      'border-emerald-900 bg-emerald-950 text-emerald-200 hover:border-emerald-700',
    warning:
      'border-amber-900 bg-amber-950 text-amber-200 hover:border-amber-700',
    ghost:
      'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
