import fs from 'fs';

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');

appSrc = appSrc.replace(
  /await insertSupabaseData\('professionals', \{ \.\.\.prof, created_at: new Date\(\)\.toISOString\(\) \}\);/g,
  `const { fullName, jobCategory, yearsOfExperience, portfolioItems, ...rest } = prof;
      await insertSupabaseData('professionals', { ...rest, full_name: fullName, job_category: jobCategory, years_of_experience: yearsOfExperience, created_at: new Date().toISOString() });`
);

appSrc = appSrc.replace(
  /await updateSupabaseData\('professionals', id, prof\);/g,
  `const { fullName, jobCategory, yearsOfExperience, portfolioItems, ...rest } = prof;
      await updateSupabaseData('professionals', id, { ...rest, full_name: fullName, job_category: jobCategory, years_of_experience: yearsOfExperience });`
);

appSrc = appSrc.replace(
  /await insertSupabaseData\('projects', \{ \.\.\.project, created_at: new Date\(\)\.toISOString\(\) \}\);/g,
  `const { imageUrl, projectUrl, ...rest } = project;
      await insertSupabaseData('projects', { ...rest, image_url: imageUrl, project_url: projectUrl, created_at: new Date().toISOString() });`
);

appSrc = appSrc.replace(
  /await updateSupabaseData\('projects', id, project\);/g,
  `const { imageUrl, projectUrl, ...rest } = project;
      await updateSupabaseData('projects', id, { ...rest, image_url: imageUrl, project_url: projectUrl });`
);

appSrc = appSrc.replace(
  /await insertSupabaseData\('job_postings', \{ \.\.\.job, created_at: new Date\(\)\.toISOString\(\) \}\);/g,
  `const { jobType, logoUrl, ...rest } = job;
      await insertSupabaseData('job_postings', { ...rest, job_type: jobType, logo_url: logoUrl, created_at: new Date().toISOString() });`
);

appSrc = appSrc.replace(
  /await updateSupabaseData\('job_postings', id, job\);/g,
  `const { jobType, logoUrl, ...rest } = job;
      await updateSupabaseData('job_postings', id, { ...rest, job_type: jobType, logo_url: logoUrl });`
);

fs.writeFileSync('src/App.tsx', appSrc);
