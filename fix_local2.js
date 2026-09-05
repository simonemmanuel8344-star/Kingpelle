import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the false check for empty string
content = content.replace(
  /if \(lUrl\) setLogoUrl\(lUrl\);\s*if \(hUrl\) setHeroImageUrl\(hUrl\);\s*if \(c\) setProfessionalInviteCode\(c\);/g,
  `if (lUrl !== null) setLogoUrl(lUrl);
          if (hUrl !== null) setHeroImageUrl(hUrl);
          if (c !== null) setProfessionalInviteCode(c);`
);

fs.writeFileSync('src/App.tsx', content);
