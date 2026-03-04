/* eslint-disable react/prop-types */
const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const base = 'rounded-lg px-4 py-2 font-medium transition';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500',
    danger: 'bg-red-600 hover:bg-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-500',
    warning: 'bg-amber-600 hover:bg-amber-500',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
