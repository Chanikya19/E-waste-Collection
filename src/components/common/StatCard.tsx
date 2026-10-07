import React from 'react';

interface StatCardProps {
  number: string;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ number, label, subtext, icon }) => {
  return (
    <div className="bg-[#f5f7f0] rounded-[16px] p-6 flex flex-col justify-between transition-all duration-200 hover:translate-y-[-2px] hover:shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[30px] font-bold text-[#1a2638] tracking-tight leading-none">
          {number}
        </span>
        {icon && <span className="text-[#0d5933]">{icon}</span>}
      </div>
      <div>
        <p className="text-[16px] font-bold text-[#1a2638] leading-snug">{label}</p>
        {subtext && <p className="text-[13px] text-[#4b5563] mt-1">{subtext}</p>}
      </div>
    </div>
  );
};
