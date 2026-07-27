# Build Guide — Milestone 3 Remainder + Milestone 4

Guide for an AI coding agent working in `Collectors-Corner-0/WEB103_Final_Collectors_Corner`.

Work through phases in order. Each phase ends with acceptance criteria that must pass before starting the next. Commit at the end of each phase. Do not batch multiple phases into one commit.

---

## Context

Collector's Corner is a CodePath WEB103 final project: users catalogue media (books, films, music, and more) into personal libraries, organize entries with custom tags, and browse other users' collections.

It is graded against a fixed rubric. Prefer the simplest implementation that satisfies it. This is a proof of concept, not a production product.

### Current state

- `WEB103_final/` holds a Vite + React app with no router and no API calls. `src/App.jsx` renders hardcoded mock data.
- `src/components/MediaCard.jsx` exists and works against mock props.
- `WEB103_final/package.json` declares scripts `server` and `db:reset` pointing at `server/index.js` and `server/db/reset.js`. **Neither file exists.** Those scripts are aspirational and will be replaced.
- `express`, `pg`, and `dotenv` are dependencies already. `react-router-dom`, `cors`, and `nodemon` are missing.
- No database code exists anywhere in the repo.

### Reference documents in this repo

- `planning/entity_relationship_diagram.md` — schema, with deviations listed below
- `planning/technical_specification.md` — API surface and validation intent, with deviations listed below
- `planning/user_stories.md` — intended behaviors
- `milestones/milestone5.md` — the grading checklist

---

## Deviations from the planning documents

The planning docs were written before the team reviewed the course labs. **Where this guide conflicts with them, follow this guide.** Do not edit the planning docs to match; note discrepancies in commit messages instead.

| Topic | Planning docs say | Build this instead | Why |
|---|---|---|---|
| Primary keys | `UUID` | `serial` | No Postgres extension needed; matches course labs |
| Auth | email + `password_hash` + `connect-pg-simple` | GitHub OAuth via Passport | This is what the rubric names and the Unit 8 lab teaches |
| `users` columns | `email`, `password_hash`, `role` | `githubid`, `username`, `avatarurl`, `accesstoken`, `role` | Follows from OAuth |
| Roles | visitor / collector / creator / curator | `collector` and `creator` only | Four permission paths cost more than the single rubric point is worth |
| Migrations | node-pg-migrate / Knex / Drizzle | `reset.js` only | The rubric asks for a reset script, nothing more |
| Cover images | Cloudinary upload | Plain text URL column | Out of scope for this milestone |
| Error shape | nested object with `code` and `details[]` | flat `{ "error": "message" }` | Simpler and sufficient |

### Schema corrections

- Add `creator TEXT` to `media` — the author, artist, or director. The ERD omits it but `MediaCard` already renders it.
- `rating` lives on `library_entries`, not `media`. A rating is one user's opinion of an item, not a property of the item.

---

## Phase 1 — Restructure into `client/` and `server/`

Unit 9 deploys these as two separate Render services with different root directories, so they must be independent packages.

1. `git mv WEB103_final client`
2. Create a new `server/` directory at the repo root.
3. In `client/package.json`: remove `express`, `pg`, and `dotenv` from dependencies; remove the `server` and `db:reset` scripts. Add `react-router-dom`.
4. Create `server/package.json` as its own package with `"type": "module"`, dependencies `express`, `cors`, `pg`, `dotenv`, `nodemon`, and scripts `start` and `reset`.
5. Add a Vite dev proxy in `client/vite.config.js` mapping `/api` to `http://localhost:3001`.

Use `git mv` rather than delete-and-recreate so file history survives.

**Acceptance**
- `cd client && npm install && npm run dev` serves the existing UI unchanged
- `cd server && npm install` succeeds
- Repo root contains `client/`, `server/`, `planning/`, `milestones/`, `Feature_Gifs/`

---

## Phase 2 — Database layer and reset script

Closes issues #1 (Create tables using SQL) and #2 (Seed SQL Tables).

Create:

