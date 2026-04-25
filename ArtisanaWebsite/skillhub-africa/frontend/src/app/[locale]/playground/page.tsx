'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useLanguage } from '@/context/LanguageContext';

export default function PythonPlayground() {
  const { t } = useLanguage();
  const [code, setCode] = useState('print("Hello from Kalide One!")\n\n# Try some math\na = 10\nb = 20\nprint(f"Result: {a + b}")\n\n# Run a loop\nfor i in range(5):\n    print(f"Iteration {i}")');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    async function initPyodide() {
      if (typeof window !== 'undefined' && !pyodideRef.current) {
        // Load Pyodide from CDN
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = async () => {
          // @ts-ignore
          pyodideRef.current = await loadPyodide();
          setIsLoading(false);
        };
        document.head.appendChild(script);
      }
    }
    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideRef.current) return;
    setIsRunning(true);
    setOutput((t.Playground?.running || 'Running...') + '\n');

    try {
      // Capture stdout
      pyodideRef.current.runPython(`
import sys
import io
sys.stdout = io.StringIO()
`);
      
      await pyodideRef.current.runPythonAsync(code);
      
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      setOutput(stdout || (t.Playground?.success || 'Code executed successfully (no output).'));
    } catch (err: any) {
      setOutput(`${t.Playground?.errorPrefix || 'Error: '}${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              {t.Playground?.badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">{t.Playground?.titlePrefix} <span className="gradient-text">{t.Playground?.titleHighlight}</span></h1>
            <p className="text-slate-400 font-medium mt-2">{t.Playground?.description}</p>
          </div>
          <div className="flex space-x-4">
             <button 
                onClick={() => setCode('')} 
                className="px-6 py-3 glass rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white/5 transition-all"
             >
               {t.Playground?.clear}
             </button>
             <button 
                onClick={runCode}
                disabled={isLoading || isRunning}
                className="px-10 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-2xl shadow-primary/30 disabled:opacity-50"
             >
               {isLoading ? (t.Playground?.booting || 'Booting...') : isRunning ? (t.Playground?.executing || 'Executing...') : (t.Playground?.run || 'Run Sequence')}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          {/* Editor Area */}
          <div className="glass rounded-[2rem] border-white/5 overflow-hidden flex flex-col relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-focus-within:bg-primary transition-colors" />
            <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">source_code.py</span>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent p-8 font-mono text-sm outline-none resize-none text-slate-300 focus:text-white transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-8">
            <div className="glass rounded-[2rem] border-white/5 overflow-hidden flex flex-col flex-1 bg-black/40">
              <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t.Playground?.terminal}</span>
                <span className="text-[10px] font-bold text-slate-500">{t.Playground?.uptime || 'Uptime: 100%'}</span>
              </div>
              <pre className="flex-1 p-8 font-mono text-sm text-green-400 overflow-auto whitespace-pre-wrap">
                {output || t.Playground?.ready}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 glass rounded-[2.5rem] border-primary/20 flex flex-col md:flex-row items-center gap-8">
           <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 animate-pulse">
             💡
           </div>
           <div>
             <h4 className="text-lg font-black uppercase tracking-tight mb-1">{t.Playground?.edgeTitle}</h4>
             <p className="text-slate-400 text-sm font-medium">{t.Playground?.edgeDesc}</p>
           </div>
        </div>
      </div>

      <footer className="mt-20 text-center">
         <a href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-slate-400 transition-colors">
            {t.return || 'Return to Command Center'}
          </a>
      </footer>
    </div>
  );
}
