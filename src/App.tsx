import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { SchedulePickupFlow } from './pages/citizen/SchedulePickupFlow';
import { MyPickupsPage } from './pages/citizen/MyPickupsPage';
import { CitizenRewardsPage } from './pages/citizen/CitizenRewardsPage';
import { CitizenProfilePage } from './pages/citizen/CitizenProfilePage';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AgencyAnalyticsPage } from './pages/agency/AgencyAnalyticsPage';
import { CentersModal, RewardsModal, AboutModal, ContactModal } from './components/common/Modals';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  
  // Modal states
  const [isCentersModalOpen, setIsCentersModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: string) => {
    if (role === 'citizen') navigate('citizen-dashboard');
    else if (role === 'staff') navigate('staff-dashboard');
    else if (role === 'agency') navigate('agency-analytics');
    else navigate('citizen-dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-[#1a2638] flex flex-col font-sans selection:bg-[#eef7e9] selection:text-[#0d5933]">
      
      {/* Editorial Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenCentersModal={() => setIsCentersModalOpen(true)}
        onOpenRewardsModal={() => setIsRewardsModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenContactModal={() => setIsContactModalOpen(true)}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        {/* Public Routes */}
        {currentRoute === 'landing' && (
          <LandingPage
            onNavigate={navigate}
            onOpenCenters={() => setIsCentersModalOpen(true)}
          />
        )}

        {currentRoute === 'login' && (
          <LoginPage
            onNavigate={navigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentRoute === 'register' && (
          <RegisterPage
            onNavigate={navigate}
            onRegisterSuccess={handleLoginSuccess}
          />
        )}

        {/* Citizen Routes */}
        {currentRoute === 'citizen-dashboard' && (
          <CitizenDashboard onNavigate={navigate} />
        )}

        {currentRoute === 'schedule-pickup' && (
          <SchedulePickupFlow
            onNavigate={navigate}
            onSuccessNavigate={() => navigate('my-pickups')}
          />
        )}

        {currentRoute === 'my-pickups' && (
          <MyPickupsPage onNavigate={navigate} />
        )}

        {currentRoute === 'citizen-rewards' && (
          <CitizenRewardsPage onNavigate={navigate} />
        )}

        {currentRoute === 'citizen-profile' && (
          <CitizenProfilePage onNavigate={navigate} />
        )}

        {/* Center Staff Routes */}
        {currentRoute === 'staff-dashboard' && (
          <StaffDashboard onNavigate={navigate} />
        )}

        {/* EPA Agency Analytics Routes */}
        {currentRoute === 'agency-analytics' && (
          <AgencyAnalyticsPage />
        )}
      </main>

      {/* Persistent Modals */}
      <CentersModal
        isOpen={isCentersModalOpen}
        onClose={() => setIsCentersModalOpen(false)}
        onSchedule={() => {
          setIsCentersModalOpen(false);
          if (user) navigate('schedule-pickup');
          else navigate('login');
        }}
      />

      <RewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
        onGetStarted={() => {
          setIsRewardsModalOpen(false);
          if (user) navigate('citizen-rewards');
          else navigate('register');
        }}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
