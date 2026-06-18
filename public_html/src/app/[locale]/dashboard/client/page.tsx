"use client";

import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import { apiService, PerformanceDashboard, Project } from '@/services/api';
import ProfessionalMatch from '@/components/ProfessionalMatch';
import { DEFAULT_TREND_THRESHOLDS, getRatioPercent, getTrendByThreshold, getTrendThresholds, TREND_BADGE_CLASSES } from '@/lib/performance-trends';

export default function ClientDashboard() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [performance, setPerformance] = useState<PerformanceDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendThresholds, setTrendThresholdsState] = useState(DEFAULT_TREND_THRESHOLDS);

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const formatPercent = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const trendLabels = t.ClientDashboard?.performance?.trend || {
    up: 'Up',
    down: 'Down',
    steady: 'Steady',
  };

  useEffect(() => {
    const syncThresholds = () => setTrendThresholdsState(getTrendThresholds());
    syncThresholds();

    window.addEventListener('storage', syncThresholds);
    return () => {
      window.removeEventListener('storage', syncThresholds);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [projectsResponse, performanceResponse] = await Promise.all([
        apiService.getProjects(),
        apiService.getPerformanceDashboard(),
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        setProjects(projectsResponse.data);
      }

      if (performanceResponse.success && performanceResponse.data) {
        setPerformance(performanceResponse.data);
      }
      
      // Fetch Quotes Mock for now
      setQuotes([
        { id: 101, artisan: 'John Plumber', amount: 450, status: 'Draft', escrow: 'Pending' },
        { id: 102, artisan: 'Electric Pro', amount: 1200, status: 'Accepted', escrow: 'Funded' },
      ]);
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getTitle = (p: Project) => p.title[language] || p.title['en'] || t.ClientDashboard?.untitled || 'Untitled Project';

  const clientMetrics = performance?.client;
  const completionRatio = getRatioPercent(clientMetrics?.completed_projects ?? 0, clientMetrics?.total_projects ?? 0);
  const spendRatio = getRatioPercent(clientMetrics?.spend_total ?? 0, clientMetrics?.committed_budget_total ?? 0);

  const activeProjectsTrend = getTrendByThreshold(
    completionRatio,
    trendThresholds.client.completion.up,
    trendThresholds.client.completion.down
  );
  const spendTrend = getTrendByThreshold(
    spendRatio,
    trendThresholds.client.spend.up,
    trendThresholds.client.spend.down
  );
  const qualityTrend = getTrendByThreshold(
    clientMetrics?.quality_rating_avg ?? 0,
    trendThresholds.client.quality.up,
    trendThresholds.client.quality.down
  );
  const onTimeTrend = getTrendByThreshold(
    clientMetrics?.on_time_completion_rate ?? 0,
    trendThresholds.client.onTime.up,
    trendThresholds.client.onTime.down
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Decor */}
      <div className="hero-glow top-0 right-0 w-[400px] h-[400px] opacity-20" />
      <div className="hero-glow bottom-0 left-0 w-[300px] h-[300px] opacity-10" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20 max-[360px]:h-16">
        <div className="max-w-7xl mx-auto px-6 max-[360px]:px-3 h-full flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">K</div>
            <span className="text-lg max-[360px]:text-sm font-black tracking-tighter uppercase italic">Kalide One</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-500">{t.ClientDashboard?.nodeID || 'Node ID'}: Client-0x7F</span>
            <Link href="/profile" className="px-4 max-[360px]:px-3 py-2 max-[360px]:py-1.5 border border-white/20 bg-white/5 rounded-full text-xs max-[360px]:text-[9px] font-black uppercase tracking-widest transition-all">
              Profile
            </Link>
            <Link href="/" className="px-4 sm:px-6 max-[360px]:px-3 py-2 max-[360px]:py-1.5 glass hover:bg-white/5 rounded-full text-xs max-[360px]:text-[9px] font-black uppercase tracking-widest transition-all">
              {t.ClientDashboard?.disconnect}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 max-[360px]:py-6 px-6 max-[360px]:px-3">
        <div className="mb-16 max-[360px]:mb-8">
          <div className="inline-block px-4 max-[360px]:px-3 py-1 glass rounded-full text-[10px] max-[360px]:text-[8px] font-black uppercase tracking-widest text-primary mb-4">
            {t.ClientDashboard?.matrix}
          </div>
          <h1 className="text-4xl max-[360px]:text-2xl md:text-6xl font-black tracking-tighter uppercase italic mb-2">{t.ClientDashboard?.title}</h1>
          <p className="text-slate-500 font-medium max-[360px]:text-xs">{t.ClientDashboard?.subtitle}</p>
        </div>

        <div className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t.ClientDashboard?.performance?.activeProjects || 'Active Projects'}</p>
              <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[activeProjectsTrend]}`}>
                {trendLabels[activeProjectsTrend]}
              </span>
            </div>
            <p className="text-xl font-black mt-2">{clientMetrics?.active_projects ?? 0} {t.ClientDashboard?.performance?.active || 'Active'}</p>
            <p className="text-xs text-slate-400">{clientMetrics?.completed_projects ?? 0} {t.ClientDashboard?.performance?.completed || 'completed'}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t.ClientDashboard?.performance?.totalSpend || 'Total Spend'}</p>
              <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[spendTrend]}`}>
                {trendLabels[spendTrend]}
              </span>
            </div>
            <p className="text-xl font-black mt-2">${formatCurrency(clientMetrics?.spend_total ?? 0)}</p>
            <p className="text-xs text-slate-400">{t.ClientDashboard?.performance?.committedBudget || 'Committed budget'}: ${formatCurrency(clientMetrics?.committed_budget_total ?? 0)}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t.ClientDashboard?.performance?.qualityRating || 'Quality Rating'}</p>
              <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[qualityTrend]}`}>
                {trendLabels[qualityTrend]}
              </span>
            </div>
            <p className="text-xl font-black mt-2">{(clientMetrics?.quality_rating_avg ?? 0).toFixed(2)} / 5</p>
            <p className="text-xs text-slate-400">{clientMetrics?.quality_reviews_count ?? 0} {t.ClientDashboard?.performance?.reviews || 'reviews'}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">{t.ClientDashboard?.performance?.onTimeCompletion || 'On-Time Completion'}</p>
              <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_BADGE_CLASSES[onTimeTrend]}`}>
                {trendLabels[onTimeTrend]}
              </span>
            </div>
            <p className="text-xl font-black mt-2">{formatPercent(clientMetrics?.on_time_completion_rate ?? 0)}%</p>
            <p className="text-xs text-slate-400">{t.ClientDashboard?.performance?.onTimeLabel || 'on-time completion'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-[360px]:gap-2 mb-10 max-[360px]:mb-6 lg:hidden">
          <Link href="/workers" className="p-4 max-[360px]:p-3 glass rounded-2xl border border-white/10 text-center text-[10px] max-[360px]:text-[8px] font-black uppercase tracking-widest text-primary break-words">
            {t.ClientDashboard?.deployWorker || 'Hire Professional'}
          </Link>
          <Link href="/bundles" className="p-4 max-[360px]:p-3 glass rounded-2xl border border-white/10 text-center text-[10px] max-[360px]:text-[8px] font-black uppercase tracking-widest text-primary break-words">
            {t.ClientDashboard?.syncTeam || 'Hire Team'}
          </Link>
          <Link href="/services" className="p-4 max-[360px]:p-3 glass rounded-2xl border border-white/10 text-center text-[10px] max-[360px]:text-[8px] font-black uppercase tracking-widest text-primary break-words">
            {t.ClientDashboard?.marketplace || 'Marketplace'}
          </Link>
          <Link href="/quotes/new" className="p-4 max-[360px]:p-3 glass rounded-2xl border border-white/10 text-center text-[10px] max-[360px]:text-[8px] font-black uppercase tracking-widest text-primary break-words">
            {t.ClientDashboard?.deployNew || 'Start New Project +'}
          </Link>
        </div>

        {/* AI Recommendations Section */}
        <div className="mb-20">
          <ProfessionalMatch />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Active Projects */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-white/5 pb-4">{t.ClientDashboard?.activeDeployments}</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-64 glass rounded-[2.5rem] animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 glass rounded-[2.5rem] text-center border-dashed border-white/10">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-4">{t.ClientDashboard?.noDeployments}</p>
                <Link href="/services" className="text-primary font-black uppercase tracking-widest text-xs hover:underline">{t.ClientDashboard?.deployNew}</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-[360px]:gap-3">
                {projects.map((project) => (
                  <div key={project.id} className="group glass p-8 max-[360px]:p-4 rounded-[2.5rem] max-[360px]:rounded-2xl border-white/5 hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                        {getTitle(project).charAt(0)}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        project.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'
                      }`}>
                        {project.status === 'completed' ? (t.Status?.completed || 'Completed') : (t.Status?.in_progress || 'Active')}
                      </span>
                    </div>
                    <h3 className="text-2xl max-[360px]:text-lg font-black uppercase tracking-tight mb-2 break-words line-clamp-2">{getTitle(project)}</h3>
                    <div className="flex items-center justify-between gap-2 text-slate-500 text-sm max-[360px]:text-[10px] font-bold mb-8">
                      <span className="break-words">{t.ClientDashboard?.budget}: ${parseFloat(project.budget).toLocaleString()}</span>
                      <span className="shrink-0">{t.ClientDashboard?.projectID}: #{project.id}</span>
                    </div>
                    <Link
                      href={`/project/${project.id}`}
                      className="w-full py-4 max-[360px]:py-3 bg-white/5 hover:bg-primary text-center rounded-xl font-black uppercase tracking-widest text-[10px] max-[360px]:text-[9px] transition-all"
                    >
                      {t.ClientDashboard?.openModule}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-white/5 pb-4">{t.ClientDashboard?.fastAccess}</h2>
            <div className="space-y-4">
              <Link href="/workers" className="flex items-center justify-between p-6 max-[360px]:p-4 glass rounded-2xl hover:bg-white/5 transition-all group">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm max-[360px]:text-[11px] break-words">{t.ClientDashboard?.deployWorker}</h3>
                  <p className="text-xs max-[360px]:text-[10px] text-slate-500 font-medium break-words">{t.ClientDashboard?.workerDesc}</p>
                </div>
                <span className="text-primary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              <Link href="/bundles" className="flex items-center justify-between p-6 max-[360px]:p-4 glass rounded-2xl hover:bg-white/5 transition-all group">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm max-[360px]:text-[11px] break-words">{t.ClientDashboard?.syncTeam}</h3>
                  <p className="text-xs max-[360px]:text-[10px] text-slate-500 font-medium break-words">{t.ClientDashboard?.teamDesc}</p>
                </div>
                <span className="text-primary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              <Link href="/services" className="flex items-center justify-between p-6 max-[360px]:p-4 glass rounded-2xl hover:bg-white/5 transition-all group">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm max-[360px]:text-[11px] break-words">{t.ClientDashboard?.marketplace}</h3>
                  <p className="text-xs max-[360px]:text-[10px] text-slate-500 font-medium break-words">{t.ClientDashboard?.marketplaceDesc}</p>
                </div>
                <span className="text-primary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>

            {/* Financial Escrow Quotes */}
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mt-12 mb-8 border-b border-white/5 pb-4">{t.ClientDashboard?.escrowQuotes}</h2>
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="p-6 max-[360px]:p-4 glass rounded-2xl border-white/5 group hover:border-white/20 transition-all">
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-sm max-[360px]:text-[11px] break-words pr-2">{quote.artisan}</h3>
                        <p className="text-[10px] max-[360px]:text-[8px] text-slate-500 uppercase tracking-widest mt-1 break-words">{t.ClientDashboard?.escrow || 'Escrow'}: <span className={quote.escrow === 'Funded' ? 'text-green-400' : 'text-yellow-400'}>{quote.escrow === 'Funded' ? (t.Status?.funded || 'Funded') : (t.Status?.pending || 'Pending')}</span></p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      quote.status === 'Accepted' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                    } shrink-0`}>
                      {quote.status === 'Accepted' ? (t.Status?.accepted || 'Accepted') : (t.Status?.draft || 'Draft')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs max-[360px]:text-[10px] font-bold text-white">${quote.amount}</span>
                    <button className="text-primary text-[10px] max-[360px]:text-[8px] font-black uppercase tracking-widest hover:underline shrink-0">{t.ClientDashboard?.reviewFund}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}