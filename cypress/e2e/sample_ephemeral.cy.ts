/// <reference types="cypress" />

/* SAMPLE TEST FILE. DO NOT MODIFY, COPY INSTEAD. */

describe("Home page (ephemeral user)", () => {
    // Shared variables for the suite
    let session: {
        access_token: string;
        refresh_token: string;
        expires_at?: number;
    } | undefined;
    let user: { id: string; email: string } | undefined;

    before(() => {
        cy.task("signInEphemeralTestUser").then((result) => {
            const res = result as {
                session: {
                    access_token: string;
                    refresh_token: string;
                    expires_at?: number;
                };
                user: { id: string; email: string };
            };
            session = res.session;
            user = res.user;
        });
    });

    after(() => {
        cy.wait(1000);
        if (user?.id) {
            cy.task("cleanupEphemeralUser", user.id).then((res) => {
                const r = res as { ok?: boolean } | null;
                if (r && r.ok !== true) {
                    // eslint-disable-next-line no-console
                    console.warn("ephemeral cleanup failed", r);
                }
            });
        }
    });

    it("logs in with an ephemeral user and shows the home page", () => {
        // Test uses the session created in before()
        // Inject session and assert UI
        cy.visit("/", {
            onBeforeLoad(win) {
                if (!session) throw new Error("session missing in before hook");
                win.localStorage.setItem(
                    "supabase.auth.token",
                    JSON.stringify(session),
                );
                win.localStorage.setItem(
                    "supabase.session",
                    JSON.stringify(session),
                );
                const supabaseUrl = Cypress.env("VITE_SUPABASE_URL") || "";
                try {
                    if (supabaseUrl) {
                        const u = new URL(supabaseUrl);
                        const projectRef = u.host.split(".")[0];
                        const key = `sb-${projectRef}-auth-token`;
                        win.localStorage.setItem(key, JSON.stringify(session));
                    }
                } catch (_e) {
                    // ignore
                }
            },
        });

        // Assert we see the authenticated UI
        cy.contains("Today", { timeout: 20000 }).should("be.visible");

        // Open user menu and assert
        if (!user) throw new Error("user missing in before hook");
        cy.get('[data-testid="user-menu-trigger"]').trigger("pointerdown")
            .click();
        cy.contains(user.email).should("be.visible");
        cy.get("body").type("{esc}");
    });
});
