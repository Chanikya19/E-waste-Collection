import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Clock, Building2, Shield, Leaf, Award, CheckCircle2, Send } from 'lucide-react';
import { CollectionCenter, RewardItem } from '../../types';
import { api } from '../../services/api';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

// 1. Collection Centres Modal
export const CentersModal: React.FC<{ isOpen: boolean; onClose: () => void; onSchedule: () => void }> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [centers, setCenters] = useState<CollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.get<{ data: CollectionCenter[] }>('/api/centers')
        .then((res) => setCenters(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#eef7e9] flex items-center justify-center text-[#145933]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1e293b]">Authorized Collection Centres</h2>
              <p className="text-[13px] text-[#4b5563]">Drop off your e-waste or find your nearest dispatch facility</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-[#6b7280]">Loading registered centers...</div>
          ) : (
            centers.map((center) => (
              <div key={center.id} className="border border-[#e5e7eb] rounded-[16px] p-5 hover:border-[#285943] transition-colors bg-[#fdfdfc]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-[16px] font-bold text-[#1e293b]">{center.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef7e9] text-[#1b7a3f]">
                    Verified Recycling Hub
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#4b5563] mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0d5933] shrink-0" />
                    <span>{center.address}, {center.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0d5933] shrink-0" />
                    <span>{center.operatingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0d5933] shrink-0" />
                    <span>{center.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#1b7a3f] shrink-0" />
                    <span>Capacity: {center.capacityKgPerDay} kg/day</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-medium text-[#6b7280] mr-1">Accepted:</span>
                  {center.acceptedCategories.map((cat, i) => (
                    <span key={i} className="text-[11px] bg-gray-100 text-[#374151] px-2 py-0.5 rounded-md font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-[#e5e7eb] flex items-center justify-between">
          <span className="text-[13px] text-[#4b5563]">Prefer home doorstep collection?</span>
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose} className="py-2 text-[13px]">Close</SecondaryButton>
            <PrimaryButton onClick={() => { onClose(); onSchedule(); }} className="py-2 text-[13px]">
              Schedule Free Pickup
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Rewards Catalog Modal
export const RewardsModal: React.FC<{ isOpen: boolean; onClose: () => void; onGetStarted: () => void }> = ({
  isOpen,
  onClose,
  onGetStarted,
}) => {
  const [rewards, setRewards] = useState<RewardItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get<{ data: RewardItem[] }>('/api/rewards')
        .then((res) => setRewards(res.data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#eef7e9] flex items-center justify-center text-[#145933]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1e293b]">EcoPoints Rewards Program</h2>
              <p className="text-[13px] text-[#4b5563]">Earn 10 points per kg of verified e-waste recycled</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="border border-[#e5e7eb] rounded-[16px] p-4 flex items-center justify-between gap-4 hover:bg-[#f7f7f5] transition-colors">
              <div>
                <h4 className="text-[15px] font-bold text-[#1e293b]">{reward.title}</h4>
                <p className="text-[12px] text-[#4b5563] mt-0.5">{reward.description}</p>
                <span className="inline-block text-[11px] font-semibold text-[#1b7a3f] bg-[#eef7e9] px-2 py-0.5 rounded-full mt-2">
                  {reward.category}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[16px] font-bold text-[#0d5933]">{reward.pointsCost}</span>
                <span className="text-[11px] text-[#6b7280] block">EcoPoints</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
          <SecondaryButton onClick={onClose} className="py-2 text-[13px]">Close</SecondaryButton>
          <PrimaryButton onClick={() => { onClose(); onGetStarted(); }} className="py-2 text-[13px]">
            Start Recycling & Earn
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

// 3. About Us Modal (SDG 12 Context)
export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full shadow-2xl p-6 sm:p-8 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌍</span>
            <h2 className="text-[20px] font-bold text-[#1e293b]">About EcoCollect & SDG 12</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-[14px] text-[#374151] leading-relaxed">
          <p>
            <strong>EcoCollect</strong> is a real-time digital circular platform engineered to combat the global e-waste crisis. By connecting citizens, certified collection centers, and municipal environmental protection agencies, we streamline doorstep pickups, certified data sanitization, and responsible material recovery.
          </p>
          <div className="bg-[#eef7e9] border border-[#d9e1d8] rounded-[16px] p-4 text-[13px] text-[#1b7a3f]">
            <h4 className="font-bold mb-1">Aligned with UN Sustainable Development Goal 12:</h4>
            <p>Target 12.5: Substantially reduce waste generation through prevention, reduction, recycling, and reuse by 2030.</p>
          </div>
          <ul className="space-y-2 text-[13px] text-[#4b5563]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1b7a3f] shrink-0" />
              <span>Full chain-of-custody tracking from doorstep to certified metallurgical refiner.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1b7a3f] shrink-0" />
              <span>Zero landfill guarantee with transparent recovered metal & polymer auditing.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#e5e7eb] flex justify-end">
          <PrimaryButton onClick={onClose} className="py-2 text-[13px]">
            Understood
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

// 4. Contact Us Modal
export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-lg w-full shadow-2xl p-6 sm:p-8 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <h2 className="text-[20px] font-bold text-[#1e293b]">Contact Support & Agency Team</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#eef7e9] text-[#1b7a3f] flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="text-[18px] font-bold text-[#1e293b]">Message Sent Successfully</h3>
            <p className="text-[13px] text-[#4b5563]">Our recycling support specialists will respond within 24 hours.</p>
            <PrimaryButton onClick={onClose} className="mt-4">Close</PrimaryButton>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="py-4 space-y-3 text-[14px]"
          >
            <div>
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-1">Your Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-[#d1d5db] rounded-[12px] px-3.5 py-2 text-[13px] focus:outline-none focus:border-[#285943]"
                placeholder="Sarah Jenkins"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-1">Email Address</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-[#d1d5db] rounded-[12px] px-3.5 py-2 text-[13px] focus:outline-none focus:border-[#285943]"
                placeholder="sarah@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1e293b] mb-1">Message / Inquiry</label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-[#d1d5db] rounded-[12px] px-3.5 py-2 text-[13px] focus:outline-none focus:border-[#285943] resize-none"
                placeholder="Inquiry about bulk corporate electronics pickup or recycling certificate..."
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <SecondaryButton onClick={onClose} className="py-2 text-[13px]">Cancel</SecondaryButton>
              <PrimaryButton type="submit" className="py-2 text-[13px]">
                Send Message
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
