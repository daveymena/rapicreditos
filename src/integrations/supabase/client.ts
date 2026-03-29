import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qsbkwtircttiJnjaxcmz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYmt3dGlyY3R0aWpuamF4Y216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDU0NzIsImV4cCI6MjA5MDI4MTQ3Mn0.gRjd5knvqcaoUzu4jOJw7Za5sk3GE__ga1rkPI2VVpQ';

// Cliente tipado para tablas del schema principal
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Cliente sin tipos estrictos para tablas adicionales (whatsapp_sessions, messages, etc.)
export const supabaseAny = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});