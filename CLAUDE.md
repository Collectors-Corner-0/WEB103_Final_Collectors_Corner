# CLAUDE.md

Standing conventions for this repository. Phase plans for current milestone work live in `BUILD_GUIDE.md` — read that file when asked to work on a numbered phase.

## Project

Collector's Corner is a CodePath WEB103 final project: users catalogue media (books, films, music, and more) into personal libraries, organize entries with custom tags, and browse other users' collections.

It is graded against a fixed rubric in `milestones/milestone5.md`. Prefer the simplest implementation that satisfies it. This is a proof of concept, not a production product.

## Stack

- Frontend: React with Vite, React Router, plain CSS
- Backend: Node.js with Express
- Database: PostgreSQL via the `pg` package, using a connection pool
- Auth: Passport with the GitHub OAuth strategy and `express-session`
- Deployment: Render, as two separate services

Do not add TypeScript, an ORM, a migration framework, a component library, a state management library, or a test framework.

## Layout

```
client/          React + Vite app (own package.json)
  src/
    components/  reusable presentational components
    pages/       route-level components
server/          Express API (own package.json)
  config/        database.js, dotenv.js, reset.js, data/
  controllers/   one file per resource, query logic only
  routes/        one file per resource, Express routers only
  server.js      entry point, middleware, route mounting
planning/        design docs — never modify
milestones/      graded course deliverables — see rules below
Feature_Gifs/    demo GIFs referenced by README
```

Until Phase 1 of `BUILD_GUIDE.md` runs, frontend code still lives in `WEB103_final/`.

## Planning docs are outdated in specific ways

The documents in `planning/` were written before the team reviewed the course labs. Follow these decisions instead:

- `serial` primary keys, not UUID
- GitHub OAuth, not email and password — `users` carries `githubid`, `username`, `avatarurl`, `accesstoken`, `role`
- Two roles only: `collector` and `creator`
- `reset.js` is the only schema tool; no migration framework
- Cover images are plain text URLs; no Cloudinary
- Errors respond with a flat `{ "error": "message" }`
- `media` includes a `creator` column (author, artist, or director) that the ERD omits
- `rating` belongs to `library_entries`, not `media`

Never edit `planning/` to match. Note discrepancies in commit messages.

## Conventions

**Database**
- `serial` primary keys named `id`; `snake_case` everywhere
- Plural table names; join tables name both sides, e.g. `library_entry_tags`
- All schema creation lives in `server/config/reset.js` and nowhere else — never create a table from a controller
- `reset.js` drops tables in reverse-dependency order, then recreates them, awaiting every step inside one `resetDatabase()` function

**API**
- All routes mount under `/api`
- One controller file and one route file per resource, matching names
- Controllers export an object of handlers; route files only map URLs to handlers
- Every handler wraps its work in `try`/`catch`
- Status codes: 200 read and update, 201 create, 400 validation failure, 404 missing record, 409 conflict
- Validate before any database write; never let a raw Postgres error reach the client

**Frontend**
- Route-level components in `pages/`, reusable components in `components/`
- One `API_URL` constant defined in `App.jsx`, passed down as props, so only one line changes at deploy time
- `fetch` with `async`/`await`; no axios
- Every async action shows a loading state, disables its submit button while in flight, and surfaces failures to the user

## Rubric constraints

- The database must reset to a seeded default state via one command
- One-to-one (`users` ↔ `user_profiles`), one-to-many, and many-to-many (through `library_entry_tags`) must all exist
- `library_entry_tags` carries a `position` column beyond its two foreign keys
- `library_entries` supports the full set of GET, POST, PATCH, and DELETE
- At least one navigation to a new URL, and at least one interaction completed without leaving the page
- At least two dynamic routes

## Working rules

- Never commit `.env` or credentials; add new variables to `.env.example`
- Never modify `planning/`
- In `milestones/`, tick checklist boxes for verifiably complete work only. Never write reflection answers or completion percentages — those belong to the team
- Keep changes scoped to the current task; do not refactor unrelated files
- When a required detail is missing, choose the simplest reasonable option and state the assumption in the commit message rather than pausing
