'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiService, Professional } from '@/services/api';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

export default function WorkerDetail() {
  const params = useParams();
  const { t } = useLanguage();
  const id = params?.id as string;
  const [worker, setWorker] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      if (id) {
        const res = await apiService.getProfessionalDetail(parseInt(id));
        if (res.success && res.data) {
          setWorker(res.data);
        }
      }
      setIsLoading(false);
    };
    fetchWorker();
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse italic">{t.WorkerProfile?.synchronizing || 'Synchronizing Node Data...'}</div>;
  if (!worker) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-black uppercase tracking-widest text-red-500">{t.WorkerProfile?.notIdentified || 'Node Not Identified'}</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Glow Effects */}
      <div className="hero-glow top-0 left-0 w-[500px] h-[500px] opacity-10" />
      
      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/workers" className="text-slate-500 hover:text-white transition-colors">
              <span className="text-xl">←</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">{worker.user_name}</h1>
          </div>
          <div className="px-4 py-1 glass rounded-full text-[9px] font-black uppercase tracking-widest text-primary">
            {worker.experience_years > 5 ? (t.WorkerProfile?.senior || 'Senior') : (t.WorkerProfile?.certified || 'Certified')} {t.Auth?.fields?.role?.artisan || 'Artisan'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
               <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-primary/20 to-blue-500/10 border border-white/10 flex items-center justify-center font-black text-6xl text-primary shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  {worker.user_name?.[0]}
               </div>
               <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">{worker.user_name}</h2>
                    {worker.is_verified && (
                       <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">
                          ✓
                       </span>
                    )}
                  </div>
                  <p className="text-xl text-slate-400 font-medium tracking-wide uppercase">{worker.skills}</p>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary underline decoration-2 underline-offset-8">{t.WorkerProfile?.missionProfile || 'Mission Profile'}</h3>
               <p className="text-lg text-slate-300 leading-relaxed font-medium">
                  {typeof worker.bio === 'string' ? worker.bio : 'Verified elite professional bridging global standards with local artisan mastery. Expertly trained and ready for synchronization.'}
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: t.WorkerProfile?.rating || 'Rating', val: `★ ${worker.rating}` },
                 { label: t.WorkerProfile?.experience || 'Experience', val: `${worker.experience_years} ${t.WorkerProfile?.years || 'Years'}` },
                 { label: t.WorkerProfile?.hourlyRate || 'Hourly Rate', val: `$${worker.hourly_rate}` },
                 { label: t.WorkerProfile?.verified || 'Verified', val: worker.is_verified ? (t.WorkerProfile?.yes || 'Protocol 1') : (t.WorkerProfile?.no || 'None') }
               ].map((stat, i) => (
                 <div key={i} className="glass p-6 rounded-3xl border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                    <p className="font-black text-xl">{stat.val}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-8">
             <div className="glass p-8 rounded-[3rem] border-white/5 shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 border-l-4 border-primary pl-4">{t.WorkerProfile?.hiringSync || 'Hiring Synchronization'}</h3>
                
                <div className="space-y-4 mb-10">
                   <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.WorkerProfile?.serviceFee || 'Service Fee'}</span>
                      <span className="font-bold">$0.00</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.WorkerProfile?.escrowProtected || 'Escrow Protected'}</span>
                      <span className="font-bold text-green-400">{t.WorkerProfile?.locked || 'Locked'}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <Link 
                    href={`/quotes/new?worker=${worker.id}`}
                    className="block w-full py-5 bg-primary hover:bg-primary/90 text-white text-center rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-primary/20"
                  >
                    {t.WorkerProfile?.initiateLink || 'Initiate Link'}
                  </Link>
                  <button className="w-full py-5 glass hover:bg-white/5 text-slate-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                    {t.WorkerProfile?.viewLedger || 'View Verified Ledger'}
                  </button>
                </div>
                
                <p className="mt-8 text-[9px] text-center text-slate-600 font-black uppercase tracking-widest">
                  {t.WorkerProfile?.secureProtocol || 'Securely operated by Kalide Global Protocol'}
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
