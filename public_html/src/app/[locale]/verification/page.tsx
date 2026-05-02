"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

export default function KYCVerification() {
  const { t } = useLanguage();
  const [documentType, setDocumentType] = useState('passport');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to backend ProfessionalVerification view
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-lg glass p-12 rounded-[3rem] border-secondary/20 shadow-2xl shadow-secondary/20">
          <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl mb-8 animate-pulse">
            ✓
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">{t.kyc?.successTitle}</h1>
          <p className="text-slate-400 text-sm font-medium">
            {t.kyc?.successDesc}
          </p>
          <Link href="/dashboard/worker" className="mt-8 block w-full py-4 bg-secondary rounded-2xl font-black uppercase tracking-widest text-[10px] text-white hover:bg-secondary/90 transition-all">
            {t.kyc?.returnDash}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="hero-glow top-0 right-0 w-[400px] h-[400px] opacity-10" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white">V</div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.kyc?.headerTitle}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t.kyc?.nodeUntrusted}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-16 px-6">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 animate-pulse">
            {t.kyc?.moduleBadge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">{t.kyc?.mainTitle}</h1>
          <p className="text-slate-500 font-medium">{t.kyc?.mainDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[3rem] border-white/5 space-y-8">
          
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">{t.kyc?.sourceLabel}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'passport', label: t.kyc?.passport },
                { id: 'national_id', label: t.kyc?.nationalId },
                { id: 'drivers_license', label: t.kyc?.driversLicense }
              ].map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setDocumentType(type.id)}
                  className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${
                    documentType === type.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <span className="font-black uppercase tracking-widest text-[10px]">
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">{t.kyc?.uploadLabel}</label>
            <label className="block w-full h-48 border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-3xl bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-all">
              <span className="text-blue-400 text-3xl mb-2">⇧</span>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                {file ? file.name : t.kyc?.selectFile}
              </span>
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
            </label>
            <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest text-center mt-2">
              {t.kyc?.fileSizeLimit}
            </p>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              type="submit"
              disabled={isSubmitting || !file}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10">{isSubmitting ? t.kyc?.transmitting : t.kyc?.submit}</span>
              <div className="absolute inset-0 h-full w-0 bg-white/20 group-hover:w-full transition-all duration-300 ease-out" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
