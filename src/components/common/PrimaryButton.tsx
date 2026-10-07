import React from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'landing' | 'app';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'landing',
  loading = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  // brand-primary is #0d5933 for landing, brand-primary-alt is #285943 for in-app
  const bgClass = variant === 'landing' 
    ? 'bg-[#0d5933] hover:bg-[#0a4829] active:bg-[#083b21]' 
    : 'bg-[#285943] hover:bg-[#1e4433] active:bg-[#173628]';

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium text-white px-6 py-3 rounded-[16px] transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none ${bgClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
};
