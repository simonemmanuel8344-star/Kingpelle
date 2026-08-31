import { Professional, Project, JobPosting } from './types';

export const initialProfessionals: Professional[] = [
  {
    id: '1',
    fullName: 'Sarah Jenkins',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@example.com',
    jobCategory: 'Graphic Designer & Brand Strategist',
    skills: ['Branding', 'UI/UX', 'Illustration', 'Typography', 'Figma', 'Adobe Illustrator'],
    location: 'Lagos & Remote',
    yearsOfExperience: '6+ Years',
    bio: 'Passionate multi-disciplinary visual designer specializing in brand identity, user experience design, and digital typography. With over 6 years crafting tailored visual systems for fast-growing startups and creative agencies, I transform abstract business ideas into iconic brand experiences.',
    portfolioItems: [
      {
        id: 'p1-1',
        title: 'Modern Brand Identity & Packaging',
        description: 'Comprehensive branding guidelines, typography system, and eco-friendly product packaging for a luxury skincare line.',
        imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600',
        category: 'Branding',
        projectUrl: 'https://example.com/brand'
      },
      {
        id: 'p1-2',
        title: 'Fintech Mobile App UI/UX',
        description: 'Clean, user-centric mobile banking interface with interactive prototype flows and accessible design components.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
        category: 'UI/UX Design',
        projectUrl: 'https://example.com/app'
      },
      {
        id: 'p1-3',
        title: 'Editorial Magazine & Type Layout',
        description: 'Minimalist editorial publication layout featuring custom typography treatments and bespoke vector illustrations.',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600',
        category: 'Illustration'
      }
    ]
  },
  {
    id: '2',
    fullName: 'David Chen',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    phone: '+1 (555) 987-6543',
    email: 'david.c@example.com',
    jobCategory: 'Full-Stack Web Developer',
    skills: ['React', 'Node.js', 'Tailwind CSS', 'TypeScript', 'Next.js', 'PostgreSQL', 'Cloud Infrastructure'],
    location: 'Abuja & Remote',
    yearsOfExperience: '8+ Years',
    bio: 'Senior full-stack software engineer with deep expertise in high-performance web applications, scalable API architecture, and frictionless frontend user interfaces. Dedicated to building secure, fast, and accessible digital products.',
    portfolioItems: [
      {
        id: 'p2-1',
        title: 'E-commerce Marketplace Platform',
        description: 'Scalable multi-vendor e-commerce web application with real-time inventory management, payments, and instant analytics dashboard.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
        category: 'Full-Stack Development',
        projectUrl: 'https://example.com/store'
      },
      {
        id: 'p2-2',
        title: 'Real-time Collaboration Cloud Suite',
        description: 'Collaborative document and project task board supporting live WebSocket sync, user permissions, and custom workflows.',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600',
        category: 'Web App'
      },
      {
        id: 'p2-3',
        title: 'Enterprise Analytics Dashboard',
        description: 'Data visualization platform with interactive charting, automated reporting, and real-time revenue metrics.',
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600',
        category: 'Frontend Engineering'
      }
    ]
  },
  {
    id: '3',
    fullName: 'Elena Rodriguez',
    picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    phone: '+1 (555) 456-7890',
    email: 'elena.r@example.com',
    jobCategory: 'Principal Architect & 3D Visualizer',
    skills: ['3D Modeling', 'Interior Design', 'AutoCAD', 'Revit', 'Sustainable Building', 'BIM'],
    location: 'Port Harcourt & Remote',
    yearsOfExperience: '7+ Years',
    bio: 'Lead architectural designer and spatial strategist combining modern aesthetic minimalism with environmental sustainability. Focused on contemporary residential spaces, commercial interiors, and photorealistic 3D structural visualizations.',
    portfolioItems: [
      {
        id: 'p3-1',
        title: 'Minimalist Eco Villa & Living Space',
        description: 'Sustainable residential villa designed with natural ventilation, solar integration, and minimalist natural stone finishes.',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
        category: 'Architecture',
        projectUrl: 'https://example.com/villa'
      },
      {
        id: 'p3-2',
        title: 'Contemporary Corporate Office Interior',
        description: 'Open-concept, ergonomic workspace design with acoustic optimization and modular collaborative pods.',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
        category: 'Interior Design'
      },
      {
        id: 'p3-3',
        title: 'Urban Boutique Cafe Concept',
        description: 'Biophilic cafe and lounge concept incorporating warm wooden textures, industrial accents, and dynamic ambient lighting.',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
        category: 'Commercial Spaces'
      }
    ]
  }
];

export const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Modern Brand Identity',
    imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600',
    category: 'Design'
  },
  {
    id: '2',
    title: 'E-commerce Platform',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    category: 'Development'
  },
  {
    id: '3',
    title: 'Minimalist Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    category: 'Architecture'
  }
];

export const initialJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Remote UI/UX Designer',
    description: 'Annual consult is looking for a creative UI/UX designer to join our remote team for ongoing projects. Submit your CV and portfolio to apply.',
    company: 'Annual consult',
    jobType: 'Remote'
  },
  {
    id: '2',
    title: 'Senior Frontend Engineer',
    description: 'Join Annual consult as a Senior Frontend Engineer. Must have 5+ years of experience with React and Tailwind CSS.',
    company: 'Annual consult',
    jobType: 'Remote'
  }
];
