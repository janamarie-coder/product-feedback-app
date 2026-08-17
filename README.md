# Product Feedback App

A simple product feedback board where customers can view existing suggestions, filter them by category, and submit new feedback. Built as a learning project focused on working through a full-stack app in structured, AI-assisted stages — from spec to deployment.

**Live app:** https://product-feedback-app-jana.netlify.app
**Live API:** https://product-feedback-app-kbc1.onrender.com

---

## What it does

- **Home page** — view all submitted suggestions, filter them by category (`UI`, `UX`, `Enhancement`, `Bug`, `Feature`), and see a friendly empty state when a filter has no matches.
- **Add Feedback page** — submit a new suggestion with a title, category, and description, with both client-side and server-side validation.

Out of scope for this version: upvoting, comments, editing, deleting, and user accounts.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js, Express |
| Database | PostgreSQL, hosted on [Neon](https://neon.tech) |
| Frontend hosting | [Netlify](https://netlify.com) |
| Backend hosting | [Render](https://render.com) |

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/get-all-suggestions` | Returns all suggestions, newest first |
| `GET` | `/get-suggestions-by-category/:category` | Returns suggestions filtered by category |
| `POST` | `/add-one-suggestion` | Creates a new suggestion |

Full request/response shapes and validation rules are documented in [`PRD.md`](./PRD.md).

---

## Running this locally

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)

### 1. Clone and install

```bash
git clone https://github.com/janamarie-coder/product-feedback-app.git
cd product-feedback-app
```

Install dependencies for both the client and server:

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Set up the database

Run the schema and seed files against your own Postgres database:

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
psql "$DATABASE_URL" -f server/db/seed.sql
```

(Or paste the contents of both files into your database provider's SQL editor, e.g. Neon's SQL Editor.)

### 3. Environment variables

**Server** — copy the example file and fill in your real database connection string:

```bash
cd server
cp .env.example .env
```

`server/.env`:
```
DATABASE_URL=your-real-postgres-connection-string
PORT=3001
```

**Client** — copy the example file:

```bash
cd client
cp .env.example .env
```

`client/.env`:
```
VITE_API_URL=http://localhost:3001
```

### 4. Run both halves

In one terminal:
```bash
cd server
npm run dev
```

In another terminal:
```bash
cd client
npm run dev
```

The app will be running at `http://localhost:5173`, talking to the API at `http://localhost:3001`.

---

## Project structure

```
product-feedback-app/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── pages/        # HomePage, AddFeedbackPage
│       └── constants.js  # API base URL config
├── server/
│   ├── controllers/      # Route handler logic
│   ├── routes/            # Express route definitions
│   ├── db/                 # schema.sql, seed.sql, connection pool
│   └── index.js            # Express app entry point
├── PRD.md                # Full product requirements document
└── TESTING_EVIDENCE.md   # Manual + edge-case testing results
```

---

## AI usage log

This project was built in structured stages, feeding an AI coding agent one scoped piece of the spec at a time rather than the whole plan at once — the goal being fewer bugs by leaving less for the agent to guess.

| Milestone | What AI was used for |
|---|---|
| 1 — PRD | Generated the initial product requirements document (pages, data model, API contract, validation rules) from a project description. Caught and corrected a mismatch between the AI's invented API route names and the assignment's required routes during manual review. |
| 2 — Scaffold | Generated the client/server folder structure and initial `package.json` files. |
| 3 — PRD review | Manual re-read of the full PRD (no AI) to catch inconsistencies before building — this pass caught a leftover whitespace-handling ambiguity that carried into Milestone 4a. |
| 4a — Database | Generated the SQL schema and seed data from the PRD's data model, with reasoning for each column's type explained back for review. Caught a whitespace-trimming inconsistency between the schema's validation and storage behavior. |
| 4b — API | Built the three Express endpoints against the deployed schema, with server-side validation and trimming. Verified all 6 test cases manually in Postman rather than trusting the agent's self-report. |
| 4c — Frontend | Built the Home and AddFeedback pages from the PRD and Figma designs (including mobile/tablet mockups and the exact design system color palette), wired to the live API. |
| 5 — Testing | Ran 20 manual and edge-case tests against the live app, uncovering two real bugs (filter state resetting on navigation, and long unbroken strings breaking layout) — documented in `TESTING_EVIDENCE.md`. |
| 6 — Backend fixes | No backend bugs were found during Milestone 5 testing — all API tests passed. |
| 7 — UI fixes | Fixed both bugs found in Milestone 5: lifted filter state above the page component so it survives navigation, and added `overflow-wrap` CSS to prevent long strings from breaking the layout. Verified both fixes against the original repro steps. |
| 8 — Accessibility & security | Ran Lighthouse accessibility audits, which flagged a heading-order violation and a missing `<main>` landmark. Fixed both; accessibility score reached 100/100 on re-test. Confirmed no secrets were ever committed to git history, and that CORS, input validation, and parameterized queries were already in place from earlier milestones. |
| 9 — Deployment | Deployed backend to Render and frontend to Netlify. Diagnosed and fixed a production-only bug where the frontend was still calling `localhost` instead of the deployed API, by moving the API base URL to an environment variable. Restricted CORS from wide-open to an explicit allowlist of the real deployed origin. |
| 10 — README | This file. |

Every bug found during this project traced back to a gap or ambiguity in the spec itself, not to the AI inventing something ungrounded — the recurring lesson was that a more precise PRD, reread critically before each build step, produces measurably fewer bugs than prompting alone.
