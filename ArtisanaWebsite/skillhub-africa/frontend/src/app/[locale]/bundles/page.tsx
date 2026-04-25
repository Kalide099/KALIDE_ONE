'use client';
import { useLanguage } from '../../../context/LanguageContext';

export default function Bundles() {
  const { t } = useLanguage();

  const bundles = [
    { 
      id: 'hv', 
      title: t.ServiceBundles?.highVoltage?.title || 'High Voltage', 
      subtitle: t.ServiceBundles?.highVoltage?.subtitle,
      desc: t.ServiceBundles?.highVoltage?.desc, 
      price: t.ServiceBundles?.highVoltage?.price,
      icon: '⚡' 
    },
    { 
      id: 'pl', 
      title: t.ServiceBundles?.plumbing?.title || 'Plumbing', 
      subtitle: t.ServiceBundles?.plumbing?.subtitle,
      desc: t.ServiceBundles?.plumbing?.desc, 
      price: t.ServiceBundles?.plumbing?.price,
      icon: '💧' 
    },
    { 
      id: 'do', 
      title: t.ServiceBundles?.devops?.title || 'DevOps', 
      subtitle: t.ServiceBundles?.devops?.subtitle,
      desc: t.ServiceBundles?.devops?.desc, 
      price: t.ServiceBundles?.devops?.price,
      icon: '☁️' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b13] text-white pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="hero-glow top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="hero-glow bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 animate-pulse">
            {t.ServiceBundles?.title || 'Multi-Agent Operations'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
            {t.Navigation?.bundles || 'Service Bundles'}
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl text-lg uppercase tracking-widest leading-relaxed">
            {t.ServiceBundles?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="group glass p-10 rounded-[3rem] border-white/5 hover:border-primary/40 transition-all duration-500 flex flex-col h-full hover:-translate-y-2">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {bundle.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Marketplace?.startingAt || 'Starting From'}</p>
                  <p className="text-2xl font-black text-primary">{bundle.price}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-3xl font-black uppercase tracking-tight mb-2 text-white italic">{bundle.title}</h3>
                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-4">{bundle.subtitle}</p>
                <p className="text-slate-400 text-sm font-medium leading-relaxed flex-1">{bundle.desc}</p>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                <button className="w-full py-4 bg-white text-black hover:bg-primary hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-primary/30">
                  {t.ServiceBundles?.cta || 'Initiate Contract'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}