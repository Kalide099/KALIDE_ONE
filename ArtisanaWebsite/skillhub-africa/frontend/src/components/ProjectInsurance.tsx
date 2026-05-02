"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface ProjectInsuranceProps {
  projectId: number;
  isInsuranceActive: boolean;
  insuranceFee?: number;
}

export default function ProjectInsurance({ projectId, isInsuranceActive, insuranceFee }: ProjectInsuranceProps) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(isInsuranceActive);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    reason: '',
    amount: '',
    details: ''
  });

  const handleToggleInsurance = async () => {
    const nextState = !isActive;
    const response = await fetch(`/api/v1/kalide-one/projects/${projectId}/insurance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nextState, fee: 15.00 }) // Flat fee for demo
    });
    if (response.ok) {
      setIsActive(nextState);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/v1/kalide-one/projects/${projectId}/insurance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: claimForm.reason,
        amountClaimed: claimForm.amount,
        details: claimForm.details
      })
    });
    if (response.ok) {
      alert("Claim submitted successfully. Our safety node will review it shortly.");
      setShowClaimModal(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] border-blue-400/20 space-y-6 relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all" />
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-black uppercase tracking-tighter italic">Micro-Insurance</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Security Protocol</p>
        </div>
        <button 
          onClick={handleToggleInsurance}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-400 border border-white/5'
          }`}
        >
          {isActive ? 'Active' : 'Disabled'}
        </button>
      </div>

      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-bold">Coverage Plan</span>
          <span className="font-black">Artisana Gold (Accidents & Theft)</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-bold">Protocol Fee</span>
          <span className="font-black">${insuranceFee || 15.00} / Project</span>
        </div>
      </div>

      {isActive ? (
        <button 
          onClick={() => setShowClaimModal(true)}
          className="w-full py-4 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-blue-500/30"
        >
          Submit Insurance Claim
        </button>
      ) : (
        <button 
          onClick={handleToggleInsurance}
          className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
        >
          Initialize Protection Node
        </button>
      )}

      {showClaimModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="glass w-full max-w-lg rounded-[3rem] p-10 border-blue-500/20 relative">
            <button onClick={() => setShowClaimModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white font-black">✕</button>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-8">Submit Claim Protocol</h2>
            <form onSubmit={handleSubmitClaim} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Reason for Claim</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold"
                  onChange={(e) => setClaimForm({...claimForm, reason: e.target.value})}
                >
                  <option value="" className="bg-[#0f172a]">Select Reason</option>
                  <option value="accident" className="bg-[#0f172a]">Site Accident</option>
                  <option value="theft" className="bg-[#0f172a]">Material Theft</option>
                  <option value="damage" className="bg-[#0f172a]">Accidental Damage</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Amount Claimed ($)</label>
                <input 
                  type="number" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold"
                  placeholder="0.00"
                  onChange={(e) => setClaimForm({...claimForm, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Incident Details</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold h-32"
                  placeholder="Describe the incident in detail..."
                  onChange={(e) => setClaimForm({...claimForm, details: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20">
                Transmit Claim to Safety Node
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
