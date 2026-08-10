'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiService, Professional, Review } from '@/services/api';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import ReviewFormModal from '@/components/ReviewFormModal';

export default function WorkerDetail() {
  const params = useParams();
  const { t } = useLanguage();
  const id = params?.id as string;
  const [worker, setWorker] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchWorkerAndReviews = async () => {
    if (id) {
      const res = await apiService.getProfessionalDetail(parseInt(id));
      if (res.success && res.data) {
        setWorker(res.data);
      }
      const revRes = await apiService.getReviews(id);
      if (revRes.success && revRes.data) {
        setReviews(revRes.data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkerAndReviews();
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse italic">{t.WorkerProfile?.synchronizing || 'Loading profile data...'}</div>;
  if (!worker) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-black uppercase tracking-widest text-red-500">{t.WorkerProfile?.notIdentified || 'Profile Not Found'}</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-900">
      {/* Glow Effects */}
      <div className="hero-glow top-0 left-0 w-[500px] h-[500px] opacity-10" />
      
      <header className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 border-b border-gray-200 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/workers" className="text-slate-500 hover:text-gray-900 transition-colors">
              <span className="text-xl">←</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">{worker.user_name}</h1>
          </div>
          <div className="px-4 py-1 bg-white shadow-sm border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-primary">
            {worker.experience_years > 5 ? (t.WorkerProfile?.senior || 'Senior') : (t.WorkerProfile?.certified || 'Certified')} {t.Auth?.fields?.role?.artisan || 'Artisan'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
               <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-primary/20 to-blue-500/10 border border-gray-200 flex items-center justify-center font-black text-6xl text-primary shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  {worker.user_name?.[0]}
               </div>
               <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic">{worker.user_name}</h2>
                    {worker.is_verified && (
                       <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-gray-900">
                          ✓
                       </span>
                    )}
                  </div>
                  <p className="text-xl text-gray-500 font-medium tracking-wide uppercase">{worker.skills}</p>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary underline decoration-2 underline-offset-8">{t.WorkerProfile?.missionProfile || 'Mission Profile'}</h3>
               <p className="text-lg text-gray-600 leading-relaxed font-medium">
                  {typeof worker.bio === 'string' ? worker.bio : 'Verified professional with strong hands-on experience and high-quality work standards.'}
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: t.WorkerProfile?.rating || 'Rating', val: `★ ${worker.rating}` },
                 { label: t.WorkerProfile?.experience || 'Experience', val: `${worker.experience_years} ${t.WorkerProfile?.years || 'Years'}` },
                 { label: t.WorkerProfile?.hourlyRate || 'Hourly Rate', val: `$${worker.hourly_rate}` },
                 { label: t.WorkerProfile?.verified || 'Verified', val: worker.is_verified ? (t.WorkerProfile?.yes || 'Yes') : (t.WorkerProfile?.no || 'No') }
               ].map((stat, i) => (
                 <div key={i} className="bg-white shadow-sm border border-gray-100 p-6 rounded-3xl border-gray-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                    <p className="font-black text-xl">{stat.val}</p>
                 </div>
               ))}
            </div>
            {/* Portfolio Gallery */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary underline decoration-2 underline-offset-8">{t.WorkerProfile?.portfolio || 'Past Projects Portfolio'}</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800'
                  ].map((img, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-2xl aspect-square bg-gray-100 border border-gray-200">
                      <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-bold tracking-widest uppercase">{t.WorkerProfile?.viewProject || 'View Project'}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Client Reviews */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black uppercase tracking-widest text-primary underline decoration-2 underline-offset-8">{t.WorkerProfile?.clientReviews || 'Verified Client Reviews'}</h3>
                 <button 
                   onClick={() => setIsReviewModalOpen(true)}
                   className="px-4 py-2 bg-gray-50 text-primary border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                 >
                   {t.WorkerProfile?.leaveReview || 'Leave a Review'}
                 </button>
               </div>
               
               <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-sm font-medium">{t.WorkerProfile?.noReviews || 'No reviews yet.'}</p>
                  ) : (
                    reviews.map((review, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-bold text-gray-900">{review.reviewer?.name || 'Anonymous Client'}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                          <div className="flex text-orange-400 text-sm">
                            {'★'.repeat(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-8">
             <div className="bg-white shadow-sm border border-gray-100 p-8 rounded-[3rem] border-gray-200 shadow-2xl sticky top-28">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8 border-l-4 border-primary pl-4">{t.WorkerProfile?.hiringSync || 'Hiring Details'}</h3>
                
                <div className="space-y-4 mb-10">
                   <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.WorkerProfile?.serviceFee || 'Service Fee'}</span>
                      <span className="font-bold text-gray-900">$0.00</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.WorkerProfile?.escrowProtected || 'Escrow Protected'}</span>
                      <span className="font-bold text-green-500">{t.WorkerProfile?.locked || 'Locked'}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <Link 
                    href={`/quotes/new?worker=${worker.id}`}
                    className="block w-full py-5 bg-primary hover:bg-primary/90 text-white text-center rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-primary/20"
                  >
                    {t.WorkerProfile?.initiateLink || 'Book Now'}
                  </Link>
                  <Link 
                    href={`/messages?to=${worker.id}`}
                    className="block w-full py-5 bg-gray-900 hover:bg-black text-white text-center rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-gray-900/20"
                  >
                    {t.WorkerProfile?.messageArtisan || 'Message Artisan'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full py-5 bg-gray-50 shadow-sm border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    {t.WorkerProfile?.viewLedger || 'View Verified History'}
                  </button>
                </div>
                
                <p className="mt-8 text-[9px] text-center text-slate-400 font-black uppercase tracking-widest">
                  {t.WorkerProfile?.secureProtocol || 'Securely managed by Kalide Global'}
                </p>
             </div>
          </div>
        </div>
      </main>

      <ReviewFormModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        workerId={id} 
        workerName={worker.user_name} 
        onSuccess={fetchWorkerAndReviews}
      />
    </div>
  );
}
