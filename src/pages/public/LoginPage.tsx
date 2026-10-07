import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormField } from '../../components/common/FormField';
import { Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Building2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: (role: UserRole) => void;
  initialMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess, initialMessage }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialMessage || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.role) {
        onLoginSuccess(result.role);
      } else {
        setErrorMessage(result.error?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (role: UserRole) => {
    let demoEmail = '';
    let demoPass = '';

    if (role === 'citizen') {
      demoEmail = 'citizen.demo@ecocollect.test';
      demoPass = 'CitizenPass123!';
    } else if (role === 'staff') {
      demoEmail = 'staff.demo@ecocollect.test';
      demoPass = 'StaffPass123!';
    } else if (role === 'agency') {
      demoEmail = 'agency.demo@ecocollect.test';
      demoPass = 'AgencyAdmin123!';
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await login(demoEmail, demoPass);
      if (result.success && result.role) {
        onLoginSuccess(result.role);
      } else {
        setErrorMessage(result.error?.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] bg-[#f7f7f5] flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="max-w-md w-full bg-white border border-[#e5e7eb] rounded-[24px] p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-[14px] bg-[#eef7e9] text-[#145933] flex items-center justify-center text-2xl mx-auto mb-3">
            ♻
          </div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">Welcome Back</h1>
          <p className="text-[13px] text-[#4b5563] mt-1">
            Sign in to access your e-waste portal and real-time dashboard
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[12px] p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Demo Accounts Quick Selection (Prompt Section 5 Requirement) */}
        <div className="mb-6 bg-[#f5f7f0] border border-[#d9e1d8] rounded-[16px] p-3.5">
          <span className="block text-[12px] font-bold text-[#1e293b] mb-2 uppercase tracking-wider">
            ⚡ Quick Demo Accounts (One-Click Sign In):
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('citizen')}
              className="flex items-center justify-between bg-white border border-[#e5e7eb] hover:border-[#1b7a3f] hover:bg-[#eef7e9] px-3 py-2 rounded-[10px] text-left transition-colors group text-[12px]"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1b7a3f]" />
                <span className="font-semibold text-[#1e293b]">Citizen Account</span>
              </div>
              <span className="text-[#6b7280] group-hover:text-[#1b7a3f]">citizen.demo@ecocollect.test →</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('staff')}
              className="flex items-center justify-between bg-white border border-[#e5e7eb] hover:border-amber-600 hover:bg-amber-50 px-3 py-2 rounded-[10px] text-left transition-colors group text-[12px]"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span className="font-semibold text-[#1e293b]">Center Staff Account</span>
              </div>
              <span className="text-[#6b7280] group-hover:text-amber-800">staff.demo@ecocollect.test →</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('agency')}
              className="flex items-center justify-between bg-white border border-[#e5e7eb] hover:border-blue-600 hover:bg-blue-50 px-3 py-2 rounded-[10px] text-left transition-colors group text-[12px]"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span className="font-semibold text-[#1e293b]">EPA Agency Admin</span>
              </div>
              <span className="text-[#6b7280] group-hover:text-blue-800">agency.demo@ecocollect.test →</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email Address"
            type="email"
            required
            placeholder="citizen.demo@ecocollect.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            trailingIcon={<Mail className="w-4 h-4" />}
          />

          <FormField
            label="Password"
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailingIcon={<Lock className="w-4 h-4" />}
          />

          <PrimaryButton
            type="submit"
            variant="app"
            loading={loading}
            className="w-full py-3 text-[14px] mt-2"
          >
            Sign In
          </PrimaryButton>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-4 border-t border-[#e5e7eb] text-center text-[13px] text-[#4b5563]">
          Don't have an EcoCollect account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-semibold text-[#285943] hover:underline inline-flex items-center gap-1"
          >
            <span>Register here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
