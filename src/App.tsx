/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { initialProfessionals, initialProjects, initialJobs } from './data';
import { Professional, Project, JobPosting, JobApplication, Rating, UserProfile } from './types';
import { Hero } from './components/Hero';
import { AdBanner } from './components/AdBanner';
import { About } from './components/About';
import { Services } from './components/Services';
import { ProfessionalsList } from './components/ProfessionalsList';
import { ProfessionalProfileView } from './components/ProfessionalProfileView';
import { Portfolio } from './components/Portfolio';
import { JobsBoard } from './components/JobsBoard';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { Navbar, AppView } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ClientDashboard } from './components/ClientDashboard';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { Chat } from './components/Chat';
import { FloatingIcons } from './components/FloatingIcons';
import { GigMatchmaker } from './components/GigMatchmaker';
import { GlobalSearch } from './components/GlobalSearch';
import { HowItWorksSlideshow } from './components/HowItWorksSlideshow';

// Dedicated multi-page views
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { OrderServicePage } from './pages/OrderServicePage';
import { ProfessionalsPage } from './pages/ProfessionalsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { JobsPage } from './pages/JobsPage';
import { ContactPage } from './pages/ContactPage';

import { MessageCircle } from 'lucide-react';
import { supabase, fetchSupabaseData, insertSupabaseData, updateSupabaseData, deleteSupabaseData, getStoredUser, fetchRegisteredClients, deleteRegisteredClient, fetchRegisteredProfessionals, saveRegisteredProfessional, deleteRegisteredProfessional, saveJobApplication, fetchJobApplications, deleteJobApplication, updateJobApplicationStatus, saveGlobalSettings, fetchGlobalSettings, generateUUID, ensureUUID } from './lib/supabase';
import { useToast } from './contexts/ToastContext';

const parseInitialRoute = (): AppView => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const route = path || hash;
  if (route === 'admin') return 'admin';
  if (route === 'about') return 'about';
  if (route === 'services') return 'services';
  if (route === 'order-service' || route === 'order') return 'order-service';
  if (route === 'professionals' || route === 'hire') return 'professionals';
  if (route === 'portfolio' || route === 'projects') return 'portfolio';
  if (route === 'jobs') return 'jobs';
  if (route === 'contact') return 'contact';
  if (route === 'client') return 'client';
  if (route === 'professional') return 'professional';
  return 'home';
};

