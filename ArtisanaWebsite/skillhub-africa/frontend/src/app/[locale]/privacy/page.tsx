'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
            {t.Legal?.privacy?.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">{t.Legal?.privacy?.titlePrefix}<span className="gradient-text">{t.Legal?.privacy?.titleHighlight}</span></h1>
          <p className="text-slate-400 font-medium mt-2">{t.Legal?.privacy?.description}</p>
        </div>

        <div className="glass rounded-[2rem] border-white/5 p-8 md:p-12 space-y-8 text-slate-300 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{t.Legal?.privacy?.sec1Title}</h2>
            <p>
              {t.Legal?.privacy?.sec1Content}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{t.Legal?.privacy?.sec2Title}</h2>
            <p>
              {t.Legal?.privacy?.sec2Content}
            </p>
          </section>

          <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
            <h3 className="text-secondary font-black uppercase tracking-tight mb-2">{t.Legal?.privacy?.noticeTitle}</h3>
            <p className="text-sm text-secondary/80">{t.Legal?.privacy?.noticeContent}</p>
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
