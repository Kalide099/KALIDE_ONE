'use client';

import { Link } from '../../../i18n/routing';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { apiService, RegisterData } from '../../../services/api';

const REGISTER_DRAFT_KEY = 'kalide_register_draft_v1';

export default function Register() {
  const { t } = useLanguage();
  const router = useRouter();
  const expertiseOptions = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Welding', 'HVAC', 'Software', 'Design'];
  const companyCapabilityOptions = ['End-to-end Construction', 'MEP', 'Software Delivery', 'Facility Maintenance', 'Interior Fit-out', 'Procurement'];
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    role: 'client',
    password: '',
    expertiseAreas: [],
    companyBase: '',
    companyCapabilities: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REGISTER_DRAFT_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        formData?: RegisterData;
        acceptedPolicies?: boolean;
        step?: number;
      };

      if (parsed.formData) {
        setFormData({
          name: parsed.formData.name || '',
          email: parsed.formData.email || '',
          phone: parsed.formData.phone || '',
          country: parsed.formData.country || '',
          city: parsed.formData.city || '',
          role: parsed.formData.role || 'client',
          password: parsed.formData.password || '',
          expertiseAreas: parsed.formData.expertiseAreas || [],
          companyBase: parsed.formData.companyBase || '',
          companyCapabilities: parsed.formData.companyCapabilities || [],
        });
      }

      if (typeof parsed.acceptedPolicies === 'boolean') {
        setAcceptedPolicies(parsed.acceptedPolicies);
      }

      if (parsed.step && parsed.step >= 1 && parsed.step <= 3) {
        setStep(parsed.step);
      }
    } catch {
      // ignore malformed draft data
    }
  }, []);

  useEffect(() => {
    const draft = {
      formData,
      acceptedPolicies,
      step,
    };
    localStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(draft));
  }, [formData, acceptedPolicies, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const clearDraft = () => {
    localStorage.removeItem(REGISTER_DRAFT_KEY);
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.role.trim()) {
        setError('Please complete your account basics before moving to the next step.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.country.trim() || !formData.city.trim()) {
        setError('Please provide your country and city.');
        return false;
      }

      if (formData.role === 'artisan' && (!formData.expertiseAreas || formData.expertiseAreas.length === 0)) {
        setError('Please select at least one expertise area for individual talent accounts.');
        return false;
      }

      if (formData.role === 'team_leader') {
        if (!formData.companyBase?.trim()) {
          setError('Please provide your company base location.');
          return false;
        }
        if (!formData.companyCapabilities || formData.companyCapabilities.length === 0) {
          setError('Please select at least one company capability.');
          return false;
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.password.trim()) {
        setError('Please create a password.');
        return false;
      }
      if (!profilePhoto) {
        setError('Please upload a profile photo for admin review.');
        return false;
      }
      if (!acceptedPolicies) {
        setError('Please accept the Terms, Privacy Policy, and Cookie Policy to continue.');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) return;
    setError('');
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleExpertise = (value: string) => {
    setFormData((prev) => {
      const current = prev.expertiseAreas || [];
      return {
        ...prev,
        expertiseAreas: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const toggleCompanyCapability = (value: string) => {
    setFormData((prev) => {
      const current = prev.companyCapabilities || [];
      return {
        ...prev,
        companyCapabilities: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.register(formData, profilePhoto);

      if (response.success) {
        clearDraft();
        setSuccess('Application submitted successfully. An admin will review your profile before login is enabled.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.message || t.Auth?.actions?.registerError || 'We could not create your account. Please check your details and try again.');
      }
    } catch (err) {
      setError(t.Auth?.actions?.uplinkError || 'Unable to connect right now. Please try again in a moment.');
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
              {t.Auth?.registerBadge || 'Create Your Account'}
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white mb-2">{t.Auth?.registerTitle || 'Sign Up'}</h1>
            <p className="text-slate-500 font-medium text-sm">{t.Auth?.registerDesc || 'Join Kalide One and start hiring or offering services.'}</p>
            <p className="text-slate-400 font-medium text-xs mt-2">Choose your account type: Service Seeker, Individual Talent, or Company Team.</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">
              <span>Step {step} of 3</span>
              <button
                type="button"
                onClick={() => {
                  clearDraft();
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    country: '',
                    city: '',
                    role: 'client',
                    password: '',
                    expertiseAreas: [],
                    companyBase: '',
                    companyCapabilities: [],
                  });
                  setProfilePhoto(null);
                  setAcceptedPolicies(false);
                  setStep(1);
                  setError('');
                }}
                className="text-primary hover:underline"
              >
                Reset Draft
              </button>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
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
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                  placeholder={t.Auth?.fields?.name || 'Full name'}
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                  placeholder={t.Auth?.fields?.email || 'Email address'}
                  value={formData.email}
                  onChange={handleChange}
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                  placeholder={t.Auth?.fields?.phone || 'Phone number'}
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
                  <option value="client" className="bg-[#0f172a]">Service Seeker (Recruiter)</option>
                  <option value="artisan" className="bg-[#0f172a]">Individual Talent</option>
                  <option value="team_leader" className="bg-[#0f172a]">Company Team</option>
                </select>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="country"
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                  placeholder={t.Auth?.fields?.country || 'Country'}
                  value={formData.country}
                  onChange={handleChange}
                />
                <input
                  name="city"
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                  placeholder={t.Auth?.fields?.city || 'City'}
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            )}

            {step === 2 && formData.role === 'artisan' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Expertise Areas (Select multiple)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {expertiseOptions.map((option) => {
                    const active = (formData.expertiseAreas || []).includes(option);
                    return (
                      <button
                        type="button"
                        key={option}
                        onClick={() => toggleExpertise(option)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          active
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-primary/40'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && formData.role === 'team_leader' && (
              <div className="space-y-4">
                <input
                  name="companyBase"
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
                  placeholder="Company base (City, Country or Headquarters)"
                  value={formData.companyBase || ''}
                  onChange={handleChange}
                />

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Company Full-Team Capabilities (Select multiple)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {companyCapabilityOptions.map((option) => {
                      const active = (formData.companyCapabilities || []).includes(option);
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => toggleCompanyCapability(option)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            active
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:border-primary/40'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 pr-14 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10"
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

                <label className="block">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Profile Photo (Required)</span>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-primary transition-all text-white font-medium file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white"
                  />
                </label>

                <label className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={acceptedPolicies}
                    onChange={(e) => setAcceptedPolicies(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">Terms</Link>,{' '}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{' '}
                    <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                  </span>
                </label>
              </>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={step === 1 || isLoading}
                className="w-1/3 py-4 border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-40"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="w-2/3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                  {isLoading ? (t.Auth?.actions?.registering || 'Creating account...') : (t.Auth?.actions?.register || 'Create Account')}
                </button>
              )}
            </div>

            <div className="text-center pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {t.Auth?.actions?.hasAccount || 'Already have an account?'} {' '}
                <Link href="/login" className="text-primary hover:underline font-black">{t.Auth?.actions?.returnAccess || 'Sign in'}</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}