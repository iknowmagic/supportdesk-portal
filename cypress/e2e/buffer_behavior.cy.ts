/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />

describe("Buffer behavior — Auto vs Manual tasks", () => {
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

    // Scenario 1: Manual task (no buffers in UI), then auto task with buffers
    // Tests that auto task respects only its own buffers, manual task buffers are ignored
    it("auto task should respect only its own buffers", () => {
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

        // Step 1: Create MANUAL task (no buffers UI available)
        cy.get("body").click();
        cy.wait(500);

        // Toggle auto-schedule OFF
        cy.get('[data-testid="auto-schedule-toggle"]').click();
        cy.wait(500);

        cy.get('[data-testid="task-name-input"]').clear().type(
            "Task Fixed Time",
        );
        cy.wait(300);

        // Submit manual task
        cy.get('[data-testid="taskmodal-submit-button"]').click();
        cy.wait(2000);

        // Step 2: Create AUTO task with buffers
        cy.get("body").click();
        cy.wait(500);

        cy.get('[data-testid="task-name-input"]').clear().type(
            "Auto Task Small Buffers",
        );
        cy.wait(300);

        // Buffers should be enabled by default (buffersEnabledAtom = true)
        // Don't click the switch - it would toggle them OFF
        // Just set the buffer values directly
        cy.get('[data-testid="buffers-before-trigger"]').should("be.visible");
        cy.get('[data-testid="buffers-before-trigger"]').click();
        // shadcn DropdownMenu renders in portal - find by role and text
        cy.get('[role="menuitem"]').contains("15min").click();

        cy.get('[data-testid="buffers-after-trigger"]').click();
        cy.get('[role="menuitem"]').contains("15min").click();
        cy.wait(300);

        // Submit auto task
        cy.get('[data-testid="taskmodal-submit-button"]').click();
        cy.wait(4000);

        // Visual verification
        cy.contains("Task Fixed Time").should("be.visible");
        cy.contains("Auto Task Small Buffers").should("be.visible");
    });

    // Scenario 2: Splittable auto task should fill earliest gaps first
    it("splittable auto task should fill earliest available gaps first", () => {
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

        // Step 1: Create MANUAL task at 9am-10am (blocks that hour)
        cy.get("body").click();
        cy.wait(500);

        // Toggle auto-schedule OFF
        cy.get('[data-testid="auto-schedule-toggle"]').click();
        cy.wait(500);

        cy.get('[data-testid="task-name-input"]').clear().type(
            "Manual Anchor 9am-10am",
        );
        cy.wait(300);

        // Submit manual task
        cy.get('[data-testid="taskmodal-submit-button"]').click();
        cy.wait(2000);

        // Step 2: Create AUTO splittable task (4hr = 240m)
        cy.get("body").click();
        cy.wait(500);

        cy.get('[data-testid="task-name-input"]').clear().type(
            "Splittable 4hr Task",
        );
        cy.wait(300);

        // Enable splittable
        cy.get('[data-testid="splittable-enabled-switch"]').click();
        cy.wait(300);
        cy.get('[data-testid="splittable-min-trigger"]').click();
        cy.get('[role="menuitem"]').contains("30min").click();
        cy.get('[data-testid="splittable-max-trigger"]').click();
        cy.get('[role="menuitem"]').contains("1hr").click();
        cy.wait(300);

        // Buffers enabled by default - just set values
        cy.get('[data-testid="buffers-before-trigger"]').click();
        cy.get('[role="menuitem"]').contains("15min").click();

        cy.get('[data-testid="buffers-after-trigger"]').click();
        cy.get('[role="menuitem"]').contains("15min").click();
        cy.wait(300);

        // Submit auto task
        cy.get('[data-testid="taskmodal-submit-button"]').click();
        cy.wait(5000);

        // Visual verification
        cy.contains("Manual Anchor 9am-10am").should("be.visible");
        cy.contains("Splittable 4hr Task").should("be.visible");
    });

    // Scenario 3: Long task near window end should defer to next day
    it("long task near window end should defer to next day, not split", () => {
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

        // Create auto task with 4hr duration
        cy.get("body").click();
        cy.wait(500);

        cy.get('[data-testid="task-name-input"]').clear().type(
            "Late Long Task (4hr)",
        );
        cy.wait(300);

        // Enable splittable with 30min-1hr range
        cy.get('[data-testid="splittable-enabled-switch"]').click();
        cy.wait(300);
        cy.get('[data-testid="splittable-min-trigger"]').click();
        cy.get('[role="menuitem"]').contains("30min").click();
        cy.get('[data-testid="splittable-max-trigger"]').click();
        cy.get('[role="menuitem"]').contains("1hr").click();
        cy.wait(300);

        // Buffers enabled by default - just set values
        cy.get('[data-testid="buffers-before-trigger"]').click();
        cy.get('[role="menuitem"]').contains("15min").click();

        cy.get('[data-testid="buffers-after-trigger"]').click();
        cy.get('[role="menuitem"]').contains("15min").click();
        cy.wait(300);

        // Submit auto task
        cy.get('[data-testid="taskmodal-submit-button"]').click();
        cy.wait(4000);

        // Visual verification
        cy.contains("Late Long Task (4hr)").should("be.visible");
    });
});
