# JARVIS training analytics upgrade

This update adds session RPE, session-type breakdown, session-load visuals, and a completed S&C list while retaining the existing swim-volume chart and browser-local storage.

## Files to replace in `sxmrxse/Jarvis-control-room`

- `index.html`
- `swim-logic.js`
- `test/swim-logic.test.js`
- `e2e/swim-dashboard.spec.js`

Keep the existing `package.json`, `playwright.config.js`, `scripts/serve.js`, `.github/workflows/tests.yml`, and `.gitignore` unchanged.

## Safest update method

1. Create a branch named `training-analytics-upgrade` from `main`.
2. Replace the four files above with the matching files from this package, keeping the same folder paths.
3. Commit the changes to that branch and open a pull request into `main`.
4. Check that the **Dashboard tests** workflow passes before merging.
5. After merging, wait for **pages build and deployment** to succeed, then refresh `https://sxmrxse.github.io/Jarvis-control-room/`.

If using GitHub's web editor, open each existing file, click the pencil icon, replace its contents with the matching file, and commit to the new branch. The two test files live in the `test/` and `e2e/` folders.

## Data notes

- Import the full Notion Training Log CSV, preferably the `_all.csv` export.
- Only rows marked `Completed` are imported; planned and missed sessions are excluded.
- RPE is shown only when a valid 1–10 score exists.
- S&C duration and load are not guessed. A blank duration stays blank, and zero session-load placeholders are treated as missing.
- The existing local browser data key is retained. Re-importing rows with Session IDs updates those rows instead of duplicating them.
- Do not commit your personal Notion export to this public repository.
