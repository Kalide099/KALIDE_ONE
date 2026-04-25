"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';

export default function AvailabilityManager() {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Mock data for availability
  const [slots, setSlots] = useState([
    { id: 1, time: '09:00', endTime: '11:00', status: 'booked', client: 'John Doe' },
    { id: 2, time: '11:30', endTime: '13:30', status: 'available' },
    { id: 3, time: '14:00', endTime: '16:00', status: 'available' },
    { id: 4, time: '16:30', endTime: '18:30', status: 'booked', client: 'Alice Smith' },
  ]);

  const toggleSlot = (id: number) => {
    setSlots(slots.map(slot => {
      if (slot.id === id && slot.status !== 'booked') {
        return { ...slot, status: slot.status === 'available' ? 'unavailable' : 'available' };
      }
      return slot;
    }));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = t.Availability?.months || ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdaysShort = t.Availability?.weekdaysShort || ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const renderCalendar = () => {
    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate?.getDate() === i && selectedDate?.getMonth() === currentDate.getMonth();
      const hasBooking = i % 4 === 0; // Mock logic for visual dots
      days.push(
        <div 
          key={i} 
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))}
          className={`h-12 w-full flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all ${
            isSelected 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
        >
          <span className="font-bold text-sm">{i}</span>
          {hasBooking && !isSelected && <span className="w-1 h-1 rounded-full bg-secondary mt-1"></span>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="hero-glow top-0 right-0 w-[500px] h-[500px] opacity-10" />

      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/worker" className="text-secondary hover:text-white transition-colors">
              <span className="font-black text-xl">←</span>
            </Link>
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center font-black text-white">A</div>
            <span className="text-lg font-black tracking-tighter uppercase italic">{t.Availability?.headerTitle}</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t.Availability?.nodeStatus}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-32">
        {/* Left Column: Calendar UI */}
        <div className="lg:col-span-5 space-y-8">
          <div className="mb-8">
            <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-secondary mb-4">
              {t.Availability?.badge}
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t.Availability?.title}</h1>
            <p className="text-slate-500 font-medium text-sm mt-2">{t.Availability?.description}</p>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-secondary/20 hover:text-secondary flex items-center justify-center transition-all"
              >
                ←
              </button>
              <h2 className="text-xl font-black uppercase tracking-widest">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-secondary/20 hover:text-secondary flex items-center justify-center transition-all"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
              {weekdaysShort.map(day => <div key={day}>{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Right Column: Time Blocks UI */}
        <div className="lg:col-span-7">
          <div className="glass p-8 md:p-12 rounded-[3rem] border-white/5 min-h-[600px] h-full">
            <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">{t.Availability?.blockMatrix}</h2>
                <p className="text-slate-400 font-medium text-sm">
                  {selectedDate?.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline">{t.Availability?.newBlock}</button>
            </div>

            <div className="space-y-4">
              {slots.map(slot => (
                <div 
                  key={slot.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border transition-all ${
                    slot.status === 'booked' 
                      ? 'border-secondary/20 bg-secondary/5' 
                      : slot.status === 'available'
                        ? 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/40 cursor-pointer'
                        : 'border-red-500/10 bg-red-500/5 opacity-50 cursor-pointer'
                  }`}
                  onClick={() => toggleSlot(slot.id)}
                >
                  <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                    <div className={`w-3 h-3 rounded-full ${
                      slot.status === 'booked' ? 'bg-secondary shadow-[0_0_10px_rgba(var(--secondary),0.5)]' 
                      : slot.status === 'available' ? 'bg-green-500' 
                      : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="font-black text-lg tracking-tight">{slot.time} - {slot.endTime}</span>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                        {slot.status === 'booked' ? t.Availability?.status?.reserved : slot.status === 'available' ? t.Availability?.status?.open : t.Availability?.status?.offline}
                      </p>
                    </div>
                  </div>
                  
                  {slot.status === 'booked' && (
                    <div className="flex items-center space-x-3 bg-black/30 px-4 py-2 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center font-black text-secondary text-xs">
                        {slot.client?.[0]}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{slot.client}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {slots.filter(s => s.status !== 'booked').length > 0 && (
              <button 
                onClick={async () => {
                  setIsSaving(true);
                  // Mock API delay
                  await new Promise(r => setTimeout(r, 1500));
                  setIsSaving(false);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                disabled={isSaving}
                className="w-full mt-8 py-5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/50 transition-all rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/5 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <span className="animate-spin text-xl">◌</span>
                ) : saveSuccess ? (
                  <span className="text-green-400 italic">{t.Availability?.syncSuccess}</span>
                ) : (
                  <span>{t.Availability?.commit}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
