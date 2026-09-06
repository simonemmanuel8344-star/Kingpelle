const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleUpdateLogo = async \(url: string\) => {[\s\S]*?};/,
`const handleUpdateLogo = async (url: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', logoUrl: url });
    } catch (e) {}
    setLogoUrl(url);
    localStorage.setItem('settings_logoUrl', url);
    await saveGlobalSettings({ logoUrl: url, heroImageUrl, professionalInviteCode });
  };`
);

code = code.replace(
  /const handleUpdateHeroImage = async \(url: string\) => {[\s\S]*?};/,
`const handleUpdateHeroImage = async (url: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', heroImageUrl: url });
    } catch (e) {}
    setHeroImageUrl(url);
    localStorage.setItem('settings_heroImageUrl', url);
    await saveGlobalSettings({ logoUrl, heroImageUrl: url, professionalInviteCode });
  };`
);

code = code.replace(
  /const handleUpdateInviteCode = async \(code: string\) => {[\s\S]*?};/,
`const handleUpdateInviteCode = async (code: string) => {
    try {
      await supabase.from('settings').upsert({ id: 'global', professionalInviteCode: code });
    } catch (e) {}
    setProfessionalInviteCode(code);
    localStorage.setItem('settings_professionalInviteCode', code);
    await saveGlobalSettings({ logoUrl, heroImageUrl, professionalInviteCode: code });
  };`
);

fs.writeFileSync('src/App.tsx', code);
