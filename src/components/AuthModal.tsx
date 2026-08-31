import { useState, FormEvent, ChangeEvent } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, Briefcase, Award, KeyRound, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: 'client' | 'professional';
}

export function AuthModal({ onClose, defaultTab = 'client' }: AuthModalProps) {
  const { showToast } = useToast();
  const [accountType, setAccountType] = useState<'client' | 'professional'>(defaultTab);
  const [isLogin, setIsLogin] = useState(true);
  
  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Professional-specific Fields
  const [inviteCode, setInviteCode] = useState('');
  const [phone, setPhone] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Log in with email & password
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showToast('Successfully logged in!', 'success');
        onClose();
      } else {
        // Registration Flow
        if (accountType === 'professional') {
          // Verify access code
          const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
          const expectedCode = settingsSnap.exists() && settingsSnap.data().professionalInviteCode 
            ? settingsSnap.data().professionalInviteCode.trim().toUpperCase() 
            : 'PRO-IDEA-2026';

          if (inviteCode.trim().toUpperCase() !== expectedCode) {
            showToast('Invalid professional verification code. Contact iDEA admin to obtain an access code.', 'error');
            setLoading(false);
            return;
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
        await updateProfile(user, { 
          displayName: fullName.trim(),
          photoURL: pictureUrl || undefined
        });

        const now = new Date().toISOString();
        const parsedSkills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (accountType === 'professional') {
          // 1. Save to users collection with role 'professional'
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: email.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            jobCategory: jobCategory.trim(),
            skills: parsedSkills,
            picture: pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            role: 'professional',
            createdAt: now
          });

          // 2. Also register in the public professionals collection so clients can discover and chat with them
          await setDoc(doc(db, 'professionals', user.uid), {
            id: user.uid,
            fullName: fullName.trim(),
            picture: pictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            phone: phone.trim(),
            email: email.trim(),
            jobCategory: jobCategory.trim() || 'Creative Professional',
            skills: parsedSkills.length > 0 ? parsedSkills : ['Consultation', 'Creative Direction'],
            userId: user.uid,
            createdAt: now
          });

          showToast('Verified Professional account created successfully!', 'success');
        } else {
          // Client account
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: email.trim(),
            fullName: fullName.trim(),
            role: 'client',
            createdAt: now
          });

          showToast('Client account created successfully!', 'success');
        }

        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      showToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 p-6 sm:p-8 bg-[#0A192F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1.5">
            {isLogin ? 'Sign In to iDEA Hub' : (accountType === 'professional' ? 'Join as Verified Professional' : 'Create Client Account')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {isLogin 
              ? 'Access your conversations, ratings, and dashboard' 
              : (accountType === 'professional' ? 'Provide your unique verification code to activate your pro profile' : 'Connect and collaborate with verified professionals')}
          </p>
        </div>

        {/* Toggle between Client and Professional on Register tab */}
        {!isLogin && (
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => setAccountType('client')}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                accountType === 'client' 
                  ? 'bg-amber-400 text-[#0A192F] shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Client
            </button>
            <button
              type="button"
              onClick={() => setAccountType('professional')}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                accountType === 'professional' 
                  ? 'bg-amber-400 text-[#0A192F] shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Verified Pro
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Professional Invite / Verification Code Field */}
          {!isLogin && accountType === 'professional' && (
            <div className="bg-amber-400/10 border border-amber-400/30 p-3.5 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                Unique Professional Verification Code *
              </label>
              <input 
                type="text" 
                required 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-amber-400/40 rounded-lg text-white font-mono text-sm uppercase placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                placeholder="Enter unique code (e.g. PRO-IDEA-2026)"
              />
              <p className="text-[11px] text-gray-300">
                Provided by iDEA Creation Hub admin. Contact 07068588344 or ideacreationhub@gmail.com if you haven't received your code.
              </p>
            </div>
          )}

          {/* Full Name */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Professional Fields: Phone, Category, Skills, Picture */}
          {!isLogin && accountType === 'professional' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="e.g. 08012345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Job Title / Category *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required 
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="e.g. Full-Stack Developer, UI/UX Designer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="React, TypeScript, Figma, Tailwind"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {pictureUrl && (
                    <img src={pictureUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-amber-400 shrink-0" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-[#0A192F] hover:file:bg-amber-300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="•••••••• (min 6 characters)"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-4 bg-amber-400 text-[#0A192F] font-bold rounded-xl hover:bg-amber-300 active:scale-[0.98] transition-all disabled:opacity-50 text-sm sm:text-base shadow-lg"
          >
            {loading ? 'Please wait...' : (
              isLogin 
                ? 'Sign In' 
                : (accountType === 'professional' ? 'Verify & Create Pro Account' : 'Create Account')
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs sm:text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-amber-400 font-semibold hover:underline"
            >
              {isLogin ? 'Register here' : 'Sign in'}
            </button>
          </p>

          {isLogin && (
            <p className="text-xs text-gray-400 pt-2 border-t border-white/10">
              Are you a verified talent?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setAccountType('professional');
                }}
                className="text-amber-400 font-semibold hover:underline"
              >
                Register with your pro code
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
