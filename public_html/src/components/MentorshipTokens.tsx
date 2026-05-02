"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function MentorshipTokens() {
  const { t } = useLanguage();
  const [tokens, setTokens] = useState(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/v1/kalide-one/auth/me', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        const result = await response.json();
        setTokens(result.data?.mentorship_tokens || 0);
        
        // Fetch rewards history mock for now or real if endpoint exists
        setRewards([
          { id: 1, amount: 10, type: 'earned', reason: 'Live AR Session: Solar Grid', created_at: new Date().toISOString() },
          { id: 2, amount: 15, type: 'earned', reason: 'Masterclass Feedback', created_at: new Date().toISOString() },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="h-40 glass rounded-3xl animate-pulse" />;

  return (
    <div className="glass p-8 rounded-[2.5rem] border-purple-500/20 relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[80px] group-hover:bg-purple-500/20 transition-all" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Reputation Currency</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">Mentorship Tokens</h3>
        </div>
        <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
          🪙
        </div>
      </div>

      <div className="mb-12">
        <span className="text-5xl font-black tracking-tighter text-white">{tokens}</span>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Stored in Node</span>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">Recent Synergetic Gains</p>
        {rewards.map((reward) => (
          <div key={reward.id} className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium truncate pr-4">{reward.reason}</span>
            <span className="text-green-400 font-black">+{reward.amount}</span>
          </div>
        ))}
      </div>

      <button className="w-full py-4 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] mt-8 transition-all border border-purple-500/30">
        Exchange for Platform Fee Credits
      </button>
    </div>
  );
}
