"use client";

import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import { apiService, Project } from '@/services/api';
import ProfessionalMatch from '@/components/ProfessionalMatch';

export default function ClientDashboard() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [projRes, quoteRes] = await Promise.all([
        apiService.getProjects(),
        apiService.getQuotes()
      ]);

      if (projRes.success && projRes.data) {
        setProjects(projRes.data);
      }
      
      if (quoteRes.success && quoteRes.data) {
        // Adapt backend structure to UI expectation
        const formattedQuotes = quoteRes.data.map(q => ({
            id: q.id,
            artisan: q.users_user_payments_quote_artisan_idTousers_user?.name || 'Unknown',
            amount: q.total_amount,
            status: q.status === 'accepted' ? 'Accepted' : 'Draft',
            escrow: q.status === 'accepted' ? 'Funded' : 'Pending',
            projectTitle: q.projects_projects?.title[language] || 'Project'
        }));
        setQuotes(formattedQuotes);
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, [language]);

  const handleFund = async (quoteId: number) => {
    // Optimistic UI or Loading state
    const confirmFund = window.confirm(t.Status?.confirmFund || 'Are you sure you want to fund this escrow?');
    if (!confirmFund) return;

    const res = await apiService.fundQuote(quoteId);
    if (res.success) {
        // Refresh data
        const quoteRes = await apiService.getQuotes();
        if (quoteRes.success && quoteRes.data) {
            const formattedQuotes = quoteRes.data.map(q => ({
                id: q.id,
                artisan: q.users_user_payments_quote_artisan_idTousers_user?.name || 'Unknown',
                amount: q.total_amount,
                status: q.status === 'accepted' ? 'Accepted' : 'Draft',
                escrow: q.status === 'accepted' ? 'Funded' : 'Pending',
                projectTitle: q.projects_projects?.title[language] || 'Project'
            }));
            setQuotes(formattedQuotes);
        }
        alert(t.Status?.fundSuccess || 'Escrow funded successfully!');
    } else {
        alert(res.message || 'Funding failed');
    }
  };

  const getTitle = (p: Project) => p.title[language] || p.title['en'] || t.ClientDashboard?.untitled || 'Untitled Project';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Decor */}
      <div className="hero-glow top-0 right-0 w-[400px] h-[400px] opacity-20" />
      <div className="hero-glow bottom-0 left-0 w-[300px] h-[300px] opacity-10" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">K</div>
            <span className="text-lg font-black tracking-tighter uppercase italic">Kalide One</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t.ClientDashboard?.nodeID || 'Node ID'}: Client-0x7F</span>
            <Link href="/" className="px-6 py-2 glass hover:bg-white/5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              {t.ClientDashboard?.disconnect}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-16">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            {t.ClientDashboard?.matrix}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-2">{t.ClientDashboard?.title}</h1>
          <p className="text-slate-500 font-medium">{t.ClientDashboard?.subtitle}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="group glass p-8 rounded-[2.5rem] border-white/5 hover:border-primary/50 transition-all">
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
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 truncate">{getTitle(project)}</h3>
                    <div className="flex items-center justify-between text-slate-500 text-sm font-bold mb-8">
                      <span>{t.ClientDashboard?.budget}: ${parseFloat(project.budget).toLocaleString()}</span>
                      <span>{t.ClientDashboard?.projectID}: #{project.id}</span>
                    </div>
                    <Link
                      href={`/project/${project.id}`}
                      className="w-full py-4 bg-white/5 hover:bg-primary text-center rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
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
              <Link href="/workers" className="flex items-center justify-between p-6 glass rounded-2xl hover:bg-white/5 transition-all group">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm">{t.ClientDashboard?.deployWorker}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t.ClientDashboard?.workerDesc}</p>
                </div>
                <span className="text-primary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              <Link href="/bundles" className="flex items-center justify-between p-6 glass rounded-2xl hover:bg-white/5 transition-all group">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm">{t.ClientDashboard?.syncTeam}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t.ClientDashboard?.teamDesc}</p>
                </div>
                <span className="text-primary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              <Link href="/services" className="flex items-center justify-between p-6 glass rounded-2xl hover:bg-white/5 transition-all group">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm">{t.ClientDashboard?.marketplace}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t.ClientDashboard?.marketplaceDesc}</p>
                </div>
                <span className="text-primary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>

            {/* Financial Escrow Quotes */}
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mt-12 mb-8 border-b border-white/5 pb-4">{t.ClientDashboard?.escrowQuotes}</h2>
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="p-6 glass rounded-2xl border-white/5 group hover:border-white/20 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-sm truncate pr-4">{quote.artisan}</h3>
                        <p className="text-[9px] text-primary/70 font-bold uppercase tracking-widest">{quote.projectTitle}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{t.ClientDashboard?.escrow || 'Escrow'}: <span className={quote.escrow === 'Funded' ? 'text-green-400' : 'text-yellow-400'}>{quote.escrow === 'Funded' ? (t.Status?.funded || 'Funded') : (t.Status?.pending || 'Pending')}</span></p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      quote.status === 'Accepted' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {quote.status === 'Accepted' ? (t.Status?.accepted || 'Accepted') : (t.Status?.draft || 'Draft')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">${quote.amount}</span>
                    <button 
                      onClick={() => handleFund(Number(quote.id))}
                      disabled={quote.escrow === 'Funded'}
                      className={`text-[10px] font-black uppercase tracking-widest hover:underline ${
                        quote.escrow === 'Funded' ? 'text-slate-600 cursor-not-allowed' : 'text-primary'
                      }`}
                    >
                      {quote.escrow === 'Funded' ? (t.Status?.funded || 'Funded') : t.ClientDashboard?.reviewFund}
                    </button>
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