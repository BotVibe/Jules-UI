# Jules Mobile PWA

Jules Mobile is a lightweight, mobile-first Progressive Web App (PWA) client for the Google Jules API. It allows you to create, monitor, and interact with your Jules AI coding sessions directly from your mobile device (optimized for iOS/Safari).

## Features

1. **Auth & Settings (Local & Secure):** Securely store your Google Jules API key in the browser's local storage. Input fields are optimized for iOS keyboards (no auto-correct, auto-capitalize).
2. **Repository Selection:** Fetches your connected GitHub repositories via the Jules API and presents them in a touch-friendly UI.
3. **Session Management:** Start a new session with a text prompt and target repository directly from your phone.
4. **Live Activity Polling:** Automatically polls the active session status every 5 seconds, displaying progress, plans, and events in a vertical timeline.
5. **Mobile-Optimized Artifact Viewer:** Displays code diffs and terminal outputs beautifully on small screens with responsive line wrapping and clear syntax highlighting.

## Tech Stack

- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Data Fetching:** SWR for reactive polling
- **PWA:** `vite-plugin-pwa` for manifest and service worker generation

## Multi-User Support

**Yes, multiple users can use the same deployed instance simultaneously.**
Because this is a static Single Page Application (SPA), all logic runs directly in the user's browser. The API Key is saved securely to each individual user's `localStorage`. This means User A and User B can navigate to the exact same URL, enter their own respective API keys, and interact with their own private Jules sessions without any overlap or server-side collision.

## Deployment to GitHub Pages

This project is configured for automated deployment to GitHub Pages using GitHub Actions.

### Setup Instructions for Repository Owners:
1. Push this code to a public or private GitHub repository.
2. In your GitHub repository, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The `.github/workflows/deploy.yml` file is already included in this repository. Any push to the `main` or `master` branch will automatically trigger a build and deployment.
5. Wait for the Action to complete, and your app will be live at `https://<your-github-username>.github.io/<your-repo-name>/`.

## Getting Started (Local Development)

### Prerequisites

- Node.js (v18+)
- A Google Jules API Key ([Get one here](https://jules.google.com/settings))

### Installation

1. Clone the repository and navigate into the project directory.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Environment Variables (Optional)

By default, the app points to the official Jules API `https://jules.googleapis.com/v1alpha`. If you need to override this, create a `.env` file in the root:

```env
VITE_JULES_API_BASE_URL="your-custom-endpoint"
```

### Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

The compiled static assets and service worker will be generated in the `dist/` directory.

## License

MIT
