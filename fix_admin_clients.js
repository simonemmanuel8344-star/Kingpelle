import fs from 'fs';

let adminSrc = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add props
adminSrc = adminSrc.replace(
  /professionals: Professional\[\];/g,
  `clients?: any[];\n  onDeleteClient?: (id: string) => Promise<void>;\n  professionals: Professional[];`
);

// 2. Add icon import if needed. Let's just use Users. 
// We can use UserCircle or Users. Let's use UserIcon if available.
// It imports `Users` already. We can just use `Users` for clients and `Briefcase` for professionals maybe?
// Actually, it has `Users` for professionals. Let's use `UserIcon` for clients.
adminSrc = adminSrc.replace(
  /import { LayoutDashboard, Users, /g,
  `import { LayoutDashboard, Users, User as UserIcon, `
);

// 3. Add to tabs
adminSrc = adminSrc.replace(
  /\{ id: 'professionals', icon: <Users className="w-5 h-5" \/>, label: 'Professionals' \},/g,
  `{ id: 'professionals', icon: <Users className="w-5 h-5" />, label: 'Professionals' },
            { id: 'clients', icon: <UserIcon className="w-5 h-5" />, label: 'Clients' },`
);

// 4. Update handleDelete
adminSrc = adminSrc.replace(
  /if \(type === 'professional'\) await props\.onDeleteProfessional\(id\);/g,
  `if (type === 'professional') await props.onDeleteProfessional(id);
      if (type === 'client' && props.onDeleteClient) await props.onDeleteClient(id);`
);

// 5. Add rendering for clients
const clientsRender = `
                    {activeTab === 'clients' && props.clients?.map(c => (
                      <tr key={c.id} className="hover:bg-white/60 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100/80 flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-500" /></div>
                          <div>
                            <p className="font-bold text-gray-900">{c.fullName}</p>
                            <p className="text-xs text-indigo-600">Client</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.email || 'No email provided'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete('client', c.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {activeTab === 'professionals'`;

adminSrc = adminSrc.replace(/\{activeTab === 'professionals'/g, clientsRender);

// 6. Update Dashboard Stats Overview to include Clients
adminSrc = adminSrc.replace(
  /label: 'Professionals', value: props\.professionals\.length/g,
  `label: 'Professionals', value: props.professionals.length`
);
adminSrc = adminSrc.replace(
  /\{ label: 'Live Projects', value: props\.projects\.length/g,
  `{ label: 'Clients', value: props.clients?.length || 0, icon: <UserIcon className="w-8 h-8 text-cyan-400" />, color: 'from-cyan-500/20 to-cyan-500/0', border: 'border-cyan-500/20' },
                  { label: 'Live Projects', value: props.projects.length`
);
// Make it a 5-column grid or just keep 4 and drop something, but grid-cols-4 can become grid-cols-5 if we just add one.
// Let's replace grid-cols-4 with grid-cols-5.
adminSrc = adminSrc.replace(/lg:grid-cols-4/g, "lg:grid-cols-5");

fs.writeFileSync('src/components/AdminDashboard.tsx', adminSrc);
