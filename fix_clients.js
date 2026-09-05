import fs from 'fs';

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add clients state
appSrc = appSrc.replace(
  /const \[professionals, setProfessionals\] = useState<Professional\[\]>\(\[\]\);/g,
  `const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);`
);

// 2. Fetch clients
const fetchClientsCode = `
        const profsRaw = await fetchSupabaseData('professionals');`;
const fetchClientsReplacement = `
        const clientsRaw = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false });
        if (clientsRaw.data) {
          const cls = clientsRaw.data.map((c: any) => ({
            ...c,
            fullName: c.full_name || c.fullName,
            createdAt: c.created_at || c.createdAt
          }));
          setClients(cls);
        }

        const profsRaw = await fetchSupabaseData('professionals');`;

appSrc = appSrc.replace(fetchClientsCode, fetchClientsReplacement);

// 3. Add onDeleteClient
appSrc = appSrc.replace(
  /const handleDeleteProfessional = async \(id: string\) => \{/g,
  `const handleDeleteClient = async (id: string) => {
    try {
      await supabase.from('profiles').delete().eq('id', id);
      setClients(prev => prev.filter(c => c.id !== id));
      showToast("Client deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete client", "error");
    }
  };

  const handleDeleteProfessional = async (id: string) => {`
);

// 4. Pass clients to AdminDashboard
appSrc = appSrc.replace(
  /<AdminDashboard\s+professionals=\{professionals\}/g,
  `<AdminDashboard
          clients={clients}
          onDeleteClient={handleDeleteClient}
          professionals={professionals}`
);

fs.writeFileSync('src/App.tsx', appSrc);
