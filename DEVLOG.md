# Development Log

### 2026-07-24 — Phase 2 — Database layer and reset script

**Issues addressed:** #1 (Create tables using SQL), #2 (Seed SQL Tables)

**Files created:**

- `server/config/dotenv.js` — loads `.env` via `dotenv/config` side effect
- `server/config/database.js` — exports a `pg.Pool()`; no explicit config object, since `pg` reads `PGHOST`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`/`PGPORT` from the environment natively
- `server/config/reset.js` — `dropAllTables()`, one `create<Table>Table()` per table in dependency order, `seedUsersTable()`, `seedMediaTable()`, and `resetDatabase()` awaiting each step in sequence
- `server/config/data/users.json` — 3 seed users (2 `collector`, 1 `creator`)
- `server/config/data/media.json` — 15 seed media rows spanning all 7 `media_type` values
- `server/.env` — local-only Postgres connection details for a dev database (`collectors_corner_dev`); gitignored via the existing `.env` pattern, never committed

**Files modified:** none — Phase 2 only adds files under `server/config/`

**Decisions and rationale:**

- Followed `BUILD_GUIDE.md`'s Phase 2 table specs literally over `planning/entity_relationship_diagram.md`, which still uses UUID primary keys, a 4-role `users.role` enum, `email`/`password_hash` auth columns, `updated_at` on every table, and omits `media.creator` and `library_entry_tags.position`. Per `CLAUDE.md`, the guide wins; the ERD was not edited.
- Seed data sources were chosen to be keyless (no API key required) and were verified live via `curl` before being written to the JSON files, rather than trusted from memory: Open Library Covers API (books + the audiobook, reusing book cover art — a common real-world pattern), Wikipedia's REST summary API (movies, music, podcasts, magazine — each match confirmed by the returned title/description before use), and the YouTube thumbnail CDN for the two `video` entries (video IDs confirmed via YouTube's oEmbed endpoint before use, since the thumbnail CDN returns 200 even for placeholder/invalid IDs).
- `accesstoken` is seeded `null` for all three users — they're fixture data, not real OAuth sessions, so there's no real token to store.
- Started a local PostgreSQL 18 (Homebrew) server and created a `collectors_corner_dev` database to run and verify `npm run reset` against, since no `.env` or reachable database existed yet in `server/`.

**Assumptions:** none beyond the above — all table shapes and constraints came directly from `BUILD_GUIDE.md`'s explicit column lists.

**Not done:** `user_profiles`, `library_entries`, `tags`, and `library_entry_tags` are created but not seeded — `BUILD_GUIDE.md`'s Phase 2 only specifies `seedUsersTable()` and `seedMediaTable()`, so seeding the other four tables is left for whichever later phase populates them through the API.

**Verification:**

- `cd server && npm run reset` — first run completed cleanly (`Database reset complete.`)
- `cd server && npm run reset` — second consecutive run also completed cleanly, no foreign-key errors
- `psql collectors_corner_dev -c "SELECT COUNT(*) FROM users;"` → 3
- `psql collectors_corner_dev -c "SELECT COUNT(*) FROM media;"` → 15
- `psql collectors_corner_dev -c "SELECT media_type, COUNT(*) FROM media GROUP BY media_type;"` → all 7 types present (book 3, movie 3, music 3, podcast 2, video 2, magazine 1, audiobook 1)
- `psql collectors_corner_dev -c "\d library_entry_tags"` → confirmed composite PK, both FKs, and the `position` column

### 2026-07-24 — Phase 3 (partial) — Express server, `media` and `library_entries`

**Issues addressed:** part of #3/#4 groundwork (Add Custom Media, full-CRUD library entries) — the API layer only; frontend wiring is later phases

**Files created:**

- `server/server.js` — `express.json()`, `cors()`, `GET /` health route, mounts `/api/media` and `/api/library`, listens on `process.env.PORT || 3001`
- `server/controllers/mediaController.js` — `getAllMedia`, `getMediaById`, `createMedia`, `updateMedia`, `deleteMedia`
- `server/routes/media.js` — maps `/api/media` URLs to the controller, no logic
- `server/controllers/libraryEntriesController.js` — `getEntriesByUser`, `getEntryById`, `createEntry`, `updateEntry`, `deleteEntry`
- `server/routes/libraryEntries.js` — maps `/api/library` URLs to the controller; `/entry/:id` registered before `/:userId` so Express doesn't match `entry` as a `userId`

**Files modified:** none

**Decisions and rationale:**

- Scope was explicitly narrowed to `media` and `library_entries` only — `BUILD_GUIDE.md`'s full Phase 3 also specifies `tags`, tag-assignment, and `users`, but tags are deferred to Phase 6 and `users` wasn't requested this pass. Neither `server/controllers/tagsController.js` nor a `users` resource exists yet; this is a deliberate scope cut, not an oversight.
- Success responses return raw JSON (`res.json(row)` / `res.json(rows)`), no envelope — the guide only mandates the error shape, not a success shape.
- `GET /api/library/:userId` and `GET /api/library/entry/:id` JOIN `media` and include `title`/`creator`/`media_type`/`cover_image_url`/`external_link` alongside entry fields, so the future collection view and edit form don't need a second fetch per entry.
- Postgres errors are translated, never forwarded: `23505` (unique_violation) → 409, `23503` (foreign_key_violation) → 400, anything else → 500 with a generic message.
- `PATCH /api/library/:id` only accepts `status`, `rating`, `personal_notes`, `date_acquired` — not `user_id`/`media_id`, which define the entry's identity and the `UNIQUE(user_id, media_id)` pair.
- `media` has no `UNIQUE` constraint in the Phase 2 schema, so it has no legitimate 409 case; only `library_entries` demonstrates one, confirmed with the user rather than inventing a uniqueness rule not in the guide.

**Assumptions:** none beyond the above — validation rules came directly from `BUILD_GUIDE.md`'s Phase 3 spec.

**Not done:** `tags`, tag-assignment endpoints, and the `users` resource — out of scope for this pass per explicit instruction (tags land in Phase 6).

**Verification:**

- `cd server && npm start` → `Server listening on port 3001`; `GET /` → `{"status":"ok"}`
- `media`: GET all, GET by `media_type`, GET by `search`, GET by id, POST (201), POST missing title (400 `"title is required."`), PATCH, DELETE (200), DELETE again on the same id (404) — all confirmed via curl with matching status codes and flat `{"error": "..."}` bodies
- `library_entries`: GET by user (empty, then populated with joined media fields), GET nonexistent entry (404), POST (201), POST invalid rating (400), POST duplicate `(user_id, media_id)` (409 `"This media is already in that user's library."`), PATCH (200), PATCH invalid status (400), DELETE (200), DELETE again (404) — all confirmed via curl
- `cd server && npm run reset` re-run afterward to restore the clean seed state (verified `media` = 15, `library_entries` = 0)

### 2026-07-24 — Phase 4 — Frontend routing and browse view (+ finishing the `users` resource)

**Issues addressed:** #7 (Browse Collections); also closes out the `users` piece of Phase 3's groundwork that was deferred

**Files created:**

- `server/controllers/usersController.js` — `getAllUsers`, `getUserById` (profile LEFT JOIN `user_profiles` + `library_entries` COUNT)
- `server/routes/users.js` — maps `/api/users` URLs to the controller
- `client/src/hooks/useFetch.js` — shared `{ data, loading, error }` fetch-on-mount hook, used by every page below
- `client/src/pages/Browse.jsx` (`/`), `MediaDetail.jsx` (`/media/:id`), `Collections.jsx` (`/collections`), `UserCollection.jsx` (`/collections/:userId`), `LibraryEntryEdit.jsx` (`/library/:entryId/edit`)

**Files modified:**

- `server/server.js` — mounts `app.use('/api/users', usersRouter)`
- `client/src/main.jsx` — now only wraps `<App />` in `<BrowserRouter>`; dropped the unused `Routes`/`Route`/`Header`/`NotFound` imports and the dead `StrictMode` import
- `client/src/App.jsx` — rebuilt around `useRoutes`; owns the one `API_URL` constant (`http://localhost:3001/api`) and `currentUserId` (hardcoded `1`, commented as temporary until Phase 7), both passed down as props; all hardcoded mock data removed
- `client/src/components/Header.jsx` — no longer a nested-route layout with `<Outlet/>`; now a plain nav `App` renders directly; dropped the dead unresolved `react-router-hash-link` import (flagged in Phase 1, deliberately deferred to this phase); links point at real routes (`/`, `/collections/:currentUserId`, `/collections`)
- `client/src/components/MediaCard.jsx` — prop shape changed to match the real schema (see below)
- `client/src/App.css` — additive rules only for the new badges/placeholder/error-message/user-card elements; no redesign of existing layout
- `client/src/routes/NotFound.jsx` → `client/src/pages/NotFound.jsx` (`git mv`), `routes/` directory removed — aligns with `CLAUDE.md`'s declared `pages/`-for-route-components layout, which the repo hadn't matched until now

