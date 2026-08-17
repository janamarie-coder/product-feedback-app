# Testing Evidence — Milestone 5

I tested every user flow from my PRD manually, plus a set of edge cases designed to break things rather than just confirm the happy path. All tests were run against the live local API (`http://localhost:3001`) and frontend (`http://localhost:5173`) — real requests and real browser interactions, not predictions. Any test data I created while testing was cleaned up afterward, so the database is back to just the original 5 seed rows.

---

## 1. Standard user flows (per PRD Section 2)

| # | Flow | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | View all suggestions | Load Home page | All 5 seed suggestions render, newest first | All 5 seed suggestions rendered on load, count showed "5 Suggestions" | Pass |
| 2 | Filter by category | Click "Bug" pill | Only Bug-category suggestion(s) shown, count updates | Clicking "Bug" called `GET /get-suggestions-by-category/Bug`, showed exactly 1 suggestion, count updated to "1 Suggestion" (correct singular) | Pass |
| 3 | Empty state | Filter to a category with no matches | "There is no feedback yet." + subtext shown | My seed data has at least 1 suggestion in every category, so nothing was naturally empty. I temporarily deleted the single "Bug" row to test this, confirmed `GET /get-suggestions-by-category/Bug` returned `{"suggestions":[]}` and that the UI showed the illustration, "There is no feedback yet.", "Try a different category or add a suggestion.", and an "Add Feedback" button — then reinserted the exact original row afterward to restore my seed data. | Pass |
| 4 | Navigate to AddFeedback | Click "Add Feedback" button | Navigates to `/add-feedback` | Clicking the button navigated to `/add-feedback` and rendered the "Create New Feedback" form | Pass |
| 5 | Submit valid feedback | Fill all fields correctly, submit | `201`, navigates to Home, new suggestion visible if filter matches | Set the active filter to "UX" (1 suggestion) on Home, navigated to AddFeedback, submitted a new suggestion in category "Bug" (deliberately not matching "UX"). Got `201`, navigated to Home — but the active filter had reset to "All" instead of staying on "UX" like PRD 2.2.2 requires. See Bug 1 below. | **Fail** |
| 6 | Submit invalid feedback (empty) | Submit with all fields blank | Inline validation errors shown, no API call made | All three fields showed red borders + the exact error messages from my PRD. Checked the network tab — no request to `/add-one-suggestion` was made. | Pass |
| 7 | Cancel button | Click Cancel on AddFeedback | Navigates to Home, nothing submitted | Cancel navigated to Home, no POST request fired, suggestion count unchanged. (Home's filter also reset to "All" here — same underlying cause as Bug 1, not a separate issue.) | Pass |
| 8 | Refresh persistence | Submit feedback, then hard-refresh the page | New suggestion still present (confirm in Neon directly) | Submitted a suggestion, hard-refreshed the page, suggestion still rendered. Confirmed independently via `GET /get-all-suggestions` that the row actually exists in the database. | Pass |

---

## 2. Edge case / stress testing

These go beyond what my PRD explicitly states, aimed at trying to break things rather than just confirming the happy path.

| # | Test | What I did | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | Title at exact max length (100 chars) | `POST /add-one-suggestion` with a 100-character title | Accepted, `201` | `201 Created`, row stored with the full 100-char title intact | Pass |
| 2 | Title one over max (101 chars) | `POST /add-one-suggestion` with a 101-character title | Rejected, `400`, "Title must be 100 characters or fewer." | `400`, exact error message match | Pass |
| 3 | Description at exact max length (500 chars) | `POST /add-one-suggestion` with a 500-character description | Accepted, `201` | `201 Created`, row stored with the full 500-char description intact | Pass |
| 4 | Description one over max (501 chars) | `POST /add-one-suggestion` with a 501-character description | Rejected, `400` | `400`, exact error message match | Pass |
| 5 | Whitespace-only title | Title = `"   "` (spaces only) | Rejected, `400`, "Title is required." (trims to empty) | `400`, exact match — confirms the server trims before validating | Pass |
| 6 | Title with special characters/emoji | Title = `"Add 🔥 dark mode!! <script>"` | Accepted and stored safely, no rendering/injection issue | `201`, stored and returned intact. Rendered on Home as plain visible text — React's default escaping prevented any script execution, no console errors | Pass |
| 7 | Rapid double-submit | Click "Submit Feedback" twice quickly | Only one suggestion created (not a duplicate) | Network log showed exactly one `POST /add-one-suggestion` → `201`, and the database had exactly one new row. The Submit button disables itself while submitting, fast enough to block a second click. | Pass |
| 8 | Browser back after submit | Submit, then press browser Back button | No duplicate submission, no broken state | After submitting and landing on Home, pressing Back returned to `/add-feedback` with a fresh, empty, unsubmitted form. No new POST fired, no duplicate row, no console errors. | Pass |
| 9 | Invalid category via direct API call | `GET /get-suggestions-by-category/NotACategory` | `400` with the exact PRD error message | `400`, exact error message match | Pass |
| 10 | Narrow viewport below mobile breakpoint | Resized browser to 320px width | Layout stays usable, no horizontal scroll or overlap | With the max-length test rows (100/500 unbroken characters) still in the list, the page had severe horizontal overflow — `document.documentElement.scrollWidth` measured 4824px against a 1280px viewport even at desktop width, and at 320px the sidebar, top bar, and cards all overflowed off-screen with visible cut-off text. See Bug 2 below. | **Fail** |
| 11 | Many suggestions at once | Added 10 suggestions via direct API calls (15 total) | Page remains responsive and scrollable, no crash | Page rendered all 15 suggestions, scrolled smoothly top to bottom, no crash, no console errors | Pass |
| 12 | Reload with an active category filter | Filtered to "UI", then hard-refreshed the page | Not specified in my PRD — recording actual behavior; not treating this as a bug unless it errors or crashes | Filter reset to "All" on hard refresh. Expected, since no filter state is persisted in localStorage or the URL, so a full page reload has nothing to restore from. No error, no crash. | Pass (recorded, not a bug) |

---

## 3. Bugs found

Two genuine bugs came out of this pass, both frontend — no backend/API failures. I didn't fix either one here; both are written up below in the 3-line format ready to file as GitHub Issues.

### Bug 1 — Active category filter resets to "All" after returning to Home (violates PRD 2.2.2)

- **What I did:** On Home, set the active filter to "UX." Clicked Add Feedback, submitted a valid suggestion in a different category ("Bug"), which succeeded and navigated back to Home.
- **What I expected:** Per my PRD (2.2.2 — filter should NOT reset to All), the "UX" filter should still be active, so the new Bug-category suggestion should not appear and the count should still reflect only UX suggestions.
- **What happened instead:** The filter silently reset to "All." The new suggestion appeared, and the count showed the full unfiltered total. The same thing happens via the Cancel button and the Go Back link — any round trip through `/add-feedback` and back loses the previously active filter.
- **Likely cause:** `activeFilter` is local `useState` inside `HomePage` (`client/src/pages/HomePage.jsx`). React Router unmounts `HomePage` on navigation to `/add-feedback` and mounts a fresh instance on return, resetting the state. Probably needs to live in the URL as a query param, or be lifted to a shared context/parent component.
- **Label:** `frontend`

### Bug 2 — Long unbroken strings in title/description cause page-wide horizontal overflow

- **What I did:** Submitted a suggestion with a 100-character title with no spaces (valid — it's exactly my PRD's own max length), then viewed the Home page at desktop (1280px) and mobile (320px) widths.
- **What I expected:** The suggestion renders normally, text wraps within its card, and the layout stays intact at every width.
- **What happened instead:** The unbroken string forced its container wider than the viewport — `scrollWidth` measured 4824px against a 1280px viewport. At 320px, the sidebar, top bar, and cards all overflowed off-screen, requiring horizontal scroll, with text cut off.
- **Likely cause:** No `word-break`/`overflow-wrap` rule on the suggestion card's title/description in `client/src/styles/index.css`. Since neither the 100-char title limit nor the 500-char description limit requires whitespace, this is reachable with completely valid input, not just adversarial data.
- **Label:** `frontend`

---

## 4. Summary

| Issue # | Summary | Label | Status |
|---|---|---|---|
| _(to file)_ | Active category filter resets to "All" after returning to Home from AddFeedback | frontend | Found, awaiting GitHub Issue |
| _(to file)_ | Long unbroken title/description strings cause page-wide horizontal overflow | frontend | Found, awaiting GitHub Issue |

18 of 20 tests passed on the first run. Both failures are real, reproducible bugs and are scoped for Milestone 7 (UI fixes) — no backend changes needed.
