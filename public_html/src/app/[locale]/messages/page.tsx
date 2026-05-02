"use client";

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  sourceLang: string;
  content: string;
  translatedContent: Record<string, string>;
  isMe: boolean;
  time: string;
}

export default function NeuralMessenger() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 'CLI-0x7F',
      senderName: 'Client - Paris Node',
      sourceLang: 'fr',
      content: 'Bonjour, pouvez-vous me confirmer que le matériel est arrivé ?',
      translatedContent: { en: 'Hello, can you confirm that the equipment has arrived?' },
      isMe: false,
      time: '14:32'
    },
    {
      id: 2,
      senderId: 'PRO-0x3C',
      senderName: 'You',
      sourceLang: 'en',
      content: 'Yes! Everything arrived safely. I will start the installation tomorrow at 8 AM.',
      translatedContent: { fr: 'Oui ! Tout est arrivé en toute sécurité. Je commencerai l\'installation demain à 8h.' },
      isMe: true,
      time: '14:45'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add Optimistic Message
    const tempMsg: Message = {
      id: Date.now(),
      senderId: 'PRO-0x3C',
      senderName: 'You',
      sourceLang: language || 'en',
      content: newMessage,
      translatedContent: {},
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    setIsTranslating(true);

    // Simulate AI Translation Delay
    setTimeout(() => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === tempMsg.id) {
          return {
            ...msg,
            translatedContent: {
              fr: `[Traduction IA]: ${tempMsg.content}`,
              en: `[AI Translated]: ${tempMsg.content}`
            }
          };
        }
        return msg;
      }));
      setIsTranslating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10" />

      {/* Internal App Header */}
      <header className="glass border-b border-white/5 h-20 shrink-0 relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-purple-500 p-[2px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-black text-xs">C7</div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic">{t.Messenger?.clientNode} [{language.toUpperCase()}]</h1>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.Messenger?.translationActive}</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-white/10 rounded-full px-4 py-1">
              {t.Messenger?.yourLang}: <span className="text-white">{language === 'en' ? t.Messenger?.english : t.Messenger?.french}</span>
            </div>
            <button className="text-secondary font-black bg-white/5 w-10 h-10 rounded-full hover:bg-secondary/20 transition-all">
              ⋮
            </button>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto p-4 md:p-6 pb-32 relative z-10">
        <div className="space-y-6">
          <div className="text-center my-8">
            <span className="text-[10px] bg-white/5 border border-white/10 text-slate-500 px-4 py-2 rounded-full font-bold uppercase tracking-widest">
              {t.Messenger?.secureChannel}
            </span>
          </div>

          {messages.map((msg) => {
            const displayContent = (msg.isMe || msg.sourceLang === language) 
              ? msg.content 
              : (msg.translatedContent[language] || msg.content);
              
            const isTranslated = !msg.isMe && msg.sourceLang !== language && msg.translatedContent[language];

            return (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] md:max-w-[60%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Meta */}
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 px-1">
                    {msg.isMe ? (t.Messenger?.you || 'You') : msg.senderName} • {msg.time}
                  </span>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-3xl ${
                    msg.isMe 
                      ? 'bg-secondary text-white rounded-tr-sm shadow-xl shadow-secondary/10' 
                      : 'glass border border-white/10 rounded-tl-sm'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{displayContent}</p>
                  </div>

                  {/* Translation Indicator */}
                  {isTranslated && (
                    <div className="flex items-center space-x-1 mt-1 text-[9px] font-black uppercase tracking-widest text-purple-400">
                      <span className="animate-pulse">✨</span>
                      <span>{t.Messenger?.autoTranslatedFrom} {msg.sourceLang.toUpperCase()}</span>
                    </div>
                  )}
                  {msg.isMe && Object.keys(msg.translatedContent).length > 0 && (
                    <div className="flex items-center space-x-1 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>✓ {t.Messenger?.translatedDelivered}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="glass border-t border-white/5 p-4 md:p-6 fixed bottom-0 w-full z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto relative">
          {isTranslating && (
             <div className="absolute -top-8 left-0 text-[10px] font-black uppercase tracking-widest text-secondary flex items-center space-x-2">
               <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
               <span>{t.Messenger?.aiTranslating}</span>
             </div>
          )}
          <form onSubmit={handleSend} className="relative flex items-center">
            <button type="button" className="absolute left-4 text-slate-400 hover:text-white transition-colors">
              📎
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.Messenger?.placeholder}
              className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-12 pr-32 text-sm text-white focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || isTranslating}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary text-white rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-secondary/80 focus:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.Messenger?.send}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
