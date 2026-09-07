import React, { useState, ChangeEvent } from 'react';
import { JobPosting, JobApplication } from '../types';
import { extractUrl } from "../lib/urlUtils";
import { Briefcase, X, UploadCloud, CheckCircle, ArrowRight, FileText, Image as ImageIcon, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';
import { compressImage, readFileAsBase64 } from '../lib/imageCompressor';

interface Props {
  jobs: JobPosting[];
  onSubmitApplication: (app: Omit<JobApplication, 'id' | 'appliedAt'>) => void;
}

export function JobsBoard({ jobs, onSubmitApplication }: Props) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    cvUrl: '',
    cvName: '',
    cvLink: '',
    photoUrl: '',
    resumeText: ''
  });
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isProcessingCv, setIsProcessingCv] = useState(false);
  const [cvError, setCvError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      // Compress image client-side to max 400x400 at 75% JPEG quality (~25KB-45KB)
      const compressedDataUrl = await compressImage(file, 400, 400, 0.75);
      setForm(prev => ({ ...prev, photoUrl: compressedDataUrl }));
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

    // If file is larger than 550KB, notify user to either compress or use a cloud link
    const maxBytes = 550 * 1024;
    if (file.size > maxBytes) {
      const sizeKb = Math.round(file.size / 1024);
      setCvError(`File is ${sizeKb} KB. For direct upload, please select a PDF under 550 KB, or simply paste your Google Drive / LinkedIn link in the Link field below.`);
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
    } catch (err) {
      console.error('Error reading CV file:', err);
      setCvError('Could not process CV file. Please try again or paste a link.');
    } finally {
      setIsProcessingCv(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedJob) {
      onSubmitApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        cvUrl: form.cvUrl,
        cvName: form.cvName,
        cvLink: form.cvLink.trim(),
        photoUrl: form.photoUrl,
        resumeText: form.resumeText.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedJob(null);
        setForm({ fullName: '', phone: '', cvUrl: '', cvName: '', cvLink: '', photoUrl: '', resumeText: '' });
      }, 3000);
    }
  };

  return (
    <section id="jobs" className="py-16 sm:py-24 bg-gray-50 border-y border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-indigo-600 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">Partner Opportunities</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Find a job here that suits your skills</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Browse open positions below and take the next step in your career.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full py-8">No open positions at the moment. Please check back later.</p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white/60 border border-gray-200/60 rounded-2xl p-6 sm:p-8 hover:border-indigo-600/50 transition-all flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs sm:text-sm font-medium px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full inline-block">
                          {job.company}
                        </span>
                        {job.jobType && (
                          <span className="text-xs sm:text-sm font-medium px-3 py-1 bg-indigo-600/20 text-indigo-600 rounded-full inline-block">
                            {job.jobType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/60 flex items-center justify-center shrink-0 border border-gray-200/60">
                      {job.logoUrl ? (
                        <img src={job.logoUrl || undefined} alt={job.company} className="w-full h-full object-cover bg-white" />
                      ) : (
                        <Briefcase className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{job.description}</p>
                </div>
                
                <div>
                  <button 
                    onClick={() => {
                      setSelectedJob(job);
                      setCvError('');
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white font-semibold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Apply for Role</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Modal - Highly responsive with client-side compression */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-white backdrop-blur-sm">
          <div className="bg-transparent border border-gray-200/60 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-transparent/95 backdrop-blur-md border-b border-gray-200/60 p-5 sm:p-6 flex justify-between items-center z-10">
              <div>
                <span className="text-xs text-indigo-600 uppercase tracking-wider font-semibold block">Job Application</span>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate max-w-[240px] sm:max-w-md">{selectedJob.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="w-10 h-10 rounded-full bg-white/60 hover:bg-gray-100/80 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 sm:p-6 flex-1">
              {submitted ? (
                <div className="text-center py-10 sm:py-12">
                  <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-green-400 mx-auto mb-4" />
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h4>
                  <p className="text-sm sm:text-base text-gray-500">{selectedJob.company ? `${selectedJob.company} will review your profile and get in touch.` : 'The hiring team will review your profile and get in touch.'}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">Full Name *</label>
                      <input required type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full px-4 py-3 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-base focus:border-indigo-600 focus:outline-none" placeholder="e.g. Sarah Connor" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">Phone Number *</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-base focus:border-indigo-600 focus:outline-none" placeholder="e.g. 08012345678" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* CV Document Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-gray-600">Upload CV File (.pdf, .doc)</label>
                        <span className="text-[11px] text-gray-500">&lt; 500 KB</span>
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvUpload}
                        className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-xs sm:text-sm focus:border-indigo-600 focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" 
                      />
                      {isProcessingCv && (
                        <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing CV...
                        </p>
                      )}
                      {form.cvName && !cvError && (
                        <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Attached: {form.cvName}
                        </p>
                      )}
                      {cvError && (
                        <div className="text-xs text-red-400 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{cvError}</span>
                        </div>
                      )}
                    </div>

                    {/* Passport Photograph with auto compression */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs sm:text-sm font-medium text-gray-600">Passport Photograph *</label>
                        <span className="text-[11px] text-indigo-600 font-medium">Auto-optimized</span>
                      </div>
                      <input 
                        required={!form.photoUrl}
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full px-3 py-2 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-xs sm:text-sm focus:border-indigo-600 focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" 
                      />
                      {isProcessingPhoto && (
                        <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing photo...
                        </p>
                      )}
                      {form.photoUrl && (
                        <div className="flex items-center gap-2 mt-2">
                          <img src={form.photoUrl || undefined} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-indigo-600/40" />
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Photo attached
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cloud CV / Portfolio Link Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">
                      Or Paste CV / Portfolio Link (Google Drive, LinkedIn, Dropbox)
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="url" 
                        value={form.cvLink} 
                        onChange={e => setForm({...form, cvLink: extractUrl(e.target.value)})} 
                        className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-sm focus:border-indigo-600 focus:outline-none" 
                        placeholder="https://drive.google.com/... or https://linkedin.com/in/..." 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5">Resume Summary / Cover Letter *</label>
                    <textarea 
                      required 
                      rows={4} 
                      placeholder="Write your background, key skills, experience summary, or cover letter here..." 
                      value={form.resumeText} 
                      onChange={e => setForm({...form, resumeText: e.target.value})} 
                      className="w-full px-4 py-3 bg-white/60 border border-gray-200/60 rounded-xl text-gray-900 text-base focus:border-indigo-600 focus:outline-none"
                    ></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isProcessingPhoto || isProcessingCv}
                      className="w-full py-3.5 sm:py-4 bg-indigo-600 text-white font-bold text-base rounded-xl hover:bg-indigo-700 active:scale-98 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      <UploadCloud className="w-5 h-5 mr-2" />
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
