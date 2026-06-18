"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { apiService, PerformanceDashboard } from '@/services/api';
import {
  DEFAULT_TREND_THRESHOLDS,
  getPresenceTrend,
  getRatioPercent,
  getTrendByThreshold,
  getTrendThresholds,
  setTrendThresholds,
  TREND_BADGE_CLASSES,
  TrendThresholdConfig,
} from '@/lib/performance-trends';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  application_status?: string;
  profile_photo?: string | null;
  expertise_areas?: string[];
  company_base?: string;
  company_capabilities?: string[];
  verification_tier?: {
    tier: number;
    label: string;
  };
  badges?: string[];
  badge_level?: string;
  fraud_risk_score?: number;
  fraud_risk_level?: 'low' | 'medium' | 'high' | string;
  active_alerts?: number;
  high_severity_alerts?: number;
  phone?: string;
  city?: string;
  country?: string;
  created_at: string;
}

export default function SupremeAdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [performance, setPerformance] = useState<PerformanceDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendThresholds, setTrendThresholdsState] = useState<TrendThresholdConfig>(DEFAULT_TREND_THRESHOLDS);

  // Stats Counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeEscrow: '$0'
  });
  
  const [selectedDossier, setSelectedDossier] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('Users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const formatPercent = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const trendLabels = t.Admin?.performance?.trend || {
    up: 'Up',
    down: 'Down',
    steady: 'Steady',
  };

  const adminMetrics = performance?.admin;
  const activeUsersTrend = getTrendByThreshold(
    getRatioPercent(adminMetrics?.active_users ?? 0, adminMetrics?.total_users ?? 0),
    trendThresholds.admin.activeUsers.up,
    trendThresholds.admin.activeUsers.down
  );
  const activeProjectsTrend = getTrendByThreshold(
    getRatioPercent(adminMetrics?.completed_projects ?? 0, adminMetrics?.total_projects ?? 0),
    trendThresholds.admin.activeProjects.up,
    trendThresholds.admin.activeProjects.down
  );
  const platformVolumeTrend = getPresenceTrend(adminMetrics?.total_platform_volume ?? 0);
  const escrowVolumeTrend = getPresenceTrend(adminMetrics?.total_escrow_volume ?? 0);
  const marketplaceRatingTrend = getTrendByThreshold(
    adminMetrics?.average_marketplace_rating ?? 0,
    trendThresholds.admin.marketplaceRating.up,
    trendThresholds.admin.marketplaceRating.down
  );

  const features = ['Users', 'Projects', 'Services', 'Academy', 'Justice', 'Workers', 'Quotes', 'Supply', 'Verification'];

  const fetchData = async (tab: string) => {
    setIsLoading(true);
    try {
      const performanceRes = await apiService.getPerformanceDashboard();
      if (performanceRes.success && performanceRes.data) {
        setPerformance(performanceRes.data);
      }

      if (tab === 'Users') {
        const res = await apiService.getAdminUsers();
        if (res.success && res.data) {
          setUsers(res.data as unknown as AdminUser[]);
          setStats(prev => ({ ...prev, totalUsers: res.data?.length || 0 }));
        }
      } else if (tab === 'Projects') {
        const res = await apiService.getAdminProjects();
        if (res.success && res.data) {
          setProjects(res.data);
          setStats(prev => ({ ...prev, totalProjects: res.data?.length || 0 }));
        }
      } else if (tab === 'Services' || tab === 'Supply') {
        const res = await apiService.getAdminPayments();
        if (res.success && res.data) {
          setPayments(res.data);
          // Calculate mock escrow from payments
          const total = res.data.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
          setStats(prev => ({ ...prev, activeEscrow: `$${total.toLocaleString()}` }));
        }
      }
    } catch (error) {
      console.error("Data fetch sequence failure:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const user = apiService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const syncThresholds = () => setTrendThresholdsState(getTrendThresholds());
    syncThresholds();

    window.addEventListener('storage', syncThresholds);
    return () => {
      window.removeEventListener('storage', syncThresholds);
    };
  }, []);

  const updateRange = (
    section: keyof TrendThresholdConfig,
    metric: string,
    field: 'up' | 'down',
    value: number
  ) => {
    setTrendThresholdsState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [metric]: {
          ...(prev[section] as Record<string, { up: number; down: number }>)[metric],
          [field]: value,
        },
      },
    }));
  };

  const handleSaveThresholds = () => {
    setTrendThresholds(trendThresholds);
    alert('Trend thresholds saved. Client and worker dashboards will use these values on refresh.');
  };

  const handleResetThresholds = () => {
    setTrendThresholdsState(DEFAULT_TREND_THRESHOLDS);
    setTrendThresholds(DEFAULT_TREND_THRESHOLDS);
    alert('Trend thresholds reset to defaults.');
  };

  const handleLogout = () => {
    apiService.logout();
    router.push('/login');
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.Admin?.protocols?.eraseConfirm || 'STRICT PROTOCOL: Are you sure you want to completely erase this node from the Database?')) return;
    const res = await apiService.deleteUser(id);
    if (res.success) {
      alert(t.Admin?.protocols?.erased || 'Node Erased.');
      fetchData(activeTab);
    } else {
      alert('Action failed: ' + res.message);
    }
  };

  const handleWarn = async (id: number, name: string) => {
    const reason = prompt((t.Admin?.protocols?.warnPrompt || 'Dispatching Fraud Warning to {name}. Enter reason (or leave default):').replace('{name}', name), t.Admin?.protocols?.warnDefault || "Violation of Kalide Global T&C");
    if (reason === null) return;
    
    const res = await apiService.warnUser(id, reason);
    if (res.success) {
      alert(res.message || t.Admin?.protocols?.warnSent || 'Warning Dispatched.');
    } else {
      alert('Action failed: ' + res.message);
    }
  };

  const handleToggleAccess = async (id: number) => {
    const res = await apiService.toggleUserAccess(id);
    if (res.success) {
      fetchData(activeTab);
    }
  };

  const handleApprove = async (id: number) => {
    const res = await apiService.approveUser(id);
    if (res.success) {
      alert(res.message || 'User approved successfully.');
      fetchData(activeTab);
    } else {
      alert('Approval failed: ' + res.message);
    }
  };

  const handleUpgrade = async (id: number, tier: string) => {
    const res = await apiService.upgradeUserSubscription(id, tier);
    if (res.success) {
      alert(res.message);
    } else {
      alert('Upgrade failed: ' + res.message);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#060b13] flex items-center justify-center font-black uppercase tracking-widest text-red-500 animate-pulse">{t.Admin?.initializing || 'Initializing Supreme Control Node...'}</div>;

  return (
    <div className="min-h-screen bg-[#060b13] text-white flex overflow-hidden">
      {/* Global Admin Glow */}
      <div className="hero-glow top-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[100px] pointer-events-none fixed" />

      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex glass w-64 h-screen border-r border-red-500/20 shadow-[30px_0_30px_rgba(220,38,38,0.02)] flex-col z-50 shrink-0">
        <div className="h-24 p-6 flex items-center space-x-4 border-b border-white/5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            K
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic leading-tight">{t.Admin?.sidebar?.title || 'Omni Control'}</span>
        </div>
        
        {/* Features Nav */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
          <p className="px-4 text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4">{t.Admin?.sidebar?.systems || 'Core Systems'}</p>
          {features.map((item) => (
            <button 
              key={item} 
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${
                activeTab === item 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)]' 
                  : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-red-400'
              }`}
            >
              <span>{item}</span>
              {activeTab === item && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {t.Admin?.sidebar?.exit || 'System Exit'}
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`lg:hidden fixed left-0 top-0 z-[100] h-screen w-72 glass border-r border-red-500/20 p-4 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between border-b border-white/5 mb-4 px-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white">K</div>
            <span className="text-sm font-black uppercase tracking-widest">Admin Menu</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 font-black text-xl">X</button>
        </div>

        <nav className="space-y-2 overflow-y-auto h-[calc(100%-5rem)] pr-1">
          {features.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === item
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'text-slate-300 border border-transparent hover:bg-white/5 hover:text-red-400'
              }`}
            >
              {item}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {t.Admin?.sidebar?.exit || 'System Exit'}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto relative scrollbar-hide">
        <main className="max-w-6xl mx-auto py-12 px-6 lg:px-12 relative z-10">
        <div className="lg:hidden mb-6 max-[360px]:mb-4">
          <div className="glass rounded-2xl border border-white/10 p-4 max-[360px]:p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Current Module</p>
              <p className="text-sm max-[360px]:text-xs font-black uppercase tracking-widest text-red-400 break-words">{activeTab}</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="shrink-0 px-4 max-[360px]:px-3 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-[10px] max-[360px]:text-[9px] font-black uppercase tracking-widest text-red-300"
            >
              Modules
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 max-[360px]:grid-cols-2 gap-2">
            {features.slice(0, 6).map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`min-h-9 py-2 px-2 rounded-lg text-[9px] max-[360px]:text-[8px] font-black uppercase tracking-widest border break-words ${
                  activeTab === item ? 'border-red-500/40 text-red-300 bg-red-500/10' : 'border-white/10 text-slate-300 bg-white/5'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">
            {t.Admin?.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{t.Admin?.titleHighlight}</span>
          </h1>
          <p className="text-red-400/70 font-medium uppercase tracking-widest text-sm">
            {t.Admin?.description}
          </p>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: t.Admin?.stats?.users || 'Active Users', value: stats.totalUsers },
            { label: t.Admin?.stats?.projects || 'Global Projects', value: stats.totalProjects },
            { label: t.Admin?.stats?.escrow || 'Escrow Volume', value: stats.activeEscrow }
          ].map((s, idx) => (
            <div key={idx} className="glass p-8 rounded-[2rem] border-red-500/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{s.label}</p>
              <p className="text-4xl font-black italic">{s.value}</p>
            </div>
          ))}
        </div>

        {adminMetrics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            <div className="glass p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.performance?.activeUsers || 'Active Users'}</p>
                <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[activeUsersTrend]}`}>
                  {trendLabels[activeUsersTrend]}
                </span>
              </div>
              <p className="text-xl font-black mt-2">{adminMetrics.active_users}</p>
              <p className="text-xs text-slate-400">of {adminMetrics.total_users} {t.Admin?.performance?.activeUsersSub || 'active'}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.performance?.activeProjects || 'Active Projects'}</p>
                <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[activeProjectsTrend]}`}>
                  {trendLabels[activeProjectsTrend]}
                </span>
              </div>
              <p className="text-xl font-black mt-2">{adminMetrics.active_projects}</p>
              <p className="text-xs text-slate-400">{adminMetrics.completed_projects} {t.Admin?.performance?.completedSub || 'completed'}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.performance?.platformVolume || 'Platform Volume'}</p>
                <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[platformVolumeTrend]}`}>
                  {trendLabels[platformVolumeTrend]}
                </span>
              </div>
              <p className="text-xl font-black mt-2">${formatCurrency(adminMetrics.total_platform_volume)}</p>
              <p className="text-xs text-slate-400">{t.Admin?.performance?.invoiceTotal || 'invoice total'}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.performance?.escrowVolume || 'Escrow Volume'}</p>
                <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[escrowVolumeTrend]}`}>
                  {trendLabels[escrowVolumeTrend]}
                </span>
              </div>
              <p className="text-xl font-black mt-2">${formatCurrency(adminMetrics.total_escrow_volume)}</p>
              <p className="text-xs text-slate-400">{t.Admin?.performance?.remainingEscrow || 'remaining in escrow'}</p>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.performance?.marketplaceRating || 'Marketplace Rating'}</p>
                <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[marketplaceRatingTrend]}`}>
                  {trendLabels[marketplaceRatingTrend]}
                </span>
              </div>
              <p className="text-xl font-black mt-2">{adminMetrics.average_marketplace_rating.toFixed(2)} / 5</p>
              <p className="text-xs text-slate-400">{t.Admin?.performance?.winRate || 'Win rate'} {formatPercent(adminMetrics.global_win_rate)}%</p>
            </div>
          </div>
        )}

        <div className="glass p-6 rounded-2xl border border-white/10 mb-12">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Trend Controls</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetThresholds}
                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-400/30 text-slate-300 hover:bg-white/5"
              >
                Reset Defaults
              </button>
              <button
                onClick={handleSaveThresholds}
                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-400/40 text-red-300 hover:bg-red-500/10"
              >
                Save Thresholds
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">Set up/down values used to show trend badges across client, worker, and admin KPI cards.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="glass rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Client Completion</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={trendThresholds.client.completion.up} onChange={(e) => updateRange('client', 'completion', 'up', Number(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input type="number" value={trendThresholds.client.completion.down} onChange={(e) => updateRange('client', 'completion', 'down', Number(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
              </div>
            </label>
            <label className="glass rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Worker Win Rate</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={trendThresholds.worker.winRate.up} onChange={(e) => updateRange('worker', 'winRate', 'up', Number(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input type="number" value={trendThresholds.worker.winRate.down} onChange={(e) => updateRange('worker', 'winRate', 'down', Number(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
              </div>
            </label>
            <label className="glass rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Admin Active Users</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={trendThresholds.admin.activeUsers.up} onChange={(e) => updateRange('admin', 'activeUsers', 'up', Number(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
                <input type="number" value={trendThresholds.admin.activeUsers.down} onChange={(e) => updateRange('admin', 'activeUsers', 'down', Number(e.target.value))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs" />
              </div>
            </label>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Users' && (
          <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.05)] animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-red-500/10">
              <h2 className="text-2xl font-black uppercase tracking-widest flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span>{t.Admin?.tabs?.users || 'User Matrix Control'}</span>
              </h2>
              <div className="px-4 py-1 bg-red-500/10 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest uppercase">
                {t.Admin?.table?.status || 'Strict Access'}
              </div>
            </div>

            <div className="md:hidden space-y-4 max-[360px]:space-y-3">
              {users.map(user => (
                <div key={user.id} className="glass rounded-2xl p-4 max-[360px]:p-3 border border-white/10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.id}</p>
                      <p className="text-sm font-black text-slate-300">#{user.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.is_active ? (t.Admin?.table?.active || 'Active') : (t.Admin?.table?.suspended || 'Suspended')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm max-[360px]:text-xs font-bold text-white break-words">{user.name}</p>
                    <p className="text-xs text-slate-400 break-all">{user.email}</p>
                    {Array.isArray(user.expertise_areas) && user.expertise_areas.length > 0 && (
                      <p className="text-[10px] text-slate-400 break-words">Expertise: {user.expertise_areas.join(', ')}</p>
                    )}
                    {user.company_base && (
                      <p className="text-[10px] text-slate-400 break-words">Company Base: {user.company_base}</p>
                    )}
                    {user.verification_tier && (
                      <p className="text-[10px] text-cyan-300 break-words">Verification: {user.verification_tier.label}</p>
                    )}
                    <p className="text-[10px] text-amber-300 break-words">Badge Level: {user.badge_level || 'None'}</p>
                    <p className={`text-[10px] break-words ${
                      user.fraud_risk_level === 'high' ? 'text-red-400' :
                      user.fraud_risk_level === 'medium' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      Fraud Risk: {user.fraud_risk_score ?? 0}% ({user.fraud_risk_level || 'low'})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        user.role === 'client' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        user.application_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        user.application_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {user.application_status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 max-[360px]:grid-cols-1 gap-2">
                    <button
                      onClick={() => setSelectedDossier(user)}
                      className="px-3 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      {t.Admin?.actions?.dossier}
                    </button>
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="px-3 py-2 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleToggleAccess(user.id)}
                      className="px-3 py-2 border border-slate-500/30 text-slate-400 hover:bg-slate-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      {user.is_active ? t.Admin?.actions?.suspend : t.Admin?.actions?.unsuspend}
                    </button>
                    <button
                      onClick={() => handleWarn(user.id, user.name)}
                      className="px-3 py-2 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      {t.Admin?.actions?.warn}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      {t.Admin?.actions?.erase}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.id}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.entity}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.email}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.status}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Application</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Trust Layer</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">{t.Admin?.table?.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-red-500/5 transition-colors">
                      <td className="py-6 text-sm font-bold text-slate-400">#{user.id}</td>
                      <td className="py-6 font-bold">{user.name}</td>
                      <td className="py-6 text-sm text-slate-400">{user.email}</td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                          user.role === 'client' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {user.is_active ? (t.Admin?.table?.active || 'Active') : (t.Admin?.table?.suspended || 'Suspended')}
                        </span>
                      </td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          user.application_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          user.application_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {user.application_status || 'pending'}
                        </span>
                      </td>
                      <td className="py-6">
                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-widest font-black text-cyan-300">
                            {user.verification_tier?.label || 'Tier 0 - Unverified'}
                          </p>
                          <p className="text-[9px] uppercase tracking-widest font-black text-amber-300">
                            {user.badge_level || 'None'} Badge
                          </p>
                          <p className={`text-[9px] uppercase tracking-widest font-black ${
                            user.fraud_risk_level === 'high' ? 'text-red-400' :
                            user.fraud_risk_level === 'medium' ? 'text-orange-400' :
                            'text-green-400'
                          }`}>
                            Risk {user.fraud_risk_score ?? 0}%
                          </p>
                        </div>
                      </td>
                      <td className="py-6 flex justify-end space-x-2">
                         <button 
                          onClick={() => setSelectedDossier(user)}
                          className="px-3 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {t.Admin?.actions?.dossier}
                        </button>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="px-3 py-2 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleToggleAccess(user.id)}
                          className="px-3 py-2 border border-slate-500/30 text-slate-400 hover:bg-slate-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {user.is_active ? t.Admin?.actions?.suspend : t.Admin?.actions?.unsuspend}
                        </button>
                        <button 
                          onClick={() => handleWarn(user.id, user.name)}
                          className="px-3 py-2 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {t.Admin?.actions?.warn}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                        >
                          {t.Admin?.actions?.erase}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Projects' && (
          <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.05)] animate-in fade-in zoom-in duration-500">
             <div className="flex justify-between items-center mb-10 pb-6 border-b border-red-500/10">
              <h2 className="text-2xl font-black uppercase tracking-widest flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                <span>{t.Admin?.tabs?.projects}</span>
              </h2>
            </div>
            <div className="md:hidden space-y-4 max-[360px]:space-y-3">
              {projects.map(project => (
                <div key={project.id} className="glass rounded-2xl p-4 max-[360px]:p-3 border border-white/10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.id}</p>
                      <p className="text-sm font-black text-slate-300">#{project.id}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm max-[360px]:text-xs font-bold text-white mb-2 break-words">{project.title?.en || 'Project'}</p>
                  <p className="text-xs font-black text-red-400 mb-4">${project.budget}</p>

                  <button className="w-full px-3 py-2 border border-white/20 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                    {t.Admin?.actions?.inspect}
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.id}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.title}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.budget}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.status}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">{t.Admin?.table?.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-6 text-sm font-bold text-slate-400">#{project.id}</td>
                      <td className="py-6 font-bold">{project.title?.en || 'Project'}</td>
                      <td className="py-6 font-bold text-red-400">${project.budget}</td>
                      <td className="py-6">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {project.status}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <button className="px-3 py-2 border border-white/20 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">{t.Admin?.actions?.inspect}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === 'Services' || activeTab === 'Supply') && (
          <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.05)] animate-in fade-in zoom-in duration-500">
             <div className="flex justify-between items-center mb-10 pb-6 border-b border-red-500/10">
              <h2 className="text-2xl font-black uppercase tracking-widest flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                <span>{t.Admin?.tabs?.ledger}</span>
              </h2>
            </div>
            <div className="md:hidden space-y-4 max-[360px]:space-y-3">
              {payments.map((payment, i) => (
                <div key={i} className="glass rounded-2xl p-4 max-[360px]:p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs max-[360px]:text-[10px] font-black uppercase tracking-widest text-slate-300 break-words pr-2">
                      {t.Admin?.tabs?.syncRequest || 'Node Sync Request'}
                    </p>
                    <p className="text-[11px] max-[360px]:text-[10px] text-slate-500 shrink-0">{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-black text-red-500 mb-1">${payment.amount}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-400">{payment.status}</p>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.transaction}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.amount}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.status}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">{t.Admin?.table?.date}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-6 font-bold uppercase tracking-tight">{t.Admin?.tabs?.syncRequest || 'Node Sync Request'}</td>
                      <td className="py-6 font-black text-red-500">${payment.amount}</td>
                      <td className="py-6 uppercase text-[9px] font-black tracking-widest text-green-400">{payment.status}</td>
                      <td className="py-6 text-right text-xs text-slate-500">{new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fallback for other modules */}
        {!['Users', 'Projects', 'Services', 'Supply'].includes(activeTab) && (
          <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.05)] flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center space-x-4">
              <span className="w-4 h-4 rounded-full bg-slate-500 animate-pulse" />
              <span>{activeTab} {t.Admin?.tabs?.offline}</span>
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center max-w-lg leading-relaxed">
              {t.Admin?.offlineDesc}
            </p>
          </div>
        )}

        {/* Dossier Modal */}
        {selectedDossier && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="glass w-full max-w-2xl rounded-[3rem] p-8 border-red-500/30 relative">
              <button 
                onClick={() => setSelectedDossier(null)}
                className="absolute top-8 right-8 text-slate-400 hover:text-white font-black text-xl"
              >
                X
              </button>
              <h2 className="text-3xl font-black uppercase tracking-widest mb-2 italic">{t.Admin?.dossier?.title}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-8">Node #{selectedDossier.id} {t.Admin?.dossier?.classified}</p>

              <div className="mb-8">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Profile Photo</p>
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                  {selectedDossier.profile_photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedDossier.profile_photo} alt="Applicant profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-black uppercase tracking-widest">No Photo</div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.Admin?.table?.entity}</p>
                  <p className="font-bold">{selectedDossier.name}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.Admin?.table?.email}</p>
                  <p className="font-bold">{selectedDossier.email}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.Admin?.dossier?.contactInfo || 'Phone / Location'}</p>
                  <p className="font-bold">{selectedDossier.phone || 'N/A'} • {selectedDossier.city || 'N/A'}, {selectedDossier.country || 'N/A'}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.Admin?.table?.date}</p>
                  <p className="font-bold">{new Date(selectedDossier.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 col-span-2">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Role-specific Details</p>
                  <p className="font-bold break-words">
                    {Array.isArray(selectedDossier.expertise_areas) && selectedDossier.expertise_areas.length > 0
                      ? `Expertise: ${selectedDossier.expertise_areas.join(', ')}`
                      : 'Expertise: Not provided'}
                  </p>
                  <p className="font-bold break-words mt-2">
                    {selectedDossier.company_base
                      ? `Company Base: ${selectedDossier.company_base}`
                      : 'Company Base: Not provided'}
                  </p>
                  <p className="font-bold break-words mt-2">
                    {Array.isArray(selectedDossier.company_capabilities) && selectedDossier.company_capabilities.length > 0
                      ? `Company Capabilities: ${selectedDossier.company_capabilities.join(', ')}`
                      : 'Company Capabilities: Not provided'}
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-white/5 col-span-2">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Trust Layer</p>
                  <p className="font-bold break-words">
                    Verification Tier: {selectedDossier.verification_tier?.label || 'Tier 0 - Unverified'}
                  </p>
                  <p className="font-bold break-words mt-2">
                    Badge Level: {selectedDossier.badge_level || 'None'}
                  </p>
                  <p className="font-bold break-words mt-2">
                    Badges: {Array.isArray(selectedDossier.badges) && selectedDossier.badges.length > 0
                      ? selectedDossier.badges.join(', ')
                      : 'No badges yet'}
                  </p>
                  <p className={`font-bold break-words mt-2 ${
                    selectedDossier.fraud_risk_level === 'high' ? 'text-red-400' :
                    selectedDossier.fraud_risk_level === 'medium' ? 'text-orange-400' :
                    'text-green-400'
                  }`}>
                    Fraud Risk: {selectedDossier.fraud_risk_score ?? 0}% ({selectedDossier.fraud_risk_level || 'low'})
                  </p>
                  <p className="font-bold break-words mt-2">
                    Active Alerts: {selectedDossier.active_alerts ?? 0} | High Severity: {selectedDossier.high_severity_alerts ?? 0}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Application Controls</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  <button onClick={() => handleApprove(selectedDossier.id)} className="px-4 py-2 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    Approve Access
                  </button>
                  <button onClick={() => handleToggleAccess(selectedDossier.id)} className="px-4 py-2 border border-slate-500/30 text-slate-400 hover:bg-slate-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    {selectedDossier.is_active ? 'Block User' : 'Unblock User'}
                  </button>
                  <button onClick={() => handleDelete(selectedDossier.id)} className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    Delete User
                  </button>
                </div>

                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{t.Admin?.dossier?.override}</h3>
                <div className="flex space-x-4">
                  <button onClick={() => handleUpgrade(selectedDossier.id, 'free')} className="px-4 py-2 border border-slate-500/30 text-slate-400 hover:bg-slate-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    {t.Admin?.dossier?.grantFree}
                  </button>
                  <button onClick={() => handleUpgrade(selectedDossier.id, 'pro')} className="px-4 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    {t.Admin?.dossier?.grantPro}
                  </button>
                  <button onClick={() => handleUpgrade(selectedDossier.id, 'elite')} className="px-4 py-2 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    {t.Admin?.dossier?.grantElite}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}