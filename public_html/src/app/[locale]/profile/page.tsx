"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { apiService } from '@/services/api';

interface ProfilePayload {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  country?: string;
  city?: string;
  has_password?: boolean;
  application_status?: string;
  profile_photo?: string | null;
  expertise_areas?: string[];
  company_base?: string;
  company_capabilities?: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfilePayload>({});

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/v1/kalide-one/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();

        if (!res.ok || !payload?.success) {
          router.push('/login');
          return;
        }

        setName(payload.data?.name || '');
        setEmail(payload.data?.email || '');
        setRole(payload.data?.role || '');
        setPhotoUrl(payload.data?.profile_photo || null);
        setProfileData(payload.data || {});
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSaving(true);
    const response = await apiService.uploadProfilePhoto(selectedFile);
    setIsSaving(false);

    if (response.success && response.data && typeof response.data === 'object' && 'profile_photo' in response.data) {
      setPhotoUrl((response.data as { profile_photo?: string }).profile_photo || null);
      alert('Profile photo updated successfully.');
    } else if (response.success) {
      alert('Profile photo updated successfully.');
    } else {
      alert(response.message || 'Failed to upload profile photo.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading profile...</div>;
  }

  const checklist = [
    { label: 'Full name', done: Boolean(profileData.name?.trim()) },
    { label: 'Email address', done: Boolean(profileData.email?.trim()) },
    { label: 'Phone number', done: Boolean(profileData.phone?.trim()) },
    { label: 'Country', done: Boolean(profileData.country?.trim()) },
    { label: 'City', done: Boolean(profileData.city?.trim()) },
    { label: 'Profile photo', done: Boolean(photoUrl) },
    { label: 'Password set', done: Boolean(profileData.has_password) },
    { label: 'Application submitted', done: Boolean(profileData.application_status) },
    {
      label: 'Expertise areas',
      done: role !== 'artisan' || (Array.isArray(profileData.expertise_areas) && profileData.expertise_areas.length > 0),
    },
    {
      label: 'Company base',
      done: role !== 'team_leader' || Boolean(profileData.company_base?.trim()),
    },
    {
      label: 'Company capabilities',
      done: role !== 'team_leader' || (Array.isArray(profileData.company_capabilities) && profileData.company_capabilities.length > 0),
    },
  ];

  const filteredChecklist = checklist.filter((item) => item.label !== 'Expertise areas' || role === 'artisan')
    .filter((item) => item.label !== 'Company base' || role === 'team_leader')
    .filter((item) => item.label !== 'Company capabilities' || role === 'team_leader');

  const completedCount = filteredChecklist.filter((item) => item.done).length;
  const completionScore = filteredChecklist.length > 0
    ? Math.round((completedCount / filteredChecklist.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-3xl mx-auto glass rounded-[2rem] p-8 border border-white/10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight">My Profile</h1>
          <Link href={role === 'admin' ? '/dashboard/admin' : role === 'client' ? '/dashboard/client' : '/dashboard/worker'} className="px-4 py-2 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 items-start mb-8">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-400 uppercase tracking-widest">No Photo</span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Name</p>
              <p className="font-bold text-lg">{name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Email</p>
              <p className="font-medium text-slate-300 break-all">{email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Role</p>
              <p className="font-medium text-slate-300 uppercase">{role}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Profile Completion</p>
            <p className="text-sm font-black text-primary">{completionScore}%</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${completionScore}%` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredChecklist.map((item) => (
              <div key={item.label} className="text-xs flex items-center gap-2">
                <span>{item.done ? '✅' : '⬜'}</span>
                <span className={item.done ? 'text-green-400' : 'text-slate-400'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Upload Profile Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white"
              required
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isSaving ? 'Uploading...' : 'Save Photo'}
          </button>
        </form>
      </div>
    </div>
  );
}
