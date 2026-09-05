import fs from 'fs';

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
        const profsRaw = await fetchSupabaseData('professionals');
        const profs = profsRaw.map((p: any) => ({
          ...p,
          fullName: p.full_name || p.fullName,
          jobCategory: p.job_category || p.jobCategory,
          yearsOfExperience: p.years_of_experience || p.yearsOfExperience
        }));
        setProfessionals(profs.length > 0 ? profs : initialProfessionals);

        const rts = await fetchSupabaseData('ratings');
        setRatings(rts);

        const prjsRaw = await fetchSupabaseData('projects');
        const prjs = prjsRaw.map((p: any) => ({
          ...p,
          imageUrl: p.image_url || p.imageUrl,
          projectUrl: p.project_url || p.projectUrl
        }));
        setProjects(prjs.length > 0 ? prjs : initialProjects);

        const jbsRaw = await fetchSupabaseData('job_postings');
        const jbs = jbsRaw.map((j: any) => ({
          ...j,
          jobType: j.job_type || j.jobType,
          logoUrl: j.logo_url || j.logoUrl
        }));
        setJobs(jbs.length > 0 ? jbs : initialJobs);
`;

appSrc = appSrc.replace(
  /const profs = await fetchSupabaseData\('professionals'\);\s*setProfessionals\(profs\.length > 0 \? profs : initialProfessionals\);\s*const rts = await fetchSupabaseData\('ratings'\);\s*setRatings\(rts\);\s*const prjs = await fetchSupabaseData\('projects'\);\s*setProjects\(prjs\.length > 0 \? prjs : initialProjects\);\s*const jbs = await fetchSupabaseData\('job_postings'\);\s*setJobs\(jbs\.length > 0 \? jbs : initialJobs\);/g,
  replacement
);

fs.writeFileSync('src/App.tsx', appSrc);
