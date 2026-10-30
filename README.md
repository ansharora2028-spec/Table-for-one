# Table for One

**Good food. Better company.** A responsive, local-first web app based on the _Table for One PM101 v3_ brief: small, compatible dining tables across nine major Indian city chapters.

This release demonstrates the complete guest journey. It is **not a live booking service**. All sample diners and venues are fictional, onboarding is guided rather than LLM-powered, and no payment, identity verification, notification, or restaurant reservation occurs. No credentials are needed.

The public demo is available at **[ansharora2028-spec.github.io/Table-for-one](https://ansharora2028-spec.github.io/Table-for-one/)**. It is deployed from `main` by GitHub Actions after the repository checks pass.

For a new Codex or Claude Code conversation, read `AGENTS.md` and the [decisions log](<decisions log.md>) first. The log records the product idea, decision history, implementation choices, current limits, and unresolved direction. Claude Code also has a root `CLAUDE.md` context pointer; Codex sessions should explicitly load the log because the owner-controlled `AGENTS.md` has not been changed to add that pointer.

## Run locally

Requires Node.js 22.12+ (validated on Node.js 24) and npm.

```sh
cd Table-for-one
npm ci
npm run dev -- --port 5173
```

Use the existing checkout in cloud tasks; each task is already isolated. Do not create a Git worktree unless the owner explicitly requests one. Live development processes must be restarted in a restored environment.

For a production build:

```sh
npm run build
npm run preview -- --port 4173
```

`dist/` is the static deployment output. Navigation uses URL fragments, so no server-side route rewriting is required. The UI uses system fonts and bundled SVG artwork and icons; no external image, font, or runtime API requests are required.

GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`. GitHub Actions builds with the `/Table-for-one/` base path; local development continues to use `/`. In the repository's **Settings → Pages**, the publishing source must be set to **GitHub Actions**.

## Try the complete journey

1. Select **Let’s find your people** and complete the guided introduction. Choose at least two interests, a conversation style, and optional gender; confirm you are an adult and agree to browser-local storage.
2. Save your area, weekly availability, cuisines, diet, meal budget, and table preference.
3. Select **Explore a sample match**. For a compatible example, choose Books and Travel, Cyber Hub, Friday or Saturday dinner, Mediterranean cuisine, and a meal budget of at least ₹750. A vegetarian or vegan meal works at this fictional venue.
4. Review the fictional tablemates, shared interests, icebreaker, date, and price. Confirm a sample seat. No money is collected or venue contacted.
5. Select **Try post-meal reflection**, rate the sample experience, and choose who you would eat with again. It is labelled as a simulated reflection, even though the fictional dinner is in the future.
6. View saved reflections in **Good memories**. Use **Your profile** to edit, export, or delete your local data. **A safer table** includes emergency guidance and a clearly labelled private note, not a submitted support report.

The fictional pool intentionally cannot fit every preference. For example, Outdoors and Tech & ideas alone have no shared-interest match; Wednesday and Thursday have no sample diners. A no-fit result preserves all your choices instead of silently widening them.

## Checks

```sh
npm test
npm run typecheck
npm run build
npm run format:check
npm run test:e2e
```

Unit tests cover matching constraints, table size, women-only eligibility, the 48-hour lead time, profile fields, and storage validation. Playwright runs desktop Chromium and an emulated mobile viewport through the full journey, persistence, validation, no-fit cases, data export/deletion, keyboard dismissal, local safety notes, and automated WCAG AA checks. Mobile emulation does not establish Safari or physical-device compatibility.

Playwright uses `/usr/bin/chromium` when available. Otherwise install its Chromium build with `npx playwright install chromium`; set `CHROMIUM_PATH` only to select another installed Chromium executable. Linux machines may also need Playwright's documented OS prerequisites. The browser tests start the development server when needed. In a restricted cloud executor, local server and browser commands need the supported execution permission that allows binding ports.

`npm run format` formats implementation files and documentation. `AGENTS.md` is deliberately excluded: agents must not change the owner-controlled guidelines without an explicit owner request.

## Data and privacy

- Profile, preferences, sample invitation, reflections, and private notes are stored under `table-for-one:v1` in this browser’s `localStorage`. They are not uploaded, encrypted, authenticated, or shared across devices.
- Only the selected interests, style, first name, and optional gender form the profile. No sensitive traits are inferred from free text; no full chat transcript, phone number, ID document, religion, caste, or political field is collected.
- Editing a profile or saving preferences releases an existing sample invitation so stale matches are not retained.
- Invalid or unsupported saved data is preserved until the user explicitly resets it. Storage failures are shown visibly rather than presented as successful saves.
- Open tabs synchronize changes and deletion. External updates close stale forms; after a storage write failure, export downloads current unsaved progress rather than an older saved record.
- Download exports this device’s app data. Delete resets the app’s stored record, including private safety notes. Previously downloaded files are outside the app’s control.
- Do not enter confidential information on a shared device. Browser-local state is not a security boundary, and this app must not be used to organise real meetings or process money.

## Architecture and the path to a live pilot

React + TypeScript + Vite; Lucide icons; Vitest for domain checks; Playwright and axe-core for browser validation. The domain is isolated in `src/domain.ts`, shared UI in `src/components.tsx`, forms in `src/flows.tsx`, and application navigation and state in `src/App.tsx`.

See [implementation notes](docs/implementation.md) for scope and decisions. Before real users or payments, the app needs authenticated server-side persistence and authorization, phone/ID verification with an appropriate provider and retention policy, a human-assisted matching/admin workflow, real venue inventory and reservations, server-side matching validation, payment/refund handling, notification delivery, moderation and safety response, and server-side data export/deletion. A later LLM integration must be server-side with explicit consent, constrained profile extraction, evaluations, and low-confidence human review. Never put provider secrets in `VITE_*` variables or trust browser-local verification or booking flags.

The project has not been deployed or published. There is no production telemetry, and no claims about pilot conversion, attendance, or safety outcomes are made.
