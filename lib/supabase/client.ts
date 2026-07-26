import { createBrowserClient } from '@supabase/ssr';

export const CURRENT_USER_ID = "619acf86-11a4-459e-acba-d078f721634a";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  return createBrowserClient(url, key);
}
