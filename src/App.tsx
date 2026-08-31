/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { initialProfessionals, initialProjects, initialJobs } from './data';
import { Professional, Project, JobPosting, JobApplication, Rating } from './types';
import { Hero } from './components/Hero';
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
import { OrderServiceModal } from './components/OrderServiceModal';
import { ClientDashboard } from './components/ClientDashboard';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { Chat } from './components/Chat';
import { MessageCircle } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { useToast } from './contexts/ToastContext';

export default function App() {
  const { showToast } = useToast();
  const [view, setView] = useState<AppView>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'professional' | 'client'>('client');
  const [activeChatProf, setActiveChatProf] = useState<Professional | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  // Supabase Order Service Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalService, setOrderModalService] = useState<string>('');
  const [orderModalProf, setOrderModalProf] = useState<{ id: string; name: string } | null>(null);

  const handleOpenOrderModal = (service?: string, prof?: { id: string; name: string }) => {
    setOrderModalService(service || '');
    setOrderModalProf(prof || null);
    setShowOrderModal(true);
  };
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [professionalInviteCode, setProfessionalInviteCode] = useState<string>('PRO-IDEA-2026');
  const [loading, setLoading] = useState(true);

  const whatsappNumber = "07068588344";
  const whatsappUrl = `https://wa.me/2347068588344?text=${encodeURIComponent("Hello iDEA Creation Hub, I would like to inquire about your services.")}`;

  useEffect(() => {
    // Listen to Professionals
    const unsubProfs = onSnapshot(collection(db, 'professionals'), (snapshot) => {
      const profsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Professional));
      setProfessionals(profsData.length > 0 ? profsData : initialProfessionals);
    }, (error) => console.error("Error fetching professionals:", error));

    // Listen to Ratings
    const unsubRatings = onSnapshot(collection(db, 'ratings'), (snapshot) => {
      const ratingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating));
      setRatings(ratingsData);
    }, (error) => console.error("Error fetching ratings:", error));

    // Listen to Projects
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projsData.length > 0 ? projsData : initialProjects);
    }, (error) => console.error("Error fetching projects:", error));

    // Listen to Jobs
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPosting));
      setJobs(jobsData.length > 0 ? jobsData : initialJobs);
    }, (error) => console.error("Error fetching jobs:", error));

    // Listen to Global Settings (Logo, Hero Image, and Pro Invite Code)
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.heroImageUrl) setHeroImageUrl(data.heroImageUrl);
        if (data.professionalInviteCode) setProfessionalInviteCode(data.professionalInviteCode);
      }
    }, (error) => console.error("Error fetching settings:", error));

    // Listen to Applications and Auth state
    let appsUnsub: (() => void) | null = null;
    let userDocUnsub: (() => void) | null = null;

    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (appsUnsub) {
        appsUnsub();
        appsUnsub = null;
      }
      if (userDocUnsub) {
        userDocUnsub();
        userDocUnsub = null;
      }

      if (user) {
        const userEmail = (user.email || '').trim().toLowerCase();
        if (userEmail === 'simonemmanuel8344@gmail.com') {
          setUserRole('admin');
          // Admin is logged in, listen to applications
          const appsQuery = query(collection(db, 'applications'), orderBy('appliedAt', 'desc'));
          appsUnsub = onSnapshot(appsQuery, (snapshot) => {
            setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication)));
          }, (error) => {
            console.error("Error fetching applications:", error);
          });
        } else {
          // Check role from users collection
          userDocUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists() && snap.data().role === 'professional') {
              setUserRole('professional');
            } else {
              setUserRole('client');
            }
          }, (error) => {
            console.error("Error fetching user profile:", error);
          });
        }
      } else {
        setUserRole('client');
        setApplications([]);
      }
    });

    setLoading(false);

    return () => {
      unsubProfs();
      unsubRatings();
      unsubProjects();
      unsubJobs();
      unsubSettings();
      if (appsUnsub) appsUnsub();
      if (userDocUnsub) userDocUnsub();
      unsubAuth();
    };
  }, []);

  const handleAddProfessional = async (prof: Professional) => {
    try {
      await setDoc(doc(db, 'professionals', prof.id), { ...prof, createdAt: new Date().toISOString() });
    } catch (err) { console.error("Error adding professional:", err); showToast("Failed to save professional", "error"); }
  };

  const handleUpdateProfessional = async (id: string, prof: Professional) => {
    try {
      await setDoc(doc(db, 'professionals', id), { ...prof }, { merge: true });
    } catch (err) { console.error("Error updating professional:", err); showToast("Failed to update professional", "error"); }
  };

  const handleDeleteProfessional = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'professionals', id));
    } catch (err) { console.error("Error deleting professional:", err); showToast("Failed to delete professional", "error"); }
  };

  const handleAddProject = async (proj: Project) => {
    try {
      await setDoc(doc(db, 'projects', proj.id), { ...proj, createdAt: new Date().toISOString() });
    } catch (err) { console.error("Error adding project:", err); showToast("Failed to save project", "error"); }
  };

  const handleUpdateProject = async (id: string, proj: Project) => {
    try {
      await updateDoc(doc(db, 'projects', id), { ...proj });
    } catch (err) { console.error("Error updating project:", err); showToast("Failed to update project", "error"); }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) { console.error("Error deleting project:", err); showToast("Failed to delete project", "error"); }
  };

  const handleAddJob = async (job: JobPosting) => {
    try {
      await setDoc(doc(db, 'jobs', job.id), { ...job, createdAt: new Date().toISOString() });
    } catch (err) { console.error("Error adding job:", err); showToast("Failed to save job", "error"); }
  };

  const handleUpdateJob = async (id: string, job: JobPosting) => {
    try {
      await updateDoc(doc(db, 'jobs', id), { ...job });
    } catch (err) { console.error("Error updating job:", err); showToast("Failed to update job", "error"); }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (err) { console.error("Error deleting job:", err); showToast("Failed to delete job", "error"); }
  };

  const handleSubmitApplication = async (appData: Omit<JobApplication, 'id' | 'appliedAt'>) => {
    const newId = Date.now().toString();
    try {
      const payload: Record<string, any> = {
        id: newId,
        jobId: appData.jobId,
        jobTitle: appData.jobTitle || 'Role Application',
        fullName: appData.fullName,
        phone: appData.phone,
        appliedAt: new Date().toISOString()
      };

      if (appData.cvUrl) payload.cvUrl = appData.cvUrl;
      if (appData.cvName) payload.cvName = appData.cvName;
      if (appData.cvLink) payload.cvLink = appData.cvLink;
      if (appData.photoUrl) payload.photoUrl = appData.photoUrl;
      if (appData.resumeText) payload.resumeText = appData.resumeText;

      await setDoc(doc(db, 'applications', newId), payload);
      showToast("Job application submitted successfully!", "success");
    } catch (err) {
      console.error("Error submitting application:", err);
      showToast("Failed to submit application. Please check your network or try attaching a cloud link.", "error");
    }
  };
  
  const handleUpdateLogo = async (url: string) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { logoUrl: url }, { merge: true });
    } catch (err) {
      console.error("Error updating logo:", err);
      showToast("Failed to update logo", "error");
    }
  };

  const handleUpdateHeroImage = async (url: string) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { heroImageUrl: url }, { merge: true });
    } catch (err) {
      console.error("Error updating hero image:", err);
      showToast("Failed to update hero image", "error");
    }
  };

  const handleUpdateInviteCode = async (code: string) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { professionalInviteCode: code }, { merge: true });
      setProfessionalInviteCode(code);
    } catch (err) {
      console.error("Error updating invite code:", err);
      showToast("Failed to update verification code", "error");
    }
  };

  const handleChatClick = (prof: Professional) => {
    if (!currentUser) {
      showToast('Please log in or register to chat with professionals', 'error');
      setShowAuthModal(true);
      return;
    }
    setActiveChatProf(prof);
    setView('chat');
  };

  const handleSelectProfessional = (prof: Professional) => {
    setSelectedProfessional(prof);
    setView('professional-profile');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A192F] flex items-center justify-center text-amber-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A192F] text-white font-sans selection:bg-amber-400 selection:text-[#0A192F] scroll-smooth relative">
      <Navbar 
        currentView={view} 
        setView={(v) => {
          setView(v);
          if (v !== 'professional-profile') {
            setSelectedProfessional(null);
          }
        }} 
        logoUrl={logoUrl} 
        onLoginClick={() => setShowAuthModal(true)}
        currentUser={currentUser}
        userRole={userRole}
      />
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showOrderModal && (
        <OrderServiceModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          initialService={orderModalService}
          professionalName={orderModalProf?.name}
          professionalId={orderModalProf?.id}
        />
      )}
      
      {view === 'professional-profile' && selectedProfessional ? (
        <ProfessionalProfileView
          professional={selectedProfessional}
          ratings={ratings}
          allProjects={projects}
          onBack={() => {
            setView('home');
            setSelectedProfessional(null);
          }}
          onChatClick={handleChatClick}
          onLoginPrompt={() => setShowAuthModal(true)}
        />
      ) : view === 'home' ? (
        <main>
          <Hero 
            heroImageUrl={heroImageUrl} 
            onOpenOrderModal={() => handleOpenOrderModal()}
          />
          <About />
          <Services 
            onOpenOrderModal={(service) => handleOpenOrderModal(service)}
          />
          <ProfessionalsList 
            professionals={professionals} 
            ratings={ratings}
            onSelectProfessional={handleSelectProfessional}
            onChatClick={handleChatClick} 
            onLoginPrompt={() => setShowAuthModal(true)}
          />
          <Portfolio projects={projects} />
          <JobsBoard jobs={jobs} onSubmitApplication={handleSubmitApplication} />
          <Contact 
            onOpenOrderModal={(service) => handleOpenOrderModal(service)}
          />
        </main>
      ) : view === 'client' ? (
        <ClientDashboard />
      ) : view === 'professional' ? (
        <ProfessionalDashboard 
          onBackToHome={() => setView('home')} 
          onViewMyProfile={handleSelectProfessional}
        />
      ) : view === 'chat' && activeChatProf ? (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Chat 
            professionalId={activeChatProf.id}
            professionalName={activeChatProf.fullName}
            professionalPicture={activeChatProf.picture}
            onBack={() => setView('home')}
          />
        </div>
      ) : (
        <AdminDashboard 
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
          logoUrl={logoUrl}
          onUpdateLogo={handleUpdateLogo}
          heroImageUrl={heroImageUrl}
          onUpdateHeroImage={handleUpdateHeroImage}
          professionalInviteCode={professionalInviteCode}
          onUpdateInviteCode={handleUpdateInviteCode}
          onViewProfessionalProfile={handleSelectProfessional}
          onLogout={() => setView('home')}
        />
      )}
      
      {/* Floating WhatsApp Quick Action Button on bottom-left */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 left-5 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] active:scale-90 text-white rounded-full shadow-2xl hover:shadow-green-500/40 transition-all cursor-pointer border-2 border-white/20 group"
        title="Chat with us on WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-7 h-7 fill-current text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
        </div>
      </a>

      <Footer />
    </div>
  );
}
