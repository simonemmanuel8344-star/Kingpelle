import fs from 'fs';

let adminSrc = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

adminSrc = adminSrc.replace(
  /<button\s+onClick=\{\(\) => openModal\(activeTab\.slice\(0, -1\) as any\)\}\s+className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600\/20"\s*>\s*<Plus className="w-5 h-5" \/> Add New \{activeTab\.slice\(0, -1\)\}\s*<\/button>/,
  `{activeTab !== 'clients' && (
                  <button 
                    onClick={() => openModal(activeTab.slice(0, -1) as any)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <Plus className="w-5 h-5" /> Add New {activeTab.slice(0, -1)}
                  </button>
                )}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', adminSrc);
