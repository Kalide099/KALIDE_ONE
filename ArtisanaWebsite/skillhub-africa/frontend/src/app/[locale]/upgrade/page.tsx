"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

export default function UpgradeNode() {
  const { t } = useLanguage();

  const plans = [
    {
      id: 'free',
      name: t.Upgrade?.plans?.free?.name,
      price: '$0',
      period: t.Upgrade?.periods?.forever,
      features: t.Upgrade?.plans?.free?.features || [],
      current: true,
      buttonText: t.Upgrade?.plans?.free?.btn,
      theme: 'border-white/10 text-slate-400',
    },
    {
      id: 'pro',
      name: t.Upgrade?.plans?.pro?.name,
      price: '$29',
      period: t.Upgrade?.periods?.month,
      features: t.Upgrade?.plans?.pro?.features || [],
      current: false,
      buttonText: t.Upgrade?.plans?.pro?.btn,
      theme: 'border-secondary/50 shadow-lg shadow-secondary/20 scale-105 z-10 bg-secondary/5',
      glow: 'shadow-secondary/20'
    },
    {
      id: 'elite',
      name: t.Upgrade?.plans?.elite?.name,
      price: '$99',
      period: t.Upgrade?.periods?.month,
      features: t.Upgrade?.plans?.elite?.features || [],
      current: false,
      buttonText: t.Upgrade?.plans?.elite?.btn,
      theme: 'border-purple-500/30 bg-purple-500/5',
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Ambience */}
      <div className="hero-glow top-0 right-0 w-[600px] h-[600px] opacity-10" />
      <div className="hero-glow-purple bottom-0 left-0 w-[500px] h-[500px] opacity-10 blur-3xl pointer-events-none" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-secondary to-purple-500 flex items-center justify-center font-black text-white">
              ⬆
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Upgrade?.headerTitle}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t.Upgrade?.nodeFree}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-24 px-6 relative z-10 pt-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-secondary mb-6 animate-pulse">
            {t.Upgrade?.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic mb-6">
            {t.Upgrade?.titlePrefix}<span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-purple-400">{t.Upgrade?.titleHighlight}</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {t.Upgrade?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`glass rounded-[3rem] p-8 md:p-10 border transition-all duration-500 ${plan.theme}`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-secondary/30">
                  {t.Upgrade?.standard}
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-black tracking-widest uppercase mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-5xl font-black tracking-tighter italic">{plan.price}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <span className={`text-sm ${plan.id === 'pro' ? 'text-secondary' : plan.id === 'elite' ? 'text-purple-400' : 'text-slate-500'}`}>✓</span>
                    <span className="text-sm font-medium text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden group ${
                  plan.current 
                    ? 'bg-white/5 text-slate-400 cursor-not-allowed' 
                    : plan.id === 'pro'
                      ? 'bg-secondary text-white hover:bg-secondary/90 shadow-xl shadow-secondary/20'
                      : 'border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500'
                }`}
                disabled={plan.current}
              >
                <span className="relative z-10">{plan.buttonText}</span>
                {!plan.current && <div className="absolute inset-0 h-full w-0 bg-white/20 group-hover:w-full transition-all duration-300 ease-out" />}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
