import { createClient } from '@supabase/supabase-js';

// Pull directly from process.env (requires eas.json env config for builds)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

// Optional: fallback for local dev (Expo Go only)
const fallbackUrl = "https://tcwtonocjgkxllnkunjv.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const supabase = createClient(
  SUPABASE_URL || fallbackUrl,
  SUPABASE_ANON_KEY || fallbackKey
);

export default supabase;
