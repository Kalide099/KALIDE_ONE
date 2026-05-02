'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function Safety() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-12 px-6">
      <div className="hero-glow top-[20%] left-[50%] -translate-x-1/2 opacity-30" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-green-400 mb-4 animate-pulse">
            {t.Legal?.safety?.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">{t.Legal?.safety?.titlePrefix}<span className="text-green-400">{t.Legal?.safety?.titleHighlight}</span></h1>
          <p className="text-slate-400 font-medium mt-4 max-w-2xl mx-auto">{t.Legal?.safety?.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass p-8 rounded-[2rem] border-green-500/20 hover:border-green-500/50 transition-colors">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{t.Legal?.safety?.sec1Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{t.Legal?.safety?.sec1Content}</p>
          </div>

          <div className="glass p-8 rounded-[2rem] border-green-500/20 hover:border-green-500/50 transition-colors">
            <div className="text-3xl mb-4">⚖️</div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white">{t.Legal?.safety?.sec2Title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{t.Legal?.safety?.sec2Content}</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="inline-block px-8 py-4 glass text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
            {t.return}
          </a>
        </div>
      </div>
    </div>
  );
}
