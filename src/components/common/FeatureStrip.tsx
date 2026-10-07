import React from 'react';

interface FeatureStripItem {
  title: string;
  subtitle: string;
}

interface FeatureStripProps {
  items?: FeatureStripItem[];
  className?: string;
}

const defaultItems: FeatureStripItem[] = [
  {
    title: 'Secure & Safe',
    subtitle: 'Your data is securely wiped & protected',
  },
  {
    title: 'Instant Tracking',
    subtitle: 'Real-time WebSocket status updates',
  },
  {
    title: 'Eco Certified',
    subtitle: '100% verified circular recycling hubs',
  },
  {
    title: 'Rewards Program',
    subtitle: 'Earn redeemable green EcoPoints',
  },
];

export const FeatureStrip: React.FC<FeatureStripProps> = ({
  items = defaultItems,
  className = '',
}) => {
  return (
    <div className={`w-full bg-[#f7f7f5] border border-[#e5e7eb] rounded-[16px] px-6 py-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e7eb]">
        {items.map((item, idx) => (
          <div key={idx} className={`flex flex-col ${idx > 0 ? 'pt-3 sm:pt-0 sm:pl-4' : ''}`}>
            <span className="text-[14px] font-bold text-[#1e293b] leading-tight">
              {item.title}
            </span>
            <span className="text-[12px] text-[#4b5563] mt-0.5 leading-snug">
              {item.subtitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
