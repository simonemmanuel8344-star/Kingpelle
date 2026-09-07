-- ==============================================================================
-- iDEA Creation Hub - Complete Master Database Setup & Sync Fix
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project (cndijjjhyczocmphedmp)
-- 3. In the left navigation menu, click "SQL Editor"
-- 4. Click "+ New query" (or blank editor)
-- 5. Paste this entire script and click "RUN" (green button)
--
-- IMPORTANT: DO NOT delete your database or drop your tables!
-- This script is 100% safe and idempotent. It creates any missing tables,
-- adds any missing columns, configures open access RLS policies, and seeds
-- all default website data (Professionals, Projects, Jobs, Settings) into Supabase.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Settings Table (Fixes missing settings table & column sync)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    logo_url TEXT,
    hero_image_url TEXT,
    professional_invite_code TEXT DEFAULT 'IDEA2026',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support both snake_case and camelCase
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "professionalInviteCode" TEXT DEFAULT 'IDEA2026';

-- Seed default global settings
INSERT INTO public.settings (id, logo_url, "logoUrl", hero_image_url, "heroImageUrl", professional_invite_code, "professionalInviteCode")
VALUES (
    'global',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600',
    'IDEA2026',
    'IDEA2026'
)
ON CONFLICT (id) DO UPDATE SET
    logo_url = COALESCE(public.settings.logo_url, EXCLUDED.logo_url),
    "logoUrl" = COALESCE(public.settings."logoUrl", EXCLUDED."logoUrl"),
    hero_image_url = COALESCE(public.settings.hero_image_url, EXCLUDED.hero_image_url),
    "heroImageUrl" = COALESCE(public.settings."heroImageUrl", EXCLUDED."heroImageUrl");

-- 3. Professionals Table (Ensure flexible TEXT id and JSONB portfolio_items)
CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    job_category TEXT,
    skills TEXT[],
    picture TEXT,
    bio TEXT,
    location TEXT DEFAULT 'Nigeria & Remote',
    years_of_experience TEXT DEFAULT '3+ Years',
    portfolio_items JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC DEFAULT 5.0,
    rating_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert ID to TEXT if previously UUID, and add any missing columns
DO $$
BEGIN
    ALTER TABLE public.professionals ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS portfolio_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 1;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Nigeria & Remote';
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS years_of_experience TEXT DEFAULT '3+ Years';

-- 4. Projects Table (Ensure flexible TEXT id, image_url, project_url)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    project_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.projects ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;

-- 5. Job Postings Table
CREATE TABLE IF NOT EXISTS public.job_postings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    company TEXT,
    job_type TEXT DEFAULT 'Remote',
    logo_url TEXT,
    location TEXT DEFAULT 'Remote',
    salary TEXT,
    status TEXT DEFAULT 'active',
    requirements TEXT[],
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.job_postings ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Remote';
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS requirements TEXT[];
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    professional_id TEXT,
    user_id TEXT,
    client_id TEXT,
    client_name TEXT,
    rating NUMERIC DEFAULT 5,
    review TEXT,
    comment TEXT,
    order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.ratings ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS review TEXT;
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS client_id TEXT;

-- 7. Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    job_id TEXT,
    applicant_name TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    cover_message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.job_applications ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS cover_message TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 8. Service Orders Table
CREATE TABLE IF NOT EXISTS public.service_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    service_id TEXT,
    service_name TEXT,
    professional_id TEXT,
    professional_name TEXT,
    status TEXT DEFAULT 'pending',
    budget TEXT,
    timeline TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    ALTER TABLE public.service_orders ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 9. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure visitors can read all public data and submit applications/orders/messages
-- ==============================================================================

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
DROP POLICY IF EXISTS "Allow public read settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all update settings" ON public.settings;

DROP POLICY IF EXISTS "Public can view professionals" ON public.professionals;
DROP POLICY IF EXISTS "Allow public read professionals" ON public.professionals;
DROP POLICY IF EXISTS "Allow write professionals" ON public.professionals;

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow write projects" ON public.projects;

