import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace handleUpdateLogo
content = content.replace(
  /const handleUpdateLogo = async \([^)]+\) => \{[\s\S]*?showToast\("Failed to update logo", "error"\);\s*\}\s*\};/,
  `const handleUpdateLogo = async (url: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', logoUrl: url });
      setLogoUrl(url);
      localStorage.setItem('settings_logoUrl', url);
    } catch (err) {
      setLogoUrl(url);
      localStorage.setItem('settings_logoUrl', url);
    }
  };`
);

// Replace handleUpdateHeroImage
content = content.replace(
  /const handleUpdateHeroImage = async \([^)]+\) => \{[\s\S]*?showToast\("Failed to update hero image", "error"\);\s*\}\s*\};/,
  `const handleUpdateHeroImage = async (url: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', heroImageUrl: url });
      setHeroImageUrl(url);
      localStorage.setItem('settings_heroImageUrl', url);
    } catch (err) {
      setHeroImageUrl(url);
      localStorage.setItem('settings_heroImageUrl', url);
    }
  };`
);

// Replace handleUpdateInviteCode
content = content.replace(
  /const handleUpdateInviteCode = async \([^)]+\) => \{[\s\S]*?showToast\("Failed to update verification code", "error"\);\s*\}\s*\};/,
  `const handleUpdateInviteCode = async (code: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', professionalInviteCode: code });
      setProfessionalInviteCode(code);
      localStorage.setItem('settings_professionalInviteCode', code);
    } catch (err) {
      setProfessionalInviteCode(code);
      localStorage.setItem('settings_professionalInviteCode', code);
    }
  };`
);

// Fix fetchData
content = content.replace(
  /if \(setts\) \{[\s\S]*?setProfessionalInviteCode\(setts\.professionalInviteCode\);\s*\}/,
  `if (setts) {
          if (setts.logoUrl) setLogoUrl(setts.logoUrl);
          if (setts.heroImageUrl) setHeroImageUrl(setts.heroImageUrl);
          if (setts.professionalInviteCode) setProfessionalInviteCode(setts.professionalInviteCode);
        } else {
          const lUrl = localStorage.getItem('settings_logoUrl');
          const hUrl = localStorage.getItem('settings_heroImageUrl');
          const c = localStorage.getItem('settings_professionalInviteCode');
          if (lUrl) setLogoUrl(lUrl);
          if (hUrl) setHeroImageUrl(hUrl);
          if (c) setProfessionalInviteCode(c);
        }`
);
content = content.replace(
  /\} catch \(err\) \{/,
  `} catch (err) {
        const lUrl = localStorage.getItem('settings_logoUrl');
        const hUrl = localStorage.getItem('settings_heroImageUrl');
        const c = localStorage.getItem('settings_professionalInviteCode');
        if (lUrl) setLogoUrl(lUrl);
        if (hUrl) setHeroImageUrl(hUrl);
        if (c) setProfessionalInviteCode(c);`
);

fs.writeFileSync('src/App.tsx', content);
