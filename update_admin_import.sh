#!/bin/bash
sed -i 's/import { AdminSettings } from '"'"'.\/AdminSettings'"'"';/import { AdminSettings } from '"'"'.\/AdminSettings'"'"';\nimport { AdminEscrowDashboard } from '"'"'.\/escrow\/AdminEscrowDashboard'"'"';/g' src/components/AdminDashboard.tsx
sed -i 's/Settings, LogOut, CheckCircle2/Settings, LogOut, CheckCircle2, ShieldCheck/g' src/components/AdminDashboard.tsx
