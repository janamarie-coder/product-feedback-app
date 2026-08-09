# Product Requirements Document: Product Feedback App

## 1. Overview

**What it does**
The Product Feedback App lets customers view existing product-improvement suggestions and submit new ones. It has two pages:

- **Home page** — browse all suggestions, filter them by category, and see an empty state when a filter (or the whole board) has no matching suggestions.
- **AddFeedback page** — a validated form for submitting a new suggestion.

There is no voting, commenting, editing, deleting, or user authentication in this version (see [Section 7](#7-out-of-scope)). Every suggestion is publicly visible to every visitor as soon as it's submitted.

**Who it's for**
- **End users / customers**: people who use the underlying product and want to propose or browse improvement ideas.
- **Learning goal**: this is a portfolio/learning project exercising a full-stack CRUD-lite flow — React frontend, Express REST API, PostgreSQL persistence — with a fixed, small scope suitable for a single developer to build and finish.

---

## 2. Pages & User Flows

### 2.1 Home Page (`/`)

**On page load:**
1. Frontend calls `GET /get-all-suggestions` (see [Section 4](#4-api-endpoints)) with no category filter — returns all suggestions, newest first.
2. Sidebar renders:
   - Header card: "My Company" / "Feedback Board" (static text, not user-editable in v1).
   - Category filter card: 6 pills — `All`, `UI`, `UX`, `Enhancement`, `Bug`, `Feature`. `All` is selected/active by default.
3. Top bar renders the current suggestion count as `"{count} Suggestion(s)"`:
   - `0` → `"0 Suggestions"`
   - `1` → `"1 Suggestion"` (singular)
   - `2+` → `"{count} Suggestions"`
   - Count reflects only suggestions currently matching the active filter, not the full board total.
4. Content card renders either:
   - **Populated state**: one card per suggestion, in the order returned by the API (newest first), each showing **title**, **category tag**, and **description**.
   - **Empty state** (see 2.1.2).

**2.1.1 Category filter interaction**
- Exactly one pill is active at a time (single-select). Clicking a pill:
  - Sets that pill active (visually: solid indigo background / white text), all others inactive (pale lavender background / indigo text).
  - Triggers a fetch:
    - If the clicked pill is `All`, call `GET /get-all-suggestions`.
    - If the clicked pill is any other category (`UI`, `UX`, `Enhancement`, `Bug`, `Feature`), call `GET /get-suggestions-by-category/:category` with that category in the path.
  - Replaces the suggestion list with the response from that call.
  - Updates the top-bar count to match the new filtered set.
  - Re-evaluates empty vs. populated state for the content card.
- Clicking the already-active pill is a no-op (no re-fetch needed, though it's harmless if it does).

**2.1.2 Empty state — trigger conditions**
The content card shows the empty state whenever the current filtered suggestion list has **zero items**. This covers two distinct cases, both rendered identically:
- **No suggestions exist at all** (fresh/empty database, `All` selected).
- **A specific category filter matches nothing**, even though other categories have suggestions.

Empty state content (centered, stacked vertically):
- Gray line-art illustration (detective character with magnifying glass).
- Heading: `"There is no feedback yet."`
- Subtext: `"Try a different category or add a suggestion."`

**2.1.3 "Add Feedback" button**
- Located top-right of the top bar (purple pill button, "+" icon, label "Add Feedback").
- Clicking it navigates to the AddFeedback page (`/add-feedback`). No confirmation, no data loss risk (nothing to lose on Home).

### 2.2 AddFeedback Page (`/add-feedback`)

**Page header:**
- "Go Back" link (top-left, navigates to Home without submitting)
- Round purple "+" icon
- Heading: "Create New Feedback"

**Form fields** (in order):

| Field | Input type | Required | Label | Helper text |
|---|---|---|---|---|
| Title | text input | Yes | "Feedback Title" | "Add a short, descriptive headline" |
| Category | select dropdown | Yes | "Category" | "Choose a category for your feedback" |
| Description | textarea | Yes | "Feedback Detail" | "Include any specific comments on what should be improved, added, etc." |

Category dropdown options: `Feature`, `UI`, `UX`, `Enhancement`, `Bug` — no "All" option, no pre-selected default.

**Buttons** (in order):
- **Cancel** (dark navy) — navigates back to Home without submitting or saving anything.
- **Submit Feedback** (primary, purple) — validates and submits the form.

**Validation rules**

Validation runs client-side on submit attempt, and is re-enforced server-side. Each rule maps to an exact error message shown inline beneath the corresponding field:

| Field | Rule | Error message |
|---|---|---|
| Title | required (non-empty after trimming) | `"Title is required."` |
| Title | min length 2 | `"Title must be at least 2 characters."` |
| Title | max length 100 | `"Title must be 100 characters or fewer."` |
| Description | required (non-empty after trimming) | `"Description is required."` |
| Description | min length 5 | `"Description must be at least 5 characters."` |
| Description | max length 500 | `"Description must be 500 characters or fewer."` |
| Category | required | `"Please select a category."` |
| Category | must be one of the 5 allowed values | `"Category must be one of: UI, UX, Enhancement, Bug, Feature."` |

**Success flow**
1. `POST /add-one-suggestion` succeeds (`201`).
2. Frontend navigates back to the Home page.
3. The new suggestion appears in the list if it matches the currently active filter (or always, if `All` is active). Do NOT reset the filter to All.

**2.2.1 Validation rules**

Validation runs client-side on submit attempt, and is **re-enforced server-side** (the API must reject invalid payloads even if the client is bypassed — see [Section 4](#4-api-endpoints)). Each rule below maps to an exact error message shown inline beneath the corresponding field:

| Field | Rule | Error message |
|---|---|---|
| Title | required (non-empty after trimming whitespace) | `"Title is required."` |
| Title | min length 2 | `"Title must be at least 2 characters."` |
| Title | max length 100 | `"Title must be 100 characters or fewer."` |
| Description | required (non-empty after trimming whitespace) | `"Description is required."` |
| Description | min length 5 | `"Description must be at least 5 characters."` |
| Description | max length 500 | `"Description must be 500 characters or fewer."` |
| Category | required (must select one) | `"Please select a category."` |
| Category | must be one of the 5 allowed values | `"Category must be one of: UI, UX, Enhancement, Bug, Feature."` |

Behavior:
- Submission is blocked client-side if any rule fails — the API is not called.
- Multiple invalid fields show multiple inline errors simultaneously (not one at a time).
- If the API itself returns a `400` (e.g., a bypassed client), the returned field-specific error messages are displayed the same way.

**2.2.2 Success flow**
1. `POST /add-one-suggestion` succeeds (`201`).
2. Frontend navigates back to the Home page.
3. The new suggestion appears in the list if it matches the currently active filter (or always, if `All` is active).

---

## 3. Data Model

### `suggestions` table

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer (serial / auto-increment primary key) | Yes (system-generated) | Unique identifier |
| `title` | varchar(100) | Yes | 2–100 characters after trimming |
| `description` | text | Yes | 5–500 characters after trimming |
| `category` | varchar / enum | Yes | Must be one of the fixed allowed values below |
| `created_at` | timestamp with time zone | Yes (system-generated, default `now()`) | Used for newest-first sort; not user-editable |

**Fixed allowed `category` values** (exactly these 5, case-sensitive as written):
```
UI
UX
Enhancement
Bug
Feature
```
Enforce this as a DB-level `CHECK` constraint (or native enum type) in addition to API-level validation, so invalid data can never land in the table regardless of entry point.

No other fields exist in v1 — no `status`, `upvotes`, `comment_count`, `user_id`, or `updated_at` (nothing in scope mutates a suggestion after creation).

---

## 4. API Endpoints

All request/response bodies are JSON. All responses use `Content-Type: application/json`.

### 4.1 `GET /get-all-suggestions`

Returns every suggestion, newest first. No filtering — this always returns the full board.

**Success response — `200 OK`**
```json
{
  "suggestions": [
    {
      "id": 3,
      "title": "Add dark mode",
      "description": "It would be great to have a dark theme option in settings.",
      "category": "Feature",
      "createdAt": "2026-08-05T14:22:00.000Z"
    },
    {
      "id": 2,
      "title": "Fix button alignment on mobile",
      "description": "The submit button overlaps the footer on small screens.",
      "category": "Bug",
      "createdAt": "2026-08-04T09:10:00.000Z"
    }
  ]
}
```
An empty result set returns `200 OK` with `"suggestions": []` — this is not an error.

### 4.2 `GET /get-suggestions-by-category/:category`

Returns suggestions in a single category, newest first.

**Path parameters:**
| Param | Required | Notes |
|---|---|---|
| `category` | Yes | One of `UI`, `UX`, `Enhancement`, `Bug`, `Feature`. There is no `All` value for this route — the frontend calls `/get-all-suggestions` instead when the `All` pill is active. |

**Success response — `200 OK`**
Same shape as 4.1, filtered to the requested category. An empty result set returns `200 OK` with `"suggestions": []` — this is not an error.

**Error response — `400 Bad Request`** (invalid `:category` value, e.g. `/get-suggestions-by-category/Foo`)
```json
{
  "error": "Invalid category. Must be one of: UI, UX, Enhancement, Bug, Feature."
}
```

### 4.3 `POST /add-one-suggestion`

Creates a new suggestion.

**Request body**
```json
{
  "title": "Add dark mode",
  "description": "It would be great to have a dark theme option in settings.",
  "category": "Feature"
}
```

**Success response — `201 Created`**
```json
{
  "suggestion": {
    "id": 4,
    "title": "Add dark mode",
    "description": "It would be great to have a dark theme option in settings.",
    "category": "Feature",
    "createdAt": "2026-08-06T18:03:11.000Z"
  }
}
```

**Error response — `400 Bad Request`** (one or more validation failures; all failing fields are returned together, not just the first)
```json
{
  "errors": {
    "title": "Title must be at least 2 characters.",
    "category": "Please select a category."
  }
}
```
Each key in `errors` is a field name (`title`, `description`, and/or `category`); the value is the exact message from the [validation table in 2.2.1](#221-validation-rules). Only fields that actually failed are present.

---

## 5. Tech Stack & Deployment Targets

| Layer | Technology | Hosting |
|---|---|---|
| Database | PostgreSQL | Neon (managed Postgres) |
| API | Node.js + Express, REST/JSON | Render |
| Frontend | React | Netlify |

- Frontend talks to the API over HTTPS using a base URL supplied via a frontend environment variable (e.g. `REACT_APP_API_URL`), so the same build can point at local, staging, or production API URLs.
- API connects to Neon via a `DATABASE_URL` connection string supplied through Render environment variables — no credentials committed to source control.
- CORS on the Express API must allow the deployed Netlify origin.
- No authentication layer, so no session/token infrastructure is needed anywhere in this stack for v1.

---

## 6. Design Reference

Live reference (currently showing the empty state):
**https://product-feedback-app-2025.netlify.app/**

### Home page layout (empty state)

**Overall structure**: two-column layout — left sidebar + right main panel, side by side on desktop, on a full-bleed light gray/lavender page background.

**Left sidebar** (fixed width, ~320px), two stacked cards with a visible gap:

1. **Header card** (top)
   - Rounded corners, diagonal gradient background: blue (top-left) → purple (middle) → pink/coral (bottom-right).
   - White bold text, two lines: large heading `"My Company"`, smaller lighter-weight subtext `"Feedback Board"` below it.
   - Generous padding, left-aligned text, ~130px tall.

2. **Category filter card** (below header card)
   - White background, rounded corners, padding around a pill-button grid.
   - Pills wrap in rows (~3 per row on desktop, ~12px gap): Row 1 — `All` (active), `UI`, `UX`; Row 2 — `Enhancement`, `Bug`; Row 3 — `Feature`.
   - Active pill: solid indigo/blue background, white text. Inactive pills: very light lavender background, indigo text.
   - Pills are fully rounded (capsule shape), sized to fit their label (not full width).

**Right main panel** (fills remaining width):

1. **Top bar** — dark navy rounded rectangle, full width of the column.
   - Left: white bold text, e.g. `"0 Suggestions"`.
   - Right: solid purple/violet rounded pill button, "+" icon, label `"Add Feedback"`.
   - Generous vertical padding; sits above the content card with a visible gap.

2. **Content card** (below top bar) — white background, rounded corners, large, fills remaining vertical space.
   - **Empty state**, centered both horizontally and vertically: gray line-art detective character (round head, hat, magnifying glass) → bold dark navy heading `"There is no feedback yet."` → smaller gray/muted subtext `"Try a different category or add a suggestion."` — all stacked and center-aligned.
   - This same card structure holds a list of suggestion cards instead of the illustration once suggestions exist (see [Section 2.1](#21-home-page-)).

**Exact color palette (from Design System file):**
| Role | Hex |
|---|---|
| Primary accent / Submit Feedback button | `#AD1FEA` |
| Secondary blue accent | `#4661E6` |
| Top bar background / Cancel button | `#373F68` |
| Inactive pill background | `#F2F4FF` |
| Additional accent (dark navy variant) | `#3A4374` |
| Additional accent (muted blue-gray) | `#647196` |
| Additional accent (coral) | `#F49F85` |
| Additional accent (sky blue) | `#62BCFA` |

**Typography:** Jost (all weights — Regular, Semibold, Bold used across headings and body text)

**Responsive behavior (from Mobile & Tablet mockups):**
- On mobile and tablet widths, the sidebar (header card + category filter card) stacks ABOVE the content card, full width — not side-by-side as on desktop.
- Category pills wrap onto multiple rows as needed at all widths.
- AddFeedback page on mobile/tablet: "Go Back" link top-left, round "+" icon, "Create New Feedback" heading, fields stacked full-width, Cancel and Submit Feedback buttons stacked or side-by-side near the bottom.

**Spacing / structure**
- Visible gutter/gap between sidebar and main panel (not flush).
- Sidebar cards and the main content card share the same corner radius (~12–16px).
- Top bar and content card are separate elements with a visible gap between them (not one continuous block).

### AddFeedback page
No design mockup was provided for this page. Build it consistent with the Home page's visual language (same color palette, corner radii, card style, fonts) since no reference exists — treat the exact layout as an implementation detail, not a spec requirement.

---

## 7. Out of Scope

The following are explicitly **not** built in v1:

- Upvoting / voting on suggestions
- Comments or replies on suggestions
- Editing an existing suggestion
- Deleting a suggestion
- User accounts, authentication, or authorization (all data is public, anyone can post)
- A "status" field or roadmap page (e.g. Planned / In-Progress / Live) — the classic Frontend Mentor version of this app has a roadmap; this version does not
- Sorting controls (e.g. "Most Upvotes") beyond the fixed newest-first order
- Search
- Pagination / infinite scroll (all suggestions load at once)
- Suggestion detail page (no `GET /get-suggestion-by-id/:id`, no click-through)
- Admin panel or moderation tools
- Email or push notifications
- Rate limiting / spam protection on submission

