import fs from 'fs';

// 1. Fix AuthModal.tsx to only use valid snake_case keys for DB insert
let authSrc = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

// The code currently has fullName: fullName, jobCategory: jobCategory, etc in profPayload
authSrc = authSrc.replace(/fullName: fullName,/g, "");
authSrc = authSrc.replace(/jobCategory: jobCategory \|\| 'Creative Specialist',/g, "");
authSrc = authSrc.replace(/yearsOfExperience: '3\+ Years',/g, "");
authSrc = authSrc.replace(/jobCategory: jobCategory \|\| null,/g, "");

// We'll also remove the users table insert completely since it doesn't exist and we don't need it failing
authSrc = authSrc.replace(/const userPayload = \{[\s\S]*?if \(userInsertError\) console\.warn\("Notice: user record insert skipped \(might be handled by trigger\):", userInsertError\);/g, "");

fs.writeFileSync('src/components/AuthModal.tsx', authSrc);
