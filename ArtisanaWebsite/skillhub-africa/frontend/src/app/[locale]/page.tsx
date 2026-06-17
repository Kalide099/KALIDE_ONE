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
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2070', // Pottery
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=2070', // Woodworking
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=2070'  // Artist
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { title: t.Categories.techTitle, icon: '💻', desc: t.Categories.techDesc },
    { title: t.Categories.homeTitle, icon: '🔨', desc: t.Categories.homeDesc },
    { title: t.Categories.creativeTitle, icon: '🎨', desc: t.Categories.creativeDesc },
    { title: t.Categories.healthTitle, icon: '🧘‍♀️', desc: t.Categories.healthDesc },
    { title: t.Categories.buildTitle, icon: '🏗️', desc: t.Categories.buildDesc },
    { title: t.Categories.logisticsTitle, icon: '📦', desc: t.Categories.logisticsDesc },
  ];

  return (
    <div className="relative min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute hero-glow top-0 left-[-10%] z-[0] opacity-40" />
      <div className="absolute hero-glow top-[40%] right-[-10%] z-[0] opacity-40" />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <main>
          {/* Hero Section */}
          <section className="pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-800 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-8">
                {t.Hero.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-stone-900">
                {t.Hero.titlePrefix} <span className="text-orange-700 italic">{t.Hero.titleHighlight}</span> <br />
                {t.Hero.titleSuffix}
              </h1>
              <p className="text-lg md:text-xl text-stone-600 leading-relaxed mb-10 max-w-xl">
                {t.Hero.description}
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-orange-700 text-white rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-orange-800 transition-colors shadow-lg shadow-orange-700/20 text-center">
                  {t.Hero.ctaHiring}
                </Link>
                <Link href="/services" className="w-full sm:w-auto px-8 py-4 bg-white text-stone-700 border border-stone-200 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-stone-50 transition-colors text-center">
                  {t.Hero.ctaExplore}
                </Link>
              </div>

              <div className="mt-16 flex items-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all text-sm font-semibold text-stone-500">
                <div>{t.Hero.trusted1}</div>
                <div>{t.Hero.trusted2}</div>
                <div>{t.Hero.trusted3}</div>
                <div>{t.Hero.trusted4}</div>
              </div>
            </div>
            
            {/* Right side imagery */}
            <div className="flex-1 w-full relative h-[400px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl">
              {backgroundImages.map((img, i) => (
                <Image
                  key={img}
                  src={img}
                  alt="Artisan Showcase"
                  fill
                  className={`object-cover transition-opacity duration-1000 ease-in-out ${
                    i === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={i === 0}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </section>

          {/* Categories Section */}
          <section id="services" className="py-24 px-6 bg-stone-100/50">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-stone-900">{t.Categories.title}</h2>
                <div className="h-1.5 w-20 bg-orange-600 rounded-full mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                  <div key={i} className="group p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-3">{cat.title}</h3>
                    <p className="text-stone-600 leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto bg-stone-900 text-white p-12 md:p-20 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6">{t.CTA.title}</h2>
                <p className="text-lg text-stone-300 font-medium mb-10 max-w-2xl mx-auto">{t.CTA.desc}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/register?role=worker" className="px-8 py-4 bg-lime-600 text-white rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-lime-700 transition-colors shadow-lg shadow-lime-700/20">{t.CTA.workerBtn}</Link>
                  <Link href="/register?role=client" className="px-8 py-4 bg-white text-stone-900 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-stone-100 transition-colors">{t.CTA.clientBtn}</Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-16 px-6 border-t border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-6">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-orange-700 rounded-lg flex items-center justify-center font-black text-white">A</div>
                <span className="text-lg font-black tracking-tight text-stone-900">ARTISANA</span>
              </div>
              <p className="text-stone-500 max-w-sm mb-8 leading-relaxed">{t.Footer.desc}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-xs text-stone-400 mb-6">{t.Footer?.links?.platform || 'Platform'}</h4>
              <ul className="space-y-4 text-sm font-medium text-stone-600">
                <li><Link href="/services" className="hover:text-orange-700 transition-colors">{t.Navigation.services}</Link></li>
                <li><Link href="/bundles" className="hover:text-orange-700 transition-colors">{t.Navigation.bundles}</Link></li>
                <li><Link href="/verification" className="hover:text-orange-700 transition-colors">{t.Footer?.links?.verification || 'Verification'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-xs text-stone-400 mb-6">{t.Footer?.links?.legal || 'Legal'}</h4>
              <ul className="space-y-4 text-sm font-medium text-stone-600">
                <li><Link href="/terms" className="hover:text-orange-700 transition-colors">{t.Footer?.links?.terms || 'Terms'}</Link></li>
                <li><Link href="/privacy" className="hover:text-orange-700 transition-colors">{t.Footer?.links?.privacy || 'Privacy'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-100 text-center">
              <p className="text-xs font-medium text-stone-400">{t.Footer.copy}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
