import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  maxLength = 200,
  className = '',
  id,
  value = '',
  onChange,
  ...props
}) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[14px] font-semibold text-[#1e293b]">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative w-full">
        <textarea
          id={fieldId}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          rows={props.rows || 3}
          className={`w-full bg-white border ${
            error ? 'border-red-500' : 'border-[#d1d5db]'
          } rounded-[12px] px-4 py-2.5 pb-7 text-[13px] text-[#1e293b] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#285943]/20 focus:border-[#285943] transition-colors resize-none disabled:bg-gray-50 ${className}`}
          {...props}
        />
        <div className="absolute right-3 bottom-2 text-[11px] text-[#6b7280] select-none">
          {currentLength}/{maxLength}
        </div>
      </div>

      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[12px] text-[#6b7280]">{helperText}</p>}
    </div>
  );
};
