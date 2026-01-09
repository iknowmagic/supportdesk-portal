#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Auto-Scheduler CLI - Interactive task management
 * Single entry point that runs in interactive mode by default
 */

import inquirer from "inquirer";
import { getAuthToken } from "./auth.js";
import { login } from "./login.js";
import { addTask, listTasks } from "./tasks-actions.js";

async function mainMenu() {
    while (true) {
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("  📋 TASK MANAGER");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "What would you like to do?",
                choices: [
                    { name: "📋 List tasks", value: "list" },
                    { name: "➕ Add task", value: "add" },
                    { name: "🚪 Exit", value: "exit" },
                ],
            },
        ]);

        if (action === "exit") {
            console.log("\nGoodbye! 👋\n");
            process.exit(0);
        } else if (action === "list") {
            await listTasks();
        } else if (action === "add") {
            await addTask();
        }
    }
}

async function main() {
    console.log("\n🤖 Auto-Scheduler CLI\n");

    if (!getAuthToken()) {
        console.log("You are not logged in.\n");
        await login();
    } else {
        console.log("✅ Authenticated\n");
    }

    await mainMenu();
}

main().catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
});
