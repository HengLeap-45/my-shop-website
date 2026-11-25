import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() || '';
export const stripeCheckoutEndpoint = import.meta.env.VITE_STRIPE_CHECKOUT_ENDPOINT?.trim() || '';
export const isStripeConfigured = Boolean(stripePublishableKey && stripeCheckoutEndpoint);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
