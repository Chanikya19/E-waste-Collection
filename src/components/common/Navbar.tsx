import React, { useState } from 'react';
import { Bell, Wifi, WifiOff, LogOut, ChevronDown, Check, X, Sparkles, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenCentersModal?: () => void;
  onOpenAboutModal?: () => void;
  onOpenContactModal?: () => void;
  onOpenRewardsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentRoute,
  onOpenCentersModal,
  onOpenAboutModal,
  onOpenContactModal,
  onOpenRewardsModal,
}) => {
  const { user, logout } = useAuth();
  const { isConnected, isConnecting, notifications, unreadCount, dismissNotification, clearAllNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'citizen':
        return <span className="bg-[#eef7e9] text-[#1b7a3f] text-[11px] font-semibold px-2 py-0.5 rounded-full">Citizen</span>;
      case 'staff':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">Center Staff</span>;
      case 'agency':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">EPA Agency</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e7eb] flex-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-[84px] sm:h-[92px] flex items-center justify-between">
        
        {/* Left Branding */}
        <div 
          onClick={() => {
            if (!user) onNavigate('landing');
            else if (user.role === 'citizen') onNavigate('citizen-dashboard');
            else if (user.role === 'staff') onNavigate('staff-dashboard');
            else if (user.role === 'agency') onNavigate('agency-analytics');
          }}
          className="flex flex-col cursor-pointer select-none group"
        >
          <div className="text-[26px] sm:text-[28px] font-bold text-[#145933] leading-none tracking-tight">
            EcoCollect
          </div>
          <div className="text-[13px] sm:text-[14px] text-[#4b5563] font-medium mt-1">
            E-Waste Collection System
          </div>
        </div>

        {/* Public State Navigation */}
        {!user ? (
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-[#374151]">
              <button 
                onClick={() => onNavigate('landing')}
                className={`transition-colors hover:text-[#0d5933] ${currentRoute === 'landing' ? 'text-[#0d5933]' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="hover:text-[#0d5933] transition-colors"
              >
                Schedule Pickup
              </button>
              <button 
                onClick={() => onOpenCentersModal?.()}
                className="hover:text-[#0d5933] transition-colors"
              >
                Collection Centres
              </button>
              <button 
                onClick={() => onOpenRewardsModal?.()}
                className="hover:text-[#0d5933] transition-colors"
              >
                Rewards
              </button>
              <button 
                onClick={() => onOpenAboutModal?.()}
                className="hover:text-[#0d5933] transition-colors"
              >
                About Us
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="text-[14px] font-semibold text-[#0d5933] px-4 py-2.5 hover:bg-[#eef7e9] rounded-[14px] transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenContactModal?.()}
                className="bg-[#0d5933] text-white px-6 py-2.5 rounded-[14px] font-semibold text-[14px] hover:bg-[#0a4829] transition-colors shadow-xs"
              >
                Contact
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated State Navigation */
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Real-time Socket Connection Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-gray-50 border-gray-200">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700">Live Sync</span>
                </>
              ) : isConnecting ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-amber-700">Connecting...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">Offline</span>
                </>
              )}
            </div>

            {/* Role specific quick nav */}
            {user.role === 'citizen' && (
              <div className="hidden md:flex items-center gap-5 text-[13px] font-semibold text-[#374151]">
                <button
                  onClick={() => onNavigate('citizen-dashboard')}
                  className={`hover:text-[#0d5933] ${currentRoute === 'citizen-dashboard' ? 'text-[#0d5933]' : ''}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('schedule-pickup')}
                  className={`hover:text-[#0d5933] ${currentRoute === 'schedule-pickup' ? 'text-[#0d5933]' : ''}`}
                >
                  + Schedule Pickup
                </button>
                <button
                  onClick={() => onNavigate('my-pickups')}
                  className={`hover:text-[#0d5933] ${currentRoute === 'my-pickups' ? 'text-[#0d5933]' : ''}`}
                >
                  My Pickups
                </button>
                <button
                  onClick={() => onNavigate('citizen-rewards')}
                  className={`hover:text-[#0d5933] flex items-center gap-1 ${currentRoute === 'citizen-rewards' ? 'text-[#0d5933]' : ''}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1b7a3f]" />
                  <span>Rewards ({user.ecoPoints || 0} pts)</span>
                </button>
                <button
                  onClick={() => onNavigate('citizen-profile')}
                  className={`hover:text-[#0d5933] ${currentRoute === 'citizen-profile' ? 'text-[#0d5933]' : ''}`}
                >
                  Profile & Security
                </button>
              </div>
            )}

            {user.role === 'staff' && (
              <div className="hidden md:flex items-center gap-5 text-[13px] font-semibold text-[#374151]">
                <button
                  onClick={() => onNavigate('staff-dashboard')}
                  className="text-[#0d5933] font-bold"
                >
                  Dispatch & Processing Queue
                </button>
              </div>
            )}

            {user.role === 'agency' && (
              <div className="hidden md:flex items-center gap-5 text-[13px] font-semibold text-[#374151]">
                <button
                  onClick={() => onNavigate('agency-analytics')}
                  className="text-[#0d5933] font-bold"
                >
                  SDG 12 Analytics Console
                </button>
              </div>
            )}

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-[12px] text-[#4b5563] hover:text-[#1e293b] hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#0d5933] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e5e7eb] rounded-[18px] shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1e293b]">Live Updates</span>
                      {unreadCount > 0 && (
                        <span className="bg-[#eef7e9] text-[#1b7a3f] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-[#6b7280] hover:text-[#1e293b]"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#f3f4f6]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[#6b7280] text-[13px]">
                        No notifications yet. Real-time updates on your pickups will appear here.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-[#f9fafb] transition-colors flex items-start justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-[#1e293b]">{notif.title}</span>
                            <span className="text-[12px] text-[#4b5563] mt-0.5">{notif.message}</span>
                            <span className="text-[10px] text-[#9ca3af] mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="text-[#9ca3af] hover:text-[#4b5563] p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Chip */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-[#f7f7f5] hover:bg-[#eef1eb] border border-[#e5e7eb] px-3 py-1.5 rounded-[14px] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#0d5933] text-white text-[12px] font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-semibold text-[#1e293b] leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e5e7eb] rounded-[18px] shadow-xl p-3 z-50 animate-in fade-in duration-150">
                  <div className="pb-3 border-b border-[#e5e7eb] mb-2">
                    <p className="text-[13px] font-bold text-[#1e293b] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#6b7280] truncate">{user.email}</p>
                    {user.centerName && (
                      <p className="text-[11px] text-[#0d5933] font-medium mt-1 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {user.centerName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-[13px]">
                    {user.role === 'citizen' && (
                      <>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigate('citizen-dashboard');
                          }}
                          className="text-left px-3 py-2 rounded-[10px] hover:bg-[#f7f7f5] text-[#1e293b]"
                        >
                          My Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigate('citizen-profile');
                          }}
                          className="text-left px-3 py-2 rounded-[10px] hover:bg-[#f7f7f5] text-[#1e293b]"
                        >
                          Profile & Password Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigate('citizen-rewards');
                          }}
                          className="text-left px-3 py-2 rounded-[10px] hover:bg-[#f7f7f5] text-[#1e293b] flex items-center justify-between"
                        >
                          <span>EcoPoints Balance</span>
                          <span className="font-bold text-[#1b7a3f]">{user.ecoPoints || 0} pts</span>
                        </button>
                      </>
                    )}

                    {user.role === 'staff' && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onNavigate('staff-dashboard');
                        }}
                        className="text-left px-3 py-2 rounded-[10px] hover:bg-[#f7f7f5] text-[#1e293b]"
                      >
                        Staff Dispatch Queue
                      </button>
                    )}

                    {user.role === 'agency' && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onNavigate('agency-analytics');
                        }}
                        className="text-left px-3 py-2 rounded-[10px] hover:bg-[#f7f7f5] text-[#1e293b]"
                      >
                        SDG 12 Analytics Console
                      </button>
                    )}

                    <div className="pt-2 border-t border-[#e5e7eb] mt-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          onNavigate('landing');
                        }}
                        className="w-full text-left px-3 py-2 rounded-[10px] text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
