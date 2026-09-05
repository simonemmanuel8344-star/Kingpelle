import fs from 'fs';

// Fix App.tsx import
let appSrc = fs.readFileSync('src/App.tsx', 'utf8');
appSrc = appSrc.replace(
  /import \{ Professional, Project, JobPosting, JobApplication, Rating, ChatSession, ChatMessage \} from '\.\/types';/g,
  `import { Professional, Project, JobPosting, JobApplication, Rating, ChatSession, ChatMessage, UserProfile } from './types';`
);
fs.writeFileSync('src/App.tsx', appSrc);

// Fix AdminDashboard.tsx import
let adminSrc = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
adminSrc = adminSrc.replace(
  /import \{ (.*?)Users(.*?) \} from 'lucide-react';/g,
  `import { $1Users, User as UserIcon$2 } from 'lucide-react';`
);
fs.writeFileSync('src/components/AdminDashboard.tsx', adminSrc);

