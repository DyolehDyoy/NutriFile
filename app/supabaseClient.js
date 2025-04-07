import { createClient } from '@supabase/supabase-js';

// Pull directly from process.env (requires eas.json env config for builds)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

// Optional: fallback for local dev (Expo Go only)
const fallbackUrl = "https://tcwtonocjgkxllnkunjv.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3Rvbm9jamdreGxsbmt1bmp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTM0MzMyMiwiZXhwIjoyMDU0OTE5MzIyfQ.izLrDwNivqj-9_qMxL6Yov1hYMMx7hYlPc6-B1gMtMs";

const supabase = createClient(
  SUPABASE_URL || fallbackUrl,
  SUPABASE_ANON_KEY || fallbackKey
);

export default supabase;
