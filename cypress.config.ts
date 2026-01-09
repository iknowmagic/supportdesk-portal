/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from "cypress";

// Expose helper task to sign in / ensure test user exists
import { setupTestUser, signInEphemeralTestUser } from "./tests/helpers/auth";

export default defineConfig({
  e2e: {
    // Base URL for the running app used by tests
    baseUrl: "http://localhost:3000", // Pass Supabase URL through to tests so they can derive project ref for storage key
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // Keep a map of ephemeral user cleanup functions so tests can request removal later
      const ephemeralCleanups = new Map<string, () => Promise<void>>();

      on("task", {
        async setupTestUser() {
          // Ensure the canonical TEST_USER exists and return its session
          const data = await setupTestUser();
          return { user: data.user, session: data.session };
        },
        async signInEphemeralTestUser() {
          // Create a short-lived test user and store its cleanup function
          const data = await signInEphemeralTestUser();
          if (data && data.user && typeof data.user.id === "string") {
            ephemeralCleanups.set(data.user.id, data.cleanup);
          }
          return { user: data.user, session: data.session };
        },
        async cleanupEphemeralUser(userId: string) {
          const cleanup = ephemeralCleanups.get(userId);
          if (!cleanup) {
            return { ok: false, reason: "no cleanup found for user" };
          }
          try {
            await cleanup();
            ephemeralCleanups.delete(userId);
            return { ok: true };
          } catch (err) {
            return { ok: false, reason: String(err) };
          }
        },
      });
    },
  },
});
