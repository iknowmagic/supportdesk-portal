/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  test: {
    coverage: {
      exclude: [
        "**/node_modules/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
        "**/dist/**",
        "**/dist_chrome/**",
        "**/dist_firefox/**",
        "cosmos/**",
        "src/tests/setup.ts",
        "custom-vite-plugins.ts",
        "__mocks__/",
        "playwright/",
        "playwright.config.ts",
        "vitest.config.ts",
        "src/components/ui",
        "src/components/shadcn-studio",
        "src/components/login-form.tsx",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
      // Don't process CSS during tests
    },
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/dist/**"],
    globals: true,
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    setupFiles: ["./src/tests/setup.ts"],
  },
});
