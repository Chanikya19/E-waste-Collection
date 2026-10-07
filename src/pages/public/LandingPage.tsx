import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Clock, Award, CheckCircle2, Sparkles, RefreshCw, Check } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { FeatureStrip } from '../../components/common/FeatureStrip';
import { BottomCtaBanner } from '../../components/common/BottomCtaBanner';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { api } from '../../services/api';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onOpenCenters: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenCenters }) => {
  const [stats, setStats] = useState({
    totalPickups: 1250,
    totalWasteRecycledKg: 980,
    happyCitizensCount: 850,
    collectionCentersCount: 45,
  });

  useEffect(() => {
    api.get<{ data: any }>('/api/analytics/public')
      .then((res) => {
        if (res.data) {
          setStats({
            totalPickups: res.data.totalPickups || 1250,
            totalWasteRecycledKg: res.data.totalWasteRecycledKg || 980,
            happyCitizensCount: res.data.happyCitizensCount || 850,
            collectionCentersCount: res.data.collectionCentersCount || 45,
          });
        }
      })
      .catch(() => {});
  }, []);

  const howItWorksSteps = [
    { num: '1', title: 'Register', desc: 'Create your citizen or corporate account in seconds.' },
    { num: '2', title: 'Schedule Pickup', desc: 'Select e-waste items, pick date, and choose doorstep pickup.' },
    { num: '3', title: 'We Collect', desc: 'Our certified dispatch team collects and securely handles the items.' },
    { num: '4', title: 'We Recycle', desc: 'Materials are dismantled and sent to certified refiners for circular reuse.' },
    { num: '5', title: 'You Earn', desc: 'Receive verified EcoPoints redeemable for vouchers and tree planting.' },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Hero Content) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-[14px] uppercase tracking-widest font-bold text-[#0d663b]">
                Sustainable Future
              </span>
              <h1 className="text-[40px] sm:text-[52px] font-bold leading-[1.1] text-[#1a2638] tracking-tight">
                Recycle Today,<br />
                <span className="text-[#0d663b]">For a Better Tomorrow</span>
              </h1>
            </div>

            <p className="text-[18px] text-[#4b5563] mt-2 mb-8 max-w-[540px] leading-relaxed">
              Dispose of your electronic waste responsibly with EcoCollect. We provide professional pickup services and certified recycling for a greener planet.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto bg-[#0d5933] hover:bg-[#0a4829] text-white px-8 py-4 rounded-[16px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <span>Schedule Pickup</span>
                <span>→</span>
              </button>
              <button 
                onClick={onOpenCenters}
                className="w-full sm:w-auto bg-white border-2 border-[#0d5933] text-[#0d5933] hover:bg-[#0d5933]/5 px-8 py-4 rounded-[16px] font-bold text-[16px] transition-all cursor-pointer"
              >
                Find Collection Centres
              </button>
            </div>
          </div>

          {/* Right Column: Why Recycle Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 bg-[#f5f7f0] rounded-[24px] border border-[#e5e7eb] shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#0d663b]" />
                <h3 className="font-bold text-[20px] text-[#1a2638]">Why Recycle With Us?</h3>
              </div>
              <p className="text-[14px] text-[#4b5563] mb-5">
                Every obsolete electronic device disposed of responsibly actively preserves vital ecosystems.
              </p>
              <ul className="space-y-4 text-[15px] text-[#374151]">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef7e9] text-[#1b7a3f] font-bold flex items-center justify-center shrink-0 text-[13px]">✓</span>
                  <span>Protect soil & water quality from toxic heavy metals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef7e9] text-[#1b7a3f] font-bold flex items-center justify-center shrink-0 text-[13px]">✓</span>
                  <span>Recover precious copper, silver, and gold ores</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef7e9] text-[#1b7a3f] font-bold flex items-center justify-center shrink-0 text-[13px]">✓</span>
                  <span>Guarantee zero landfill overflow & EPA auditing</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Feature Strip under Hero */}
        <div className="mt-14">
          <FeatureStrip />
        </div>
      </section>

      {/* 4 Stat Cards Row */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 border-t border-b border-[#e5e7eb] bg-[#fafbf8]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            number={`${stats.totalPickups.toLocaleString()}+`}
            label="Pickups Completed"
            subtext="Doorstep & drop-off requests"
          />
          <StatCard
            number={`${stats.totalWasteRecycledKg.toLocaleString()}+ kg`}
            label="E-Waste Recycled"
            subtext="Zero landfill divergence"
          />
          <StatCard
            number={`${stats.happyCitizensCount.toLocaleString()}+`}
            label="Happy Citizens"
            subtext="Active eco contributors"
          />
          <StatCard
            number={`${stats.collectionCentersCount}+`}
            label="Collection Centres"
            subtext="Certified processing hubs"
          />
        </div>
      </section>

      {/* Two-Column Section: Why Choose EcoCollect + How It Works */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Why Choose EcoCollect? */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[13px] uppercase tracking-widest font-bold text-[#0d663b] block mb-1">
                Responsible Stewardship
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-bold text-[#1a2638] tracking-tight mb-3">
                Why Choose EcoCollect?
              </h2>
              <p className="text-[16px] text-[#4b5563] leading-relaxed">
                We bridge the gap between households and certified recycling processors through transparency, data security, and real-time tracking.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#f5f7f0] rounded-[16px] p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0d5933] text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a2638]">Easy & Flexible Scheduling</h3>
                  <p className="text-[14px] text-[#4b5563] mt-1">
                    Book a convenient 3-hour morning or afternoon window for doorstep collection in under 2 minutes.
                  </p>
                </div>
              </div>

              <div className="bg-[#f5f7f0] rounded-[16px] p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0d5933] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a2638]">Certified Safe & Data Secure</h3>
                  <p className="text-[14px] text-[#4b5563] mt-1">
                    Storage drives undergo certified physical degaussing or digital shredding to guarantee zero data leakage.
                  </p>
                </div>
              </div>

              <div className="bg-[#f5f7f0] rounded-[16px] p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0d5933] text-white flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a2638]">Track in Real-Time</h3>
                  <p className="text-[14px] text-[#4b5563] mt-1">
                    Follow every step from collection to processing with live WebSocket status updates and proof photos.
                  </p>
                </div>
              </div>

              <div className="bg-[#f5f7f0] rounded-[16px] p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0d5933] text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a2638]">Earn Rewarding EcoPoints</h3>
                  <p className="text-[14px] text-[#4b5563] mt-1">
                    Turn obsolete laptops, batteries, and appliances into shopping discounts and sponsored urban trees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: How It Works */}
          <div className="bg-[#f7f7f5] border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8">
            <span className="text-[13px] uppercase tracking-widest font-bold text-[#0d663b] block mb-1">
              Step-by-Step
            </span>
            <h2 className="text-[28px] font-bold text-[#1a2638] tracking-tight mb-2">
              How It Works
            </h2>
            <p className="text-[15px] text-[#4b5563] mb-8">
              A seamless 5-step circular journey from your home to responsible refiners.
            </p>

            <div className="relative space-y-6">
              {howItWorksSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div className="w-9 h-9 rounded-full bg-[#0d5933] text-white font-bold text-[15px] flex items-center justify-center shrink-0 z-10 shadow-xs">
                    {step.num}
                  </div>
                  <div className="flex-1 bg-white border border-[#e5e7eb] rounded-[16px] p-4 shadow-xs">
                    <h3 className="text-[16px] font-bold text-[#1a2638]">{step.title}</h3>
                    <p className="text-[13px] text-[#4b5563] mt-1">{step.desc}</p>
                  </div>
                  {idx < howItWorksSteps.length - 1 && (
                    <div className="absolute left-[17px] top-[36px] w-[2px] h-[calc(100%+8px)] bg-[#d9e1d8]" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#e5e7eb]">
              <PrimaryButton 
                variant="landing" 
                onClick={() => onNavigate('register')}
                className="w-full py-3.5 text-[15px]"
              >
                Create Account & Schedule First Pickup
              </PrimaryButton>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20">
        <BottomCtaBanner 
          text="Small actions, big impact."
          subtext="Join over 800+ citizens making a difference today."
          ctaText="Get Started Now →"
          onClick={() => onNavigate('register')}
        />
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2638] text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♻</span>
            <div>
              <span className="text-[20px] font-bold tracking-tight">EcoCollect</span>
              <p className="text-[12px] text-gray-400">Responsible E-Waste Recycling Platform</p>
            </div>
          </div>
          <p className="text-[13px] text-gray-400 text-center sm:text-right">
            Designed in accordance with UN Sustainable Development Goal 12 (Responsible Consumption & Production).
          </p>
        </div>
      </footer>

    </div>
  );
};
