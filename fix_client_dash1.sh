#!/bin/bash
sed -i 's/fetchUserJobApplications, fetchUserNotifications/fetchUserJobApplications, fetchUserNotifications, fetchClientOrders/g' src/components/ClientDashboard.tsx

sed -i 's/const \[applications, setApplications\] = useState<JobApplication\[\]>(\[\]);/const \[applications, setApplications\] = useState<JobApplication\[\]>(\[\]);\n  const \[orders, setOrders\] = useState<any\[\]>(\[\]);/g' src/components/ClientDashboard.tsx