DROP POLICY IF EXISTS "Public can view job_postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow public read job_postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow write job_postings" ON public.job_postings;

DROP POLICY IF EXISTS "Public can view ratings" ON public.ratings;
DROP POLICY IF EXISTS "Allow public read ratings" ON public.ratings;
DROP POLICY IF EXISTS "Allow write ratings" ON public.ratings;

DROP POLICY IF EXISTS "Public can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public read contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public insert contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public update contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow public delete contact_messages" ON public.contact_messages;

DROP POLICY IF EXISTS "Allow public read service_orders" ON public.service_orders;
DROP POLICY IF EXISTS "Allow public write service_orders" ON public.service_orders;

DROP POLICY IF EXISTS "Allow public read job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Allow public write job_applications" ON public.job_applications;

-- Apply Open Policies for Website Operations
CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow all update settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Allow write professionals" ON public.professionals FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow write projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read job_postings" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Allow write job_postings" ON public.job_postings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Allow write ratings" ON public.ratings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read contact_messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contact_messages" ON public.contact_messages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete contact_messages" ON public.contact_messages FOR DELETE USING (true);

CREATE POLICY "Allow public read service_orders" ON public.service_orders FOR SELECT USING (true);
CREATE POLICY "Allow public write service_orders" ON public.service_orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read job_applications" ON public.job_applications FOR SELECT USING (true);
CREATE POLICY "Allow public write job_applications" ON public.job_applications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. Seed Initial Website Content Directly Into Supabase
-- ==============================================================================

