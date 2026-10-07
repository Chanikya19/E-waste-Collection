import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  isSelect?: boolean;
  options?: { value: string; label: string }[];
  onSelectChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  trailingIcon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  isSelect = false,
  options = [],
  onSelectChange,
  trailingIcon,
  className = '',
  id,
  ...props
}) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[14px] font-semibold text-[#1e293b]">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative w-full">
        {isSelect ? (
          <div className="relative">
            <select
              id={fieldId}
              value={props.value as string}
              onChange={onSelectChange}
              disabled={props.disabled}
              className={`w-full bg-white border ${
                error ? 'border-red-500' : 'border-[#d1d5db]'
              } rounded-[12px] px-4 py-2.5 text-[13px] text-[#1e293b] appearance-none focus:outline-none focus:ring-2 focus:ring-[#285943]/20 focus:border-[#285943] transition-colors disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#94a3b8]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              id={fieldId}
              className={`w-full bg-white border ${
                error ? 'border-red-500' : 'border-[#d1d5db]'
              } rounded-[12px] px-4 py-2.5 text-[13px] text-[#1e293b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#285943]/20 focus:border-[#285943] transition-colors disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
              {...props}
            />
            {trailingIcon && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                {trailingIcon}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[12px] text-[#6b7280]">{helperText}</p>}
    </div>
  );
};
