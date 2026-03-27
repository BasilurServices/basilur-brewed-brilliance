import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dhfzmbxiabfwahxvajxz.supabase.co";
const supabaseAnonKey = "sb_publishable_oMH90yKDYZNChp6C6lS71w_LXNR8fk1";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
