"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewQuote() {
  const { t, language } = useLanguage();
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [terms, setTerms] = useState(t.Quotes?.defaultTerms || 'Standard payment terms: 50% upfront, 50% upon completion.');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.15; // 15% estimated tax
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to backend/payments/quotes/
    setTimeout(() => {
      setIsSubmitting(false);
      // Let's assume redirect back to dashboard happens here via router
      alert(t.Quotes?.success || "Quote successfully deployed to the Client's Escrow Node!");
      window.location.href = `/${language}/dashboard/worker`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Decor */}
      <div className="hero-glow top-0 right-0 w-[500px] h-[500px] opacity-10" />
      <div className="hero-glow bottom-0 left-0 w-[400px] h-[400px] opacity-10" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center font-black text-white">Q</div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Quotes?.generator}</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t.Quotes?.drafting}</span>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-2 glass hover:bg-white/5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              {showPreview ? t.Quotes?.editMode : t.Quotes?.previewPDF}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-secondary mb-4 animate-pulse">
            {t.Quotes?.secureInit}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-2">{t.Quotes?.draftTitle}</h1>
          <p className="text-slate-500 font-medium">{t.Quotes?.draftDesc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {!showPreview ? (
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Meta Information */}
                <div className="p-8 glass rounded-[2.5rem] border-white/5 space-y-6">
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-4">{t.Quotes?.projectMeta}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.Quotes?.clientRef}</label>
                      <input 
                        type="text" 
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                        placeholder={t.Quotes?.clientPlaceholder}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.Quotes?.projectTitle}</label>
                      <input 
                        type="text" 
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                        placeholder={t.Quotes?.projectPlaceholder}
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="p-8 glass rounded-[2.5rem] border-white/5 space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-400">{t.Quotes?.breakdown}</h2>
                    <button type="button" onClick={addLineItem} className="text-secondary text-[10px] font-black uppercase tracking-widest hover:underline">{t.Quotes?.addEntry}</button>
                  </div>
                  
                  <div className="space-y-4">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-end bg-black/10 p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                        <div className="col-span-12 md:col-span-5 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.Quotes?.description}</label>
                          <input 
                            type="text" 
                            required
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-secondary outline-none"
                            placeholder={t.Quotes?.descPlaceholder}
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.Quotes?.qty}</label>
                          <input 
                            type="number" 
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-secondary outline-none text-center"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.Quotes?.unitPrice}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500">$</span>
                            <input 
                              type="number" 
                              min="0"
                              required
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full bg-black/20 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-sm focus:border-secondary outline-none"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-2 flex justify-end pb-2">
                          <button 
                            type="button" 
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="p-8 glass rounded-[2.5rem] border-white/5 space-y-6">
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-4">{t.Quotes?.termsConditions}</h2>
                  <textarea 
                    rows={4}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none resize-none text-slate-300"
                  />
                </div>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2">
               {/* PDF Preview Mode */}
               <div className="bg-white text-slate-900 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-bl-full" />
                 
                 <div className="flex justify-between items-start mb-16 border-b pb-8">
                   <div>
                     <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-2xl mb-4">K</div>
                     <h2 className="text-2xl font-black uppercase tracking-tighter">{t.Quotes?.officialQuote}</h2>
                     <p className="text-sm text-slate-500 mt-1">{t.Quotes?.generatedBy}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-1">{t.Quotes?.reference}</p>
                     <p className="text-xl font-black">#QTE-{Date.now().toString().slice(-6)}</p>
                     <p className="text-sm font-medium mt-2">{t.Quotes?.date}: {new Date().toLocaleDateString()}</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-12 mb-12">
                   <div>
                     <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-2">{t.Quotes?.issuedTo}</p>
                     <p className="font-black text-lg">{clientName || 'Client Name'}</p>
                     <p className="text-sm font-medium text-slate-500 mt-1">{t.Quotes?.projectTitle}: {projectName || 'Project Title'}</p>
                   </div>
                   <div>
                     <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-2">{t.Quotes?.issuedBy}</p>
                     <p className="font-black text-lg">{t.WorkerDashboard?.nodeID || 'Professional Node'}-0x3C</p>
                     <p className="text-sm font-medium text-slate-500 mt-1">{t.Quotes?.verifiedArtisan}</p>
                   </div>
                 </div>

                 <table className="w-full mb-12">
                   <thead>
                     <tr className="border-b-2 border-slate-200">
                       <th className="text-left font-bold text-[10px] text-slate-400 uppercase tracking-widest py-3">{t.Quotes?.description}</th>
                       <th className="text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest py-3">{t.Quotes?.qty}</th>
                       <th className="text-right font-bold text-[10px] text-slate-400 uppercase tracking-widest py-3">{t.Quotes?.unitPrice || 'Price'}</th>
                       <th className="text-right font-bold text-[10px] text-slate-400 uppercase tracking-widest py-3">{t.Quotes?.finalAmount || 'Total'}</th>
                     </tr>
                   </thead>
                   <tbody>
                     {lineItems.map((item) => (
                       <tr key={item.id} className="border-b border-slate-100">
                         <td className="py-4 text-sm font-medium">{item.description || '-'}</td>
                         <td className="py-4 text-sm text-center">{item.quantity}</td>
                         <td className="py-4 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                         <td className="py-4 text-sm font-bold text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>

                 <div className="flex justify-end mb-16">
                   <div className="w-64 space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500">{t.Quotes?.subtotal}</span>
                       <span className="font-bold">${subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500">{t.Quotes?.tax}</span>
                       <span className="font-bold">${tax.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between border-t-2 border-slate-900 pt-3">
                       <span className="font-black uppercase tracking-widest">{t.Quotes?.totalDue}</span>
                       <span className="font-black text-secondary">${total.toFixed(2)}</span>
                     </div>
                   </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-2xl">
                   <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-2">{t.Quotes?.agreement}</p>
                   <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{terms}</p>
                 </div>
               </div>
            </div>
          )}

          {/* Quick Summary & Submit */}
          <div className="space-y-8">
            <div className="p-8 glass rounded-[2.5rem] border-secondary/20 shadow-2xl shadow-secondary/10 sticky top-28">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-4 mb-6">{t.Quotes?.summary}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{t.Quotes?.subtotal}</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{t.Quotes?.tax}</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase tracking-widest text-sm">{t.Quotes?.finalAmount}</span>
                  <span className="font-black text-2xl text-secondary">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || lineItems.length === 0 || subtotal === 0}
                  className="w-full py-5 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="relative z-10">{isSubmitting ? t.Quotes?.transmitting : t.Quotes?.deploy}</span>
                  <div className="absolute inset-0 h-full w-0 bg-white/20 group-hover:w-full transition-all duration-300 ease-out" />
                </button>
                <p className="text-[9px] text-center text-slate-500 font-medium uppercase tracking-widest">
                  {t.Quotes?.legalNotice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
