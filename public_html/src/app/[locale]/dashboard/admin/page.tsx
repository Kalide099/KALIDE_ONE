"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { apiService } from '@/services/api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Stats Counters
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeEscrow: '$0'
  });
  
  const [selectedDossier, setSelectedDossier] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('Users');

  const features = ['Users', 'Projects', 'Services', 'Academy', 'Justice', 'Workers', 'Quotes', 'Supply', 'Verification'];

  const fetchData = async (tab: string) => {
    setIsLoading(true);
    try {
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
      <aside className="glass w-64 h-screen border-r border-red-500/20 shadow-[30px_0_30px_rgba(220,38,38,0.02)] flex flex-col z-50 shrink-0">
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

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto relative scrollbar-hide">
        <main className="max-w-6xl mx-auto py-12 px-6 lg:px-12 relative z-10">
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.id}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.entity}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.email}</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.Admin?.table?.status}</th>
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
                      <td className="py-6 flex justify-end space-x-2">
                         <button 
                          onClick={() => setSelectedDossier(user)}
                          className="px-3 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          {t.Admin?.actions?.dossier}
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
            <div className="overflow-x-auto">
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
            <div className="overflow-x-auto">
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
              </div>

              <div className="border-t border-white/5 pt-8">
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