import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BottomCtaBannerProps {
  text?: string;
  subtext?: string;
  ctaText?: string;
  onClick: () => void;
}

export const BottomCtaBanner: React.FC<BottomCtaBannerProps> = ({
  text = 'Small actions, big impact.',
  subtext = 'Join over 800+ citizens making a difference today.',
  ctaText = 'Get Started Now →',
  onClick,
}) => {
  return (
    <div className="bg-[#0d5933] w-full py-6 px-6 sm:px-10 rounded-[20px] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex flex-col text-center sm:text-left">
        <h4 className="text-white text-[22px] sm:text-[24px] font-bold leading-tight">
          {text}
        </h4>
        {subtext && (
          <p className="text-white/80 text-[14px] mt-0.5">
            {subtext}
          </p>
        )}
      </div>
      <button
        onClick={onClick}
        className="bg-white text-[#0d5933] px-8 py-3 rounded-[14px] font-bold text-[14px] hover:bg-[#eef7e9] transition-colors whitespace-nowrap cursor-pointer shadow-xs active:scale-[0.99]"
      >
        {ctaText}
      </button>
    </div>
  );
};
