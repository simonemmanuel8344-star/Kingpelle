import fs from 'fs';

// Fix App.tsx
let appSrc = fs.readFileSync('src/App.tsx', 'utf8');
appSrc = appSrc.replace(
  /import \{ Professional, Project, JobPosting, JobApplication, Rating \} from '\.\/types';/g,
  `import { Professional, Project, JobPosting, JobApplication, Rating, UserProfile } from './types';`
);
fs.writeFileSync('src/App.tsx', appSrc);

// Fix AdminDashboard.tsx
let adminSrc = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
adminSrc = adminSrc.replace(
  /Users, Briefcase, FileCheck,/g,
  `Users, User as UserIcon, Briefcase, FileCheck,`
);
fs.writeFileSync('src/components/AdminDashboard.tsx', adminSrc);

