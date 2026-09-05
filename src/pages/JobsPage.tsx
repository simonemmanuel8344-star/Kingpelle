import React, { useState, ChangeEvent } from 'react';
import { JobPosting, JobApplication } from '../types';
import { 
  Briefcase, X, UploadCloud, CheckCircle2, ArrowRight, 
  Sparkles, DollarSign, MapPin, Clock, Search, Filter, Loader2 
} from 'lucide-react';
import { compressImage, readFileAsBase64 } from '../lib/imageCompressor';
import { AppView } from '../components/Navbar';
import { useToast } from '../contexts/ToastContext';

interface JobsPageProps {
  jobs: JobPosting[];
  onSubmitApplication: (app: Omit<JobApplication, 'id' | 'appliedAt'>) => Promise<void> | void;
  onNavigate: (view: AppView) => void;
}

export function JobsPage({ jobs, onSubmitApplication, onNavigate }: JobsPageProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cvUrl: '',
    cvName: '',
    cvLink: '',
    photoUrl: '',
    resumeText: ''
  });
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isProcessingCv, setIsProcessingCv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvError, setCvError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const compressedDataUrl = await compressImage(file, 400, 400, 0.75);
      setForm(prev => ({ ...prev, photoUrl: compressedDataUrl }));
      showToast('Photo attached successfully', 'success');
    } catch (err) {
      console.error('Error processing photo:', err);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvError('');

    const maxBytes = 600 * 1024;
    if (file.size > maxBytes) {
      const sizeKb = Math.round(file.size / 1024);
      setCvError(`File is ${sizeKb} KB. For direct upload, please select a file under 600 KB, or paste your Google Drive / LinkedIn link.`);
      return;
    }

    try {
      setIsProcessingCv(true);
      const dataUrl = await readFileAsBase64(file);
      setForm(prev => ({ 
        ...prev, 
        cvUrl: dataUrl, 
        cvName: file.name 
      }));
      showToast('CV document uploaded', 'success');
    } catch (err) {
      console.error('Error reading CV file:', err);
      setCvError('Could not process CV file. Please paste a cloud link.');
    } finally {
      setIsProcessingCv(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    try {
      await onSubmitApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        cvUrl: form.cvUrl,
        cvName: form.cvName,
        cvLink: form.cvLink.trim(),
        photoUrl: form.photoUrl,
        resumeText: form.resumeText.trim()
      });

      setSubmitted(true);
      showToast('Application received and logged!', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setSelectedJob(null);
        setForm({ fullName: '', email: '', phone: '', cvUrl: '', cvName: '', cvLink: '', photoUrl: '', resumeText: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
      showToast('Failed to send application. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'All' || 
      (job.jobType && job.jobType.toLowerCase().includes(selectedType.toLowerCase()));

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-[85vh] py-10 sm:py-16">
      {/* Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Find Jobs</span>
          </div>

          <button
            onClick={() => onNavigate('client')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200/60 transition-colors cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Track My Applications</span>
          </button>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Verified Career Opportunities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Explore Open <span className="text-indigo-600">Jobs & Gigs</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Apply directly to curated remote and on-site openings with top companies and fast-growing creative agencies.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role, company, or keywords..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-indigo-600 shadow-sm"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
          >
            <option value="All">All Job Types</option>
            <option value="Remote">Remote</option>
            <option value="Full-time">Full-Time</option>
            <option value="Contract">Contract / Freelance</option>
            <option value="Part-time">Part-Time</option>
          </select>
        </div>
      </div>

      {/* Jobs Listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl max-w-md mx-auto">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No open positions found</h3>
            <p className="text-sm text-gray-500 mb-4">Try clearing your filters or check back again soon.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType('All'); }}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map(job => (
              <div 
                key={job.id} 
                className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 hover:border-indigo-600/40 hover:shadow-xl transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                          {job.company}
                        </span>
                        {job.jobType && (
                          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                            {job.jobType}
                          </span>
                        )}
                        {job.location && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200">
                      {job.logoUrl ? (
                        <img src={job.logoUrl} alt={job.company} className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="text-indigo-600 w-6 h-6" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {job.description}
                  </p>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mb-6 space-y-1.5">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Requirements</div>
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    {job.salary ? `💰 ${job.salary}` : 'Competitive Compensation'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setCvError('');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply for Role</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-5 sm:p-6 flex justify-between items-center z-10">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Job Application</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedJob.title}</h3>
                <p className="text-xs text-gray-500">{selectedJob.company}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Received & Logged!</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                    Your application status is now <span className="font-bold text-amber-600">Pending Review</span>. You can track recruitment progress, reviews, and interviewer messages directly in your profile dashboard.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedJob(null);
                      onNavigate('client');
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>View Application in My Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input 
                        required
                        type="text" 
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                        placeholder="e.g. Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                      <input 
                        required
                        type="tel" 
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                        placeholder="e.g. 08012345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                      placeholder="e.g. yourname@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Paste Resume Link / LinkedIn</label>
                    <input 
                      type="url" 
                      value={form.cvLink}
                      onChange={e => setForm({ ...form, cvLink: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                      placeholder="https://drive.google.com/... or LinkedIn profile"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Upload CV / Document (PDF or DOC)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={handleCvUpload}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    {isProcessingCv && <p className="text-xs text-indigo-600 mt-1">Processing file...</p>}
                    {cvError && <p className="text-xs text-red-500 mt-1">{cvError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Brief Cover Note or Experience Summary</label>
                    <textarea 
                      rows={3}
                      value={form.resumeText}
                      onChange={e => setForm({ ...form, resumeText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
                      placeholder="Highlight relevant past roles, key skills, and why you are great for this opening..."
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || isProcessingCv || isProcessingPhoto}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Job Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
