"use client";

import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import { apiService, Project } from '@/services/api';

export default function WorkerDashboard() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await apiService.getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
      
      // Fetch Quotes Mock for now until API is updated
      setQuotes([
        { id: 101, project: 'Villa Plumbing', amount: 450, status: 'Draft' },
        { id: 102, project: 'Office Wiring', amount: 1200, status: 'Accepted' },
      ]);
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getTitle = (p: Project) => p.title[language] || p.title['en'] || 'Untitled Project';

  const services = [
    { id: 1, title: 'Plumbing Service', price: 50, bookings: 5 },
    { id: 2, title: 'Electrical Work', price: 75, bookings: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Decor */}
      <div className="hero-glow top-0 left-0 w-[400px] h-[400px] opacity-20" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">K</div>
            <span className="text-lg font-black tracking-tighter uppercase italic">Kalide One</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/upgrade" className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-secondary to-purple-500 rounded-full hover:scale-105 transition-all shadow-lg shadow-secondary/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{t.WorkerDashboard?.upgradeNode}</span>
            </Link>
            <Link href="/verification" className="hidden sm:flex items-center space-x-2 px-4 py-2 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 rounded-full transition-all group">
              <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{t.WorkerDashboard?.kycNeeded}</span>
            </Link>
            <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-secondary">{t.WorkerDashboard?.nodeID}-0x3C</span>
            <Link href="/" className="px-6 py-2 glass hover:bg-white/5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              {t.WorkerDashboard?.disconnect}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6 pt-32">
        <div className="mb-16">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
            {t.WorkerDashboard?.outputNode}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-2">{t.WorkerDashboard?.title}</h1>
          <p className="text-slate-500 font-medium">{t.WorkerDashboard?.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* My Projects */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-white/5 pb-4">{t.WorkerDashboard?.assignedOps}</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-64 glass rounded-[2.5rem] animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 glass rounded-[2.5rem] text-center border-dashed border-white/10">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-4">{t.WorkerDashboard?.noOps}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="group glass p-8 rounded-[2.5rem] border-white/5 hover:border-secondary/50 transition-all">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                        {getTitle(project).charAt(0)}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        project.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-secondary/10 text-secondary'
                      }`}>
                        {project.status === 'completed' ? (t.Status?.completed || 'Completed') : (t.Status?.in_progress || 'Active')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 truncate">{getTitle(project)}</h3>
                    <p className="text-slate-500 text-xs font-bold mb-8 italic truncate">{t.WorkerDashboard?.origin || 'Origin'}: Node {project.client}</p>
                    <Link
                      href={`/project/${project.id}`}
                      className="w-full py-4 bg-white/5 hover:bg-secondary text-center rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      {t.WorkerDashboard?.enterProject}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-white/5 pb-4">{t.WorkerDashboard?.serviceModules}</h2>
            <div className="space-y-4">
              <Link href="/availability" className="flex items-center justify-between p-6 glass rounded-2xl border-white/5 border hover:border-secondary/50 group transition-all">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary group-hover:text-white transition-colors">{t.Availability?.headerTitle}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{t.WorkerDashboard?.availabilityDesc}</p>
                </div>
                <span className="text-secondary group-hover:translate-x-2 transition-transform">→</span>
              </Link>
              {services.map((service) => (
                <div key={service.id} className="p-6 glass rounded-2xl border-white/5 group hover:border-white/20 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black uppercase tracking-tight text-sm">{service.title}</h3>
                    <span className="text-xs font-bold text-slate-400">${service.price}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{service.bookings} {t.WorkerDashboard?.verifiedBookings}</span>
                    <button 
                      onClick={() => { setSelectedService(service); setActiveModal('edit-service'); }}
                      className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      {t.WorkerDashboard?.editNode}
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setActiveModal('new-service')}
                className="w-full py-5 border border-dashed border-white/10 hover:border-secondary/50 hover:bg-secondary/5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-secondary transition-all"
              >
                {t.WorkerDashboard?.newService}
              </button>
            </div>

            {/* Quotes and Invoices */}
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mt-12 mb-8 border-b border-white/5 pb-4">{t.WorkerDashboard?.financialNode}</h2>
            <div className="space-y-4">
              <Link href="/dashboard/worker/wallet" className="flex items-center justify-between p-6 glass rounded-2xl border-secondary/30 border bg-secondary/5 hover:bg-secondary/10 group transition-all">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary group-hover:text-white transition-colors">Financial Intelligence Node</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Manage liquid assets & Mobile Money payouts</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-secondary group-hover:translate-x-2 transition-transform text-xl">→</span>
                </div>
              </Link>
              {quotes.map((quote) => (
                <div key={quote.id} className="p-6 glass rounded-2xl border-white/5 group hover:border-white/20 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black uppercase tracking-tight text-sm truncate pr-4">{quote.project}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      quote.status === 'Accepted' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {quote.status === 'Accepted' ? (t.Status?.accepted || 'Accepted') : (t.Status?.draft || 'Draft')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">${quote.amount}</span>
                    <button 
                      onClick={() => { setSelectedService(quote); setActiveModal('view-quote'); }}
                      className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      {t.WorkerDashboard?.viewQuote}
                    </button>
                  </div>
                </div>
              ))}
              <Link href="/quotes/new" className="block w-full py-5 glass text-center border-secondary/20 hover:border-secondary hover:bg-secondary/5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-secondary transition-all shadow-lg shadow-secondary/10">
                {t.WorkerDashboard?.newQuote}
              </Link>

              {/* Kalide Supply Link */}
              <Link href="/supply" className="flex items-center justify-between p-6 glass rounded-2xl border-orange-500/20 border hover:border-orange-500/50 group transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-orange-400 group-hover:text-white transition-colors">{t.WorkerDashboard?.supplyB2B}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{t.WorkerDashboard?.supplyDesc}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-orange-400 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </Link>
            </div>
            
            
            {/* Communication & Intelligence Node */}
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mt-12 mb-8 border-b border-white/5 pb-4">{t.WorkerDashboard?.networkIntel}</h2>
            <div className="space-y-4">
              <Link href="/messages" className="flex items-center justify-between p-6 glass rounded-2xl border-white/5 border hover:border-blue-500/50 group transition-all">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-blue-400 group-hover:text-white transition-colors">{t.WorkerDashboard?.messenger}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{t.WorkerDashboard?.messengerDesc}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-full">1 {t.WorkerDashboard?.newBadge}</span>
                  <span className="text-blue-400 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </Link>

              {/* Academy Link */}
              <Link href="/academy" className="flex items-center justify-between p-6 glass rounded-2xl border-purple-500/20 border hover:border-purple-500/50 group transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-purple-400 group-hover:text-white transition-colors">{t.WorkerDashboard?.academy}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{t.WorkerDashboard?.academyDesc}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-purple-400 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </Link>

              {/* Justice Node Link */}
              <Link href="/justice" className="flex items-center justify-between p-6 glass rounded-2xl border-red-500/20 border hover:border-red-500/50 group transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-red-400 group-hover:text-white transition-colors">{t.WorkerDashboard?.justice}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{t.WorkerDashboard?.justiceDesc}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">1 {t.WorkerDashboard?.activeBadge}</span>
                  <span className="text-red-400 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamic Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="glass w-full max-w-lg rounded-[3rem] p-8 border-secondary/20 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white font-black">X</button>
            
            {activeModal === 'edit-service' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">{t.WorkerDashboard?.editService}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{t.WorkerDashboard?.serviceTitle}</label>
                    <input type="text" defaultValue={selectedService?.title} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{t.WorkerDashboard?.priceHr}</label>
                    <input type="number" defaultValue={selectedService?.price} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold" />
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="w-full py-5 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] mt-8">{t.WorkerDashboard?.commitUpdates}</button>
              </div>
            )}

            {activeModal === 'new-service' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">{t.WorkerDashboard?.appendNode}</h2>
                <div className="space-y-4">
                  <input type="text" placeholder={t.WorkerDashboard?.servicePlaceholder} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold" />
                  <input type="number" placeholder={t.WorkerDashboard?.baseFee} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold" />
                </div>
                <button onClick={() => setActiveModal(null)} className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] mt-8">{t.WorkerDashboard?.initializeNode}</button>
              </div>
            )}

            {activeModal === 'view-quote' && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">{t.WorkerDashboard?.classifiedQuote}</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{t.WorkerDashboard?.refID || 'Ref ID: '}{selectedService?.id}X</p>
                  </div>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-full uppercase tracking-widest">{selectedService?.status === 'Accepted' ? (t.Status?.accepted || 'Accepted') : (t.Status?.draft || 'Draft')}</span>
                </div>
                
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">{t.WorkerDashboard?.projectNode}</span>
                    <span className="font-black">{selectedService?.project}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">{t.WorkerDashboard?.baseValuation}</span>
                    <span className="font-black">${selectedService?.amount}.00</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-white/5 pt-4">
                    <span className="text-slate-500 font-bold">{t.WorkerDashboard?.escrowGuarantee}</span>
                    <span className="text-green-400 font-black">{t.WorkerDashboard?.verifiedByKalide}</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-4 glass text-[10px] font-black uppercase tracking-widest rounded-xl">{t.WorkerDashboard?.downloadPDF}</button>
                  {selectedService?.status === 'Draft' && (
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{t.WorkerDashboard?.transmitClient}</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}