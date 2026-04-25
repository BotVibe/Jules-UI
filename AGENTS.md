# AGENTS.md

This file contains instructions for AI agents working on the `jules-client` repository.

## Tech Stack & Architecture

- **Core:** React, TypeScript, Vite.
- **Styling:** Tailwind CSS v4.
- **Data Fetching:** SWR (used for polling session activities).
- **Icons:** `lucide-react`.
- **PWA:** `vite-plugin-pwa` is used. Do not manually edit the service worker unless configuring the plugin in `vite.config.ts`.
- **Target Audience:** The application is strictly **mobile-first**, optimized specifically for iOS/Safari.

## Coding Conventions

1. **Mobile-First CSS:** Always design components with mobile screens in mind first. Avoid fixed horizontal widths that exceed typical mobile viewports (e.g., use `w-full max-w-full` instead of `w-[400px]`).
2. **Error Handling:** All network requests in `src/lib/api.ts` must use strict `try/catch` blocks. The `JulesApiError` class should be thrown to bubble up status codes and messages to the UI components. Do not fail silently.
3. **No Dummy Data / Hallucinations:** Never hardcode dummy API responses. Ensure all API calls hit the actual configured endpoint. If a new Jules API endpoint is required, verify its path first.
4. **Environment Variables:** Use `import.meta.env.VITE_X` for environment variables. Ensure fallbacks are provided if variables are missing.
5. **Types:** Define all API models and interfaces cleanly in `src/types/jules.ts`. Use `import type` for type-only imports to satisfy the TypeScript `verbatimModuleSyntax` rules.

## Building, Deployment, and Verification

- Before committing changes, always run a full build to verify TypeScript compilation:
  ```bash
  npm run build
  ```
- **Deployment & Base URL:** The application is deployed automatically to GitHub Pages via a GitHub Action (`.github/workflows/deploy.yml`). The `vite.config.ts` handles the `base` path dynamically using `process.env.GITHUB_REPOSITORY`. If you modify routing or asset paths, verify that they continue to work under a nested sub-path (e.g., `https://user.github.io/repo/`).
- Note on dependencies: If adding Vite plugins, be aware of peer dependency issues with Vite v8. Use `npm install <package> --legacy-peer-deps` if `npm` throws ERESOLVE conflicts regarding Vite versions.
