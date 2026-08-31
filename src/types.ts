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
  logoUrl?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle?: string;
  fullName: string;
  phone: string;
  cvUrl?: string;
  cvName?: string;
  cvLink?: string;
  photoUrl?: string;
  resumeText?: string;
  appliedAt: string;
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
