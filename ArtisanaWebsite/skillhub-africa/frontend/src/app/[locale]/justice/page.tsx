"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

export default function KalideJusticeNode() {
  const { t } = useLanguage();
  const [isAccepted, setIsAccepted] = useState(false);

  const disputeData = {
    id: "DSP-8842-X",
    project: "Server Rack Wiring",
    status: "AI Review Complete",
    client: "TechCorp Logistics",
    artisan: "Marcus (Node 0x3C)",
    escrowAmount: "$1,850.00",
    aiConfidence: "94.2%",
    settlement: {
      clientRefund: "25%",
      artisanPayout: "75%",
      clientAmount: "$462.50",
      artisanAmount: "$1,387.50"
    },
    reasoning: [
      "Analysis of Milestone 1 confirms physical hardware was installed to spec. (Image Match: 98%)",
      "Neural Messenger logs show Client requested scope change on Oct 14th without updating Escrow.",
      "Artisan completed 75% of the original contractual obligations before the dispute was filed.",
      "Conclusion: Artisan is entitled to 75% payment for work rendered based on African Gig Economy Fair Work Act."
    ]
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="hero-glow top-0 left-0 w-[500px] h-[500px] opacity-10 blur-3xl pointer-events-none" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center font-black text-white">
              ⚖
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Justice?.headerTitle}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Dispute: {disputeData.id}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6 relative z-10 pt-32">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-red-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400 mb-6 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            {t.Justice?.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">
            {t.Justice?.titlePrefix}<span className="text-red-400">{t.Justice?.titleHighlight}</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {t.Justice?.description}
          </p>
        </div>

        <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden">
          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-8 border-b border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.project}</p>
              <p className="font-bold text-sm">{disputeData.project}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.status}</p>
              <p className="font-bold text-sm text-red-400">{disputeData.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.escrow}</p>
              <p className="font-bold text-sm text-white">{disputeData.escrowAmount}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.confidence}</p>
              <p className="font-bold text-sm text-green-400">{disputeData.aiConfidence}</p>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="mb-12">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{t.Justice?.reasoningTitle}</span>
            </h3>
            <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5">
              {disputeData.reasoning.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <span className="text-red-500 font-black mt-1">↳</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Proposal */}
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-6">{t.Justice?.settlementTitle}</h3>
            
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden flex mb-8">
              <div 
                className="h-full bg-red-500 transition-all duration-1000" 
                style={{ width: disputeData.settlement.clientRefund }} 
              />
              <div 
                className="h-full bg-secondary transition-all duration-1000" 
                style={{ width: disputeData.settlement.artisanPayout }} 
              />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">{t.Justice?.table?.refundClient}</p>
                <p className="text-3xl font-black italic">{disputeData.settlement.clientAmount}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">({disputeData.settlement.clientRefund})</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">{t.Justice?.table?.payoutArtisan}</p>
                <p className="text-3xl font-black italic">{disputeData.settlement.artisanAmount}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">({disputeData.settlement.artisanPayout})</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAccepted ? (
                <>
                  <button 
                    onClick={() => setIsAccepted(true)}
                    className="flex-1 py-5 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                  >
                    {t.Justice?.accept}
                  </button>
                  <button className="flex-1 py-5 glass hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white transition-all">
                    {t.Justice?.escalate}
                  </button>
                </>
              ) : (
                <div className="w-full bg-green-500/10 border border-green-500/30 p-6 rounded-2xl text-center">
                  <p className="text-green-400 font-black uppercase tracking-widest text-xs mb-2">{t.Justice?.protocolAccepted}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t.Justice?.redistributing}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
