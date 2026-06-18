'use client';

import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

export default function CookiesPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            {t.Legal?.cookies?.badge || 'Cookie Policy'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
            {t.Legal?.cookies?.titlePrefix || 'Cookie '}
            <span className="gradient-text">{t.Legal?.cookies?.titleHighlight || 'Policy'}</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2">
            {t.Legal?.cookies?.updated || 'Last updated: June 2026'}
          </p>
        </div>

        <div className="glass rounded-[2rem] border-white/5 p-8 md:p-12 space-y-8 text-slate-300 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
              {t.Legal?.cookies?.sec1Title || '1. What Cookies Are'}
            </h2>
            <p>
              {t.Legal?.cookies?.sec1Content || 'Cookies are small text files saved on your device to help the platform work properly and remember basic settings.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
              {t.Legal?.cookies?.sec2Title || '2. How We Use Cookies'}
            </h2>
            <p>
              {t.Legal?.cookies?.sec2Content || 'We use cookies for sign-in sessions, security checks, language preference, and essential performance analytics.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
              {t.Legal?.cookies?.sec3Title || '3. Your Choices'}
            </h2>
            <p>
              {t.Legal?.cookies?.sec3Content || 'You can accept or decline non-essential cookies from our banner. Essential cookies may still be used because they are required for core platform functions.'}
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block px-8 py-4 glass text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
            {t.return || 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