**Decisions and rationale:**

- Phase 4's `/collections` page has no way to list users without a `users` endpoint, and Phase 3 explicitly skipped that resource. Rather than block or fake it, built it now exactly as `BUILD_GUIDE.md`'s Phase 3 spec defines (`GET /api/users`, `GET /api/users/:id` with profile + library entry count) — confirmed with the user before doing backend work inside a nominally frontend phase.
- `MediaCard`'s `media` prop is now schema-shaped (`cover_image_url`, `external_link`, optional `rating`/`status`) instead of the old mock shape (`mediaImg`, `mediaLink`, always-present `rating`). The card's primary click target changed from an external `target="_blank"` anchor to an internal `<Link to="/media/:id">`, since the rubric requires that navigation; `external_link` became a secondary link outside the `<Link>` to avoid nested `<a>` tags. A new optional `editHref` prop lets `UserCollection` add an "Edit" affordance without a second card component.
- `LibraryEntryEdit` is read-only display this phase — the real form and PATCH/DELETE wiring is explicitly Phase 5 scope; Phase 4's acceptance criteria only require the route to exist and survive a direct refresh.
- The old ✚ "add media" button in `App.jsx` was removed rather than carried over as a dead stub — it had no working handler, and Phase 5 gives it a real modal.
- `API_URL` is an absolute URL (`http://localhost:3001/api`), not the Phase 1 Vite `/api` dev proxy, since `client/` and `server/` deploy as separate Render services on different domains — a relative path wouldn't survive that split, and an absolute constant is what makes "one line changes at deploy time" literally true. The dev proxy is left in place but unused.
- Documented (not yet implemented) the submit/loading pattern every Phase 5+ form should follow: local `submitting`/`error` state, `try/await/catch/finally`, submit button `disabled={submitting}` — not a shared hook, since POST/PATCH/DELETE call sites differ too much to usefully abstract yet.

