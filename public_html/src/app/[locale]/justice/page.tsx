"use client";

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { apiService, DisputeRecord } from '@/services/api';

export default function KalideJusticeNode() {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const activeDispute = useMemo(
    () => disputes.find((item) => item.status !== 'resolved') || disputes[0] || null,
    [disputes]
  );

  useEffect(() => {
    const loadDisputes = async () => {
      setIsLoading(true);
      const response = await apiService.getDisputes();
      if (response.success && response.data) {
        setDisputes(response.data);
      }
      setIsLoading(false);
    };

    loadDisputes();
  }, []);

  const settlement = activeDispute?.ai_settlement;
  const clientRefundPct = settlement?.client_refund_percentage ?? 50;
  const artisanPayoutPct = settlement?.artisan_payout_percentage ?? 50;
  const confidence = settlement?.confidence_score ?? 0;
  const reasoning = settlement?.reasoning
    ? settlement.reasoning
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    : [
        'Justice Node has not generated a detailed reasoning block yet.',
        'You can escalate this dispute to admin mediation for manual adjudication.',
      ];

  const refreshDisputes = async () => {
    const refresh = await apiService.getDisputes();
    if (refresh.success && refresh.data) {
      setDisputes(refresh.data);
    }
  };

  const handleAcceptSettlement = async () => {
    if (!activeDispute) return;

    setIsActing(true);
    const response = await apiService.disputeAction(activeDispute.id, {
      action: 'accept_ai_settlement',
      note: 'Accepted by participant through Justice dashboard.',
    });

    if (response.success) {
      setIsAccepted(true);
      setFeedbackMessage('Settlement accepted. Escrow redistribution has been initiated.');
      await refreshDisputes();
    } else {
      setFeedbackMessage(response.message || 'Could not accept settlement.');
    }
    setIsActing(false);
  };

  const handleEscalate = async () => {
    if (!activeDispute) return;

    setIsActing(true);
    const response = await apiService.disputeAction(activeDispute.id, {
      action: 'escalate_to_admin',
      note: 'Escalated by participant from Justice node.',
    });

    if (response.success) {
      setFeedbackMessage('Dispute escalated to admin mediation.');
      await refreshDisputes();
    } else {
      setFeedbackMessage(response.message || 'Could not escalate dispute.');
    }
    setIsActing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest font-black text-slate-400">Loading Justice Node...</p>
      </div>
    );
  }

  if (!activeDispute) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white">
        <main className="max-w-4xl mx-auto py-20 px-6">
          <div className="glass rounded-3xl p-10 border border-white/10 text-center">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3">Justice Node</p>
            <h1 className="text-3xl font-black uppercase tracking-widest mb-3">No active disputes</h1>
            <p className="text-sm text-slate-400">There are currently no disputes linked to your account.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="hero-glow top-0 left-0 w-[500px] h-[500px] opacity-10 blur-3xl pointer-events-none" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center font-black text-white">⚖</div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Justice?.headerTitle}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Dispute: DSP-{activeDispute.id}
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
          <p className="text-slate-400 text-sm font-medium">{t.Justice?.description}</p>
        </div>

        <div className="glass rounded-[3rem] p-8 md:p-12 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-8 border-b border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.project}</p>
              <p className="font-bold text-sm">{activeDispute.project_title}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.status}</p>
              <p className="font-bold text-sm text-red-400">{activeDispute.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.escrow}</p>
              <p className="font-bold text-sm text-white">{activeDispute.priority.toUpperCase()} PRIORITY</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.Justice?.table?.confidence}</p>
              <p className="font-bold text-sm text-green-400">{confidence.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{t.Justice?.reasoningTitle}</span>
            </h3>
            <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5">
              {reasoning.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <span className="text-red-500 font-black mt-1">↳</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-6">{t.Justice?.settlementTitle}</h3>

            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden flex mb-8">
              <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${clientRefundPct}%` }} />
              <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${artisanPayoutPct}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">{t.Justice?.table?.refundClient}</p>
                <p className="text-3xl font-black italic">{clientRefundPct}%</p>
                <p className="text-xs text-slate-500 font-bold mt-1">Suggested refund</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">{t.Justice?.table?.payoutArtisan}</p>
                <p className="text-3xl font-black italic">{artisanPayoutPct}%</p>
                <p className="text-xs text-slate-500 font-bold mt-1">Suggested payout</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!isAccepted ? (
                <>
                  <button
                    onClick={handleAcceptSettlement}
                    disabled={isActing}
                    className="flex-1 py-5 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                  >
                    {isActing ? 'Processing...' : t.Justice?.accept}
                  </button>
                  <button
                    onClick={handleEscalate}
                    disabled={isActing}
                    className="flex-1 py-5 glass hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white transition-all"
                  >
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

            {feedbackMessage && (
              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/40">
                <p className="text-xs text-slate-300 font-bold">{feedbackMessage}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
