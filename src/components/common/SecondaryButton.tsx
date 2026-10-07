import React from 'react';
import { Loader2 } from 'lucide-react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'landing' | 'app';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  variant = 'landing',
  loading = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  const borderAndTextClass = variant === 'landing'
    ? 'border-[#0d5933] text-[#0d5933] hover:bg-[#0d5933]/5'
    : 'border-[#285943] text-[#285943] hover:bg-[#285943]/5';

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium bg-white border px-6 py-3 rounded-[16px] transition-all duration-200 shadow-xs hover:shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${borderAndTextClass} ${className}`}
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
