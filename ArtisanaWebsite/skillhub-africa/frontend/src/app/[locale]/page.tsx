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
    'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&q=100&w=2070', // Welder / Heavy Craft
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=100&w=2070', // Pottery / Detail Craft
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=100&w=2070', // Carpenter / Woodwork
    'https://images.unsplash.com/photo-1508247926149-adab375db609?auto=format&fit=crop&q=100&w=2070'  // Mechanic / Engineering
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
    <div className="relative min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans">
      
      {/* Content Layer */}
      <div className="relative z-10">
        <main>
          {/* Hero Section */}
          <section className="pt-28 md:pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <div className="inline-block px-5 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-orange-200 shadow-sm">
                {t.Hero.badge}
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-8 text-gray-900 drop-shadow-sm">
                {t.Hero.titlePrefix} <span className="text-orange-600 italic underline decoration-orange-200 decoration-8 underline-offset-4">{t.Hero.titleHighlight}</span> <br />
                {t.Hero.titleSuffix}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-xl font-medium">
                {t.Hero.description}
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-orange-600 text-gray-900 rounded-2xl font-bold uppercase tracking-wide text-sm hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/30 text-center transform hover:-translate-y-1">
                  {t.Hero.ctaHiring}
                </Link>
                <Link href="/services" className="w-full sm:w-auto px-10 py-5 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-bold uppercase tracking-wide text-sm hover:border-gray-300 hover:bg-gray-50 transition-all text-center">
                  {t.Hero.ctaExplore}
                </Link>
              </div>

              <div className="mt-16 flex items-center gap-10 text-sm font-bold text-gray-400">
                <div className="hover:text-orange-500 transition-colors cursor-pointer">{t.Hero.trusted1}</div>
                <div className="hover:text-orange-500 transition-colors cursor-pointer">{t.Hero.trusted2}</div>
                <div className="hover:text-orange-500 transition-colors cursor-pointer">{t.Hero.trusted3}</div>
                <div className="hover:text-orange-500 transition-colors cursor-pointer">{t.Hero.trusted4}</div>
              </div>
            </div>
            
            {/* Right side imagery */}
            <div className="flex-1 w-full relative h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              {backgroundImages.map((img, i) => (
                <Image
                  key={img}
                  src={img}
                  alt="Artisan Showcase"
                  fill
                  className={`object-cover transition-opacity duration-700 ease-in-out ${
                    i === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={i === 0}
                />
              ))}
              {/* Very light gradient to ensure any overlay text would pop, but minimal blur */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </section>

          {/* Categories Section */}
          <section id="services" className="py-32 px-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="mb-20 text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900">{t.Categories.title}</h2>
                <div className="h-2 w-24 bg-orange-500 rounded-full mx-auto shadow-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {categories.map((cat, i) => (
                  <div key={i} className="group p-10 bg-white rounded-[2rem] border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-gray-900 transition-all shadow-sm">
                      {cat.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{cat.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{cat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 bg-white">
            <div className="max-w-6xl mx-auto bg-gradient-to-br from-orange-500 to-orange-700 text-gray-900 p-16 md:p-24 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay" />
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-8 drop-shadow-md">{t.CTA.title}</h2>
                <p className="text-xl md:text-2xl text-orange-50 font-medium mb-12 max-w-3xl mx-auto drop-shadow-sm">{t.CTA.desc}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link href="/register?role=worker" className="px-10 py-5 bg-white text-orange-700 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-gray-50 hover:scale-105 transition-all shadow-xl shadow-black/10">
                    {t.CTA.workerBtn}
                  </Link>
                  <Link href="/register?role=client" className="px-10 py-5 bg-transparent border-2 border-white text-gray-900 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-white/10 hover:scale-105 transition-all">
                    {t.CTA.clientBtn}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-20 px-6 border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-6">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-gray-900 text-xl shadow-md">A</div>
                <span className="text-2xl font-black tracking-tight text-gray-900">ARTISANA</span>
              </div>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed text-lg">{t.Footer.desc}</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-8">{t.Footer?.links?.platform || 'Platform'}</h4>
              <ul className="space-y-5 text-base font-medium text-gray-600">
                <li><Link href="/services" className="hover:text-orange-600 transition-colors">{t.Navigation.services}</Link></li>
                <li><Link href="/bundles" className="hover:text-orange-600 transition-colors">{t.Navigation.bundles}</Link></li>
                <li><Link href="/verification" className="hover:text-orange-600 transition-colors">{t.Footer?.links?.verification || 'Verification'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-8">{t.Footer?.links?.legal || 'Legal'}</h4>
              <ul className="space-y-5 text-base font-medium text-gray-600">
                <li><Link href="/terms" className="hover:text-orange-600 transition-colors">{t.Footer?.links?.terms || 'Terms'}</Link></li>
                <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">{t.Footer?.links?.privacy || 'Privacy'}</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-200 text-center">
              <p className="text-sm font-semibold text-gray-400">{t.Footer.copy}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
