'use client';

import { useParams } from 'next/navigation';
import { Link } from '../../../../i18n/routing';
import { useLanguage } from '../../../../context/LanguageContext';

import { useState, useEffect } from 'react';
import { apiService, Project } from '../../../../services/api';
import VoiceUpdate from '@/components/VoiceUpdate';
import QRCheckIn from '@/components/QRCheckIn';
import ProjectInsurance from '@/components/ProjectInsurance';

export default function ProjectDetail() {
  const params = useParams();
  const { t, language } = useLanguage();
  const id = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<'voice' | 'qr' | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        const response = await apiService.getProjectDetail(parseInt(id));
        if (response.success && response.data) {
          setProject(response.data);
        }
      }
      setIsLoading(false);
    };
    fetchProject();
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-primary font-black uppercase italic animate-pulse">{t.ProjectDetail?.loading}</div>;
  if (!project) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-red-500 font-black uppercase">{t.ProjectDetail?.notFound}</div>;

  const getTitle = () => project.title[language] || project.title['en'] || 'Untitled Project';
  const getDesc = () => project.description[language] || project.description['en'] || 'No description provided.';

  const handleReleaseEscrow = async () => {
    if (!project) return;
    setIsLoading(true);
    const response = await apiService.releaseEscrow(project.id);
    if (response.success) {
       setProject({ ...project, status: 'completed' });
       alert(t.ProjectDetail?.releaseSuccess || 'Escrow released successfully');
    } else {
       alert(t.ProjectDetail?.releaseFail || 'Failed to release escrow');
    }
    setIsLoading(false);
  };

  const currentUser = apiService.getCurrentUser();
  const isClient = currentUser?.role === 'client';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Background Decor */}
      <div className="hero-glow top-0 left-0 w-[500px] h-[500px] opacity-10" />
      
      <header className="glass sticky top-0 z-50 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={isClient ? "/dashboard/client" : "/dashboard/worker"} className="text-slate-500 hover:text-white transition-colors">
              <span className="text-xl">←</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">{getTitle()}</h1>
          </div>
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            project.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'
          }`}>
            {t.ProjectDetail?.status}: {project.status.replace('_', ' ')}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
             <div>
                <div className="inline-block px-4 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-secondary mb-6">
                  {t.ProjectDetail?.moduleID}: #{project.id}
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-6 italic">{getTitle()}</h2>
                <p className="text-xl text-slate-400 font-medium leading-relaxed">{getDesc()}</p>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="p-6 glass rounded-2xl border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.ProjectDetail?.budgetNode}</p>
                   <p className="text-2xl font-black">${parseFloat(project.budget).toLocaleString()}</p>
                </div>
                <div className="p-6 glass rounded-2xl border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.ProjectDetail?.completionNode}</p>
                   <p className="text-2xl font-black">{project.status === 'completed' ? '100%' : '45%'}</p>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.ProjectDetail?.syncTimeline}</h3>
                <div className="relative pl-8 border-l-2 border-white/5 space-y-12">
                   <div className="relative">
                      <div className="absolute left-[-37px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-[#0f172a]" />
                      <p className="font-black uppercase text-xs tracking-widest mb-1">{t.ProjectDetail?.initialization}</p>
                      <p className="text-slate-500 text-xs font-medium">{project.start_date}</p>
                   </div>
                   <div className="relative">
                      <div className="absolute left-[-37px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-[#0f172a]" />
                      <p className="font-black uppercase text-xs tracking-widest mb-1">{t.ProjectDetail?.targetCompletion}</p>
                      <p className="text-slate-500 text-xs font-medium">{project.deadline}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-8">
             <div className="glass p-8 rounded-[2rem] border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 underline decoration-primary decoration-4 underline-offset-8">{t.ProjectDetail?.entityAccess}</h3>
                
                <div className="space-y-6 mb-12">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs">C</div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.ProjectDetail?.clientNode}</p>
                         <p className="text-xs font-bold">{project.client}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-xs text-primary">W</div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.ProjectDetail?.assignedProfessional}</p>
                         <p className="text-xs font-bold">{project.professional || t.ProjectDetail?.unassigned}</p>
                      </div>
                   </div>
                </div>

                 <div className="space-y-4">
                    <button 
                       onClick={() => setActiveAction('voice')}
                       className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                       {t.ProjectDetail?.updateProtocol} (Voice)
                    </button>
                    <button 
                       onClick={() => setActiveAction('qr')}
                       className="w-full py-4 border border-blue-500/30 text-blue-400 hover:bg-blue-500/5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                       Field Check-In / Scan
                    </button>
                    <button className="w-full py-4 glass hover:bg-white/5 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                       {t.ProjectDetail?.secureMessaging}
                    </button>
                    {isClient && project.status !== 'completed' && (
                      <button 
                         onClick={handleReleaseEscrow}
                         className="w-full py-4 border border-secondary/30 text-secondary hover:bg-secondary/5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                      >
                         {t.ProjectDetail?.releaseEscrow}
                      </button>
                    )}
                 </div>
              </div>

              {/* Insurance Node */}
              <ProjectInsurance 
                projectId={project.id} 
                isInsuranceActive={project.insurance_active || false} 
                insuranceFee={parseFloat(project.insurance_fee || '15.00')} 
              />

              {/* Action Modals */}
              {activeAction && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                  <div className="w-full max-w-xl relative">
                    <button 
                      onClick={() => setActiveAction(null)}
                      className="absolute -top-12 right-0 text-white font-black text-xl hover:scale-110 transition-transform"
                    >
                      ✕
                    </button>
                    
                    {activeAction === 'voice' && (
                      <VoiceUpdate 
                        projectId={project.id} 
                        onUpdateComplete={(text) => {
                          alert(`Transcribed & Sending: ${text}`);
                          setActiveAction(null);
                        }} 
                      />
                    )}
                    
                    {activeAction === 'qr' && (
                      <QRCheckIn 
                        projectId={project.id} 
                        mode={isClient ? 'scan' : 'generate'}
                        onSuccess={() => setActiveAction(null)}
                      />
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}