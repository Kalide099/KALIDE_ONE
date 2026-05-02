"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalHomeButton() {
  const { t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => router.push('/')}
      className="fixed bottom-6 right-6 z-[100] px-6 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:border-red-500/50 hover:text-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center space-x-2 group"
      aria-label="Return to Home"
    >
      <svg 
        className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span>{t.Navigation?.home || 'Home'}</span>
    </button>
  );
}
