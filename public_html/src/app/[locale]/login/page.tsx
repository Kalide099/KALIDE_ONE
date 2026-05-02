'use client';

import { Link } from '../../../i18n/routing';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { apiService, LoginData } from '../../../services/api';

export default function Login() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.login(formData);

      if (response.success && response.data) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setSuccess(t.Auth?.actions?.success || 'Authentication successful. Initializing session...');

        const userRole = response.data.user.role;
        setTimeout(() => {
          if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else if (userRole === 'worker') {
            router.push('/dashboard/worker');
          } else {
            router.push('/dashboard/client');
          }
        }, 1500);
      } else {
        setError(response.message || t.Auth?.actions?.error || 'Verification failed. Please check your credentials.');
      }
    } catch (err) {
      setError(t.Auth?.actions?.networkError || 'Network synchronization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-xl relative">
        <div className="glass p-12 md:p-20 rounded-[3rem] border-white/5 shadow-2xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-6">
              {t.Auth?.loginBadge || 'Secure Access Node'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-2">{t.Auth?.loginTitle || 'Protocol Access'}</h1>
            <p className="text-slate-500 font-medium">{t.Auth?.loginDesc || 'Secure authentication for system-wide operations.'}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-200/10 rounded-2xl text-green-500 text-xs font-black uppercase tracking-widest text-center">
              {success}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white font-medium placeholder:text-slate-600"
                  placeholder={t.Auth?.fields?.email || "Official Email Node"}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="group relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white font-medium placeholder:text-slate-600"
                  placeholder={t.Auth?.fields?.password || "Access Key"}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (t.Auth?.actions?.loggingIn || 'Verifying...') : (t.Auth?.actions?.login || 'Identify Access')}
            </button>

            <div className="text-center pt-8">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t.Auth?.actions?.noAccount || 'No access node yet?'} {' '}
                <Link href="/register" className="text-primary hover:underline font-black">{t.Auth?.actions?.createNode || 'Provision Account'}</Link>
              </span>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-slate-400 transition-colors">
            {t.Auth?.actions?.returnAccess || 'Return to Command Center'}
          </Link>
        </div>
      </div>
    </div>
  );
}