const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \{ data: setts \} = await supabase\.from\('settings'\)\.select\('\*'\)\.eq\('id', 'global'\)\.single\(\);\s*if \(setts\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
`const syncSettings = await fetchGlobalSettings();
        if (syncSettings) {
          if (syncSettings.logoUrl) setLogoUrl(syncSettings.logoUrl);
          if (syncSettings.heroImageUrl) setHeroImageUrl(syncSettings.heroImageUrl);
          if (syncSettings.professionalInviteCode) setProfessionalInviteCode(syncSettings.professionalInviteCode);
        } else {
          const { data: setts } = await supabase.from('settings').select('*').eq('id', 'global').single();
          if (setts) {
            if (setts.logoUrl) setLogoUrl(setts.logoUrl);
            if (setts.heroImageUrl) setHeroImageUrl(setts.heroImageUrl);
            if (setts.professionalInviteCode) setProfessionalInviteCode(setts.professionalInviteCode);
          } else {
            const lUrl = localStorage.getItem('settings_logoUrl');
            const hUrl = localStorage.getItem('settings_heroImageUrl');
            const c = localStorage.getItem('settings_professionalInviteCode');
            if (lUrl !== null) setLogoUrl(lUrl);
            if (hUrl !== null) setHeroImageUrl(hUrl);
            if (c !== null) setProfessionalInviteCode(c);
          }
        }`
);

fs.writeFileSync('src/App.tsx', code);
