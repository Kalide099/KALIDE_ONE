"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

export default function KalideSupply() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('construction');
  const [cartCount, setCartCount] = useState(0);

  const categories = [
    { id: 'construction', name: 'Construction & Wood' },
    { id: 'electrical', name: 'Electrical & Servers' },
    { id: 'plumbing', name: 'Pipes & Hydro' },
  ];

  const products = [
    { id: 101, name: 'Premium Portland Cement (50kg)', category: 'construction', price: '$8.50', vendor: 'BuildIt Africa', inStock: true, imgUrl: 'C' },
    { id: 102, name: 'Smart Router Enterprise Grade', category: 'electrical', price: '$299.00', vendor: 'TechSupply', inStock: true, imgUrl: 'R' },
    { id: 103, name: 'Copper Wiring Bundle (100m)', category: 'electrical', price: '$45.00', vendor: 'BuildIt Africa', inStock: true, imgUrl: 'W' },
    { id: 104, name: 'PVC Pipes Heavy Duty (Set of 10)', category: 'plumbing', price: '$120.00', vendor: 'AquaFlow', inStock: false, imgUrl: 'P' },
  ];

  const activeProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="hero-glow top-0 right-0 w-[400px] h-[400px] opacity-10 blur-3xl pointer-events-none" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-white">
              S
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Supply?.headerTitle}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
                {t.Supply?.escrowStatus}
            </div>
            <button className="px-4 py-2 glass hover:bg-white/5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              {t.Supply?.cart} ({cartCount})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6 relative z-10 pt-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <div className="inline-block px-4 py-1 bg-orange-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4">
              {t.Supply?.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-2">
              {t.Supply?.titlePrefix}<span className="text-orange-400">{t.Supply?.titleHighlight}</span>
            </h1>
            <p className="text-slate-400 md:text-lg font-medium max-w-2xl">
              {t.Supply?.description}
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-4 overflow-x-auto pb-6 mb-8 scrollbar-hide">
          {[
            { id: 'construction', name: t.Supply?.categories?.construction },
            { id: 'electrical', name: t.Supply?.categories?.electrical },
            { id: 'plumbing', name: t.Supply?.categories?.plumbing },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'glass text-slate-400 hover:text-white border-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeProducts.map(product => (
            <div key={product.id} className="glass rounded-[2rem] p-6 border-white/5 hover:border-orange-500/30 transition-all group flex flex-col">
              <div className="w-full h-40 bg-black/40 rounded-2xl mb-6 flex items-center justify-center border border-white/5 group-hover:border-orange-500/20 transition-all">
                <span className="text-4xl font-black text-slate-600">{product.imgUrl}</span>
              </div>
              <h3 className="font-bold text-sm mb-1">{product.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{product.vendor}</p>
              
              <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
                <div>
                  <span className="text-xl font-black">{product.price}</span>
                </div>
                <button 
                  disabled={!product.inStock}
                  onClick={() => product.inStock && setCartCount(prev => prev + 1)}
                  className={`px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all ${
                    product.inStock 
                      ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20 active:scale-95' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? t.Supply?.add : t.Supply?.outStock}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
