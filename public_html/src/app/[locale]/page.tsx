"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from '../../i18n/routing';

export default function Landing() {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);

  const backgroundImages = [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?auto=format&fit=crop&q=80&w=2070'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { title: t.Categories.techTitle, icon: '⚡', desc: t.Categories.techDesc },
    { title: t.Categories.homeTitle, icon: '🏠', desc: t.Categories.homeDesc },
    { title: t.Categories.creativeTitle, icon: '🎨', desc: t.Categories.creativeDesc },
    { title: t.Categories.healthTitle, icon: '🏥', desc: t.Categories.healthDesc },
    { title: t.Categories.buildTitle, icon: '🏗️', desc: t.Categories.buildDesc },
    { title: t.Categories.logisticsTitle, icon: '🚚', desc: t.Categories.logisticsDesc },
  ];

  return (
    <div className="relative min-h-screen bg-[#060b13] text-white overflow-x-hidden">
      {/* Background Carousel - Layer 0 */}
      <div className="fixed inset-0 z-0">
        {backgroundImages.map((img, i) => (
          <Image
            key={img}
            src={img}
            alt="Service Background"
            fill
            className={`object-cover transition-opacity duration-[3000ms] ease-in-out ${
              i === currentImage ? 'opacity-80' : 'opacity-0'
            }`}
            priority={i === 0}
          />
        ))}
        {/* Refined Overlays for clarity and readability */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b13] via-black/10 to-[#060b13] z-10" />
      </div>

      {/* Dynamic Background Effects - Layer 5 */}
      <div className="absolute hero-glow top-[-100px] left-[-100px] z-[5] opacity-30" />
      <div className="absolute hero-glow bottom-[-100px] right-[-100px] z-[5] opacity-30" />
      
      {/* Content Layer */}
      <div className="relative z-10 drop-shadow-2xl">
        <main>
          {/* Hero Section */}
          <section className="pt-32 md:pt-48 pb-20 px-6 max-w-7xl mx-auto text-center">
            <div className="inline-block px-4 py-1.5 glass rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary mb-8 animate-pulse">
              {t.Hero.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1] md:leading-[0.9] mb-8 uppercase">
              {t.Hero.titlePrefix}<span className="gradient-text italic">{t.Hero.titleHighlight}</span> <br />
              {t.Hero.titleSuffix}
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-xl text-slate-100 font-medium leading-relaxed mb-12 px-4">
              {t.Hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-2xl shadow-primary/30">
                {t.Hero.ctaHiring}
              </Link>
              <Link href="/services" className="w-full sm:w-auto px-10 py-5 glass text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-all">
                {t.Hero.ctaExplore}
              </Link>
            </div>

            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="text-center font-black text-2xl">{t.Hero.trusted1}</div>
              <div className="text-center font-black text-2xl">{t.Hero.trusted2}</div>
              <div className="text-center font-black text-2xl">{t.Hero.trusted3}</div>
              <div className="text-center font-black text-2xl">{t.Hero.trusted4}</div>
            </div>
          </section>

          {/* Categories Section */}
          <section id="services" className="py-24 px-6 bg-white/[0.01]">
            <div className="max-w-7xl mx-auto">
              <div className="mb-20">
                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">{t.Categories.title}</h2>
                <div className="h-1.5 w-20 bg-primary rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                  <div key={i} className="group p-8 glass rounded-[2.5rem] hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-3">{cat.title}</h3>
                    <p className="text-slate-200 font-medium leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6">
            <div className="max-w-5xl mx-auto glass p-12 md:p-24 rounded-[3rem] text-center border-primary/20 shadow-2xl shadow-primary/10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 italic">{t.CTA.title}</h2>
              <p className="text-xl text-slate-100 font-medium mb-12">{t.CTA.desc}</p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/register?role=worker" className="px-8 py-4 bg-secondary text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-secondary/90 transition-all">{t.CTA.workerBtn}</Link>
                <Link href="/register?role=client" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">{t.CTA.clientBtn}</Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-20 px-6 border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-6">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">K</div>
                <span className="text-lg font-black tracking-tighter uppercase italic">Kalide One</span>
              </div>
              <p className="text-slate-300 max-w-sm mb-8 leading-relaxed">{t.Footer.desc}</p>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-8 underline decoration-primary decoration-4 underline-offset-8">{t.Footer?.links?.platform || 'Platform'}</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><Link href="/services" className="hover:text-primary">{t.Navigation.services}</Link></li>
                <li><Link href="/bundles" className="hover:text-primary">{t.Navigation.bundles}</Link></li>
                <li><Link href="/verification" className="hover:text-primary">{t.Footer?.links?.verification || 'Verification'}</Link></li>
                <li><Link href="#" className="hover:text-primary">{t.Footer?.links?.support || 'Global Support'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-8 underline decoration-primary decoration-4 underline-offset-8">{t.Footer?.links?.legal || 'Legal'}</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><Link href="/terms" className="hover:text-primary">{t.Footer?.links?.terms || 'Terms'}</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">{t.Footer?.links?.privacy || 'Privacy'}</Link></li>
                <li><Link href="/safety" className="hover:text-primary">{t.Footer?.links?.safety || 'Safety'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{t.Footer.copy}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