export default function App() {
  const { showToast } = useToast();
  const [view, setView] = useState<AppView>(parseInitialRoute);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('idea_hub_local_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [userRole, setUserRole] = useState<'admin' | 'professional' | 'client'>(() => {
    try {
      const cached = localStorage.getItem('idea_hub_local_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.role || 'client';
      }
    } catch {}
    return 'client';
  });
  const [activeChatProf, setActiveChatProf] = useState<Professional | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedOrderService, setSelectedOrderService] = useState<string>('Graphic Design & Brand Identity');

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('https://i.ibb.co/5gtxJ8Yz/Whats-App-Image-2026-08-30-at-7-01-19-PM.jpg');
  const [heroImageUrl, setHeroImageUrl] = useState<string>('https://i.ibb.co/rK6vrMRy/Whats-App-Image-2026-09-03-at-12-23-22-AM.jpg');
  const [professionalInviteCode, setProfessionalInviteCode] = useState<string>('PRO-IDEA-2026');
  const [loading, setLoading] = useState(true);

  const whatsappNumber = "07068588344";
  const whatsappUrl = `https://wa.me/2347068588344?text=${encodeURIComponent("Hello iDEA Creation Hub, I would like to inquire about your services.")}`;

  // Direct redirection to dedicated Order Service Page
  const handleNavigateToOrder = (serviceName?: string, prof?: Professional | null) => {
    if (serviceName) {
      setSelectedOrderService(serviceName);
    }
    if (prof) {
      setSelectedProfessional(prof);
    }
    handleNavigate('order-service');
  };

  const handleNavigate = (newView: AppView) => {
    setView(newView);
    if (newView !== 'professional-profile') {
      setSelectedProfessional(null);
    }
    try {
      const targetUrl = newView === 'home' ? '/' : `/${newView}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ view: newView }, '', targetUrl);
      }
    } catch {
      // Fallback in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setView(parseInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cls = await fetchRegisteredClients();
        setClients(cls);

        const registeredPros = await fetchRegisteredProfessionals();
        const existingIds = new Set(registeredPros.map(p => p.id));
        const existingEmails = new Set(registeredPros.map(p => p.email?.toLowerCase()).filter(Boolean));
        const existingNames = new Set(registeredPros.map(p => p.fullName?.trim().toLowerCase()).filter(Boolean));
        const remainingInitial = initialProfessionals.filter(p => !existingIds.has(p.id) && !existingEmails.has(p.email?.toLowerCase()) && !existingNames.has(p.fullName?.trim().toLowerCase()));
        setProfessionals([...registeredPros, ...remainingInitial]);

        const rts = await fetchSupabaseData('ratings');
        setRatings(rts);

        const prjsRaw = await fetchSupabaseData('projects');
        const prjs = prjsRaw.map((p: any) => ({
          ...p,
          imageUrl: p.image_url || p.imageUrl,
          projectUrl: p.project_url || p.projectUrl
        }));
        setProjects(prjs.length > 0 ? prjs : initialProjects);

        const jbsRaw = await fetchSupabaseData('job_postings');
        const jbs = jbsRaw.map((j: any) => ({
          ...j,
          jobType: j.job_type || j.jobType,
          logoUrl: j.logo_url || j.logoUrl
        }));
        setJobs(jbs.length > 0 ? jbs : initialJobs);

        const apps = await fetchJobApplications();
        setApplications(apps);

        const syncSettings = await fetchGlobalSettings();
        if (syncSettings) {
          if (syncSettings.logoUrl) setLogoUrl(syncSettings.logoUrl);
          if (syncSettings.heroImageUrl) setHeroImageUrl(syncSettings.heroImageUrl);
          if (syncSettings.professionalInviteCode) setProfessionalInviteCode(syncSettings.professionalInviteCode);
        } else {
          const { data: setts } = await supabase.from('settings').select('*').eq('id', 'global').single();
          if (setts) {
            if (setts.logoUrl) setLogoUrl(setts.logoUrl);
            if (setts.heroImageUrl) setHeroImageUrl(setts.heroImageUrl);
            if (setts.professionalInviteCode) setProfessionalInviteCode(setts.professionalInviteCode);
          } else {
            const lUrl = localStorage.getItem('settings_logoUrl');
            const hUrl = localStorage.getItem('settings_heroImageUrl');
            const c = localStorage.getItem('settings_professionalInviteCode');
            if (lUrl !== null) setLogoUrl(lUrl);
            if (hUrl !== null) setHeroImageUrl(hUrl);
            if (c !== null) setProfessionalInviteCode(c);
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };
    
    fetchData();

    // Check existing session immediately on startup
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          setCurrentUser(user);
          const userEmail = (user.email || '').trim().toLowerCase();
          let determinedRole: 'admin' | 'professional' | 'client' = 'client';

          if (userEmail === 'simonemmanuel8344@gmail.com') {
            determinedRole = 'admin';
            const apps = await fetchJobApplications();
            setApplications(apps);
          } else {
            const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
            if (userData?.role === 'professional') {
              determinedRole = 'professional';
            } else {
              const { data: profData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
              if (profData?.role === 'professional') {
                determinedRole = 'professional';
              } else {
                determinedRole = (user.user_metadata?.role as any) || 'client';
              }
            }
          }
          setUserRole(determinedRole);
          localStorage.setItem('idea_hub_local_user', JSON.stringify({
            id: user.id,
            email: user.email,
            role: determinedRole,
            user_metadata: user.user_metadata
          }));
        } else {
          // Backup check from local cache if offline or storage delayed
          const cachedUser = localStorage.getItem('idea_hub_local_user');
          if (cachedUser) {
            try {
              const parsed = JSON.parse(cachedUser);
              if (parsed && parsed.id) {
                setCurrentUser(parsed);
                setUserRole(parsed.role || 'client');
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // Supabase Auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      
      if (user) {
        setCurrentUser(user);
        const userEmail = (user.email || '').trim().toLowerCase();
        let determinedRole: 'admin' | 'professional' | 'client' = 'client';

        if (userEmail === 'simonemmanuel8344@gmail.com') {
          determinedRole = 'admin';
          const apps = await fetchJobApplications();
          setApplications(apps);
        } else {
          const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
          if (userData?.role === 'professional') {
            determinedRole = 'professional';
          } else {
            const { data: profData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profData?.role === 'professional') {
              determinedRole = 'professional';
            } else {
              determinedRole = (user.user_metadata?.role as any) || 'client';
            }
          }
        }
        setUserRole(determinedRole);
        localStorage.setItem('idea_hub_local_user', JSON.stringify({
          id: user.id,
          email: user.email,
          role: determinedRole,
          user_metadata: user.user_metadata
        }));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole('client');
        localStorage.removeItem('idea_hub_local_user');
      }
      setLoading(false);
    });

    const handleCustomAuth = async (e: any) => {
      const u = e.detail;
      if (u) {
        setCurrentUser(u);
        const role = u.role || 'client';
        setUserRole(role);
        if (role === 'admin' || u.email === 'simonemmanuel8344@gmail.com') {
          const apps = await fetchJobApplications();
          setApplications(apps);
        }
      } else {
        setCurrentUser(null);
        setUserRole('client');
      }
    };
    window.addEventListener('idea_hub_auth_changed', handleCustomAuth);

    const handleClientRegistered = (e: any) => {
      if (e.detail) {
        setClients(prev => {
          const filtered = prev.filter(c => c.id !== e.detail.id && c.email.toLowerCase() !== e.detail.email.toLowerCase());
          return [e.detail, ...filtered];
        });
      }
    };
    const handleClientDeleted = (e: any) => {
      if (e.detail?.id) {
        setClients(prev => prev.filter(c => c.id !== e.detail.id && (!e.detail.email || c.email.toLowerCase() !== e.detail.email.toLowerCase())));
      }
    };
    const handleProsUpdated = (e: any) => {
      if (e.detail?.deleted && e.detail.id) {
        setProfessionals(prev => prev.filter(p => p.id !== e.detail.id));
      } else if (e.detail?.id) {
        setProfessionals(prev => {
          const filtered = prev.filter(p => p.id !== e.detail.id && (!e.detail.email || p.email?.toLowerCase() !== e.detail.email?.toLowerCase()));
          return [e.detail, ...filtered];
        });
      }
    };

    const handleAppSubmitted = (e: any) => {
      if (e.detail?.id) {
        setApplications(prev => [e.detail, ...prev.filter(a => a.id !== e.detail.id)]);
      }
    };
    const handleAppDeleted = (e: any) => {
      if (e.detail?.id) {
        setApplications(prev => prev.filter(a => a.id !== e.detail.id));
      }
    };
    const handleAppUpdated = (e: any) => {
      if (e.detail?.id) {
        setApplications(prev => prev.map(a => a.id === e.detail.id ? { ...a, ...e.detail } : a));
      }
    };

    window.addEventListener('idea_hub_client_registered', handleClientRegistered);
    window.addEventListener('idea_hub_client_deleted', handleClientDeleted);
    window.addEventListener('idea_hub_professionals_updated', handleProsUpdated);
    window.addEventListener('idea_hub_job_application_submitted', handleAppSubmitted);
    window.addEventListener('idea_hub_job_application_deleted', handleAppDeleted);
    window.addEventListener('idea_hub_job_application_updated', handleAppUpdated);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('idea_hub_auth_changed', handleCustomAuth);
      window.removeEventListener('idea_hub_client_registered', handleClientRegistered);
      window.removeEventListener('idea_hub_client_deleted', handleClientDeleted);
      window.removeEventListener('idea_hub_professionals_updated', handleProsUpdated);
      window.removeEventListener('idea_hub_job_application_submitted', handleAppSubmitted);
      window.removeEventListener('idea_hub_job_application_deleted', handleAppDeleted);
      window.removeEventListener('idea_hub_job_application_updated', handleAppUpdated);
    };
  }, []);

  const handleAddProfessional = async (prof: Professional) => {
    try {
      const validId = ensureUUID(prof.id);
      const normalized = { ...prof, id: validId };
      await saveRegisteredProfessional(normalized);
      setProfessionals(prev => [normalized, ...prev.filter(p => p.id !== normalized.id)]);
      showToast("Professional saved successfully to cloud database", "success");
    } catch (err: any) {
      console.error("Error adding professional:", err);
      showToast(err?.message ? `Failed to save: ${err.message}` : "Failed to save professional", "error");
    }
  };

  const handleUpdateProfessional = async (id: string, prof: Professional) => {
    try {
      const validId = ensureUUID(id);
      const normalized = { ...prof, id: validId };
      await saveRegisteredProfessional(normalized);
      setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...normalized } : p));
      showToast("Professional updated successfully in cloud database", "success");
    } catch (err: any) {
      console.error("Error updating professional:", err);
      showToast(err?.message ? `Failed to update: ${err.message}` : "Failed to update professional", "error");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const client = clients.find(c => c.id === id);
      await deleteRegisteredClient(id, client?.email);
      setClients(prev => prev.filter(c => c.id !== id));
      showToast("Client deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete client", "error");
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    try {
      await deleteRegisteredProfessional(id);
      setProfessionals(prev => prev.filter(p => p.id !== id));
      showToast("Professional deleted successfully", "success");
    } catch (err) { console.error("Error deleting professional:", err); showToast("Failed to delete professional", "error"); }
  };

  const handleAddProject = async (proj: Project) => {
    try {
      const projPayload = {
        id: proj.id || generateUUID(),
        title: proj.title,
        description: proj.description || '',
        image_url: proj.imageUrl || (proj as any).image_url || '',
        project_url: proj.projectUrl || (proj as any).project_url || '',
        category: proj.category || 'Design',
        created_at: new Date().toISOString()
      };
      await insertSupabaseData('projects', projPayload);
      setProjects(prev => [...prev, { ...proj, id: projPayload.id, imageUrl: projPayload.image_url, projectUrl: projPayload.project_url }]);
      showToast("Project added successfully", "success");
    } catch (err) { console.error("Error adding project:", err); showToast("Failed to save project", "error"); }
  };

  const handleUpdateProject = async (id: string, proj: Project) => {
    try {
      const updatePayload = {
        title: proj.title,
        description: proj.description,
        image_url: proj.imageUrl || (proj as any).image_url,
        project_url: proj.projectUrl || (proj as any).project_url,
        category: proj.category
      };
      await updateSupabaseData('projects', id, updatePayload);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...proj } : p));
      showToast("Project updated successfully", "success");
    } catch (err) { console.error("Error updating project:", err); showToast("Failed to update project", "error"); }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteSupabaseData('projects', id);
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast("Project deleted successfully", "success");
    } catch (err) { console.error("Error deleting project:", err); showToast("Failed to delete project", "error"); }
  };

  const handleAddJob = async (job: JobPosting) => {
    try {
      const { jobType, logoUrl, requirements, ...rest } = job as any;
      const jobPayload = {
        ...rest,
        id: job.id || generateUUID(),
        job_type: jobType || job.jobType || 'Remote',
        logo_url: logoUrl || job.logoUrl || '',
        location: job.location || 'Remote',
        salary: job.salary || '',
        status: job.status || 'active',
        requirements: Array.isArray(requirements) ? requirements : [],
        created_at: new Date().toISOString()
      };
      await insertSupabaseData('job_postings', jobPayload);
      setJobs(prev => [...prev, { ...job, id: jobPayload.id }]);
      showToast("Job posted successfully", "success");
    } catch (err) { console.error("Error adding job:", err); showToast("Failed to save job", "error"); }
  };

  const handleUpdateJob = async (id: string, job: JobPosting) => {
    try {
      const { jobType, logoUrl, requirements, ...rest } = job as any;
      const updatePayload = {
        ...rest,
        job_type: jobType || job.jobType || 'Remote',
        logo_url: logoUrl || job.logoUrl || '',
        location: job.location || 'Remote',
        salary: job.salary || '',
        status: job.status || 'active',
        requirements: Array.isArray(requirements) ? requirements : []
      };
      await updateSupabaseData('job_postings', id, updatePayload);
      setJobs(prev => prev.map(p => p.id === id ? { ...p, ...job } : p));
      showToast("Job updated successfully", "success");
    } catch (err) { console.error("Error updating job:", err); showToast("Failed to update job", "error"); }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteSupabaseData('job_postings', id);
      setJobs(prev => prev.filter(p => p.id !== id));
      showToast("Job deleted successfully", "success");
    } catch (err) { console.error("Error deleting job:", err); showToast("Failed to delete job", "error"); }
  };

  const handleSubmitApplication = async (appData: Omit<JobApplication, 'id' | 'appliedAt'>) => {
    try {
      const savedApp = await saveJobApplication(appData);
      setApplications(prev => [savedApp, ...prev.filter(a => a.id !== savedApp.id)]);
      showToast("Job application submitted successfully! Our team will review your application.", "success");
    } catch (err) {
      console.error("Error submitting application:", err);
      showToast("Failed to submit application. Please retry.", "error");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await deleteJobApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      showToast("Application deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting application:", err);
      showToast("Failed to delete application", "error");
    }
  };

  const handleUpdateApplicationStatus = async (
    id: string, 
    status: 'pending' | 'reviewed' | 'contacted' | 'rejected',
    feedback?: string
  ) => {
    try {
      await updateJobApplicationStatus(id, status, feedback);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status, adminFeedback: feedback ?? a.adminFeedback } : a));
      showToast(`Application marked as ${status}`, "success");
    } catch (err) {
      console.error("Error updating application status:", err);
      showToast("Failed to update status", "error");
    }
  };
  
  const handleUpdateLogo = async (url: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', logoUrl: url });
    } catch (e) {}
    setLogoUrl(url);
    localStorage.setItem('settings_logoUrl', url);
    await saveGlobalSettings({ logoUrl: url, heroImageUrl, professionalInviteCode });
  };

  const handleUpdateHeroImage = async (url: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', heroImageUrl: url });
    } catch (e) {}
    setHeroImageUrl(url);
    localStorage.setItem('settings_heroImageUrl', url);
    await saveGlobalSettings({ logoUrl, heroImageUrl: url, professionalInviteCode });
  };

  const handleUpdateInviteCode = async (code: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', professionalInviteCode: code });
    } catch (e) {}
    setProfessionalInviteCode(code);
    localStorage.setItem('settings_professionalInviteCode', code);
    await saveGlobalSettings({ logoUrl, heroImageUrl, professionalInviteCode: code });
  };

  const handleChatClick = (prof: Professional) => {
    const active = currentUser || getStoredUser();
    if (!active) {
      showToast('Please sign in or register to chat with professionals', 'error');
      setShowAuthModal(true);
      return;
    }
    setActiveChatProf(prof);
    setView('chat');
  };

  useEffect(() => {
    const handleRatingSubmitted = (e: any) => {
      if (e.detail) {
        const newRating: Rating = e.detail;
        setRatings(prev => {
          const filtered = prev.filter(r => !(r.profId === newRating.profId && r.userId === newRating.userId));
          return [...filtered, newRating];
        });
      }
    };
    window.addEventListener('idea_hub_rating_submitted', handleRatingSubmitted);
    return () => window.removeEventListener('idea_hub_rating_submitted', handleRatingSubmitted);
  }, []);

  const handleSelectProfessional = (prof: Professional) => {
    setSelectedProfessional(prof);
    setView('professional-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent animated-mesh-bg flex items-center justify-center text-indigo-600 font-bold">
        Loading iDEA Creation Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent animated-mesh-bg text-gray-900 font-sans selection:bg-indigo-600 selection:text-white scroll-smooth relative flex flex-col justify-between">
      <FloatingIcons />
      
      <div>
        <Navbar 
          currentView={view} 
          setView={handleNavigate} 
          logoUrl={logoUrl} 
          onLoginClick={() => setShowAuthModal(true)}
          currentUser={currentUser}
          userRole={userRole}
        />
        
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onSuccess={(loggedUser, role) => {
              setCurrentUser(loggedUser);
              const r = (role || 'client') as any;
              setUserRole(r);
              setShowAuthModal(false);
              if (r === 'admin' || loggedUser.email === 'simonemmanuel8344@gmail.com') {
                handleNavigate('admin');
              } else if (r === 'professional') {
                handleNavigate('professional');
              } else {
                handleNavigate('client');
              }
            }}
          />
        )}
        
        {/* View Switcher: Multi-Page Routing */}
        {view === 'home' && (
          <main>
            <Hero 
              heroImageUrl={heroImageUrl} 
              onOpenOrderModal={() => handleNavigateToOrder()}
            />
            <AdBanner />
            <GlobalSearch 
              onSelectProfessional={handleSelectProfessional} 
              onOpenOrderModal={(service) => handleNavigateToOrder(service)} 
            />
            <GigMatchmaker onOpenOrderModal={(service) => handleNavigateToOrder(service)} />
            <About />
            <HowItWorksSlideshow onOpenOrderModal={(service) => handleNavigateToOrder(service)} />
            <Services 
              onOpenOrderModal={(service) => handleNavigateToOrder(service)}
            />
            <ProfessionalsList 
              professionals={professionals} 
              ratings={ratings}
              currentUser={currentUser}
              onSelectProfessional={handleSelectProfessional}
              onChatClick={handleChatClick} 
              onLoginPrompt={() => setShowAuthModal(true)}
            />
            <Portfolio projects={projects} />
            <JobsBoard jobs={jobs} onSubmitApplication={handleSubmitApplication} />
            <Contact 
              onOpenOrderModal={(service) => handleNavigateToOrder(service)}
            />
          </main>
        )}

        {view === 'about' && (
          <AboutPage 
            onNavigate={handleNavigate} 
            onOpenOrder={handleNavigateToOrder}
          />
        )}

        {view === 'services' && (
          <ServicesPage 
            onNavigate={handleNavigate}
            onSelectOrderService={(serviceTitle) => handleNavigateToOrder(serviceTitle)}
          />
        )}

        {view === 'order-service' && (
          <OrderServicePage 
            initialService={selectedOrderService}
            selectedProfessional={selectedProfessional}
            professionals={professionals}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'professionals' && (
          <ProfessionalsPage 
            professionals={professionals}
            ratings={ratings}
            currentUser={currentUser}
            onSelectProfessional={handleSelectProfessional}
            onChatClick={handleChatClick}
            onLoginPrompt={() => setShowAuthModal(true)}
            onNavigate={handleNavigate}
            onOrderService={handleNavigateToOrder}
          />
        )}

        {view === 'portfolio' && (
          <ProjectsPage 
            projects={projects}
            onNavigate={handleNavigate}
            onOrderService={handleNavigateToOrder}
          />
        )}

        {view === 'jobs' && (
          <JobsPage 
            jobs={jobs}
            onSubmitApplication={handleSubmitApplication}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'contact' && (
          <ContactPage 
            onNavigate={handleNavigate}
            onOrderService={handleNavigateToOrder}
          />
        )}

        {view === 'professional-profile' && selectedProfessional && (
          <ProfessionalProfileView
            professional={selectedProfessional}
            ratings={ratings}
            allProjects={projects}
            currentUser={currentUser}
            onBack={() => {
              setView('professionals');
              setSelectedProfessional(null);
            }}
            onChatClick={handleChatClick}
            onLoginPrompt={() => setShowAuthModal(true)}
          />
        )}

        {view === 'client' && (
          <ClientDashboard onNavigateToJobs={() => handleNavigate('jobs')} />
        )}

        {view === 'professional' && (
          <ProfessionalDashboard 
            onBackToHome={() => handleNavigate('home')} 
            onViewMyProfile={handleSelectProfessional}
          />
        )}

        {view === 'chat' && activeChatProf && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <Chat 
              professionalId={activeChatProf.id}
              professionalName={activeChatProf.fullName}
              professionalPicture={activeChatProf.picture}
              currentUser={currentUser}
              onBack={() => handleNavigate('home')}
            />
          </div>
        )}

        {view === 'admin' && (
          <AdminDashboard
            clients={clients}
            onDeleteClient={handleDeleteClient}
            professionals={professionals}
            projects={projects}
            jobs={jobs}
            onAddProfessional={handleAddProfessional} 
            onUpdateProfessional={handleUpdateProfessional}
            onDeleteProfessional={handleDeleteProfessional}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            applications={applications}
            onDeleteApplication={handleDeleteApplication}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            logoUrl={logoUrl}
            onUpdateLogo={handleUpdateLogo}
            heroImageUrl={heroImageUrl}
            onUpdateHeroImage={handleUpdateHeroImage}
            professionalInviteCode={professionalInviteCode}
            onUpdateInviteCode={handleUpdateInviteCode}
            onViewProfessionalProfile={handleSelectProfessional}
            onLogout={() => handleNavigate('home')}
          />
        )}
      </div>
      
      {/* Floating WhatsApp Quick Action Button on bottom-left */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 left-5 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] active:scale-90 text-gray-900 rounded-full shadow-2xl hover:shadow-green-500/40 transition-all cursor-pointer border-2 border-gray-300 group"
        title="Chat with us on WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-7 h-7 fill-current text-gray-900 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
        </div>
      </a>

      <Footer 
        logoUrl={logoUrl} 
        onNavigate={handleNavigate}
        onOrderService={handleNavigateToOrder}
      />
    </div>
  );
}
