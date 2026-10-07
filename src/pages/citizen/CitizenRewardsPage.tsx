import React, { useState, useEffect } from 'react';
import { Sparkles, Award, ShoppingBag, TreePine, Wrench, Package, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { RewardItem } from '../../types';
import { PrimaryButton } from '../../components/common/PrimaryButton';

interface CitizenRewardsPageProps {
  onNavigate: (route: string) => void;
}

export const CitizenRewardsPage: React.FC<CitizenRewardsPageProps> = ({ onNavigate }) => {
  const { user, updateUserPoints } = useAuth();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<{ code: string; title: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: RewardItem[] }>('/api/rewards')
      .then((res) => setRewards(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward: RewardItem) => {
    if ((user?.ecoPoints || 0) < reward.pointsCost) {
      setErrorMsg(`You need ${reward.pointsCost} EcoPoints to redeem this reward. Recycle more e-waste to earn points!`);
      return;
    }

    setErrorMsg(null);
    setRedeemingId(reward.id);

    try {
      const res = await api.post<{ voucherCode: string; remainingPoints: number }>('/api/rewards/redeem', {
        rewardId: reward.id,
      });
      updateUserPoints(res.remainingPoints);
      setRedeemedVoucher({ code: res.voucherCode, title: reward.title });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to redeem reward.');
    } finally {
      setRedeemingId(null);
    }
  };

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'Tree Planting':
        return <TreePine className="w-6 h-6 text-emerald-600" />;
      case 'Voucher':
        return <ShoppingBag className="w-6 h-6 text-blue-600" />;
      case 'Certificate':
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Package className="w-6 h-6 text-[#285943]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with EcoPoints Balance */}
      <div className="bg-[#285943] rounded-[24px] p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span className="text-[13px] font-bold uppercase tracking-wider text-emerald-200">
              EcoPoints Rewards & Stewardship
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight mt-1">
            Turn Obsolete Tech Into Real Impact
          </h1>
          <p className="text-[14px] text-emerald-100 mt-1 max-w-xl">
            You earn 10 EcoPoints for every kilogram of verified e-waste collected and recycled through EcoCollect.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-[20px] p-5 text-center min-w-[200px] shrink-0">
          <span className="text-[12px] font-medium text-emerald-200 uppercase tracking-wider block">
            Your Balance
          </span>
          <span className="text-[36px] font-bold text-white block leading-none my-1">
            {user?.ecoPoints || 0}
          </span>
          <span className="text-[12px] text-emerald-200 font-semibold">Available EcoPoints</span>
        </div>
      </div>

      {/* Redemption Success Modal */}
      {redeemedVoucher && (
        <div className="bg-[#eef7e9] border border-[#d9e1d8] rounded-[20px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1b7a3f] text-white flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#1e293b]">Reward Successfully Redeemed!</h3>
              <p className="text-[13px] text-[#285943]">
                {redeemedVoucher.title} — Use voucher code below:
              </p>
              <span className="inline-block mt-1 font-mono font-bold text-[15px] bg-white border border-[#d9e1d8] text-[#145933] px-3 py-1 rounded-[8px]">
                {redeemedVoucher.code}
              </span>
            </div>
          </div>
          <button
            onClick={() => setRedeemedVoucher(null)}
            className="text-[13px] font-semibold text-[#0d5933] hover:underline px-4 py-2 bg-white rounded-[12px] border border-[#d9e1d8]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[16px] p-4 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rewards Catalog Grid */}
      <div className="space-y-4">
        <h2 className="text-[20px] font-bold text-[#1e293b]">Available Rewards Catalog</h2>
        
        {loading ? (
          <div className="p-12 text-center text-[#6b7280]">Loading rewards...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = (user?.ecoPoints || 0) >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all hover:border-[#285943]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-[14px] bg-[#f5f7f0] flex items-center justify-center">
                        {getRewardIcon(reward.category)}
                      </div>
                      <span className="text-[15px] font-bold text-[#0d5933] bg-[#eef7e9] px-3 py-1 rounded-full">
                        {reward.pointsCost} pts
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider block">
                      {reward.category}
                    </span>
                    <h3 className="text-[17px] font-bold text-[#1e293b] mt-1">{reward.title}</h3>
                    <p className="text-[13px] text-[#4b5563] mt-2 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#e5e7eb]">
                    <PrimaryButton
                      variant="app"
                      disabled={!canAfford}
                      loading={redeemingId === reward.id}
                      onClick={() => handleRedeem(reward)}
                      className="w-full py-2.5 text-[13px]"
                    >
                      {canAfford ? 'Redeem Reward' : `Need ${reward.pointsCost - (user?.ecoPoints || 0)} More Points`}
                    </PrimaryButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
