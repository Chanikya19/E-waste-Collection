import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save, 
  Calendar,
  Leaf,
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { FormField } from '../../components/common/FormField';

interface CitizenProfilePageProps {
  onNavigate: (route: string) => void;
}

export const CitizenProfilePage: React.FC<CitizenProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Metro City');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || 'Metro City');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await updateProfile({
      name,
      phone,
      address,
      city,
    });

    setProfileSaving(false);
    if (res.success) {
      setProfileSuccess(res.message || 'Profile information updated successfully.');
      setTimeout(() => setProfileSuccess(null), 5000);
    } else {
      setProfileError(res.error?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      setPasswordUpdating(false);
      return;
    }

    const res = await changePassword(currentPassword, newPassword, confirmPassword);

    setPasswordUpdating(false);
    if (res.success) {
      setPasswordSuccess(res.message || 'Password changed successfully. Your JWT authentication token has been renewed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 6000);
    } else {
      setPasswordError(res.error?.message || 'Failed to change password. Please check your current password.');
    }
  };

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Editorial Banner */}
      <div className="bg-[#0d5933] text-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-[24px] shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-200">
                Citizen Account & Security
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Verified Citizen
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight mt-1 text-white">
              {user?.name || 'Citizen User'}
            </h1>
            <p className="text-[14px] text-emerald-100 mt-1 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-300" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                Member since {formattedDate}
              </span>
            </p>
          </div>
        </div>

        {/* Quick EcoPoints badge */}
        <div className="bg-white/10 border border-white/20 rounded-[18px] p-4 text-center min-w-[170px] shrink-0">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>EcoPoints Balance</span>
          </div>
          <span className="text-[32px] font-bold text-white block leading-tight mt-0.5">
            {user?.ecoPoints || 0}
          </span>
          <button 
            onClick={() => onNavigate('citizen-rewards')}
            className="text-[12px] text-emerald-200 hover:text-white underline underline-offset-2 transition-colors cursor-pointer mt-0.5 block"
          >
            Redeem in Store →
          </button>
        </div>
      </div>

      {/* Main Grid: Personal Info Form (Left) & Security Password Management (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Personal Profile Information */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-[#f5f7f0] text-[#0d5933] flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1a2638]">Personal Information</h2>
                  <p className="text-[12px] text-[#4b5563]">Manage your contact details and default pickup location</p>
                </div>
              </div>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] p-4 rounded-[16px] flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Update Saved</span>
                  <span>{profileSuccess}</span>
                </div>
              </div>
            )}

            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-[13px] p-4 rounded-[16px] flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Error</span>
                  <span>{profileError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              
              <FormField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="E.g., Samantha Miller"
              />

              <div className="space-y-1">
                <label className="block text-[13px] font-semibold text-[#1e293b]">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-[#f3f4f6] text-[#6b7280] border border-[#d1d5db] rounded-[12px] px-3.5 py-2.5 text-[14px] cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-[#6b7280]">
                  Your email is the unique identifier bound to your authenticated JWT session.
                </p>
              </div>

              <FormField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                helperText="Used by certified drivers for dispatch coordination."
              />

              <FormField
                label="Default Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="1428 Elmwood Avenue, Apt 4B"
                helperText="Auto-populates your doorstep collection requests."
              />

              <FormField
                label="City / Municipality"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Metro City"
              />

              <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                <span className="text-[12px] text-[#6b7280]">
                  Changes reflect immediately on all devices.
                </span>
                <PrimaryButton
                  type="submit"
                  loading={profileSaving}
                  icon={<Save className="w-4 h-4" />}
                  className="text-[13px] py-2.5 px-6"
                >
                  Save Profile Changes
                </PrimaryButton>
              </div>

            </form>

          </div>

          {/* Quick Environmental Impact Summary Card */}
          <div className="bg-[#f5f7f0] border border-[#d9e1d8] rounded-[24px] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#0d5933]" />
              <h3 className="font-bold text-[16px] text-[#1a2638]">Your Circular Contribution</h3>
            </div>
            <p className="text-[13px] text-[#4b5563] leading-relaxed">
              Every completed pickup directly diverts toxic heavy metals from urban landfills and supports municipal SDG 12 recycling goals.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-3 text-center">
                <span className="text-[11px] text-[#6b7280] block font-medium">EcoPoints Earned</span>
                <span className="text-[20px] font-bold text-[#0d5933]">{user?.ecoPoints || 0} pts</span>
              </div>
              <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-3 text-center">
                <span className="text-[11px] text-[#6b7280] block font-medium">Verified Auditing</span>
                <span className="text-[13px] font-bold text-[#1b7a3f] mt-1 block">EPA Certified</span>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => onNavigate('my-pickups')}
                className="text-[13px] font-semibold text-[#0d5933] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View My Pickups History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('schedule-pickup')}
                className="text-[13px] font-semibold text-[#0d5933] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Schedule New Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Change Password Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1a2638]">Security & Password</h2>
                  <p className="text-[12px] text-[#4b5563]">Change your account password securely with salted bcrypt encryption</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Bcrypt Active
              </span>
            </div>

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] p-4 rounded-[16px] flex items-start gap-3 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Password Changed Successfully</span>
                  <span>{passwordSuccess}</span>
                </div>
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-[13px] p-4 rounded-[16px] flex items-start gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Password Update Failed</span>
                  <span>{passwordError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              {/* Current Password */}
              <div className="space-y-1">
                <label className="block text-[13px] font-semibold text-[#1e293b]">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter your current password"
                    className="w-full bg-[#f7f7f5] text-[#1e293b] border border-[#d1d5db] rounded-[12px] px-3.5 py-2.5 pr-10 text-[14px] focus:outline-none focus:border-[#0d5933]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="block text-[13px] font-semibold text-[#1e293b]">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-[#f7f7f5] text-[#1e293b] border border-[#d1d5db] rounded-[12px] px-3.5 py-2.5 pr-10 text-[14px] focus:outline-none focus:border-[#0d5933]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          newPassword.length < 6 ? 'w-1/4 bg-red-500' :
                          newPassword.length < 9 ? 'w-2/3 bg-amber-500' :
                          'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-[#6b7280]">
                      {newPassword.length < 6 ? 'Too short' : newPassword.length < 9 ? 'Moderate' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="block text-[13px] font-semibold text-[#1e293b]">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-type new password"
                    className="w-full bg-[#f7f7f5] text-[#1e293b] border border-[#d1d5db] rounded-[12px] px-3.5 py-2.5 pr-10 text-[14px] focus:outline-none focus:border-[#0d5933]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-[11px] text-red-600 block">
                    Passwords do not match.
                  </span>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match!
                  </span>
                )}
              </div>

              {/* Security note */}
              <div className="bg-[#f7f7f5] rounded-[14px] p-3.5 border border-[#e5e7eb] space-y-1">
                <span className="text-[12px] font-bold text-[#1a2638] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#0d5933]" />
                  JWT Session Re-validation Guarantee
                </span>
                <p className="text-[11px] text-[#4b5563] leading-normal">
                  When you change your password, bcrypt applies a cryptographic salt to secure your credentials. Your JWT authentication token is immediately renewed so you stay logged in without disruption.
                </p>
              </div>

              <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-end">
                <PrimaryButton
                  type="submit"
                  loading={passwordUpdating}
                  icon={<Lock className="w-4 h-4" />}
                  className="text-[13px] py-2.5 px-6 bg-[#1a2638] hover:bg-[#0f172a]"
                >
                  Update Password & Refresh Session
                </PrimaryButton>
              </div>

            </form>

          </div>

          {/* Quick Demo Credentials Info for Easy Testing */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-[20px] p-4 text-[12px] text-amber-900 space-y-1">
            <span className="font-bold block flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Demo Testing Notice
            </span>
            <p className="text-amber-800">
              If logged in with the demo citizen account (<code>citizen.demo@ecocollect.test</code>), the original password is <code>CitizenPass123!</code>. You can change it to any new password of your choice, and then test logging out and logging back in with your updated password!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
