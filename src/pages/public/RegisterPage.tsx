import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormField } from '../../components/common/FormField';
import { Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
  onRegisterSuccess: (role: UserRole) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: 'Metro City',
    role: 'citizen' as UserRole,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success && res.role) {
        onRegisterSuccess(res.role);
      } else {
        setErrorMessage(res.error?.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] bg-[#f7f7f5] flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="max-w-lg w-full bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-[14px] bg-[#eef7e9] text-[#145933] flex items-center justify-center text-2xl mx-auto mb-3">
            ♻
          </div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">Join EcoCollect</h1>
          <p className="text-[13px] text-[#4b5563] mt-1">
            Create an account to schedule free pickups and earn EcoPoints
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[12px] p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FormField
            label="Full Name"
            required
            placeholder="Sarah Jenkins"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            trailingIcon={<User className="w-4 h-4" />}
          />

          <FormField
            label="Email Address"
            type="email"
            required
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            trailingIcon={<Mail className="w-4 h-4" />}
          />

          <FormField
            label="Password"
            type="password"
            required
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            trailingIcon={<Lock className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              trailingIcon={<Phone className="w-4 h-4" />}
            />
            <FormField
              label="City"
              placeholder="Metro City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              trailingIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <FormField
            label="Default Address"
            placeholder="742 Evergreen Terrace, Apt 4B"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="pt-2">
            <PrimaryButton
              type="submit"
              variant="app"
              loading={loading}
              className="w-full py-3 text-[14px]"
            >
              Create Account
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#e5e7eb] text-center text-[13px] text-[#4b5563]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-semibold text-[#285943] hover:underline"
          >
            Sign In here
          </button>
        </div>

      </div>
    </div>
  );
};
