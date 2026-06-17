"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success'>('idle');

  const handleCheckout = () => {
    setIsLoading(true);
    // Simulate API Call to create-checkout-session
    setTimeout(() => {
      setIsLoading(false);
      setPaymentStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-10" />
      
      <div className="glass max-w-lg w-full p-10 rounded-[3rem] border-white/5 relative z-10 shadow-2xl">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2 text-center">Secure Checkout</h1>
        <p className="text-slate-500 font-medium text-center mb-8 uppercase tracking-widest text-xs">SkillHub Africa Escrow Node</p>

        {paymentStatus === 'success' ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              ✓
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest">Payment Verified</h2>
            <p className="text-slate-400 text-sm">Funds have been securely locked in Escrow.</p>
            <Link href="/dashboard/client" className="block w-full py-4 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[10px] mt-8 hover:bg-secondary/80 transition-all">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Project Services</span>
                <span className="font-black">$450.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Kalide Insurance (5%)</span>
                <span className="font-black">$22.50</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/5 pt-4">
                <span className="text-slate-400 font-black uppercase tracking-widest">Total Valuation</span>
                <span className="text-secondary font-black text-xl">$472.50</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-secondary to-purple-600 hover:to-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all relative overflow-hidden"
            >
              {isLoading ? 'Processing Transaction...' : 'Initialize Secure Payment'}
              {isLoading && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
            </button>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-center space-x-2">
              <span>🔒</span>
              <span>Guaranteed by Kalide One Escrow</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
