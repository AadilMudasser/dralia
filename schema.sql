// ============================================================
// AQ Wellness Portal — Supabase Configuration
// ============================================================
// Project: dralia
// These are PUBLIC keys (anon / publishable) — safe to expose
// in client-side code. All real access control is enforced by
// Row Level Security (RLS) policies in the database.
// ============================================================

const SUPABASE_URL = "https://hsmpapwkguzzwgrjvtsg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbXBhcHdrZ3V6endncmp2dHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTAzMzksImV4cCI6MjA5NzYyNjMzOX0.vaXh-EOvQ9ogx8vvNsJwygu3wF9yVp1yFEJN5Dm4T8I";

// Single shared client instance, used by every page.
// `supabase` here refers to the global UMD build loaded via the
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> tag.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Storage bucket names (must match buckets created in Supabase)
const BUCKETS = {
  PROGRESS_PHOTOS: "progress-photos",
  ATTACHMENTS: "attachments",
  AVATARS: "avatars"
};
