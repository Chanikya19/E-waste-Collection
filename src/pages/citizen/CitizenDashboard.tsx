import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Truck, 
  Recycle, 
  MapPin, 
  Calendar,
  Award,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import { PickupRequest, PickupStatus } from '../../types';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';

interface CitizenDashboardProps {
  onNavigate: (route: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    try {
      const res = await api.get<{ data: PickupRequest[] }>('/api/pickups');
      setPickups(res.data);
    } catch (err) {
      console.error('Failed to load pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  // Real-time socket event listener for status updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (payload: { requestId: string; status: PickupStatus; pickup: PickupRequest }) => {
      setPickups((prev) =>
        prev.map((p) => (p.id === payload.requestId ? { ...p, ...payload.pickup } : p))
      );
    };

    const handleRequestCreated = (newPickup: PickupRequest) => {
      if (newPickup.citizenId === user?.id) {
        setPickups((prev) => [newPickup, ...prev]);
      }
    };

    socket.on('request:statusUpdated', handleStatusUpdate);
    socket.on('request:created', handleRequestCreated);

    return () => {
      socket.off('request:statusUpdated', handleStatusUpdate);
      socket.off('request:created', handleRequestCreated);
    };
  }, [socket, user?.id]);

  const activePickups = pickups.filter((p) => p.status === 'REQUESTED' || p.status === 'SCHEDULED' || p.status === 'COLLECTED');
  const completedPickups = pickups.filter((p) => p.status === 'RECYCLED');
  const totalWeightRecycled = completedPickups.reduce((acc, p) => acc + (p.actualWeightKg || 0), 0);
  const co2OffsetKg = Math.round(totalWeightRecycled * 1.44);

  const getStatusBadge = (status: PickupStatus) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="bg-amber-100 text-amber-800 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">Requested (Pending Dispatch)</span>;
      case 'SCHEDULED':
        return <span className="bg-blue-100 text-blue-800 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">Scheduled for Pickup</span>;
      case 'COLLECTED':
        return <span className="bg-purple-100 text-purple-800 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">Collected (In Transit)</span>;
      case 'RECYCLED':
        return <span className="bg-[#eef7e9] text-[#1b7a3f] text-[12px] font-bold px-2.5 py-0.5 rounded-full">✓ Responsibly Recycled</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const getTimelineSteps = (status: PickupStatus) => {
    const steps = [
      { key: 'REQUESTED', label: 'Requested' },
      { key: 'SCHEDULED', label: 'Scheduled' },
      { key: 'COLLECTED', label: 'Collected' },
      { key: 'RECYCLED', label: 'Recycled' },
    ];

    const statusOrder = ['REQUESTED', 'SCHEDULED', 'COLLECTED', 'RECYCLED'];
    const currentIndex = statusOrder.indexOf(status);

    return (
      <div className="flex items-center w-full max-w-xl my-3">
        {steps.map((step, idx) => {
          const stepIndex = statusOrder.indexOf(step.key);
          const isDone = currentIndex >= stepIndex;
          const isCurrent = currentIndex === stepIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isDone
                    ? 'bg-[#285943] text-white shadow-xs'
                    : 'bg-white border-2 border-[#d9e1d8] text-[#9ca3af]'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={`text-[11px] mt-1 font-medium ${
                  isCurrent ? 'text-[#285943] font-bold' : isDone ? 'text-[#374151]' : 'text-[#9ca3af]'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-1 mb-4 rounded-full ${
                  currentIndex > idx ? 'bg-[#285943]' : 'bg-[#e5e7eb]'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1e293b]">
              Welcome back, {user?.name.split(' ')[0]}
            </h1>
          </div>
          <p className="text-[14px] text-[#4b5563] mt-1">
            Track your scheduled pickups, view real-time recycling progress, and manage your earned EcoPoints.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <SecondaryButton
            onClick={() => onNavigate('citizen-profile')}
            className="text-[13px] py-2.5 px-4"
          >
            Profile & Security
          </SecondaryButton>
          <PrimaryButton
            variant="app"
            onClick={() => onNavigate('schedule-pickup')}
            icon={<Plus className="w-4 h-4" />}
            className="text-[13px] py-2.5 px-4"
          >
            Schedule Pickup
          </PrimaryButton>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              Active Pickups
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {activePickups.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              E-Waste Recycled
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {totalWeightRecycled.toFixed(1)} kg
            </span>
          </div>
          <div className="w-11 h-11 rounded-[14px] bg-[#eef7e9] text-[#1b7a3f] flex items-center justify-center">
            <Recycle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              CO2 Diverted
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {co2OffsetKg} kg
            </span>
          </div>
          <div className="w-11 h-11 rounded-[14px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#1b7a3f] transition-colors"
          onClick={() => onNavigate('citizen-rewards')}
        >
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              EcoPoints Balance
            </span>
            <span className="text-[28px] font-bold text-[#1b7a3f] mt-1 block">
              {user?.ecoPoints || 0} pts
            </span>
          </div>
          <div className="w-11 h-11 rounded-[14px] bg-[#eef7e9] text-[#1b7a3f] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Pickups Tracking Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#1e293b]">Active Pickups (Live Tracking)</h2>
          <button
            onClick={() => onNavigate('my-pickups')}
            className="text-[13px] font-semibold text-[#285943] hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6b7280]">Loading active pickups...</div>
        ) : activePickups.length === 0 ? (
          <div className="bg-white border border-dashed border-[#d1d5db] rounded-[24px] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f5f7f0] text-[#0d5933] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-bold text-[#1e293b]">No Active Pickups In Progress</h3>
            <p className="text-[13px] text-[#4b5563] max-w-md mx-auto">
              Have old electronics lying around? Schedule a free doorstep collection and earn EcoPoints today.
            </p>
            <PrimaryButton
              variant="app"
              onClick={() => onNavigate('schedule-pickup')}
              className="mt-2 text-[13px]"
            >
              Schedule Free Pickup
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activePickups.map((pickup) => (
              <div
                key={pickup.id}
                className="bg-white border border-[#e5e7eb] hover:border-[#285943] transition-colors rounded-[24px] p-6 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-bold text-[#1e293b] font-mono">
                      #{pickup.trackingCode}
                    </span>
                    {getStatusBadge(pickup.status)}
                  </div>
                  <span className="text-[12px] text-[#6b7280]">
                    Created on {new Date(pickup.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Real-time Interactive Timeline */}
                <div className="py-2">
                  {getTimelineSteps(pickup.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-[13px]">
                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Categories & Items</span>
                    <span className="font-semibold text-[#1e293b]">
                      {pickup.categories.join(', ')} ({pickup.estimatedItemsCount} items)
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Scheduled Window</span>
                    <span className="font-semibold text-[#1e293b]">
                      {pickup.pickupDate} • {pickup.preferredTimeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Assigned Center</span>
                    <span className="font-semibold text-[#1e293b]">
                      {pickup.centerName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
