import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 

// Add a function to set the Clerk JWT for RLS
export async function setSupabaseAuthToken(token: string | null) {
  if (token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token, // Since Clerk handles refresh, we can use the same token
    });
    if (error) {
      console.error('Error setting Supabase session:', error);
    }
    return data;
  } else {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out of Supabase:', error);
    }
  }
} 