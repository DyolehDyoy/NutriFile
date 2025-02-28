import { createClient } from '@supabase/supabase-js';


// Supabase Project Credentials
const SUPABASE_URL = "https://tcwtonocjgkxllnkunjv.supabase.co";  // ✅ Supabase Project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3Rvbm9jamdreGxsbmt1bmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNDMzMjIsImV4cCI6MjA1NDkxOTMyMn0.eaPDALto5IP7cYKBJAXCgGKmfz-5D75xz9mnwJP7Dys";  // ✅ Safe for public use

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 
  
  export default supabase;
