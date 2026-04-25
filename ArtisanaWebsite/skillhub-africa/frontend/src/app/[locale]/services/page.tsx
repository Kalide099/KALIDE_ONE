'use client';
import { useLanguage } from '../../../context/LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    { 
      id: 'hv', 
      title: t.ServiceBundles?.highVoltage?.subtitle || 'Smart Grid Installation', 
      desc: t.ServiceBundles?.highVoltage?.desc, 
      price: t.ServiceBundles?.highVoltage?.price, 
      tag: t.ServiceBundles?.highVoltage?.title 
    },
    { 
      id: 'pl', 
      title: t.ServiceBundles?.plumbing?.subtitle || 'Pipeline Architecture', 
      desc: t.ServiceBundles?.plumbing?.desc, 
      price: t.ServiceBundles?.plumbing?.price, 
      tag: t.ServiceBundles?.plumbing?.title 
    },
    { 
      id: 'do', 
      title: t.ServiceBundles?.devops?.subtitle || 'Cloud Infrastructure', 
      desc: t.ServiceBundles?.devops?.desc, 
      price: t.ServiceBundles?.devops?.price, 
      tag: t.ServiceBundles?.devops?.title 
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b13] text-white pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="hero-glow bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-6">
            {t.Marketplace?.badge || 'Global Marketplace'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">
            {t.Navigation?.services || 'Services'}
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg uppercase tracking-widest leading-relaxed">
            {t.Marketplace?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group glass p-10 rounded-[3.5rem] border-white/5 hover:border-secondary/40 transition-all duration-500 flex flex-col h-full hover:scale-[1.02]">
              <div className="mb-6 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-4 py-1.5 rounded-full">
                  {service.tag}
                </span>
                <p className="text-xl font-black text-white">{service.price}</p>
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-white group-hover:text-secondary transition-colors italic">
                {service.title}
              </h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-1">
                {service.desc}
              </p>
              
              <button className="w-full py-4 glass text-white rounded-2xl font-black uppercase tracking-widest text-xs group-hover:bg-secondary transition-all shadow-xl hover:shadow-secondary/20">
                {t.ServiceBundles?.cta || 'Initiate Contract'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}