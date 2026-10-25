# JARVIS Swim Performance Dashboard

A lightweight, standalone dashboard for reviewing completed swimming sessions.

## Features

- Weekly swim-volume chart, with one bar per completed swim session.
- Weekly mean-distance reference line.
- Summary of total metres, completed sessions, and average metres per session.
- CSV import and export.
- Local browser storage for dashboard data.
- Responsive dark interface.

## Run locally

Open `index.html` in a modern web browser. Keep `swim-logic.js` in the same folder. No build step or package installation is required.

## Run tests

Install Node.js 22 or later, then run the unit tests from the repository root:

```sh
npm install
npm test
```

Browser-level checks use Playwright and Chromium:

```sh
npx playwright install chromium
npm run test:e2e
```

The unit tests use Node.js's built-in test runner. The Playwright tests create synthetic sample sessions at runtime and do not use personal Notion exports or real training data. GitHub Actions runs both suites on pushes and pull requests to `main`.

## Data and privacy

Import a CSV export to review your own sessions. Keep personal training data and raw Notion exports out of this public repository.

## Status

The dashboard is a static HTML application. Unit and Playwright browser tests are included. GitHub Pages deployment is the next planned step.
