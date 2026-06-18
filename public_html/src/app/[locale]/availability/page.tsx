"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { apiService, AvailabilitySlot } from '@/services/api';

function toLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeLabel(value: string) {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  const hh = `${dt.getHours()}`.padStart(2, '0');
  const mm = `${dt.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function AvailabilityManager() {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadMe = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch('/api/v1/kalide-one/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (res.ok && payload?.success) {
          setProfessionalId(Number(payload.data?.id));
        }
      } catch {
        // ignore
      }
    };

    loadMe();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!professionalId || !selectedDate) return;

      const dateKey = toLocalDateInputValue(selectedDate);
      const response = await apiService.getAvailability(professionalId, dateKey, false);
      if (response.success && Array.isArray(response.data)) {
        setSlots(response.data);
      } else {
        setSlots([]);
      }
    };

    loadAvailability();
  }, [professionalId, selectedDate]);

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
  const selectedDateKey = selectedDate ? toLocalDateInputValue(selectedDate) : toLocalDateInputValue();

  const renderCalendar = () => {
    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate?.getDate() === i && selectedDate?.getMonth() === currentDate.getMonth();
      const dayKey = toLocalDateInputValue(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      const hasBooking = slots.some((slot) => toLocalDateInputValue(new Date(slot.date)) === dayKey);
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
              <button
                type="button"
                onClick={async () => {
                  if (!selectedDateKey) return;
                  if (newStartTime >= newEndTime) {
                    setFeedback('End time must be after start time.');
                    return;
                  }

                  setIsSaving(true);
                  setFeedback('');

                  const response = await apiService.createAvailability(selectedDateKey, newStartTime, newEndTime);
                  setIsSaving(false);

                  if (response.success && response.data) {
                    setSaveSuccess(true);
                    setFeedback('Time block saved successfully.');
                    setSlots((prev) => [...prev, response.data as AvailabilitySlot].sort((a, b) =>
                      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                    ));
                    setTimeout(() => setSaveSuccess(false), 2500);
                  } else {
                    setFeedback(response.message || 'Could not save this time block.');
                  }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-secondary hover:underline"
              >
                {isSaving ? 'Saving...' : t.Availability?.newBlock}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full bg-black/30 border border-white/10 px-4 py-3 rounded-xl text-sm"
              />
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full bg-black/30 border border-white/10 px-4 py-3 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-4">
              {slots.map(slot => {
                const status = slot.is_booked ? 'booked' : 'available';
                return (
                <div 
                  key={slot.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border transition-all ${
                    status === 'booked' 
                      ? 'border-secondary/20 bg-secondary/5' 
                      : status === 'available'
                        ? 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/40 cursor-pointer'
                        : 'border-red-500/10 bg-red-500/5 opacity-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'booked' ? 'bg-secondary shadow-[0_0_10px_rgba(var(--secondary),0.5)]' 
                      : status === 'available' ? 'bg-green-500' 
                      : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="font-black text-lg tracking-tight">{toTimeLabel(slot.start_time)} - {toTimeLabel(slot.end_time)}</span>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                        {status === 'booked' ? t.Availability?.status?.reserved : status === 'available' ? t.Availability?.status?.open : t.Availability?.status?.offline}
                      </p>
                    </div>
                  </div>
                  
                  {status === 'booked' && (
                    <div className="flex items-center space-x-3 bg-black/30 px-4 py-2 rounded-xl">
                      <span className="text-xs font-black uppercase tracking-widest text-secondary">Reserved</span>
                    </div>
                  )}
                </div>
              );
              })}

              {!slots.length && (
                <div className="p-6 rounded-2xl border border-white/10 bg-black/20 text-xs font-black uppercase tracking-widest text-slate-400">
                  No slots yet for this date. Add your first time block.
                </div>
              )}
            </div>

            {(feedback || saveSuccess) && (
              <div className="w-full mt-8 py-4 px-5 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                {saveSuccess ? t.Availability?.syncSuccess : feedback}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
