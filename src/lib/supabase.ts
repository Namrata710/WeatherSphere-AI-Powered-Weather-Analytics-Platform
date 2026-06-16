import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSessionId(): string {
  let id = localStorage.getItem('weather_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('weather_session_id', id);
  }
  return id;
}
