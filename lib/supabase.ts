import { createClient } from "@supabase/supabase-js";

// Extract Supabase URL from database URL
// Format: postgresql://postgres.<project-ref>:password@host:port/database
function getSupabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL || "";
  const match = dbUrl.match(/postgres\.([^:]+):/);
  if (match) {
    return `https://${match[1]}.supabase.co`;
  }
  // Fallback to env var
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

const supabaseUrl = getSupabaseUrl();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

// Only create client if we have credentials
export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const STORAGE_BUCKET = "documents";
