import fs from 'fs';

let authSrc = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

// The original file was heavily modified by our previous step. Let's just append the profiles insert block correctly.
// Right after:
// const now = new Date().toISOString();
// try {

const replacement = `const now = new Date().toISOString();
        try {
          const profilePayload = {
            id: authData.user.id,
            email,
            full_name: fullName,
            role: accountType,
            phone: phone || null,
            created_at: now
          };
          const { error: profileError } = await supabase.from('profiles').upsert([profilePayload]);
          if (profileError) console.warn("Notice: profile record insert skipped:", profileError);`;

authSrc = authSrc.replace(/const now = new Date\(\)\.toISOString\(\);\s*try \{/g, replacement);

fs.writeFileSync('src/components/AuthModal.tsx', authSrc);
