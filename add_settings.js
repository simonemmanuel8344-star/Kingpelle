const fs = require('fs');

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');
appSrc = appSrc.replace(
  "const [logoUrl, setLogoUrl] = useState<string>('https://i.ibb.co/5gtxJ8Yz/Whats-App-Image-2026-08-30-at-7-01-19-PM.jpg');",
  `const [settings, setSettings] = useState<any>({
    logoUrl: 'https://i.ibb.co/5gtxJ8Yz/Whats-App-Image-2026-08-30-at-7-01-19-PM.jpg',
    heroImageUrl: 'https://i.ibb.co/rK6vrMRy/Whats-App-Image-2026-09-03-at-12-23-22-AM.jpg',
    professionalInviteCode: 'PRO-IDEA-2026',
    heroTitle: '',
    heroSubtitle: '',
    aboutTitle: '',
    aboutText1: '',
    aboutText2: '',
    contactEmail: 'ideacreationhub@gmail.com',
    contactPhone: '+2347068588344'
  });`
);
appSrc = appSrc.replace("const [heroImageUrl, setHeroImageUrl] = useState<string>('https://i.ibb.co/rK6vrMRy/Whats-App-Image-2026-09-03-at-12-23-22-AM.jpg');", "");
appSrc = appSrc.replace("const [professionalInviteCode, setProfessionalInviteCode] = useState<string>('PRO-IDEA-2026');", "");

fs.writeFileSync('src/App.tsx', appSrc);
