import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Enables `describe`, `it`, and `expect` globally
    environment: "node", // Ensures it runs in a Node.js environment,
    include: ['test/**/*.{test,spec}.{ts,tsx,js,jsx}'],
  },
});
