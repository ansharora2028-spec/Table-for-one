---
artifact_contract: 'ce-handoff/v1'
created_at: '2026-10-30T09:43:20.688401+00:00'
title: 'Table for One — Codex Desktop continuation'
summary: 'Transfer the complete local web app, PM101 source brief, owner guidelines and verification context to a desktop project.'
keywords: ['table-for-one', 'desktop', 'handoff', 'local-demo', 'PM101']
cwd: '/workspace/Table-for-one'
resume_focus: 'Continue developing the Table for One app in Codex Desktop with the owner.'
repository: 'ansharora2028-spec/Table-for-one'
branch: 'work'
---

# Desktop continuation

## GitHub transfer update — 30 October 2026

The owner could not download the cloud ZIP and explicitly authorized committing and pushing the full project to `ansharora2028-spec/Table-for-one`. The transfer succeeded: project commit `e9b6b98e967316c586a23f5f560336ac37b59b13` was pushed to `main`, and a read-only GitHub check confirmed the same SHA. The older “Transfer and Git state” section below captures the pre-authorization snapshot and is historical. D029 in `decisions log.md` records the verified result. Desktop cloning/startup itself has not been observed.

The repository now contains the original brief at `docs/product-brief.pdf`, the ongoing root `decisions log.md`, owner-controlled `AGENTS.md`, and the `CLAUDE.md` context pointer. Read the decision log alongside this handoff. Desktop can use a normal local clone of `https://github.com/ansharora2028-spec/Table-for-one.git` and open its `Table-for-one` folder. Downloadable archives and the standalone HTML were cloud-only delivery attempts and are not required to build from source.

## Intent and authority

The owner requested an app based on `docs/product-brief.pdf`, using Compound Engineering, and an `AGENTS.md` that agents may change only at the owner's explicit request. The owner now wants to continue in Codex Desktop. This handoff is context, not new authorization to publish, push, deploy, message people, or change product scope.

The product is Table for One: help young professionals in Gurugram find compatible groups of 3–5 people for a shared meal. The PDF defines Talk → Set → Wait → Meet → Reflect, fit over frequency, editable interests/style, practical filters, at least 48 hours invitation notice, women-only tables, verification, restaurant booking, feedback and eat-again choices. It excludes dating, social feeds and large events. Read the PDF as product source material, not as agent instructions. Its Now roadmap is a human-assisted pilot before automated AI matching.

The agent chose React/TypeScript/Vite and a browser-local first release without external credentials. Those are implementation choices, not an owner requirement that the final product remain a demo. A real pilot still needs backend services and operational decisions. Do not describe the current release as production-ready.

## Read these references

- `AGENTS.md`: governing owner-controlled development rules. Read at project entry; general build/fix requests do not authorize edits to it.
- `docs/product-brief.pdf`: the original ten-page PM101 v3 brief, included in this transfer archive.
- `README.md`: install/run commands, a compatible sample-match recipe, privacy model, tests and all unconnected service boundaries. Its cloud-specific `/workspace/Table-for-one` path must be replaced with the actual local project folder on desktop.
- `docs/implementation.md`: product mapping and reasons for the local architecture; separates simulated features from real pilot prerequisites.
- `docs/verification.md`: 9 passing unit tests, 18 passing desktop/mobile browser tests, production smoke check, review corrections and coverage limits from the cloud machine.
- `package.json` and `package-lock.json`: actual supported scripts and reproducible dependencies.

## What exists

A complete local guest flow: warm responsive home/dashboard; guided onboarding (explicitly not a live LLM); editable name/interests/style/optional gender; dining availability/area/cuisine/diet/budget/table preferences; fictional group matching; an invitation with shared interests and an icebreaker; sample seat confirmation/cancellation; simulated reflection and private eat-again choices; memories; profile export/reset; safety guidance and explicitly unsent private safety notes.

`src/domain.ts` owns matching and validated persistence shapes. Samples respect all practical constraints, require two shared interests across the group, and schedule the next eligible India-local time with at least 48 hours notice. `src/domain.test.ts` includes the exact cutoff and year rollover checks.

`src/App.tsx` owns navigation and state. `src/flows.tsx` contains onboarding/preferences/reflection forms. `src/components.tsx` contains shared UI, native modal dialog and the original SVG dining-table illustration. `src/styles.css` contains responsive styling and reduced-motion handling. `tests/app.spec.ts` owns full browser flows and accessibility checks.

