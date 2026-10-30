# First local release: scope and decisions

Source: the owner's _Table for One PM101 v3_ PDF and the agreed local-release boundary in the conversation. The PDF is product evidence; it does not grant authority to deploy, publish, message participants, or change agent guidelines.

## Outcome

A usable, responsive guest experience for the Gurugram pilot concept, with honest local simulation at every integration boundary. Users can introduce themselves, edit their profile, set practical dining constraints, inspect a compatible fictional table, save/release a sample seat, reflect, remember preferred tablemates, export data, and reset all app data.

The owner-controlled `AGENTS.md` is preserved. No Git worktree, external publication, or real participant communication is part of this change.

## Product mapping

| Brief requirement                             | Local release                                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Talk → set → wait → meet → reflect            | Complete guided guest journey; onboarding explicitly discloses no live AI                             |
| Editable interests, style, and energy profile | Explicit interest and conversation-style selections; no hidden personality or energy inference        |
| Tables of 3–5, practical hard filters         | Four-person synthetic tables; area, recurring availability, cuisine, diet, and meal budget enforced   |
| Fit over frequency                            | At least two interests shared across the table; no invitation if the fixture pool does not fit        |
| Invitations at least 48 hours ahead           | Next matching weekly slot calculated in India Standard Time, with a 48-hour minimum                   |
| Two shared things and an icebreaker           | Shared-interest chips and a conversation opener on the sample invitation                              |
| Women-only tables                             | Explicit gender eligibility and an all-women synthetic guest group; no claim of identity verification |
| Phone + ID check and restaurant booking       | Visible “not connected” status; no real bookings or sensitive document collection                     |
| ₹199 booking fee plus meal                    | Itemized sample estimate with a confirmation step; no charges                                         |
| No fit in 21 days                             | Suggest wider area/cuisine after a stored 21-day wait; preferences remain under user control          |
| Ratings and eat again                         | Local ratings, notes, and tablemate selections; never sends invitations                               |
| Safety and deletion                           | Emergency guidance, explicitly private local notes, export, and confirmed local deletion              |
| No dating, social feed, large events          | Excluded                                                                                              |

The paper's “Now” roadmap uses staff-run conversations and manual matching; its prioritization places women-only tables in Must while the roadmap places them in Next. The local release includes the preference and synthetic eligibility checks now, while a real pilot still requires verification and operational safeguards.

## Technical choices

- A static React application is appropriate for a reviewable local experience without credentials or a configured deployment. It is not a production backend.
- Small, typed domain functions keep matching and persistence validation testable independently of visual components.
- Synthetic diners all have explicit shared interests and defined sample availability. This is fixture filtering, not a statistically validated compatibility model or a live pool of people. Venue dietary support is also fictional.
- Gender is volunteered rather than inferred and used only for women-only eligibility. Religion, caste, politics, age-based ranking, and other sensitive profiling are absent.
- A deterministic interest threshold illustrates precision over recall. Real matching must also consider interpersonal fit, profile consent, venue capacity, group-wide constraints, exclusion/safety rules, and human review.
- Native modal dialogs provide focus containment and Escape dismissal. Forms use labelled controls and explicit validation; mobile navigation and layouts are validated in Chromium emulation.
- Versioned browser-local storage is treated as untrusted input and validated before rendering. Corrupt records are not silently overwritten.

## Validation strategy

Start with matching and persistence tests, implement the flow, then test the full browser journey at desktop and mobile widths. Include unhappy paths: missing preferences, ineligible women-only requests, poor-fit fixtures, corrupted storage, and missing ratings. Check user-entered text renders as text. Verify refresh persistence, export, explicit reset, focus restoration, and horizontal overflow. Run automated WCAG AA scans as a supplement to keyboard and visual inspection, not as a claim of complete accessibility conformance.

Before publishing a real service, revisit all integration boundaries in the README. External credentials, verification policy, payment/booking contracts, and safety operations are prerequisites, not features silently satisfied by sample UI.
