import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Search, 
  Filter, 
  AlertCircle, 
  Sparkles, 
  Recycle, 
  ChevronRight,
  Package,
  Calendar,
  Phone,
  MapPin,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import { PickupRequest, PickupStatus } from '../../types';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { FormField } from '../../components/common/FormField';

interface StaffDashboardProps {
  onNavigate: (route: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active updating modal state
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState<PickupStatus>('SCHEDULED');
  const [actualWeight, setActualWeight] = useState<string>('5.5');
  const [staffNotes, setStaffNotes] = useState<string>('');
  const [metalsKg, setMetalsKg] = useState<string>('2.2');
  const [plasticsKg, setPlasticsKg] = useState<string>('1.8');
  const [glassKg, setGlassKg] = useState<string>('0.8');
  const [hazardousKg, setHazardousKg] = useState<string>('0.7');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchPickups = async () => {
    try {
      const res = await api.get<{ data: PickupRequest[] }>('/api/pickups');
      setPickups(res.data);
    } catch (err) {
      console.error('Failed to load dispatch queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  // Listen for real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (payload: { requestId: string; status: PickupStatus; pickup: PickupRequest }) => {
      setPickups((prev) =>
        prev.map((p) => (p.id === payload.requestId ? { ...p, ...payload.pickup } : p))
      );
      if (selectedPickup && selectedPickup.id === payload.requestId) {
        setSelectedPickup(payload.pickup);
      }
    };

    const handleRequestCreated = (newPickup: PickupRequest) => {
      setPickups((prev) => [newPickup, ...prev]);
    };

    socket.on('request:statusUpdated', handleStatusUpdate);
    socket.on('request:created', handleRequestCreated);

    return () => {
      socket.off('request:statusUpdated', handleStatusUpdate);
      socket.off('request:created', handleRequestCreated);
    };
  }, [socket, selectedPickup]);

  const openUpdateModal = (pickup: PickupRequest) => {
    setSelectedPickup(pickup);
    setUpdateStatus(
      pickup.status === 'REQUESTED' ? 'SCHEDULED' :
      pickup.status === 'SCHEDULED' ? 'COLLECTED' :
      pickup.status === 'COLLECTED' ? 'RECYCLED' : 'RECYCLED'
    );
    setActualWeight(pickup.actualWeightKg ? String(pickup.actualWeightKg) : '5.0');
    setStaffNotes(pickup.staffNotes || '');
    setUpdateError(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPickup) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const payload: any = {
        status: updateStatus,
        staffNotes,
      };

      if (updateStatus === 'COLLECTED' || updateStatus === 'RECYCLED') {
        const weight = parseFloat(actualWeight);
        if (isNaN(weight) || weight <= 0) {
          throw new Error('Please enter a valid actual weight in kg.');
        }
        payload.actualWeightKg = weight;
      }

      if (updateStatus === 'RECYCLED') {
        payload.materialsRecovered = {
          metalsKg: parseFloat(metalsKg) || 0,
          plasticsKg: parseFloat(plasticsKg) || 0,
          glassKg: parseFloat(glassKg) || 0,
          hazardousKg: parseFloat(hazardousKg) || 0,
        };
      }

      const res = await api.patch<{ data: PickupRequest }>(`/api/pickups/${selectedPickup.id}/status`, payload);
      
      setPickups((prev) =>
        prev.map((p) => (p.id === selectedPickup.id ? res.data : p))
      );
      setSelectedPickup(null);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update pickup status.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredPickups = pickups.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const countRequested = pickups.filter((p) => p.status === 'REQUESTED').length;
  const countScheduled = pickups.filter((p) => p.status === 'SCHEDULED').length;
  const countCollected = pickups.filter((p) => p.status === 'COLLECTED').length;
  const countRecycled = pickups.filter((p) => p.status === 'RECYCLED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-[#285943] text-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-300" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-200">
              Center Operations & Dispatch Queue
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight mt-1">
            {user?.centerName || 'Metro Downtown E-Waste Center'}
          </h1>
          <p className="text-[14px] text-emerald-100 mt-1">
            Manage dispatch vehicles, weigh collected electronic payloads, and log circular recycling material recovery.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-[18px] p-4 text-center min-w-[170px] shrink-0">
          <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
            Action Required
          </span>
          <span className="text-[32px] font-bold text-white block leading-tight">
            {countRequested + countScheduled}
          </span>
          <span className="text-[12px] text-emerald-200">Pending Pickups</span>
        </div>
      </div>

      {/* Metric summary counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterStatus('REQUESTED')}
          className={`p-5 rounded-[20px] border cursor-pointer transition-all ${
            filterStatus === 'REQUESTED' ? 'border-amber-600 bg-amber-50/70 shadow-xs' : 'bg-white border-[#e5e7eb] hover:bg-gray-50'
          }`}
        >
          <span className="text-[12px] font-bold text-amber-800 uppercase tracking-wider block">1. Requested</span>
          <span className="text-[26px] font-bold text-[#1e293b] mt-1 block">{countRequested}</span>
          <span className="text-[11px] text-[#6b7280]">Awaiting dispatch slot</span>
        </div>

        <div 
          onClick={() => setFilterStatus('SCHEDULED')}
          className={`p-5 rounded-[20px] border cursor-pointer transition-all ${
            filterStatus === 'SCHEDULED' ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'bg-white border-[#e5e7eb] hover:bg-gray-50'
          }`}
        >
          <span className="text-[12px] font-bold text-blue-800 uppercase tracking-wider block">2. Scheduled</span>
          <span className="text-[26px] font-bold text-[#1e293b] mt-1 block">{countScheduled}</span>
          <span className="text-[11px] text-[#6b7280]">Vehicle assigned</span>
        </div>

        <div 
          onClick={() => setFilterStatus('COLLECTED')}
          className={`p-5 rounded-[20px] border cursor-pointer transition-all ${
            filterStatus === 'COLLECTED' ? 'border-purple-600 bg-purple-50/70 shadow-xs' : 'bg-white border-[#e5e7eb] hover:bg-gray-50'
          }`}
        >
          <span className="text-[12px] font-bold text-purple-800 uppercase tracking-wider block">3. Collected</span>
          <span className="text-[26px] font-bold text-[#1e293b] mt-1 block">{countCollected}</span>
          <span className="text-[11px] text-[#6b7280]">Ready for weighing & sorting</span>
        </div>

        <div 
          onClick={() => setFilterStatus('RECYCLED')}
          className={`p-5 rounded-[20px] border cursor-pointer transition-all ${
            filterStatus === 'RECYCLED' ? 'border-[#1b7a3f] bg-[#eef7e9] shadow-xs' : 'bg-white border-[#e5e7eb] hover:bg-gray-50'
          }`}
        >
          <span className="text-[12px] font-bold text-[#1b7a3f] uppercase tracking-wider block">4. Recycled</span>
          <span className="text-[26px] font-bold text-[#1e293b] mt-1 block">{countRecycled}</span>
          <span className="text-[11px] text-[#6b7280]">Points awarded to citizens</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by code, citizen, items..."
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
              {status === 'ALL' ? 'All Queue Items' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List Table / Card View */}
      {loading ? (
        <div className="p-12 text-center text-[#6b7280]">Loading staff queue...</div>
      ) : filteredPickups.length === 0 ? (
        <div className="bg-white border border-dashed border-[#d1d5db] rounded-[24px] p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-[#94a3b8] mx-auto" />
          <h3 className="text-[16px] font-bold text-[#1e293b]">No Matching Pickups In Queue</h3>
          <p className="text-[13px] text-[#4b5563]">Adjust your search query or filter status above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPickups.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs hover:border-[#285943] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-[16px] text-[#1e293b]">
                    #{pickup.trackingCode}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    pickup.status === 'REQUESTED' ? 'bg-amber-100 text-amber-800' :
                    pickup.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    pickup.status === 'COLLECTED' ? 'bg-purple-100 text-purple-800' :
                    'bg-[#eef7e9] text-[#1b7a3f]'
                  }`}>
                    {pickup.status}
                  </span>
                  <span className="text-[12px] text-[#6b7280]">
                    {pickup.pickupType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px] pt-1">
                  <div>
                    <span className="text-[11px] text-[#6b7280] block">Citizen & Contact</span>
                    <span className="font-semibold text-[#1e293b]">{pickup.citizenName}</span>
                    <span className="text-[12px] text-[#4b5563] block">{pickup.citizenPhone}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#6b7280] block">Waste Items</span>
                    <span className="font-semibold text-[#1e293b]">
                      {pickup.categories.join(', ')} ({pickup.estimatedItemsCount} items)
                    </span>
                    <span className="text-[12px] text-[#4b5563] block truncate max-w-xs">
                      {pickup.wasteDescription}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#6b7280] block">Pickup Location</span>
                    <span className="font-semibold text-[#1e293b]">
                      {pickup.addressLine}, {pickup.city}
                    </span>
                    <span className="text-[12px] text-[#4b5563] block">
                      Slot: {pickup.pickupDate} • {pickup.preferredTimeSlot.split(' - ')[0]}
                    </span>
                  </div>
                </div>

                {pickup.specialInstructions && (
                  <div className="text-[12px] bg-[#f7f7f5] rounded-[10px] px-3 py-1.5 text-[#4b5563] inline-block">
                    <strong>Note:</strong> {pickup.specialInstructions}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-3">
                <PrimaryButton
                  variant="app"
                  onClick={() => openUpdateModal(pickup)}
                  className="py-2.5 text-[13px] whitespace-nowrap"
                >
                  Update Status & Log Weight →
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Update Status & Log Weight Modal */}
      {selectedPickup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#1e293b]">
                  Update Request #{selectedPickup.trackingCode}
                </h2>
                <p className="text-[12px] text-[#4b5563]">Citizen: {selectedPickup.citizenName}</p>
              </div>
              <button 
                onClick={() => setSelectedPickup(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4 text-[13px]">
              {updateError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3 rounded-[12px]">
                  {updateError}
                </div>
              )}

              <FormField
                label="New Status Stage"
                isSelect
                value={updateStatus}
                onSelectChange={(e) => setUpdateStatus(e.target.value as PickupStatus)}
                options={[
                  { value: 'REQUESTED', label: '1. REQUESTED (Pending Slot Assignment)' },
                  { value: 'SCHEDULED', label: '2. SCHEDULED (Dispatch Truck Assigned)' },
                  { value: 'COLLECTED', label: '3. COLLECTED (Payload Arrived at Center)' },
                  { value: 'RECYCLED', label: '4. RECYCLED (Dismantled, Materials Recovered, Points Awarded)' },
                  { value: 'CANCELLED', label: 'CANCELLED' },
                ]}
              />

              {(updateStatus === 'COLLECTED' || updateStatus === 'RECYCLED') && (
                <FormField
                  label="Verified Actual Weight (kg)"
                  type="number"
                  step="0.1"
                  required
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  helperText="Awarded points are calculated dynamically (10 EcoPoints per 1.0 kg)."
                />
              )}

              {updateStatus === 'RECYCLED' && (
                <div className="bg-[#f5f7f0] border border-[#d9e1d8] rounded-[16px] p-4 space-y-3">
                  <span className="font-bold text-[#145933] block text-[13px]">
                    Circular Material Recovery Breakdown (kg):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="Metals (Cu, Au, Al, Fe)"
                      type="number"
                      step="0.1"
                      value={metalsKg}
                      onChange={(e) => setMetalsKg(e.target.value)}
                    />
                    <FormField
                      label="Polymers / Plastics"
                      type="number"
                      step="0.1"
                      value={plasticsKg}
                      onChange={(e) => setPlasticsKg(e.target.value)}
                    />
                    <FormField
                      label="Glass / Silicates"
                      type="number"
                      step="0.1"
                      value={glassKg}
                      onChange={(e) => setGlassKg(e.target.value)}
                    />
                    <FormField
                      label="Hazardous Neutralized"
                      type="number"
                      step="0.1"
                      value={hazardousKg}
                      onChange={(e) => setHazardousKg(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <FormField
                label="Staff Internal Notes"
                placeholder="E.g., Hard drives sanitized with NIST 800-88 standards. Driver: Marcus Vance."
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
              />

              <div className="pt-4 border-t border-[#e5e7eb] flex justify-end gap-2">
                <SecondaryButton 
                  type="button" 
                  onClick={() => setSelectedPickup(null)}
                  className="py-2 text-[13px]"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton 
                  type="submit" 
                  loading={updating}
                  className="py-2 text-[13px]"
                >
                  Save & Broadcast Live
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
