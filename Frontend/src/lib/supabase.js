import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default  supabase;