- `server/config/dotenv.js` — loads `.env`
- `server/config/database.js` — exports a `pg` connection pool
- `server/config/data/media.json` — seed catalog
- `server/config/data/users.json` — seed users
- `server/config/reset.js` — the reset script

`reset.js` structure:

- `dropAllTables()` drops every table in reverse-dependency order: `library_entry_tags`, `library_entries`, `tags`, `media`, `user_profiles`, `users`
- One `create<Table>Table()` function per table, in dependency order
- `seedUsersTable()` and `seedMediaTable()` reading from the JSON files
- A single `resetDatabase()` that `await`s each step in sequence, called on the last line

Tables, all with `serial` primary keys named `id`:

**users** — `githubid int`, `username varchar(100) NOT NULL`, `avatarurl text`, `accesstoken varchar(500)`, `role varchar(20) NOT NULL DEFAULT 'collector'` with a CHECK constraint allowing `collector` and `creator`, `created_at timestamp DEFAULT now()`

**user_profiles** — `user_id int PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE` (primary key and foreign key on the same column is what makes this one-to-one), `display_name text`, `bio text`, `favorite_genres text`, `updated_at timestamp DEFAULT now()`

**media** — `created_by_user_id int REFERENCES users(id)`, `title varchar(200) NOT NULL`, `creator varchar(200)`, `media_type varchar(50) NOT NULL` with a CHECK constraint allowing `book`, `movie`, `music`, `podcast`, `video`, `magazine`, `audiobook`, `description text`, `cover_image_url text`, `external_link text`, `is_user_created boolean NOT NULL DEFAULT false`, `created_at timestamp DEFAULT now()`

**library_entries** — `user_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `media_id int NOT NULL REFERENCES media(id) ON DELETE CASCADE`, `status varchar(20) NOT NULL DEFAULT 'planned'` with a CHECK constraint allowing `planned`, `in_progress`, `completed`, `archived`, `rating int` with a CHECK constraint of 1 through 5 or null, `personal_notes text`, `date_acquired date`, `created_at timestamp DEFAULT now()`, plus `UNIQUE (user_id, media_id)`

**tags** — `user_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `name varchar(50) NOT NULL`, `color varchar(20)`, `created_at timestamp DEFAULT now()`, plus `UNIQUE (user_id, name)`

**library_entry_tags** — `library_entry_id int REFERENCES library_entries(id) ON DELETE CASCADE`, `tag_id int REFERENCES tags(id) ON DELETE CASCADE`, `position int NOT NULL DEFAULT 0`, `created_at timestamp DEFAULT now()`, composite primary key on `(library_entry_id, tag_id)`

The `position` column is deliberate: the rubric awards a point for a join table carrying a field beyond its two foreign keys.

Seed data: at least three users, and at least fifteen media rows spanning every allowed `media_type`. Use real titles and working cover image URLs — these appear in demo GIFs.

