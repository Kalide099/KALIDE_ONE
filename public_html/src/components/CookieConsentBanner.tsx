'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

const CONSENT_KEY = 'cookie_consent_choice';

export default function CookieConsentBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    setVisible(!stored);
  }, []);

  const saveChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[120] md:left-auto md:max-w-lg">
      <div className="glass border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl">
        <h3 className="text-white font-black uppercase tracking-wider text-xs mb-2">
          {t.Legal?.cookies?.bannerTitle || 'Cookie Preferences'}
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {t.Legal?.cookies?.bannerDescription || 'We use cookies to keep the platform secure, improve performance, and remember your preferences.'}{' '}
          <Link href="/cookies" className="text-primary hover:underline">
            {t.Legal?.cookies?.learnMore || 'Learn more'}
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveChoice('accepted')}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/90"
          >
            {t.Legal?.cookies?.accept || 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => saveChoice('declined')}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-black uppercase tracking-wider hover:bg-white/20"
          >
            {t.Legal?.cookies?.decline || 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
}
