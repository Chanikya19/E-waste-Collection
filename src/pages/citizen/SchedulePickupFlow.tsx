import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  BatteryCharging, 
  Microwave, 
  Package, 
  UploadCloud, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Phone, 
  Truck, 
  MapPin, 
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { Stepper } from '../../components/common/Stepper';
import { FeatureStrip } from '../../components/common/FeatureStrip';
import { SummaryCard } from '../../components/common/SummaryCard';
import { InfoListCard } from '../../components/common/InfoListCard';
import { FormField } from '../../components/common/FormField';
import { Textarea } from '../../components/common/Textarea';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { WasteCategory, PickupRequest } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SchedulePickupFlowProps {
  onNavigate: (route: string) => void;
  onSuccessNavigate: (pickupId: string) => void;
}

const CATEGORIES: { name: WasteCategory; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { name: 'Laptop', icon: Laptop, desc: 'Laptops, notebooks, chargers' },
  { name: 'Mobile Phone', icon: Smartphone, desc: 'Smartphones, tablets, e-readers' },
  { name: 'Television', icon: Tv, desc: 'LED, LCD, CRT, monitors' },
  { name: 'Battery', icon: BatteryCharging, desc: 'Li-ion, power tool, UPS batteries' },
  { name: 'Appliances', icon: Microwave, desc: 'Microwaves, toasters, blenders' },
  { name: 'Others', icon: Package, desc: 'Cables, peripherals, boards' },
];

