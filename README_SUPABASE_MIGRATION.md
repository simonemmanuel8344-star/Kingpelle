# Supabase Migration Strategy

## Step 1: Database Provisioning (User Action Required)
Because I do not have direct SQL execution access to your Supabase instance (only the public REST API anon key), I have generated the complete schema for you. 
1. Open your Supabase Dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the contents of `/supabase-schema.sql` and run it.
4. This will create all required tables, configure Row Level Security (RLS) policies, and set up your Storage Buckets.

## Step 2: Component Refactoring (Agent Action)
Once you confirm the tables are created, I will proceed to replace Firebase across the codebase:
- `App.tsx`: Replace `onSnapshot` with `supabase.channel()`
- `AdminDashboard.tsx`: Replace `setDoc`/`updateDoc` with `supabase.from().upsert()`
- `AuthModal.tsx`: Replace Firebase Auth with Supabase Auth
- `ProfessionalDashboard.tsx` & `ClientDashboard.tsx`: Update user data fetching.

## Step 3: Deprecating Firebase
Once Supabase is fully wired and tested, we will remove `firebase` from `package.json` and delete `src/lib/firebase.ts`.
