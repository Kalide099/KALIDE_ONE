"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          language === "en" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("fr")}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
          language === "fr" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
        }`}
      >
        FR
      </button>
    </div>
  );
}
