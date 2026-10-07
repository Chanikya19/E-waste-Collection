import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Leaf, 
  Recycle, 
  Award, 
  Building2, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Sparkles,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { api } from '../../services/api';
import { PlatformAnalytics } from '../../types';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { useSocket } from '../../context/SocketContext';

const PIE_COLORS = ['#0d5933', '#1b7a3f', '#285943', '#4b5563', '#94a3b8', '#d9e1d8'];

export const AgencyAnalyticsPage: React.FC = () => {
  const { socket } = useSocket();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get<{ data: PlatformAnalytics }>('/api/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load agency analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Listen for real-time status updates to refresh analytics live
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchAnalytics();
    };

    socket.on('request:statusUpdated', handleUpdate);
    socket.on('request:created', handleUpdate);

    return () => {
      socket.off('request:statusUpdated', handleUpdate);
      socket.off('request:created', handleUpdate);
    };
  }, [socket]);

  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = ['Category', 'Recycled Units', 'Total Weight (kg)'];
      const rows = (analytics?.categoryBreakdown || []).map((c) => [c.category, c.count, c.weightKg]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ecocollect_sdg12_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 600);
  };

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-[#6b7280]">
        Loading SDG 12 Analytics Console...
      </div>
    );
  }

  const pieData = (analytics.categoryBreakdown || []).map((item) => ({
    name: item.category,
    value: item.weightKg,
  }));

  const centerData = (analytics.centerPerformance || []).map((c) => ({
    name: c.centerName.replace(' Center', '').replace(' Metro', ''),
    recycledKg: c.totalProcessedKg,
    pickups: c.completedPickups,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Hero Banner */}
      <div className="bg-[#1a2638] text-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-300">
              UN SDG 12 Compliance & Municipal Auditing
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight mt-1">
            Environmental Protection Agency Console
          </h1>
          <p className="text-[14px] text-gray-300 mt-1 max-w-2xl">
            Real-time material flows, hazardous toxin divergence, and certified metallurgical recycling audits across all registered collection hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SecondaryButton
            variant="app"
            onClick={fetchAnalytics}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-[13px] py-2.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Refresh
          </SecondaryButton>
          <PrimaryButton
            variant="app"
            loading={exporting}
            onClick={handleExportReport}
            icon={<Download className="w-4 h-4" />}
            className="text-[13px] py-2.5 bg-[#0d5933] hover:bg-[#0a4829]"
          >
            Export SDG Report (CSV)
          </PrimaryButton>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              Total E-Waste Recycled
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {(analytics.totalWasteRecycledKg || 0).toLocaleString()} kg
            </span>
            <span className="text-[11px] text-[#1b7a3f] font-medium mt-0.5 block">
              100% Diverted from Landfills
            </span>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-[#eef7e9] text-[#1b7a3f] flex items-center justify-center">
            <Recycle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              CO2 Emissions Avoided
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {(analytics.co2EmissionsSavedKg || 0).toLocaleString()} kg
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Calculated via EPA WARM Model
            </span>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              Precious Metals Recovered
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {(analytics.metalsRecoveredKg || 0).toLocaleString()} kg
            </span>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
              Copper, Silver, Gold, Aluminum
            </span>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-wider block">
              Toxins Neutralized
            </span>
            <span className="text-[28px] font-bold text-[#1e293b] mt-1 block">
              {(analytics.toxicDivertedKg || 0).toLocaleString()} kg
            </span>
            <span className="text-[11px] text-purple-700 font-medium mt-0.5 block">
              Lead, Mercury, Cadmium, Li-ion
            </span>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-purple-50 text-purple-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two-Column Charts: Category Breakdown & Center Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Chart 1: Material Category Composition */}
        <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
            <div>
              <h3 className="text-[16px] font-bold text-[#1e293b]">E-Waste Weight Composition by Category</h3>
              <p className="text-[12px] text-[#4b5563]">Breakdown in kilograms (kg)</p>
            </div>
            <span className="text-[12px] font-semibold bg-[#f5f7f0] text-[#0d5933] px-2.5 py-1 rounded-full">
              Live Audit
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} kg`, 'Processed Weight']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Collection Centers Processing Performance */}
        <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
            <div>
              <h3 className="text-[16px] font-bold text-[#1e293b]">Center Processing Volume</h3>
              <p className="text-[12px] text-[#4b5563]">Total kilograms recycled per facility</p>
            </div>
            <span className="text-[12px] font-semibold bg-[#eef7e9] text-[#1b7a3f] px-2.5 py-1 rounded-full">
              Hub Capacity
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centerData}>
                <XAxis dataKey="name" fontSize={11} stroke="#6b7280" />
                <YAxis fontSize={11} stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: any) => [`${value} kg`, 'Recycled Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="recycledKg" fill="#0d5933" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Real-Time Immutable Audit Log / Recent Activity */}
      <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#285943]" />
            <h3 className="text-[16px] font-bold text-[#1e293b]">Real-Time Circular Chain-of-Custody Log</h3>
          </div>
          <span className="text-[12px] text-[#6b7280]">Real-Time Streaming Active</span>
        </div>

        <div className="divide-y divide-[#f3f4f6] max-h-72 overflow-y-auto">
          {(analytics.recentActivity || []).length === 0 ? (
            <div className="py-8 text-center text-[#6b7280] text-[13px]">
              No recent audit transactions logged.
            </div>
          ) : (
            (analytics.recentActivity || []).map((activity) => (
              <div key={activity.id} className="py-3 flex items-center justify-between text-[13px] hover:bg-[#fcfdfa] px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1b7a3f]" />
                  <span className="font-semibold text-[#1e293b]">{activity.message}</span>
                </div>
                <span className="text-[11px] text-[#9ca3af] font-mono">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
