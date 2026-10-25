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

Install Node.js 18 or later, then run this command from the repository root:

```sh
node --test
```

The tests use Node.js's built-in test runner; no third-party test framework is needed.

## Data and privacy

Import a CSV export to review your own sessions. Keep personal training data and raw Notion exports out of this public repository.

## Status

The dashboard is a static HTML application. Unit tests are included; browser-level Playwright testing and GitHub Pages deployment are planned.
