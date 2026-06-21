# AQ Wellness Portal

A patient portal web application for AQ Wellness (medical weight management clinic run by Dr. Alia Qaiser). Built with plain HTML/CSS/JavaScript and Supabase (Auth, Database, Storage, Edge Functions). No frameworks.

## Project structure

```
aq-wellness-portal/
├── index.html                 Landing page — Patient Login / Doctor Login
├── client-dashboard.html      Patient dashboard
├── admin-dashboard.html       Doctor (admin) dashboard
├── vercel.json                Vercel static hosting config
├── css/
│   └── style.css              All styling (theme: white/pink/purple)
├── js/
│   ├── supabase-config.js     Supabase URL + anon key + bucket names
│   ├── auth.js                Shared auth/session helpers
│   ├── index.js                Login logic for homepage
│   ├── client-dashboard.js    Patient dashboard logic
│   └── admin-dashboard.js     Doctor dashboard logic
└── supabase/
    ├── functions/
    │   └── create-patient/    Edge Function: creates patient auth accounts
    │       └── index.ts
    └── sql/
        └── schema.sql         Full schema reference (tables, RLS, triggers, storage)
```

## Supabase project

This app is wired to the **dralia** Supabase project (already created and configured):

- Project URL: `https://hsmpapwkguzzwgrjvtsg.supabase.co`
- All 7 tables, RLS policies, auto-notification triggers, and 3 storage buckets (`progress-photos`, `attachments`, `avatars`) are already live.
- One doctor account already exists: `draliaqaiser@gmail.com` (role: doctor).
- The `create-patient` Edge Function is already deployed.

If you ever need to rebuild this on a **fresh** Supabase project, run `supabase/sql/schema.sql` in the SQL Editor, then deploy the Edge Function in `supabase/functions/create-patient/`, then update the URL/key in `js/supabase-config.js`.

### Why an Edge Function for patient creation?

Creating a Supabase Auth user (`auth.admin.createUser`) requires the **service role key**, which must never be exposed in client-side code. The `create-patient` Edge Function holds that key server-side, verifies the caller is the logged-in doctor, then creates the patient's auth account + profile + patient record in one atomic step. This is how "doctor creates all patient accounts manually, no public signup" is enforced securely.

## How authentication & roles work

- `profiles.role` is either `'doctor'` or `'patient'`.
- On login, the app checks `profiles.role` and redirects:
  - `doctor` → `admin-dashboard.html`
  - `patient` → `client-dashboard.html`
- If a patient tries the Doctor Login form (or vice versa), they're signed back out and shown an error — no cross-portal access.
- All actual data access is enforced by **Row Level Security**, not just the frontend redirect. A patient's JWT can only ever see/edit their own rows; a doctor's JWT (checked via the `is_doctor()` SQL function) can access everything.

## Deploying to GitHub + Vercel

1. **Push to GitHub**
   ```bash
   cd aq-wellness-portal
   git init
   git add .
   git commit -m "Initial commit: AQ Wellness Portal"
   git branch -M main
   git remote add origin https://github.com/<your-username>/aq-wellness-portal.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project → Import the GitHub repo.
   - Framework Preset: **Other** (static site, no build step needed).
   - Root Directory: leave as `/` (the repo root).
   - Build Command: leave empty.
   - Output Directory: leave empty (defaults to root).
   - Click **Deploy**.
   - Vercel will serve `index.html`, `client-dashboard.html`, `admin-dashboard.html` directly, since this is a static multi-page site.

3. **No environment variables needed** — the Supabase URL and anon/publishable key are safe to keep in `js/supabase-config.js` since access control is enforced entirely by RLS on the backend, not by hiding these values.

## Adding the first/only doctor account (already done for dralia)

The doctor account is created once, manually, via the Supabase Dashboard:
1. Supabase Dashboard → Authentication → Users → **Add user** → enter email + password, confirm email automatically.
2. Copy the new user's UUID.
3. In the SQL Editor:
   ```sql
   insert into public.profiles (id, role, full_name, email)
   values ('<uuid-from-step-2>', 'doctor', 'Dr. Alia Qaiser', 'draliaqaiser@gmail.com');
   ```
This has already been done for the live `dralia` project — Dr. Alia Qaiser can log in immediately with her existing credentials.

## Adding patients

Patients are **never** self-registered. The doctor adds them from **Admin Dashboard → Patients → + Add New Patient**, filling in their name, email, a temporary password, and any intake details. This calls the `create-patient` Edge Function, which creates their Supabase Auth login, profile, and patient record all at once. The doctor then shares the email + temporary password with the patient directly (e.g. in person or via secure message).

## Features recap

**Patient (client-dashboard.html):**
- View profile, upload front/side/back progress photos, view photo history
- View & open assigned forms, mark them completed
- View treatment plans (diet/exercise/physiotherapy/supplement/lifestyle) with attachments
- View doctor's consultation notes (read-only)
- Notification bell with unread count, auto-updates in real time when the doctor adds content (via Supabase Realtime)

**Doctor (admin-dashboard.html):**
- Dashboard with stats (total patients, pending forms, active plans, photos) + recent activity feed
- Search/filter patients by name, email, status
- Add / edit patient profiles
- Open any patient to view their full profile, photos, plans, forms, notes
- Assign forms (title + URL), add/delete treatment plans (with file attachments), add/delete consultation notes
- Notifications are created automatically by database triggers whenever a form/plan/note is added — no extra doctor action needed

## Tech notes

- Pure HTML/CSS/Vanilla JS — no build tooling, no React/Vue/Angular.
- Supabase JS client loaded via CDN (`@supabase/supabase-js@2`).
- File uploads use Supabase Storage with private buckets; the app generates short-lived signed URLs (1 hour) to display/download photos and attachments.
- Realtime subscriptions keep both dashboards live-updating without a page refresh.
