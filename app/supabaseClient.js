import { createClient } from '@supabase/supabase-js';

// Pull directly from process.env (requires eas.json env config for builds)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

// Optional: fallback for local dev (Expo Go only)
const fallbackUrl = "https://fwjhfxjfqmmrfpeesoca.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3amhmeGpmcW1tcmZwZWVzb2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA4ODA3NiwiZXhwIjoyMDczNjY0MDc2fQ.UPdu86GPlGOCqAuG1miaAdZA1krzc0AGEhApiewV9gA";

const supabase = createClient(
  SUPABASE_URL || fallbackUrl,
  SUPABASE_ANON_KEY || fallbackKey
);

export default supabase;