Also create `server/.env.example` listing `PGDATABASE`, `PGHOST`, `PGPASSWORD`, `PGPORT`, `PGUSER`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`, all with empty values. Never commit a real `.env`.

**Acceptance**
- `cd server && npm run reset` completes with no error
- Running it a second time also completes with no foreign-key error
- Every table exists and `media` and `users` hold the seeded rows

---

## Phase 3 — Express server and REST API

Create `server/server.js` with `express.json()`, `cors()`, a `GET /` health route, and `app.listen` on `process.env.PORT || 3001`.

Then one controller and one route file per resource, mounted under `/api`.

**`media`** — `GET /api/media` (supports optional `?media_type=` and `?search=` query filters), `GET /api/media/:id`, `POST /api/media`, `PATCH /api/media/:id`, `DELETE /api/media/:id`

**`library_entries`** — `GET /api/library/:userId`, `GET /api/library/entry/:id`, `POST /api/library`, `PATCH /api/library/:id`, `DELETE /api/library/:id`

This is the full-CRUD entity the rubric requires. All four verbs must work.

**`tags`** — `GET /api/tags/:userId`, `POST /api/tags`, `PATCH /api/tags/:id`, `DELETE /api/tags/:id`

**tag assignment** — `POST /api/library/:entryId/tags/:tagId`, `DELETE /api/library/:entryId/tags/:tagId`

**`users`** — `GET /api/users`, `GET /api/users/:id` (returns profile plus library entry count)

Conventions:
- Controllers hold query logic and export an object of handlers; route files only map URLs to handlers
- Every handler wraps its work in `try`/`catch`
- Status codes: 200 read and update, 201 create, 400 validation failure, 404 missing record, 409 conflict
- Errors respond `{ "error": "human readable message" }`

Validation, running **before** any database write:
- `POST /api/media` requires a non-empty `title` and a `media_type` within the allowed set
- `POST /api/library` requires `user_id` and `media_id`; rating, when present, must be an integer from 1 to 5; status must be within the allowed set
- `POST /api/tags` requires a non-empty `name` under 50 characters
- Duplicate inserts violating a UNIQUE constraint return 409 with a clear message, not a raw Postgres error

**Acceptance**
- Server starts on port 3001 and `GET /` responds
- Every endpoint returns correct data via curl or Postman
- `POST /api/media` with a missing title returns 400 and a readable message
- `POST /api/library` with a duplicate user and media pair returns 409

---

## Phase 4 — Frontend routing and browse view

Closes issue #7 (Browse Collections).

Add React Router to `client/src/main.jsx` and rebuild `App.jsx` around `useRoutes`.

Routes:
- `/` — browse all media in the catalog
- `/media/:id` — detail view for one media item
- `/collections` — list of all users with public collections
- `/collections/:userId` — one user's library entries
- `/library/:entryId/edit` — edit form for a library entry

`/media/:id` and `/collections/:userId` are the dynamic routes the rubric requires.

Structure:
- Route-level components in `client/src/pages/`
- Reusable components in `client/src/components/`
- One `API_URL` constant defined in `App.jsx` and passed down as props, so only one line changes at deploy time
- `fetch` with `async`/`await`; do not add axios

Replace all hardcoded mock data in `App.jsx` with real fetches. Keep `MediaCard` but adapt its props to the real schema: `title`, `creator`, `media_type`, `cover_image_url`, `external_link`.

Until Phase 7 lands auth, hardcode a `currentUserId` constant in `App.jsx` pointing at a seeded user, with a comment marking it as temporary.

Async behavior, applied consistently from the first component onward:
- Show a loading indicator while a request is in flight
- Disable submit buttons during submission
- Display a readable message on failure

Build this as one shared pattern now. Retrofitting it later means touching every component.

**Acceptance**
- Home page lists seeded media fetched from the API
- Clicking a card navigates to `/media/:id` and shows that item's detail
- `/collections` lists users; clicking one shows that user's library entries
- Direct URL entry works for every route, including a page refresh

---

## Phase 5 — Add and edit custom media

Closes issue #3 (Add Custom Media).

Build an "Add Media" form inside a modal or slide-out panel — modal presentation is itself a rubric point.

- Fields: title, creator, media type dropdown, description, cover image URL, external link
- Client-side validation mirroring the server rules, with errors shown inline next to the offending field
- Submit posts to `POST /api/media` with `is_user_created` true
- On success, close the modal and refresh the list without a full page reload
- On failure, keep the modal open and display the server's error message

Add an edit form for library entries at `/library/:entryId/edit` covering status, rating, personal notes, and date acquired, submitting via `PATCH`. Include a delete action with a confirmation step.

**Acceptance**
- Submitting the form creates a media row that appears in the list immediately
- Submitting with an empty title shows a validation error and writes nothing
- Editing a library entry persists across a page refresh
- Deleting a library entry removes it from the database

---

## Phase 6 — Tags and filtering

Closes issues #9 (Custom Tags), #8 (Filter Collections), and #5 (Sort Media).

- A tag manager UI: create, rename, recolor, delete
- Tag assignment on a library entry, writing through `library_entry_tags`
- Filter controls on the collection view: by tag, by media type, and by status
- A sort control: by title, by date added, and by rating

Filtering and sorting must update results **without a page navigation** — this is the rubric's same-page interaction requirement.

**Acceptance**
- A user can create a tag and apply it to a library entry
- Selecting a tag filters the visible entries with no page reload
- Changing the sort order reorders entries with no page reload
- Applied tags survive a page refresh

---

## Phase 7 — GitHub OAuth

Closes issue #10 (Access Control). Follow the Unit 8 lab pattern.

- `npm install passport passport-github2 express-session` in `server/`
- `server/config/auth.js` configuring the GitHub strategy, with a `verify` function that looks up the user by `username` and inserts a new row when absent
- Session middleware, `passport.initialize()`, `passport.session()`, `serializeUser`, `deserializeUser` in `server.js`
- CORS updated with an explicit `origin` and `credentials: true`
- `server/routes/auth.js` with `/login/success`, `/login/failed`, `/logout`, `/github`, `/github/callback`
- A `Login` page on the client, plus a header avatar and logout button
- Route guards: unauthenticated visitors can browse the catalog and public collections, but library and tag mutations require login
- Ownership checks server-side: a user may only mutate their own library entries and tags
- Replace the temporary `currentUserId` constant from Phase 4 with the session user

Note that the `credentials` setting appears in three places — the CORS config, the get-user fetch, and the logout fetch. Missing any one causes login to fail silently.

**Acceptance**
- Login via GitHub redirects back authenticated with the avatar visible
- Logout clears the session and returns to a logged-out view
- An unauthenticated request to mutate a library entry returns 401
- A logged-in user cannot edit another user's entries

---

## Phase 8 — Documentation updates

Do **not** write reflection answers or completion percentages. Those are the team's to fill in.

1. In `README.md`, add a ✅ before the name of each completed feature and embed its GIF beneath from `Feature_Gifs/`. Leave `[gif goes here]` under features that are not done.
2. In `milestones/milestone3.md`, tick the checklist boxes for tasks now verifiably complete and fill in the issue-title and milestone-name lists. Leave the five Reflection answers untouched.
3. In `milestones/milestone4.md`, tick the boxes for verifiably complete tasks. Leave the Reflection section untouched.
4. Create `milestones/progress_report_4.md` from the template in the course portal, filling in every issue closed this unit alongside the file or folder holding that work. Leave the completion percentage blank for the team.

**Acceptance**
- README GIF paths resolve when viewed on GitHub
- No reflection text has been generated
- `progress_report_4.md` lists issues with accurate file paths

---

## Before deploying (Phase 9) — env vars to set

The four hardcoded-`localhost` values flagged by Copilot's PR review on #13 are now env-driven, each falling back to its local-dev value when unset — so nothing changes for local dev, but these three env vars need real values once actually deployed:

1. `VITE_SERVER_URL` (client build-time env var) — the deployed API's base URL. Falls back to `http://localhost:3001`.
2. `GITHUB_CALLBACK_URL` (server) — must exactly match the deployed domain's `/auth/github/callback` path, **and** the GitHub OAuth App's own registered callback URL must be updated to match. This is the exact class of bug that caused the "redirect_uri is not associated with this application" error during Phase 7 testing — a mismatch here fails the same way in production. Falls back to `http://localhost:3001/auth/github/callback`.
3. `CLIENT_URL` (server) — the deployed client's origin. Used both for the post-login redirect (`server/routes/auth.js`) and the CORS `origin` (`server/server.js`), so they can't drift apart. Falls back to `http://localhost:5173`.

---

## Guardrails

- Never modify files in `planning/`. They are graded historical artifacts.
- Never write reflection answers or completion percentages in `milestones/`.
- Never commit `.env` or credentials. Add new variables to `.env.example` instead.
- Do not add TypeScript, an ORM, a migration framework, a component library, a state management library, or a test framework.
- Do not refactor code unrelated to the current phase.
- Create tables only in `reset.js`. Never create a table from a controller.
- When a required detail is missing, choose the simplest reasonable option and state the assumption in the commit message rather than pausing.
- Commit at the end of each phase with a message naming the phase and the issues it closes.
