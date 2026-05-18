import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Cliente para el cliente/frontend (limitado por RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con permisos admin (usar SOLO en API routes)
export const getServiceSupabase = () => {
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
    return createClient(supabaseUrl, supabaseServiceRole, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