-- Seed Verified Professionals
INSERT INTO public.professionals (
    id, full_name, email, phone, job_category, skills, picture, bio, location, years_of_experience, portfolio_items, rating, rating_count
) VALUES 
(
    '1',
    'Sarah Jenkins',
    'sarah.j@example.com',
    '+1 (555) 123-4567',
    'Graphic Designer & Brand Strategist',
    ARRAY['Branding', 'UI/UX', 'Illustration', 'Typography', 'Figma', 'Adobe Illustrator'],
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    'Passionate multi-disciplinary visual designer specializing in brand identity, user experience design, and digital typography. With over 6 years crafting tailored visual systems for fast-growing startups and creative agencies, I transform abstract business ideas into iconic brand experiences.',
    'Lagos & Remote',
    '6+ Years',
    '[
        {"id":"p1-1","title":"Modern Brand Identity & Packaging","description":"Comprehensive branding guidelines, typography system, and eco-friendly product packaging for a luxury skincare line.","imageUrl":"https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600","category":"Branding","projectUrl":"https://example.com/brand"},
        {"id":"p1-2","title":"Fintech Mobile App UI/UX","description":"Clean, user-centric mobile banking interface with interactive prototype flows and accessible design components.","imageUrl":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600","category":"UI/UX Design","projectUrl":"https://example.com/app"},
        {"id":"p1-3","title":"Editorial Magazine & Type Layout","description":"Minimalist editorial publication layout featuring custom typography treatments and bespoke vector illustrations.","imageUrl":"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600","category":"Illustration"}
    ]'::jsonb,
    5.0,
    14
),
(
    '2',
    'David Chen',
    'david.c@example.com',
    '+1 (555) 987-6543',
    'Full-Stack Web Developer',
    ARRAY['React', 'Node.js', 'Tailwind CSS', 'TypeScript', 'Next.js', 'PostgreSQL', 'Cloud Infrastructure'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'Senior full-stack software engineer with deep expertise in high-performance web applications, scalable API architecture, and frictionless frontend user interfaces. Dedicated to building secure, fast, and accessible digital products.',
    'Abuja & Remote',
    '8+ Years',
    '[
        {"id":"p2-1","title":"E-commerce Marketplace Platform","description":"Scalable multi-vendor e-commerce web application with real-time inventory management, payments, and instant analytics dashboard.","imageUrl":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600","category":"Full-Stack Development","projectUrl":"https://example.com/store"},
        {"id":"p2-2","title":"Real-time Collaboration Cloud Suite","description":"Collaborative document and project task board supporting live WebSocket sync, user permissions, and custom workflows.","imageUrl":"https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600","category":"Web App"},
        {"id":"p2-3","title":"Enterprise Analytics Dashboard","description":"Data visualization platform with interactive charting, automated reporting, and real-time revenue metrics.","imageUrl":"https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600","category":"Frontend Engineering"}
    ]'::jsonb,
    5.0,
    22
),
(
    '3',
    'Elena Rodriguez',
    'elena.r@example.com',
    '+1 (555) 456-7890',
    'Principal Architect & 3D Visualizer',
    ARRAY['3D Modeling', 'Interior Design', 'AutoCAD', 'Revit', 'Sustainable Building', 'BIM'],
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    'Lead architectural designer and spatial strategist combining modern aesthetic minimalism with environmental sustainability. Focused on contemporary residential spaces, commercial interiors, and photorealistic 3D structural visualizations.',
    'Port Harcourt & Remote',
    '7+ Years',
    '[
        {"id":"p3-1","title":"Minimalist Eco Villa & Living Space","description":"Sustainable residential villa designed with natural ventilation, solar integration, and minimalist natural stone finishes.","imageUrl":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600","category":"Architecture","projectUrl":"https://example.com/villa"},
        {"id":"p3-2","title":"Contemporary Corporate Office Interior","description":"Open-concept, ergonomic workspace design with acoustic optimization and modular collaborative pods.","imageUrl":"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600","category":"Interior Design"},
        {"id":"p3-3","title":"Urban Boutique Cafe Concept","description":"Biophilic cafe and lounge concept incorporating warm wooden textures, industrial accents, and dynamic ambient lighting.","imageUrl":"https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600","category":"Commercial Spaces"}
    ]'::jsonb,
    5.0,
    19
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    job_category = EXCLUDED.job_category,
    skills = EXCLUDED.skills,
    picture = EXCLUDED.picture,
    bio = EXCLUDED.bio,
    portfolio_items = EXCLUDED.portfolio_items;

-- Seed Projects (Portfolio)
INSERT INTO public.projects (id, title, description, image_url, category) VALUES
(
    '1',
    'Modern Brand Identity',
    'Visual identity system and brand guidelines crafted for next-generation digital products.',
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600',
    'Design'
),
(
    '2',
    'E-commerce Platform',
    'High-conversion e-commerce architecture with seamless payment gateway and responsive catalog.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    'Development'
),
(
    '3',
    'Minimalist Architecture',
    'Contemporary residential architectural drafting and photorealistic environmental rendering.',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    'Architecture'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category;

-- Seed Job Postings
INSERT INTO public.job_postings (id, title, description, company, job_type, location, requirements) VALUES
(
    '1',
    'Remote UI/UX Designer',
    'Annual consult is looking for a creative UI/UX designer to join our remote team for ongoing projects. Submit your CV and portfolio to apply.',
    'Annual consult',
    'Remote',
    'Remote',
    ARRAY['Figma expertise', 'UI/UX prototyping', '3+ years experience', 'Portfolio submission required']
),
(
    '2',
    'Senior Frontend Engineer',
    'Join Annual consult as a Senior Frontend Engineer. Must have 5+ years of experience with React, Tailwind CSS, and scalable web architectures.',
    'Annual consult',
    'Remote',
    'Remote',
    ARRAY['React / Next.js', 'Tailwind CSS', 'TypeScript', 'API Integration']
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    company = EXCLUDED.company,
    job_type = EXCLUDED.job_type,
    requirements = EXCLUDED.requirements;

-- ==============================================================================
-- DONE! All tables, columns, RLS policies, and seed data are now ready.
-- ==============================================================================
