"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

export default function KalideAcademy() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'mentors' | 'masterclasses' | 'forum'>('mentors');

  const mentors = [
    { id: 1, name: 'Eng. Marcus T.', domain: 'Advanced Electrical Grids', rate: '$45/hr', rating: 4.9, country: 'DE', ar: true },
    { id: 2, name: 'Sarah O.', domain: 'Industrial Plumbing', rate: '$35/hr', rating: 4.8, country: 'KE', ar: false },
    { id: 3, name: 'David L.', domain: 'Smart Home Automation', rate: '$55/hr', rating: 5.0, country: 'US', ar: true },
  ];

  const masterclasses = [
    { id: 1, title: 'Solar Panel Installation for Commercial scale', instructor: 'Dr. Evans', price: '$99', students: 1204, badge: 'Solar Tech Pro' },
    { id: 2, title: 'Modern Sustainable Carpentry', instructor: 'Jens M.', price: '$49', students: 850, badge: 'Woodworking Master' },
  ];

  const forumPosts = [
    { id: 1, title: 'How to bypass standard load limits on D4 inverters?', author: 'AliK_99', upvotes: 245, replies: 12, category: 'Electrical' },
    { id: 2, title: 'Best waterproof sealant for tropical climates?', author: 'RoofCrafters', upvotes: 180, replies: 34, category: 'Construction' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Immersive Background */}
      <div className="hero-glow-purple top-0 left-0 w-[500px] h-[500px] opacity-10 blur-3xl pointer-events-none" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-black text-white">
              A
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Academy?.brainNode || 'Global Brain Node'}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <span>{t.Academy?.reputation || 'Reputation'}:</span>
              <span className="text-purple-400">1,240 pts</span>
            </div>
            <button className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold hover:bg-white/5 transition-all">
              {t.Academy?.publish || '+ Publish'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 mb-6 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            {t.Academy?.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">
            {t.Academy?.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{t.Academy?.titleHighlight}</span>
          </h1>
          <p className="text-slate-400 md:text-lg font-medium leading-relaxed">
            {t.Academy?.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {[
            { id: 'mentors', label: t.Academy?.tabs?.mentors || 'Mentors (Live AR)' },
            { id: 'masterclasses', label: t.Academy?.tabs?.masterclasses || 'Masterclasses (VOD)' },
            { id: 'forum', label: t.Academy?.tabs?.forum || 'Global Forum' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/50 shadow-lg shadow-purple-500/10' 
                  : 'glass text-slate-500 hover:text-white border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {/* Mentors */}
          {activeTab === 'mentors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map(mentor => (
                <div key={mentor.id} className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="text-[10px] font-black text-slate-500">{mentor.country}</span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-2xl mb-6 group-hover:scale-110 transition-transform">
                    {mentor.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">{mentor.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 h-8">{mentor.domain}</p>
                  
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <span className="text-2xl font-black italic">{mentor.rate}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs font-bold">{mentor.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                      {t.Academy?.actions?.viewMatrix || 'View Availability Matrix'}
                    </button>
                    {mentor.ar && (
                      <button 
                        onClick={() => {
                          alert(`Initializing Neural AR Link with ${mentor.name}... Please wear your VR/AR headset.`);
                        }}
                        className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-purple-500 text-white hover:bg-purple-400 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>{t.Academy?.actions?.bookAR || 'Book Live AR Remote Assist'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Masterclasses */}
          {activeTab === 'masterclasses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {masterclasses.map(course => (
                <div key={course.id} className="glass p-1 flex flex-col md:flex-row rounded-[2.5rem] border-white/5 hover:border-blue-500/30 transition-all">
                  <div className="w-full md:w-48 h-48 bg-gradient-to-br from-black to-slate-900 rounded-[2.2rem] m-2 flex items-center justify-center relative overflow-hidden">
                    <span className="text-4xl">▶</span>
                    <div className="absolute inset-0 bg-blue-500/10" />
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-4 self-start">
                      {t.Academy?.awards || 'Awards'}: {course.badge}
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">{course.title}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">By {course.instructor} • {course.students} Enrolled</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-black italic">{course.price}</span>
                      <button 
                        onClick={() => {
                          const btn = document.activeElement as HTMLButtonElement;
                          const originalText = btn.innerText;
                          btn.innerText = 'Syncing...';
                          setTimeout(() => {
                            btn.innerText = 'Node Owned ✓';
                            btn.classList.replace('bg-blue-500', 'bg-green-500/20');
                            btn.classList.add('text-green-400');
                          }, 1000);
                        }}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {t.Academy?.actions?.purchase || 'Purchase Node'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Global Forum */}
          {activeTab === 'forum' && (
            <div className="glass rounded-[3rem] p-8 md:p-12 border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                <h2 className="text-2xl font-black uppercase tracking-widest">{t.Academy?.forumTitle || 'Global Synapse'}</h2>
                <input 
                  type="text" 
                  placeholder={t.Academy?.actions?.searchForum || "Search Neural Network..."}
                  className="bg-black/40 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-purple-500 w-full max-w-xs transition-all"
                />
              </div>
              
              <div className="space-y-4">
                {forumPosts.map(post => (
                  <div key={post.id} className="flex items-center p-6 border border-white/5 hover:border-white/10 rounded-2xl bg-black/20 hover:bg-black/40 transition-all cursor-pointer">
                    <div className="flex flex-col items-center mr-6 px-4">
                      <span className="text-purple-400 text-xl font-black">▲</span>
                      <span className="font-bold text-sm mt-1">{post.upvotes}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-1 hover:text-purple-400 transition-colors">{post.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Posted by {post.author} in {post.category}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center space-x-2 text-slate-400 text-xs font-bold">
                      <span>💬 {post.replies} Replies</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  {t.Academy?.actions?.loadThreads || 'Load Older Threads ↓'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
