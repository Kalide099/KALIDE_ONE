"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

export default function ProfessionalMatch() {
  const { t, language } = useLanguage();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/v1/kalide-one/projects/matching-artisans?minRating=4');
        const result = await response.json();
        if (result.success) {
          setArtisans(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (isLoading) return <div className="h-64 glass rounded-[2.5rem] animate-pulse flex items-center justify-center text-primary font-black uppercase text-xs tracking-widest italic">Syncing Matching Engine...</div>;
  if (artisans.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-400">Algorithmic Recommendations</h2>
        <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">AI Powered</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artisans.map((artisan) => (
          <div key={artisan.id} className="group glass p-6 rounded-[2.5rem] border-white/5 hover:border-secondary/50 transition-all relative overflow-hidden">
            <div className="absolute top-4 right-4 text-secondary font-black text-xs italic">
              {artisan.matchScore}% Match
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xs text-slate-300">
                {artisan.users_user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-sm text-white">{artisan.users_user.name}</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{artisan.users_user.city}, {artisan.users_user.country}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Reputation Score</span>
                <span className="text-white">{artisan.rating} / 5.0</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${(artisan.rating / 5) * 100}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-bold italic truncate">{artisan.bio}</p>
            </div>

            <Link 
              href={`/worker/${artisan.user_id}`}
              className="block w-full py-3 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white text-center rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
            >
              Initiate Contact Protocol
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
