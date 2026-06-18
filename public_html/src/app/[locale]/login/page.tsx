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
  const [showPassword, setShowPassword] = useState(false);
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

        setSuccess(t.Auth?.actions?.success || 'Login successful. Taking you to your dashboard...');

        const userRole = String(response.data.user.role || '').toLowerCase();
        setTimeout(() => {
          if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else if (userRole === 'worker' || userRole === 'artisan' || userRole === 'team_leader') {
            router.push('/dashboard/worker');
          } else {
            router.push('/dashboard/client');
          }
        }, 1500);
      } else {
        setError(response.message || t.Auth?.actions?.error || 'We could not log you in. Please check your email and password.');
      }
    } catch (err) {
      setError(t.Auth?.actions?.networkError || 'Unable to connect right now. Please try again in a moment.');
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
              {t.Auth?.loginBadge || 'Welcome Back'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-2">{t.Auth?.loginTitle || 'Sign In'}</h1>
            <p className="text-slate-500 font-medium">{t.Auth?.loginDesc || 'Access your account to manage bookings, jobs, and messages.'}</p>
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
                  placeholder={t.Auth?.fields?.email || 'Email address'}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="group relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-white/5 border border-white/10 px-8 py-5 pr-16 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-white font-medium placeholder:text-slate-600"
                  placeholder={t.Auth?.fields?.password || 'Password'}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (t.Auth?.actions?.loggingIn || 'Signing in...') : (t.Auth?.actions?.login || 'Sign In')}
            </button>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>,{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{' '}
              <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
            </p>

            <div className="text-center pt-8">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t.Auth?.actions?.noAccount || 'Do not have an account yet?'} {' '}
                <Link href="/register" className="text-primary hover:underline font-black">{t.Auth?.actions?.createNode || 'Create one'}</Link>
              </span>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-slate-400 transition-colors">
            {t.Auth?.actions?.returnAccess || 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}