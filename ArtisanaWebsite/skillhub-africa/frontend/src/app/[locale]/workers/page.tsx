'use client';

import { useState, useEffect } from 'react';
import { apiService, Professional } from '@/services/api';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

export default function Workers() {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      const res = await apiService.getProfessionals();
      if (res.success && res.data) {
        setWorkers(res.data);
      }
      setIsLoading(false);
    };
    fetchWorkers();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Decor */}
      <div className="hero-glow top-0 right-0 w-[600px] h-[600px] opacity-10" />
      <div className="hero-glow bottom-0 left-0 w-[400px] h-[400px] opacity-5 bg-blue-500" />

      <main className="max-w-7xl mx-auto py-16 px-6 pt-32">
        <div className="mb-16">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            {t.Workers?.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
            {t.Workers?.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{t.Workers?.titleHighlight}</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[300px] glass rounded-[2rem] border-white/5 animate-pulse" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="py-20 text-center glass rounded-[3rem] border-white/5">
            <p className="text-slate-500 font-black uppercase tracking-widest mb-4">{t.Workers?.noNodes}</p>
            <Link href="/register" className="text-primary font-bold underline">{t.Workers?.applyJoin}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workers.map((worker) => (
              <div key={worker.id} className="group glass rounded-[2rem] border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-2xl text-primary border border-white/5">
                      {worker.user_name?.[0] || 'A'}
                    </div>
                    {worker.is_verified && (
                      <div className="px-3 py-1 bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full">
                        {t.Workers?.verifiedNode}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-black uppercase tracking-tight mb-2 truncate group-hover:text-primary transition-colors">
                    {worker.user_name}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 min-h-[1.5rem] line-clamp-1">
                    {worker.skills || t.Workers?.generalArtisan}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Workers?.rating}</p>
                      <p className="font-black text-lg">★ {worker.rating || t.Workers?.newRating}</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Workers?.rate}</p>
                      <p className="font-black text-lg">${worker.hourly_rate}/hr</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-white/5 p-4 flex gap-2">
                  <Link 
                    href={`/worker/${worker.id}`}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-center rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    {t.Workers?.viewProtocol}
                  </Link>
                  <Link 
                    href={`/quotes/new?worker=${worker.id}`}
                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white text-center rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    {t.Workers?.requestSync}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}