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

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Jules API Key ([Get one here](https://jules.google.com/settings))

### Installation

1. Clone the repository and navigate into the project directory.
2. Install dependencies:
   ```bash
   npm install
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
