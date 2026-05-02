"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { apiService } from '@/services/api';
import { Link } from '@/i18n/routing';

export default function WorkerWallet() {
  const { t } = useLanguage();
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    provider: 'mpesa',
    phoneNumber: ''
  });

  useEffect(() => {
    const fetchWallet = async () => {
      const response = await fetch('/api/v1/kalide-one/payments/wallets/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setWallet(data);
      setIsLoading(false);
    };
    fetchWallet();
  }, []);

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutForm.amount || !payoutForm.phoneNumber) return;

    setIsRequesting(true);
    try {
      const response = await fetch('/api/v1/kalide-one/payments/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payoutForm)
      });
      const result = await response.json();
      if (response.ok) {
        alert("Payout request submitted successfully!");
        // Refresh wallet
        window.location.reload();
      } else {
        alert(result.message || "Payout failed");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-secondary font-black uppercase animate-pulse">Initializing Financial Node...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-slate-500 hover:text-white transition-colors">←</Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-black uppercase tracking-widest italic">Financial Intelligence Node</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Wallet Balance */}
          <div className="glass p-12 rounded-[3rem] border-secondary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl group-hover:bg-secondary/20 transition-all" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Total Liquid Assets</p>
            <h2 className="text-6xl font-black tracking-tighter mb-4 italic">
              {wallet?.currency} {parseFloat(wallet?.balance || '0').toLocaleString()}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Escrow Securely Synchronized</span>
            </div>
          </div>

          {/* Payout Form */}
          <div className="glass p-12 rounded-[3rem] border-white/5">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Withdraw to Mobile Money</h3>
            <form onSubmit={handlePayout} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Amount to Withdraw</label>
                <input 
                  type="number" 
                  required
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-secondary/50 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Mobile Money Provider</label>
                <select 
                  value={payoutForm.provider}
                  onChange={(e) => setPayoutForm({...payoutForm, provider: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-secondary/50 transition-all appearance-none"
                >
                  <option value="mpesa" className="bg-[#1e293b]">M-Pesa</option>
                  <option value="mtn" className="bg-[#1e293b]">MTN MoMo</option>
                  <option value="orange" className="bg-[#1e293b]">Orange Money</option>
                  <option value="wave" className="bg-[#1e293b]">Wave</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Phone Number (Uplink)</label>
                <input 
                  type="text" 
                  required
                  value={payoutForm.phoneNumber}
                  onChange={(e) => setPayoutForm({...payoutForm, phoneNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-secondary/50 transition-all"
                  placeholder="+254..."
                />
              </div>
              <button 
                type="submit"
                disabled={isRequesting}
                className="w-full py-5 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isRequesting ? "Initializing Payout Protocol..." : "Request Mobile Money Payout"}
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-16 space-y-8">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-4">Transaction Ledger</h3>
          <div className="space-y-4">
            {wallet?.payments_transaction?.length === 0 ? (
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-center py-12">No transactions recorded in this node.</p>
            ) : (
              wallet?.payments_transaction?.map((tx: any) => (
                <div key={tx.id} className="glass p-6 rounded-2xl border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                      tx.type === 'payout' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {tx.type === 'payout' ? '↓' : '↑'}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{tx.type} Request</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black italic">{tx.amount} {wallet?.currency}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      tx.status === 'pending' ? 'text-yellow-400' : 'text-green-400'
                    }`}>{tx.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