export const SchedulePickupFlow: React.FC<SchedulePickupFlowProps> = ({ onNavigate, onSuccessNavigate }) => {
  const { user } = useAuth();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Data
  const [categories, setCategories] = useState<WasteCategory[]>(['Laptop']);
  const [estimatedItemsCount, setEstimatedItemsCount] = useState<number>(2);
  const [wasteDescription, setWasteDescription] = useState<string>('2 old laptops with chargers and internal batteries');
  const [photoName, setPhotoName] = useState<string | null>(null);

  // Step 2 Data
  const defaultDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState<string>(defaultDate);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>('09:00 AM - 12:00 PM');
  const [preferredContact, setPreferredContact] = useState<string>('Phone');
  const [pickupType, setPickupType] = useState<'Doorstep Pickup' | 'Drop-off at Center'>('Doorstep Pickup');
  const [specialInstructions, setSpecialInstructions] = useState<string>('Please call when arrived at the security gate.');

  // Step 3 Data
  const [addressLine, setAddressLine] = useState<string>(user?.address || '742 Evergreen Terrace, Apt 4B');
  const [city, setCity] = useState<string>(user?.city || 'Metro City');
  const [state, setState] = useState<string>('California');
  const [pinCode, setPinCode] = useState<string>('94103');
  const [landmark, setLandmark] = useState<string>('Opposite Central Park Gate 2');

  // Step 4 Created Pickup Data
  const [createdPickup, setCreatedPickup] = useState<PickupRequest | null>(null);

  const steps = [
    { id: 1, label: 'Waste Details' },
    { id: 2, label: 'Pickup Details' },
    { id: 3, label: 'Address Details' },
    { id: 4, label: 'Confirmation' },
  ];

  const toggleCategory = (cat: WasteCategory) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter((c) => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleNextStep1 = () => {
    if (categories.length === 0) {
      setErrorMessage('Please select at least one waste category.');
      return;
    }
    if (!wasteDescription.trim()) {
      setErrorMessage('Please enter a brief description of the items.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep2 = () => {
    if (!pickupDate) {
      setErrorMessage('Please select a pickup date.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    if (!addressLine.trim() || !city.trim() || !pinCode.trim()) {
      setErrorMessage('Please fill in all required address fields.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const payload = {
        categories,
        estimatedItemsCount,
        wasteDescription,
        pickupDate,
        preferredTimeSlot,
        preferredContact,
        pickupType,
        specialInstructions,
        addressLine,
        city,
        state,
        pinCode,
        landmark,
      };

      const res = await api.post<{ data: PickupRequest }>('/api/pickups', payload);
      setCreatedPickup(res.data);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule pickup. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const summaryRows = [
    { label: 'Selected Categories', value: categories.join(', ') || 'None' },
    { label: 'Est. Quantity', value: `${estimatedItemsCount} Item(s)` },
    { label: 'Pickup Type', value: pickupType },
    { label: 'Date & Slot', value: `${pickupDate || 'TBD'} • ${preferredTimeSlot.split(' - ')[0]}` },
    { label: 'Service Charge', value: 'FREE ($0.00)', isHighlight: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Persistent Stepper Header */}
      <div className="mb-6">
        <Stepper
          currentStep={currentStep}
          steps={steps}
          onStepClick={(step) => {
            if (currentStep !== 4 && step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
      </div>

      {/* Persistent Feature Strip under Stepper */}
      <div className="mb-8">
        <FeatureStrip />
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[16px] p-4 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Form wizard on left, Sidebar on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2-Columns: Step Content */}
        <div className="lg:col-span-2">
          
          {/* STEP 1: WASTE DETAILS */}
          {currentStep === 1 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1e293b]">Step 1: Select Waste Category</h2>
                <p className="text-[14px] text-[#4b5563] mt-1">
                  Choose all the types of electronics you wish to dispose of responsibly.
                </p>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = categories.includes(cat.name);

                  return (
                    <div
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-[16px] border-2 cursor-pointer transition-all duration-200 text-center ${
                        isSelected
                          ? 'border-[#285943] bg-[#eef7e9]/60 shadow-xs'
                          : 'border-[#e5e7eb] bg-white hover:border-[#c7d8cc] hover:bg-[#f7f7f5]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#285943] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center mb-2.5 ${
                        isSelected ? 'bg-[#285943] text-white' : 'bg-[#f5f7f0] text-[#0d5933]'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[14px] font-bold text-[#1e293b]">{cat.name}</span>
                      <span className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-1">{cat.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Items Stepper */}
              <div className="flex items-center justify-between bg-[#f7f7f5] rounded-[16px] p-4 border border-[#e5e7eb]">
                <div>
                  <label className="text-[14px] font-semibold text-[#1e293b] block">
                    Estimated Number of Devices
                  </label>
                  <span className="text-[12px] text-[#4b5563]">Helps our team bring proper collection bins</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEstimatedItemsCount(Math.max(1, estimatedItemsCount - 1))}
                    className="w-9 h-9 rounded-[10px] bg-white border border-[#d1d5db] font-bold text-[16px] text-[#1e293b] hover:bg-gray-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-[16px] font-bold text-[#1e293b] w-6 text-center">
                    {estimatedItemsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEstimatedItemsCount(estimatedItemsCount + 1)}
                    className="w-9 h-9 rounded-[10px] bg-white border border-[#d1d5db] font-bold text-[16px] text-[#1e293b] hover:bg-gray-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Description Textarea */}
              <Textarea
                label="Item Details & Condition"
                required
                rows={3}
                placeholder="E.g., 2 MacBook Pros with swollen batteries, 1 box of charging cables, and 1 old laser printer."
                value={wasteDescription}
                onChange={(e) => setWasteDescription(e.target.value)}
                helperText="Please mention any heavy appliances or leaking batteries so our dispatch team prepares safety protocols."
              />

              {/* Photo Upload Dropzone */}
              <div>
                <label className="text-[14px] font-semibold text-[#1e293b] block mb-1.5">
                  Upload Photo (Optional)
                </label>
                <label className="border-2 border-dashed border-[#d1d5db] hover:border-[#285943] bg-[#fdfdfc] rounded-[16px] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                  <UploadCloud className="w-8 h-8 text-[#94a3b8] group-hover:text-[#285943] mb-2 transition-colors" />
                  <span className="text-[13px] font-semibold text-[#1e293b]">
                    {photoName ? photoName : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-[11px] text-[#6b7280] mt-0.5">
                    PNG, JPG or WEBP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPhotoName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                <SecondaryButton
                  variant="app"
                  onClick={() => onNavigate('citizen-dashboard')}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  variant="app"
                  onClick={handleNextStep1}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next: Pickup Details
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* STEP 2: PICKUP DETAILS */}
          {currentStep === 2 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1e293b]">Step 2: Pickup Schedule & Preferences</h2>
                <p className="text-[14px] text-[#4b5563] mt-1">
                  Choose your preferred date, time slot, and communication channel.
                </p>
              </div>

              {/* Row 1: Pickup Date + Preferred Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Pickup Date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  trailingIcon={<Calendar className="w-4 h-4" />}
                />

                <FormField
                  label="Preferred Time Slot"
                  isSelect
                  value={preferredTimeSlot}
                  onSelectChange={(e) => setPreferredTimeSlot(e.target.value)}
                  options={[
                    { value: '09:00 AM - 12:00 PM', label: 'Morning (09:00 AM - 12:00 PM)' },
                    { value: '12:00 PM - 03:00 PM', label: 'Afternoon (12:00 PM - 03:00 PM)' },
                    { value: '03:00 PM - 06:00 PM', label: 'Evening (03:00 PM - 06:00 PM)' },
                  ]}
                />
              </div>

              {/* Row 2: Preferred Contact + Pickup Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Preferred Contact Channel"
                  isSelect
                  value={preferredContact}
                  onSelectChange={(e) => setPreferredContact(e.target.value)}
                  options={[
                    { value: 'Phone', label: 'Phone Call' },
                    { value: 'SMS', label: 'SMS Notification' },
                    { value: 'Email', label: 'Email Confirmation' },
                  ]}
                />

                <FormField
                  label="Pickup Method"
                  isSelect
                  value={pickupType}
                  onSelectChange={(e) => setPickupType(e.target.value as any)}
                  options={[
                    { value: 'Doorstep Pickup', label: 'Doorstep Pickup (FREE)' },
                    { value: 'Drop-off at Center', label: 'Self Drop-off at Center' },
                  ]}
                />
              </div>

              {/* Special Instructions Textarea */}
              <Textarea
                label="Special Instructions for Dispatch"
                rows={3}
                placeholder="E.g., Call upon gate arrival, buzzer #402, elevator is around the corner."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                helperText="Provide any gate codes or parking instructions to ensure smooth arrival."
              />

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                <SecondaryButton
                  variant="app"
                  onClick={() => setCurrentStep(1)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </SecondaryButton>
                <PrimaryButton
                  variant="app"
                  onClick={handleNextStep2}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next: Address Details
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS DETAILS */}
          {currentStep === 3 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#1e293b]">Step 3: Pickup Location</h2>
                <p className="text-[14px] text-[#4b5563] mt-1">
                  Specify the exact address where our collection vehicle will dispatch.
                </p>
              </div>

              <FormField
                label="Street Address / Flat / Building"
                required
                placeholder="742 Evergreen Terrace, Apt 4B"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                trailingIcon={<MapPin className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="City"
                  required
                  placeholder="Metro City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <FormField
                  label="State / Province"
                  required
                  placeholder="California"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="PIN / Postal Code"
                  required
                  placeholder="94103"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                />

                <FormField
                  label="Landmark (Optional)"
                  placeholder="Opposite Central Park Gate 2"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              <div className="bg-[#f5f7f0] rounded-[16px] p-4 text-[13px] text-[#285943] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#1b7a3f] shrink-0" />
                <span>
                  Our nearest hub (<strong>Metro Downtown E-Waste Center</strong>) is 2.4 miles away and will fulfill this request.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                <SecondaryButton
                  variant="app"
                  onClick={() => setCurrentStep(2)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </SecondaryButton>
                <PrimaryButton
                  variant="app"
                  loading={loading}
                  onClick={handleFinalSubmit}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Confirm & Schedule Pickup
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {currentStep === 4 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Success Banner */}
              <div className="bg-[#eef7e9] border border-[#d9e1d8] rounded-[20px] p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#1b7a3f] text-white flex items-center justify-center mb-3 shadow-sm">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h2 className="text-[24px] font-bold text-[#1e293b]">Pickup Scheduled Successfully!</h2>
                <p className="text-[14px] text-[#285943] mt-1 max-w-md font-medium">
                  Your request has been dispatched to <strong>{createdPickup?.centerName || 'Metro Downtown E-Waste Center'}</strong>.
                </p>
              </div>

              {/* Pickup Information Panel */}
              <div className="bg-[#f7f7f5] border border-[#e5e7eb] rounded-[20px] p-6 space-y-3.5">
                <h3 className="text-[16px] font-bold text-[#1e293b] pb-2 border-b border-[#e5e7eb]">
                  Pickup Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Tracking ID</span>
                    <span className="font-bold text-[#1e293b] text-[15px] font-mono">
                      #{createdPickup?.trackingCode || 'EC-94830'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#1b7a3f] bg-[#eef7e9] px-2 py-0.5 rounded-full text-[12px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      REQUESTED (Pending Dispatch)
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Scheduled Date & Slot</span>
                    <span className="font-semibold text-[#1e293b]">
                      {pickupDate} • {preferredTimeSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Pickup Type</span>
                    <span className="font-semibold text-[#1e293b]">{pickupType}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[#6b7280] block text-[11px]">Pickup Address</span>
                    <span className="font-semibold text-[#1e293b]">
                      {addressLine}, {city}, {state} - {pinCode} {landmark ? `(${landmark})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Contact Number</span>
                    <span className="font-semibold text-[#1e293b]">{user?.phone || '+1 (555) 234-5678'}</span>
                  </div>

                  <div>
                    <span className="text-[#6b7280] block text-[11px]">Service Charge</span>
                    <span className="font-bold text-[#1b7a3f]">FREE ($0.00)</span>
                  </div>
                </div>
              </div>

              {/* Notification Line */}
              <div className="p-4 rounded-[14px] bg-[#f5f7f0] border border-[#e5e7eb] text-[13px] text-[#4b5563] space-y-1">
                <p>📧 A confirmation receipt has been sent to <strong>{user?.email || 'your email'}</strong>.</p>
                <p>📱 You will receive an SMS reminder 2 hours before the dispatch driver arrives.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <SecondaryButton
                  variant="app"
                  onClick={() => onNavigate('citizen-dashboard')}
                >
                  Return to Dashboard
                </SecondaryButton>
                <PrimaryButton
                  variant="app"
                  onClick={() => onNavigate('my-pickups')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  View & Track My Pickups
                </PrimaryButton>
              </div>

            </div>
          )}

        </div>

        {/* Right 1-Column: Summary Card + Info List Card */}
        <div className="space-y-6">
          <SummaryCard
            rows={summaryRows}
            estimatedPoints={estimatedItemsCount * 50}
          />
          <InfoListCard />
        </div>

      </div>

    </div>
  );
};
