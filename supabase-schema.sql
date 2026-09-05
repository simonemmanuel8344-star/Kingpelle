-- Supabase Database Schema for iDEA Creation Hub

-- 1. Website Settings
CREATE TABLE website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'iDEA Creation Hub',
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  hero_image_url TEXT,
  hero_heading TEXT,
  hero_description TEXT,
  cta_text TEXT,
  contact_email TEXT,
  phone TEXT,
  whatsapp TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Social Media
CREATE TABLE social_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects (Portfolio)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  slug TEXT UNIQUE,
  cover_image_url TEXT,
  gallery_image_urls TEXT[],
  client_info TEXT,
  services_used TEXT[],
  project_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  icon TEXT,
  image_url TEXT,
  deliverables TEXT[],
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  description TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Remote Jobs
CREATE TABLE remote_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT,
  employment_type TEXT,
  experience_level TEXT,
  is_remote BOOLEAN DEFAULT true,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  skills TEXT[],
  application_deadline TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Job Applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES remote_jobs(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  cover_message TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Client Project Requests (Service Orders)
CREATE TABLE client_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_requested TEXT,
  project_title TEXT,
  project_description TEXT,
  budget TEXT,
  deadline TEXT,
  attachment_url TEXT,
  preferred_contact_method TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  position TEXT,
  company TEXT,
  photo_url TEXT,
  testimonial TEXT NOT NULL,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Setup Data
INSERT INTO website_settings (name, tagline, contact_email) VALUES ('iDEA Creation Hub', 'Innovate. Design. Engineer. Accelerate.', 'ideacreationhub@gmail.com');

-- Enable Row Level Security
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Public read access for published/enabled content
CREATE POLICY "Public can view website settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Public can view enabled social media" ON social_media FOR SELECT USING (is_enabled = true);
CREATE POLICY "Public can view published projects" ON projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published services" ON services FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published skills" ON skills FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published jobs" ON remote_jobs FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published testimonials" ON testimonials FOR SELECT USING (is_published = true);

-- Public insert access for forms
CREATE POLICY "Public can insert job applications" ON job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert client requests" ON client_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Admin full access (Authenticated users for now, can be restricted by role later)
CREATE POLICY "Admins have full access to website settings" ON website_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to social media" ON social_media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to skills" ON skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to remote jobs" ON remote_jobs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to job applications" ON job_applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to client requests" ON client_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to contact messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- Storage Buckets Setup
-- Note: Buckets need to be created via Supabase UI or API first, but here are the SQL commands if supported:
INSERT INTO storage.buckets (id, name, public) VALUES 
('portfolio-images', 'portfolio-images', true),
('service-images', 'service-images', true),
('profile-assets', 'profile-assets', true),
('website-assets', 'website-assets', true),
('job-applications', 'job-applications', false),
('project-attachments', 'project-attachments', false)
ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Public read portfolio-images" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-images');
CREATE POLICY "Public read service-images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Public read profile-assets" ON storage.objects FOR SELECT USING (bucket_id = 'profile-assets');
CREATE POLICY "Public read website-assets" ON storage.objects FOR SELECT USING (bucket_id = 'website-assets');

CREATE POLICY "Public insert job-applications" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-applications');
CREATE POLICY "Public insert project-attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-attachments');

CREATE POLICY "Admin full access storage" ON storage.objects FOR ALL USING (auth.role() = 'authenticated');
