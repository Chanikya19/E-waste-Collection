import React from 'react';
import { CheckCircle2, Leaf, Shield, Award, Zap } from 'lucide-react';

interface InfoListCardProps {
  title?: string;
}

export const InfoListCard: React.FC<InfoListCardProps> = ({
  title = 'Why Recycle E-Waste?',
}) => {
  const points = [
    {
      title: 'Prevents Toxic Pollution',
      desc: 'Keeps lead, mercury, and cadmium out of landfills and municipal groundwater.',
      icon: Shield,
    },
    {
      title: 'Recovers Rare Precious Metals',
      desc: 'Gold, silver, copper, and palladium are extracted for circular reuse in manufacturing.',
      icon: Zap,
    },
    {
      title: 'Lowers Carbon Footprint',
      desc: 'Each kg of recycled electronics offsets ~1.44 kg of greenhouse CO2 emissions.',
      icon: Leaf,
    },
    {
      title: 'Earn Green EcoPoints',
      desc: 'Get rewarded with eco-vouchers, repair discounts, and urban tree planting sponsorships.',
      icon: Award,
    },
  ];

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-[18px] font-bold text-[#1e293b] border-b border-[#e5e7eb] pb-3">
        {title}
      </h3>

      <div className="flex flex-col gap-3.5">
        {points.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#eef7e9] flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#1b7a3f]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-[#1e293b] leading-tight">
                  {item.title}
                </span>
                <span className="text-[12px] text-[#4b5563] mt-0.5 leading-relaxed">
                  {item.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
