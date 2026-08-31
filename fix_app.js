const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { Navbar } from './components/Navbar';",
  "import { Navbar } from './components/Navbar';\nimport { AuthModal } from './components/AuthModal';\nimport { ClientDashboard } from './components/ClientDashboard';\nimport { Chat } from './components/Chat';"
);

// Add state variables
code = code.replace(
  "const [view, setView] = useState<'home' | 'admin'>('home');",
  "const [view, setView] = useState<'home' | 'admin' | 'client'>('home');\n  const [showAuthModal, setShowAuthModal] = useState(false);\n  const [currentUser, setCurrentUser] = useState<any>(null);\n  const [activeChatProf, setActiveChatProf] = useState<Professional | null>(null);"
);

// Add auth listener to useEffect
code = code.replace(
  "const unsubApps = auth.onAuthStateChanged((user) => {",
  "const unsubAuth = auth.onAuthStateChanged((user) => {\n      setCurrentUser(user);\n      if (user && user.email === 'simonemmanuel8344@gmail.com') {\n        const appsQuery = query(collection(db, 'applications'), orderBy('appliedAt', 'desc'));\n        const unsubscribe = onSnapshot(appsQuery, (snapshot) => {\n          setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication)));\n        });\n        return () => unsubscribe();\n      }\n    });"
);

// We need to carefully replace the inner content of onAuthStateChanged since we changed it.
// Actually, let's just use string replacement carefully.