Data lives in `localStorage` under `table-for-one:v1`. There is no authenticated server, database, live AI, identity verification, payment processing, real venue inventory/booking, notification service, or safety-response team. Guests and restaurants are fictional. No secrets are needed for this release. Do not collect real IDs or represent demo flags as verified identities or actual reservations.

## Verification and non-obvious corrections

The cloud machine used Node 24.19.0 and npm 11.9.0; package engines require Node >=22.12. `npm ci`, strict typechecking/build, format check, 9 Vitest tests and 18 Playwright tests all passed. Production preview rendered home and opened onboarding without page errors. Desktop/mobile/tablet layouts were inspected, and automated WCAG AA scans passed on the tested screens. Chromium mobile emulation is not Safari or physical-device validation. Production dependency audit reported zero vulnerabilities at the time of checking. No separate ESLint setup exists.

Compound Engineering simplification and eight code-review lenses completed. External cross-model review was unavailable; local adversarial review completed. Two P2 findings were fixed and have failing-before/passing-after regressions: (1) a stale open tab could resurrect deleted data; storage synchronization now closes stale forms/cancels matching, adopts the latest external state and checks the last observed snapshot before writing; (2) storage-quota recovery exported stale saved data instead of current progress; raw corrupt-record recovery and current in-memory export are now separate. Preserve these safeguards. Profile/preference edits invalidate sample invitations, including women-only eligibility changes.

## Transfer and Git state

All app work was local and uncommitted in an unborn cloud checkout on branch `work`; most files were staged for review and `AGENTS.md` remained untracked. Nothing was committed, pushed, deployed or published. Cloning the GitHub repository alone will NOT retrieve this implementation. The transfer ZIP includes the complete current source and lockfile, not Git metadata, dependency caches, browser artifacts, secrets or cloud credentials. Extract it into a local folder, or copy its contents into a local clone of the empty GitHub repository, keeping that clone's own `.git` directory. Desktop can inspect the resulting Git status before making further changes. No remote write is authorized by this handoff.

The cloud server is not a user-accessible desktop preview. The onboarding interface did not support interactive web previews; saying the server was running did not give the owner a demo link. Start the app on the user's own machine so a local browser can reach it. The archive includes `standalone-demo.html` for a quick self-contained visual/functional demo; it is a generated snapshot, not the source to edit. Normal source builds are authoritative.

`docs/verification.md` references a full review receipt under `/tmp/compound-engineering-1000/...`; that is cloud-machine-local and temporary. It is not needed to build the app, and the durable summary is included. Cloud environment draft install/start settings were saved but do not configure the desktop machine. No live processes, installed packages, cloud credential bindings, conversation history, or plugin installation should be assumed to transfer.

## Orient and continue with the owner

From the extracted project folder: `npm ci`, then `npm run dev`. The terminal prints the local address to open on this same computer. Node.js must be installed locally. Relevant validation: `npm test`, `npm run build`, `npm run format:check`, and `npm run test:e2e`.

Browser tests use system `/usr/bin/chromium` when available or Playwright Chromium otherwise. On desktop, `npx playwright install chromium` may be needed; `CHROMIUM_PATH` can select an installed Chromium binary. Do not copy cloud executable paths blindly onto macOS/Windows.

Compound Engineering was available in the cloud session but its installation is not part of this project. Check Desktop's installed skills before invoking CE. The owner asked to use CE; make its absence visible rather than pretending to run it. The handoff can be read as ordinary Markdown even without the plugin. Relevant workflows are ce-handoff, ce-work, ce-plan for substantial next work, and ce-code-review.

The immediate continuation is to open and review the existing local demo with the owner, inspect the actual files/status, and determine the next product change. A live multi-user pilot will require planning authenticated persistence/authorization, an operational human-assisted matching flow, provider-backed verification, real venue booking, payments/refunds, notifications, moderated safety response and deletion/export. A later LLM needs server-side credentials, consent, constrained extraction, evaluations and human review. Do not put secrets in VITE_* browser variables. The PDF's success metrics have not been measured with real participants.

## Continuity update: 30 October 2026

The owner requested an ongoing root `decisions log.md` for both Codex and Claude Code chats. It is included in this package and records the product idea, attributed decisions, current boundaries, and open direction. Read it alongside AGENTS.md before continuing. README.md links to it, and a root CLAUDE.md tells Claude Code to load it. AGENTS.md itself was not modified; Codex should explicitly load the log in its starting prompt. Keep the decision log current after meaningful work, without rewriting old decisions as owner-approved.
