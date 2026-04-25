"use client";

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.Navigation?.home || 'Home', isAnchor: false },
    { href: '/#services', label: t.Navigation?.services || 'Services', isAnchor: true },
    { href: '/bundles', label: t.Navigation?.bundles || 'Packs', isAnchor: false },
    { href: '/playground', label: t.Navigation?.playground || 'Playground', isAnchor: false, isPrimary: true },
  ];

  return (
    <header className="glass fixed top-0 w-full z-[100] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">K</div>
            <span className="text-xl font-black tracking-tighter uppercase italic">Kalide One</span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a key={link.href} href={link.href} className={`hover:text-primary transition-colors ${link.isPrimary ? 'text-primary' : ''}`}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={`hover:text-primary transition-colors ${link.isPrimary ? 'text-primary' : ''}`}>
                {link.label}
              </Link>
            )
          ))}
          <div className="w-px h-4 bg-white/10" />
          <LanguageSwitcher />
          <Link href="/login" className="hover:text-primary transition-colors">{t.Navigation?.login || 'Login'}</Link>
          <Link href="/register" className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20">
            {t.Navigation?.join || 'Join Hub'}
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5 glass rounded-lg z-50 relative"
        >
          <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-[#060b13]/95 backdrop-blur-xl z-40 transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-center p-6">
            <nav className="flex flex-col space-y-6 text-sm font-black uppercase tracking-[0.3em] text-white">
              {navLinks.map((link) => (
                link.isAnchor ? (
                  <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="hover:text-primary">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="hover:text-primary">
                    {link.label}
                  </Link>
                )
              ))}
              <div className="h-px w-20 bg-white/10 mx-auto" />
              <div className="flex justify-center scale-125 py-4">
                <LanguageSwitcher />
              </div>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-primary">{t.Navigation?.login || 'Login'}</Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="px-10 py-5 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30">
                {t.Navigation?.join || 'Join Hub'}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
