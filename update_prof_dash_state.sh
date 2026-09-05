#!/bin/bash
sed -i 's/const \[chats, setChats\] = useState<ChatSession\[\]>(\[\]);/const \[chats, setChats\] = useState<ChatSession\[\]>(\[\]);\n  const \[orders, setOrders\] = useState<any\[\]>(\[\]);/g' src/components/ProfessionalDashboard.tsx
