"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { apiService } from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
