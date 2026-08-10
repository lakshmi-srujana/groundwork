import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient stores the session in cookies so Next.js middleware can read it
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
