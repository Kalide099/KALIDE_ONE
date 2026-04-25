"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";

export default function ApplicationPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    applicationType: "verification",
    fullName: "",
    businessName: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for application submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-white flex flex-col relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] pointer-events-none" />

      {/* Simple Header */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 pt-32 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">
            {t.Apply?.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">
            {t.Apply?.titlePrefix}<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">{t.Apply?.titleHighlight}</span>
          </h1>
          <p className="text-slate-400 font-medium uppercase tracking-widest text-sm max-w-2xl mx-auto">
            {t.Apply?.description}
          </p>
        </div>

        {submitted ? (
          <div className="glass rounded-[3rem] p-12 text-center border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-widest mb-4">{t.Apply?.successTitle}</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              {t.Apply?.successDesc}
            </p>
            <button 
              onClick={() => router.push('/dashboard/client')}
              className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {t.Apply?.returnHub}
            </button>
          </div>
        ) : (
          <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/10 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Type Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">{t.Apply?.classification}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'verification', label: t.Apply?.types?.verification },
                    { id: 'partnership', label: t.Apply?.types?.partnership },
                    { id: 'academy', label: t.Apply?.types?.academy }
                  ].map((type) => (
                    <div 
                      key={type.id}
                      onClick={() => setFormData({...formData, applicationType: type.id})}
                      className={`cursor-pointer border rounded-2xl p-4 text-center transition-all duration-300 ${
                        formData.applicationType === type.id 
                          ? 'border-red-500 bg-red-500/10 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]' 
                          : 'border-white/5 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${formData.applicationType === type.id ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.applicationType === type.id ? 'text-white' : 'text-slate-400'}`}>
                        {type.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">{t.Apply?.fields?.name}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
                    placeholder={t.Apply?.fields?.namePlaceholder}
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">{t.Apply?.fields?.alias}</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-medium"
                    placeholder={t.Apply?.fields?.aliasPlaceholder}
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">{t.Apply?.fields?.proposal}</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-medium resize-none"
                  placeholder={t.Apply?.fields?.proposalPlaceholder}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">{t.Apply?.fields?.dossier}</label>
                <div className="w-full border-2 border-dashed border-white/10 rounded-3xl p-10 text-center hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500/20 transition-colors">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-300">{t.Apply?.fields?.dossierClick}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{t.Apply?.fields?.dossierLimit}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{t.Apply?.transmitting}</span>
                    </>
                  ) : (
                    <span>{t.Apply?.submit}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </main>
    </div>
  );
}
