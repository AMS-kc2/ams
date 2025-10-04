import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Database } from "../types/database";

dotenv.config();

// Create a single supabase client for interacting with your database
const db = createClient<Database>(
	process.env.SUPABASE_URL || "",
	process.env.SUPABASE_ANON_KEY || "",
);

export default db;
