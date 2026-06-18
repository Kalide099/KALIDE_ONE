'use client';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4">
            {t.Legal?.terms?.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">{t.Legal?.terms?.titlePrefix}<span className="gradient-text">{t.Legal?.terms?.titleHighlight}</span></h1>
          <p className="text-slate-400 font-medium mt-2">{t.Legal?.terms?.updated}</p>
        </div>

        <div className="glass rounded-[2rem] border-white/5 p-8 md:p-12 space-y-8 text-slate-300 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{t.Legal?.terms?.sec1Title}</h2>
            <p>
              {t.Legal?.terms?.sec1Content}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{t.Legal?.terms?.sec2Title}</h2>
            <p>
              {t.Legal?.terms?.sec2Content}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{t.Legal?.terms?.sec3Title}</h2>
            <p>
              {t.Legal?.terms?.sec3Content}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">4. Accounts and Eligibility</h2>
            <p>
              You must provide accurate account details and keep your login information private. You are responsible for actions taken from your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">5. Prohibited Use</h2>
            <p>
              Fraud, abuse, harassment, data scraping, impersonation, and any illegal activity are not allowed. Accounts involved in violations may be suspended or removed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">6. Related Policies</h2>
            <p>
              Please also review our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
              {' '}to understand how your information is managed.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block px-8 py-4 glass text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
            {t.return}
          </Link>
        </div>
      </div>
    </div>
  );
}
