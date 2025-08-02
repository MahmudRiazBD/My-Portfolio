import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These environment variables are not available in the browser.
// They are only available in the server-side environment.
// For client-side code (in frontend/admin), we'll need to use Vite's env variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and Service Key must be defined in .env file for the API");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