**Assumptions:** none beyond the above.

**Not done:** `LibraryEntryEdit`'s actual form/submit behavior (Phase 5); tags and filtering/sorting (Phase 6); auth-gated mutations (Phase 7).

**Verification:**

- `cd server`: `GET /api/users` and `GET /api/users/1` (profile fields null, `library_entry_count: 0`, since no `user_profiles` row is seeded), `GET /api/users/999` → 404, `GET /api/users/abc` → 400 — all via curl
- `cd client && npm run build` — succeeds; `npm run lint` (oxlint) — clean
- `cd client && npm run dev` — the `react-router-hash-link` dependency-scan warning from Phase 1 is gone
- Created a real library entry via curl, then confirmed every route returns 200 through the dev server (`/`, `/media/1`, `/collections`, `/collections/1`, `/library/1/edit`, and an unmatched path for the `NotFound` catch-all) and that every component module transforms cleanly (200, not Vite's error overlay) — no browser-automation tool is available in this environment, so rendered output was not visually screenshotted; verification relied on build/lint success, clean module transforms, and each page's fetch target already being curl-confirmed to return the shape the component expects
- `cd server && npm run reset` re-run afterward to restore the clean seed state

### 2026-07-25 — Design system pass (tokens, typography, wireframe review)

**Issues addressed:** none directly — design/tooling groundwork ahead of the CSS work later phases depend on

**Files created:**

- `.mcp.json` — declares the `@playwright/mcp` server (`npx @playwright/mcp@latest`) so the agent can screenshot/interact with the real running app; not a project dependency, agent tooling only
- `WIREFRAME_NOTES.md` — comparison of `planning/wireframes.md`'s five images against what `BUILD_GUIDE.md` actually specifies (route naming differences, dropped comments feature, no genre/mood sort since no such columns exist), plus a live-screenshot list of the original UI's dated styling and a real layout bug (card title text overlapping the type badge beneath it)
- `DESIGN.md` — the canonical token system (color, type, spacing, shape) and component/layout/copy rules going forward; supplied by the user as a more considered direction than the first-pass palette, adopted after checking it by hand rather than rubber-stamping it (see Decisions below)

**Files modified:**

- `.gitignore` — added `.playwright-mcp/` (tool-generated snapshots/console logs, not project content)
- `client/index.html` — added the Google Fonts `<link>`s for Literata + Instrument Sans
- `client/src/index.css`, `client/src/App.css` — rebased from the first-pass palette (warm cream/terracotta) onto `DESIGN.md`'s tokens (cool paper/slate), added `prefers-reduced-motion` handling and `:focus-visible` outlines, switched card titles to italic Literata
- `client/src/components/Header.jsx` — `Link` → `NavLink` so the active-route accent underline `DESIGN.md` specifies actually applies (plain `Link` never gets an active class)

**Decisions and rationale:**

- The user's proposed `DESIGN.md` argued a cool/near-monochrome palette suits this app better than a warm one, since cover art already carries all the color and a warm accent competes with it. Verified this against the actual first-pass screenshots rather than taking it on faith — the terracotta badges did visibly clash with orange/red-toned covers already in the seed data (`Dune`, `Sapiens`) — and adopted it.
- `DESIGN.md`'s original `--ink-muted` (`#6C7280`) was checked against `--surface` (`#F4F5F7`) using the WCAG relative-luminance formula by hand: ~4.4:1, just under the 4.5:1 AA threshold the doc's own "Quality floor" section promises. Darkened to `#5B6170` (~5.7:1) before adopting, rather than trusting the doc's claim unverified. Also spot-checked `--accent` on white (9.6:1) and `--danger` on white (6.6:1) — both clear comfortably.
- Confirmed via `document.fonts` in a live Playwright session that Literata actually loads (`status: "loaded"`) rather than silently falling back to the Georgia fallback, which would look similar enough to go unnoticed.
- Only applied the new tokens to surfaces that already exist (nav, cards, badges, media detail, profile). `DESIGN.md` also specifies buttons, inputs, a modal, loading skeletons, and empty states — none of that CSS was written yet, since none of those components exist in the codebase until Phase 5+; writing it now would be speculative and risks drifting from whatever markup those phases actually produce.

**Assumptions:** none beyond the above.

**Not done:** applying the design system to not-yet-built components (buttons/inputs/modal/skeletons/empty states); replacing the plain `Loading…` text with the skeleton pattern `DESIGN.md` specifies (left as-is since it's an existing surface that could reasonably be touched now, but deferred to keep this pass scoped to the token rebase, not a full component audit).

**Verification:**

- `cd client && npm run build` — succeeds; `npm run lint` (oxlint) — clean
- Playwright: screenshotted `/`, `/media/1`, and `/collections` before and after the token rebase — confirmed the grid no longer clips (all 15 items visible, no horizontal scroll), the title/badge overlap bug is gone, italic Literata titles render correctly, and the active-nav underline (`NavLink`) appears only on the matched route
- `document.fonts` check in-browser confirmed Literata is actually loaded, not falling back
- Hand-verified contrast ratios for `--ink-muted`, `--accent`, and `--danger` against their respective backgrounds via the WCAG relative-luminance formula
