/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import inquirer from "inquirer";
import { saveAuthToken, SUPABASE_ANON_KEY, SUPABASE_URL } from "./auth";

export async function login() {
    const { email } = await inquirer.prompt([{
        type: "input",
        name: "email",
        message: "Enter your email:",
        validate: (input) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Invalid email format",
    }]);

    console.log(`Sending code to ${email}...`);
    const tempSupabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await tempSupabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
    });

    if (error) {
        console.error(`❌ Failed: ${error.message}`);
        process.exit(1);
    }

    console.log("✅ Code sent! Check your email.");

    const { code } = await inquirer.prompt([{
        type: "input",
        name: "code",
        message: "Enter the 6-digit code:",
        validate: (input) => /^\d{6}$/.test(input) || "Code must be 6 digits",
    }]);

    const { error: verifyError, data } = await tempSupabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
    });

    if (verifyError || !data.session) {
        console.error(
            `❌ Verification failed: ${verifyError?.message || "No session"}`,
        );
        process.exit(1);
    }

    saveAuthToken(data.session.access_token);
    console.log("✅ Successfully logged in!\n");
}
