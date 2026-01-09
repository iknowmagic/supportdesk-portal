/// <reference types="cypress" />

interface SetupTestUserResult {
    session: { expires_at: number } & Record<string, unknown>;
    user: { email: string } & Record<string, unknown>;
}

describe("Home page (authenticated)", () => {
    it("shows the calendar home after the user is signed in", () => {
        // Ask the Node task to ensure the canonical TEST_USER exists and return session
        cy.task("setupTestUser").then((result) => {
            const { session, user } = result as SetupTestUserResult;
            // Inject Supabase session into localStorage before the app loads so the client picks it up
            cy.visit("/", {
                onBeforeLoad(win) {
                    // Try multiple storage shapes that Supabase client may read on init.
                    // 1) Backwards-compatible: store session object directly
                    win.localStorage.setItem(
                        "supabase.auth.token",
                        JSON.stringify(session),
                    );

                    // 2) Newer format used by some SDKs: wrap in a `currentSession` field
                    const wrapped = {
                        currentSession: session,
                        expiresAt: session.expires_at,
                    };
                    win.localStorage.setItem(
                        "supabase.auth.token",
                        JSON.stringify(wrapped),
                    );

                    // 3) Also set a generic persisted session key just in case
                    win.localStorage.setItem(
                        "supabase.session",
                        JSON.stringify(session),
                    );

                    // 4) If Cypress exposes the Supabase URL, derive the sb-<project>-auth-token key and set it
                    const supabaseUrl = Cypress.env("VITE_SUPABASE_URL") || "";
                    try {
                        if (supabaseUrl) {
                            const u = new URL(supabaseUrl);
                            const projectRef = u.host.split(".")[0]; // e.g., abc123
                            const key = `sb-${projectRef}-auth-token`;
                            win.localStorage.setItem(
                                key,
                                JSON.stringify(session),
                            );
                        }
                    } catch (_e) {
                        // ignore - if parsing fails, we still set the other keys above
                    }
                },
            });

            // (Simplified) We inject auth before the app loads and let it bootstrap naturally.
            // No explicit setSession/reload — keep the test minimal and robust.

            // The calendar header has a "Today" button — assert it appears
            cy.contains("Today", { timeout: 20000 }).should("be.visible");

            // Open the user menu and assert the user's email is visible
            cy.get('[data-testid="user-menu-trigger"]').trigger("pointerdown")
                .click();
            cy.contains(user.email).should("be.visible");

            // Close the menu via Escape instead of clicking the body (avoids pointer-events issues)
            cy.get("body").type("{esc}");
        });
    });
});
