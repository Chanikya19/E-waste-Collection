import React, { useState, useEffect } from 'react';
import { PickupRequest, PickupStatus } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Package, Search, Filter, Calendar, MapPin, CheckCircle2, Truck, Plus, Sparkles } from 'lucide-react';

interface MyPickupsPageProps {
  onNavigate: (route: string) => void;
}

export const MyPickupsPage: React.FC<MyPickupsPageProps> = ({ onNavigate }) => {
  const { socket } = useSocket();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Listen for real-time status changes
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (payload: { requestId: string; status: PickupStatus; pickup: PickupRequest }) => {
      setPickups((prev) =>
        prev.map((p) => (p.id === payload.requestId ? { ...p, ...payload.pickup } : p))
      );
    };

    socket.on('request:statusUpdated', handleStatusUpdate);
    return () => {
      socket.off('request:statusUpdated', handleStatusUpdate);
    };
  }, [socket]);

  const filteredPickups = pickups.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.wasteDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: PickupStatus) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="bg-amber-100 text-amber-800 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">REQUESTED</span>;
      case 'SCHEDULED':
        return <span className="bg-blue-100 text-blue-800 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">SCHEDULED</span>;
      case 'COLLECTED':
        return <span className="bg-purple-100 text-purple-800 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">COLLECTED</span>;
      case 'RECYCLED':
        return <span className="bg-[#eef7e9] text-[#1b7a3f] text-[12px] font-bold px-2.5 py-0.5 rounded-full">RECYCLED</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">My E-Waste Pickups & History</h1>
          <p className="text-[14px] text-[#4b5563]">
            Live tracking and chain-of-custody recycling records
          </p>
        </div>

        <PrimaryButton
          variant="app"
          onClick={() => onNavigate('schedule-pickup')}
          icon={<Plus className="w-4 h-4" />}
        >
          Schedule New Pickup
        </PrimaryButton>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by ID, category, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f7f7f5] border border-[#d1d5db] rounded-[12px] pl-9 pr-4 py-2 text-[13px] text-[#1e293b] focus:outline-none focus:border-[#285943]"
          />
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'REQUESTED', 'SCHEDULED', 'COLLECTED', 'RECYCLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-[10px] text-[12px] font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-[#285943] text-white font-semibold'
                  : 'bg-[#f7f7f5] text-[#4b5563] hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Requests' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Pickups List */}
      {loading ? (
        <div className="p-12 text-center text-[#6b7280]">Loading pickup requests...</div>
      ) : filteredPickups.length === 0 ? (
        <div className="bg-white border border-dashed border-[#d1d5db] rounded-[24px] p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-[#94a3b8] mx-auto" />
          <h3 className="text-[16px] font-bold text-[#1e293b]">No Matching Pickups Found</h3>
          <p className="text-[13px] text-[#4b5563]">Try adjusting your search terms or filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPickups.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs space-y-4 hover:border-[#285943] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[16px] font-bold text-[#1e293b]">
                    #{pickup.trackingCode}
                  </span>
                  {getStatusBadge(pickup.status)}
                </div>
                <span className="text-[12px] text-[#6b7280]">
                  Scheduled for {pickup.pickupDate} ({pickup.preferredTimeSlot})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px]">
                <div>
                  <span className="text-[#6b7280] block text-[11px]">Categories</span>
                  <span className="font-semibold text-[#1e293b]">{pickup.categories.join(', ')}</span>
                  <span className="text-[11px] text-[#6b7280] block">({pickup.estimatedItemsCount} items)</span>
                </div>

                <div>
                  <span className="text-[#6b7280] block text-[11px]">Pickup Address</span>
                  <span className="font-semibold text-[#1e293b]">{pickup.addressLine}, {pickup.city}</span>
                </div>

                <div>
                  <span className="text-[#6b7280] block text-[11px]">Processing Facility</span>
                  <span className="font-semibold text-[#1e293b]">{pickup.centerName}</span>
                </div>

                <div>
                  <span className="text-[#6b7280] block text-[11px]">Recycling Outcome</span>
                  {pickup.status === 'RECYCLED' ? (
                    <span className="font-bold text-[#1b7a3f] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{pickup.pointsAwarded || 150} pts ({pickup.actualWeightKg} kg)
                    </span>
                  ) : pickup.status === 'COLLECTED' ? (
                    <span className="font-semibold text-purple-700">
                      Weighed {pickup.actualWeightKg || '—'} kg • Dismantling
                    </span>
                  ) : (
                    <span className="text-[#6b7280]">Pending processing</span>
                  )}
                </div>
              </div>

              {/* Material Recovery Breakdown (for Recycled items) */}
              {pickup.materialsRecovered && (
                <div className="bg-[#f5f7f0] rounded-[16px] p-3.5 border border-[#d9e1d8] flex flex-wrap items-center gap-4 text-[12px]">
                  <span className="font-bold text-[#0d5933] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#1b7a3f]" />
                    Verified Material Recovery:
                  </span>
                  <span className="text-[#1e293b]">⚡ Metals: <strong>{pickup.materialsRecovered.metalsKg} kg</strong></span>
                  <span className="text-[#1e293b]">♻ Plastics: <strong>{pickup.materialsRecovered.plasticsKg} kg</strong></span>
                  <span className="text-[#1e293b]">🔍 Glass: <strong>{pickup.materialsRecovered.glassKg} kg</strong></span>
                  <span className="text-[#1e293b]">🛡️ Hazardous Safely Neutralized: <strong>{pickup.materialsRecovered.hazardousKg} kg</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
