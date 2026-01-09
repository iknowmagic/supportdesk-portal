/* eslint-disable no-console */
import inquirer from "inquirer";
import { getAuthenticatedClient } from "./auth.js";

async function fetchTasksFromEdge() {
    const client = getAuthenticatedClient();
    const { data, error, response } = await client.functions.invoke("tasks", {
        method: "GET",
    });
    if (error) {
        let message = "Failed to fetch tasks";
        if (response) {
            try {
                const parsed = await response.json();
                if (parsed?.error) message = parsed.error;
            } catch {
                // ignore parse errors
            }
        }
        if (error instanceof Error && error.message) {
            message = `${message}: ${error.message}`;
        }
        throw new Error(message);
    }
    return data;
}

async function createTaskViaEdge(payload: Record<string, unknown>) {
    const client = getAuthenticatedClient();
    const { data, error, response } = await client.functions.invoke("task", {
        method: "POST",
        body: payload,
    });
    if (error) {
        let message = "Failed to create task";
        if (response) {
            try {
                const parsed = await response.json();
                if (parsed?.error) message = parsed.error;
            } catch {
                // ignore parse errors
            }
        }
        if (error instanceof Error && error.message) {
            message = `${message}: ${error.message}`;
        }
        throw new Error(message);
    }
    return data;
}

export async function listTasks() {
    let tasks: Array<Record<string, unknown>>;
    try {
        tasks = await fetchTasksFromEdge();
    } catch (error) {
        console.error("❌ Error:", (error as Error).message);
        return;
    }

    if (!tasks || tasks.length === 0) {
        console.log("\n📭 No tasks found\n");
        return;
    }

    console.log(`\n📋 Found ${tasks.length} task(s):\n`);
    tasks.forEach((task, index: number) => {
        const auto = task.auto_schedule ? "🤖" : "  ";
        console.log(
            `${
                index + 1
            }. ${auto} ${task.title} (${task.duration}min, ${task.priority})`,
        );
    });
    console.log();
}

export async function addTask() {
    const answers = await inquirer.prompt([
        { type: "input", name: "title", message: "Task title:" },
        {
            type: "number",
            name: "duration",
            message: "Duration (minutes):",
            default: 60,
        },
        {
            type: "list",
            name: "priority",
            message: "Priority:",
            choices: ["asap", "high", "normal", "low"],
            default: "normal",
        },
        {
            type: "confirm",
            name: "autoSchedule",
            message: "Enable auto-scheduling?",
            default: true,
        },
    ]);

    try {
        const created = await createTaskViaEdge({
            task: {
                title: answers.title,
                duration: answers.duration,
                priority: answers.priority,
                auto_schedule: answers.autoSchedule,
                buffer_before: 0,
                buffer_after: 0,
            },
        });

        console.log("\n✅ Task created!");
        console.log(
            `   ${created.title} (${created.duration}min, ${created.priority})\n`,
        );
    } catch (error) {
        console.error("❌ Error:", (error as Error).message);
    }
}
