'use client';

import { Link } from '../../../i18n/routing';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { apiService, RegisterData } from '../../../services/api';

export default function Register() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    role: 'client',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.register(formData);

      if (response.success) {
        setSuccess(t.Auth?.actions?.registerSuccess || 'Account provisioned successfully. Redirecting to login node...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.message || t.Auth?.actions?.registerError || 'Provisioning failed. Review parameters.');
      }
    } catch (err) {
      setError(t.Auth?.actions?.uplinkError || 'Communication uplink error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-2xl relative">
        <div className="glass p-12 md:p-16 rounded-[3rem] border-white/5 shadow-2xl">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-6">
              {t.Auth?.registerBadge || 'New Node Deployment'}
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white mb-2">{t.Auth?.registerTitle || 'Initialize Account'}</h1>
            <p className="text-slate-500 font-medium text-sm">{t.Auth?.registerDesc || 'Join the unified Kalide One network.'}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-200/10 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-200/10 rounded-2xl text-green-500 text-[10px] font-black uppercase tracking-widest text-center">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="name"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                placeholder={t.Auth?.fields?.name || "Full Identity Name"}
                value={formData.name}
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                placeholder={t.Auth?.fields?.email || "Communication Email"}
                value={formData.email}
                onChange={handleChange}
              />
              <input
                name="phone"
                type="tel"
                required
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                placeholder={t.Auth?.fields?.phone || "Uplink Phone"}
                value={formData.phone}
                onChange={handleChange}
              />
              <select
                name="role"
                required
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10 appearance-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="client" className="bg-[#0f172a]">{t.Auth?.fields?.role?.client || 'Client Node'}</option>
                <option value="artisan" className="bg-[#0f172a]">{t.Auth?.fields?.role?.artisan || 'Professional Node'}</option>
                <option value="team_leader" className="bg-[#0f172a]">{t.Auth?.fields?.role?.team || 'Team Manager Node'}</option>
              </select>
              <input
                name="country"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                placeholder={t.Auth?.fields?.country || "Regional Country"}
                value={formData.country}
                onChange={handleChange}
              />
              <input
                name="city"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                placeholder={t.Auth?.fields?.city || "City Station"}
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
              placeholder={t.Auth?.fields?.password || "Primary Access Key"}
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (t.Auth?.actions?.registering || 'Deploying...') : (t.Auth?.actions?.register || 'Confirm Registration')}
            </button>

            <div className="text-center pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t.Auth?.actions?.hasAccount || 'Identified before?'} {' '}
                <Link href="/login" className="text-primary hover:underline font-black">{t.Auth?.actions?.returnAccess || 'Return to Access'}</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}