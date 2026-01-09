/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
export const CONFIG_PATH = resolve(homedir(), ".auto-scheduler-cli.json");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(
        "Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env",
    );
    process.exit(1);
}

export function getAuthToken() {
    if (process.env.CLI_AUTH_TOKEN) return process.env.CLI_AUTH_TOKEN;
    if (existsSync(CONFIG_PATH)) {
        try {
            const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
            return config.authToken;
        } catch (error) {
            console.error(
                "Error reading auth token:",
                (error as Error).message,
            );
        }
    }
    return null;
}

export function saveAuthToken(token: string) {
    try {
        writeFileSync(
            CONFIG_PATH,
            JSON.stringify({ authToken: token }, null, 2),
        );
        console.log(`✅ Auth token saved`);
    } catch (error) {
        console.error("Error saving token:", (error as Error).message);
        process.exit(1);
    }
}

export function getAuthenticatedClient() {
    const authToken = getAuthToken();
    if (!authToken) throw new Error("Not authenticated");
    return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${authToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
