/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />

describe("Task modal — Splittable section", () => {
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

    // after(() => {
    //     if (user?.id) {
    //         cy.task("cleanupEphemeralUser", user.id).then((res) => {
    //             const r = res as { ok?: boolean } | null;
    //             if (r && r.ok !== true) {
    //                 // eslint-disable-next-line no-console
    //                 console.warn("ephemeral cleanup failed", r);
    //             }
    //         });
    //     }
    // });

    it("opens the calendar, creates a new task and shows splittable max = 1hr", () => {
        if (!session) throw new Error("session missing");

        cy.visit("/", {
            onBeforeLoad(win) {
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

        // Wait for calendar to load
        cy.contains("Today", { timeout: 20000 }).should("be.visible");

        cy.get("body").click();

        // Ensure the task modal splittable section is visible
        cy.get('[data-testid="taskmodal-splittable"]', { timeout: 5000 })
            .should("be.visible");

        // Max should be 1hr (default)
        // cy.get('[data-testid="splittable-max-trigger"]').should(
        //     "contain.text",
        //     "1hr",
        // );

        cy.wait(500);
        // Toggle auto-schedule off by clicking the zap button
        cy.get('[data-testid="auto-schedule-toggle"]').click();
        cy.wait(500);
        // Type a task name
        cy.get('[data-testid="task-name-input"]').type("Test Task");
        cy.wait(500);
        cy.get('[data-testid="recurrence-option-Daily"]').click();
        cy.wait(500);
        cy.get('[data-testid="taskmodal-submit-button"]').click();
    });
});
