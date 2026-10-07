import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface SummaryRow {
  label: string;
  value: string;
  isHighlight?: boolean;
}

interface SummaryCardProps {
  title?: string;
  rows: SummaryRow[];
  highlightMessage?: string;
  estimatedPoints?: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title = 'Pickup Summary',
  rows,
  highlightMessage = 'Doorstep pickup is 100% FREE for all household and enterprise e-waste.',
  estimatedPoints,
}) => {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
        <h3 className="text-[18px] font-bold text-[#1e293b]">{title}</h3>
        <span className="bg-[#eef7e9] text-[#1b7a3f] font-bold text-[12px] px-2.5 py-1 rounded-full">
          FREE
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between text-[13px] py-0.5">
            <span className="text-[#374151] font-medium">{row.label}</span>
            <span className={`text-right font-semibold ${row.isHighlight ? 'text-[#1b7a3f]' : 'text-[#1e293b]'}`}>
              {row.value || '—'}
            </span>
          </div>
        ))}
      </div>

      {estimatedPoints && (
        <div className="flex items-center justify-between bg-[#f5f7f0] rounded-[12px] p-3 text-[13px]">
          <span className="flex items-center gap-1.5 text-[#285943] font-medium">
            <Sparkles className="w-4 h-4 text-[#1b7a3f]" />
            Estimated EcoPoints
          </span>
          <span className="font-bold text-[#0d5933]">+{estimatedPoints} pts</span>
        </div>
      )}

      {/* Embedded Highlight Message Card */}
      {highlightMessage && (
        <div className="bg-[#eef7e9] border border-[#d9e1d8] rounded-[16px] p-3.5 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1b7a3f] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#1b7a3f] leading-relaxed font-medium">
            {highlightMessage}
          </p>
        </div>
      )}
    </div>
  );
};
