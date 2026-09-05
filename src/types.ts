export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'status_update' | 'message' | 'system';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  projectUrl?: string;
}

export interface Professional {
  id: string;
  fullName: string;
  picture: string;
  phone: string;
  email: string;
  jobCategory: string;
  skills: string[];
  bio?: string;
  location?: string;
  yearsOfExperience?: number | string;
  portfolioItems?: PortfolioItem[];
  rating?: number;
  ratingCount?: number;
  userId?: string;
  createdAt?: string;
}

export interface Rating {
  id: string;
  profId: string;
  profName?: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  company: string;
  jobType?: string;
  type?: string;
  location?: string;
  salary?: string;
  status?: string;
  requirements?: string[];
  logoUrl?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  fullName: string;
  phone: string;
  email?: string;
  userId?: string;
  cvUrl?: string;
  cvName?: string;
  cvLink?: string;
  photoUrl?: string;
  resumeText?: string;
  appliedAt: string;
  status?: 'pending' | 'reviewed' | 'contacted' | 'rejected';
  internalStatus?: string;
  statusUpdatedAt?: string;
  adminFeedback?: string;
  internalNotes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'admin' | 'professional';
  phone?: string;
  jobCategory?: string;
  skills?: string[];
  picture?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  clientId: string;
  clientName?: string;
  professionalId: string;
  professionalName: string;
  professionalPicture?: string;
  lastMessage: string;
  updatedAt: string;
  participants?: string[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: string;
}

export interface GlobalSettings {
  logoUrl?: string;
  heroImageUrl?: string;
  professionalInviteCode?: string;
}

export interface ServiceOrder {
  id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_category: string;
  project_title: string;
  project_description: string;
  budget_range?: string;
  timeline?: string;
  professional_id?: string;
  professional_name?: string;
  attachment_url?: string;
  cloud_link?: string;
  status?: 'pending' | 'reviewed' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at?: string;
}

// --- Escrow Payment Management System ---
export type EscrowStatus = 
  | 'pending_payment'
  | 'payment_processing'
  | 'funded'
  | 'work_in_progress'
  | 'work_submitted'
  | 'client_review'
  | 'client_approved'
  | 'awaiting_admin_release'
  | 'released'
  | 'refund_requested'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export interface EscrowProject {
  id: string;
  service_order_id?: string;
  client_id: string;
  client_name: string;
  professional_id: string;
  professional_name: string;
  title: string;
  amount: number;
  commission_rate: number;
  status: EscrowStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  user_type: 'client' | 'professional' | 'admin';
  pending_escrow: number;
  available_balance: number;
  withdrawn: number;
  updated_at?: string;
}

export interface EscrowTransaction {
  id: string;
  project_id: string;
  wallet_id?: string;
  amount: number;
  type: 'fund' | 'release' | 'refund' | 'withdraw' | 'commission';
  status: string;
  reference_id?: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  project_id: string;
  opened_by: string;
  reason: string;
  status: 'open' | 'resolved';
  resolution?: string;
  created_at: string;
}
