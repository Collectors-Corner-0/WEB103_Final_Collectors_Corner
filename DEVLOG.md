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

### 2026-07-25 — Phase 5 — Add and edit custom media

**Issues addressed:** #3 (Add Custom Media)

**Files created:**

- `client/src/components/Modal.jsx` — generic reusable modal shell: `createPortal` into `document.body`, `Escape`-to-close, backdrop-click-to-close. Built from `DESIGN.md`'s Modal spec.
- `client/src/components/AddMediaModal.jsx` — the Add Media form, client-side validation, and submit logic

**Files modified:**

- `client/src/hooks/useFetch.js` — added a `refetchIndex`/`refetch()` pair so any page using the hook can re-trigger its GET on demand; fully backward compatible, every existing caller ignores the new return field
- `client/src/pages/Browse.jsx` — added the "Add media" trigger button, modal-open state, and wired `refetch` as the modal's `onCreated` callback
- `client/src/pages/LibraryEntryEdit.jsx` — replaced the Phase 4 read-only placeholder with a real form (status/rating/personal notes/date acquired), a `PATCH` submit that navigates to `/collections/:userId` on success, and a delete action behind a `Modal`-based confirmation dialog
- `client/src/App.css` — added `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-danger`, `.modal-backdrop`/`.modal`, `.field`/`.field-error`/`.form-actions`/`.form-error-banner`, `.page-heading` — all built from `DESIGN.md`'s existing tokens, no new hardcoded values; this is the first real use of the Button/Input/Modal specs that were deliberately left unbuilt in the design-system pass

**Decisions and rationale:**

- Client-side validation mirrors `server/controllers/mediaController.js`'s `createMedia` exactly (`title` required, `media_type` required) and nothing more — no format/length checks on `creator`, `description`, `cover_image_url`, or `external_link`, since the server doesn't enforce any either. Same principle on the edit form: `status` and `rating` are `<select>` elements constrained to the legal values by construction, so `updateEntry`'s validation is mirrored structurally rather than with a redundant runtime check.
- Chose to give `useFetch` a `refetch()` function (re-run the real GET) over locally splicing the new row into state — guarantees the list matches server state exactly (ordering, any future filtering) rather than duplicating insert-position logic on the client.
- `.btn-danger` is a small, justified addition beyond `DESIGN.md`'s two documented button variants (primary/secondary) — it uses the `--danger` token that already exists in the palette for exactly this purpose (destructive actions).
- Reused the same generic `Modal` component for the delete confirmation rather than `window.confirm()` — a native browser dialog would look jarringly out of place against `DESIGN.md`'s considered visual system, and reusing `Modal` cost nothing new.
- After a successful save or delete, the edit form navigates back to `/collections/:userId` (the entry's owner) rather than staying on the page — mirrors the "Return to Collection" affordance already implicit in the wireframes' media detail page.

**Assumptions:** none beyond the above.

**Not done:** no "add to my library" action on `Browse`/`MediaCard` (creating `library_entries` from the catalog view is a different, unbuilt feature — Phase 5 is only about creating `media` rows); no loading-skeleton or empty-state work (still deferred per `DESIGN.md`'s implementation-status note); `tags` remain Phase 6.

**Verification (via Playwright against the live app, plus curl/psql spot-checks):**

- Clicked "Add media," submitted with every field empty → inline "Title is required." and "Media type is required." appeared, fields got the `--danger` border, and `browser_network_requests` confirmed **no** `POST /api/media` was sent
- Filled in a valid title + media type, submitted → network log showed `POST /api/media` → 201 then `GET /api/media` → 200 (the `refetch`), modal closed, new card appeared in the grid; confirmed via curl the row count went from 15 to 16 and the new title is in the response
- Created a library entry via curl, opened `/library/:entryId/edit` → form was correctly pre-filled from the fetched entry; changed status/rating/notes, saved → redirected to `/collections/:userId`; confirmed via curl that the new values persisted in the database (not just local state)
- Re-opened the same entry's edit page, clicked "Delete entry" → confirmation dialog appeared (styled via `Modal`, danger button); confirmed → redirected to the collection, which now read "0 items in library"; confirmed via curl that `GET /api/library/entry/:id` now 404s
- `cd client && npm run build` — succeeds; `npm run lint` (oxlint) — clean
- `cd server && npm run reset` re-run afterward to restore the clean seed state

### 2026-07-25 — Phase 6 — Tags and filtering

**Issues addressed:** #9 (Custom Tags), #8 (Filter Collections), #5 (Sort Media)

**Files created:**

- `server/controllers/tagsController.js` — `getTagsByUser`, `createTag`, `updateTag`, `deleteTag`
- `server/routes/tags.js` — maps `/api/tags` URLs to the controller
- `client/src/components/TagManagerModal.jsx` — create/rename/recolor/delete UI, reusing `Modal` from Phase 5

**Files modified:**

- `server/server.js` — mounts `app.use('/api/tags', tagsRouter)`
- `server/controllers/libraryEntriesController.js` — added `assignTag`/`removeTag` (`POST`/`DELETE /:entryId/tags/:tagId`); `ENTRY_SELECT` now embeds each entry's `tags` as a `json_agg` correlated subquery ordered by `position`, so `GET /api/library/:userId` and `GET /api/library/entry/:id` return tags with no extra fetch
- `server/routes/libraryEntries.js` — added the two tag-assignment routes
- `client/src/pages/UserCollection.jsx` — tag/media-type/status filters and a title/date/rating sort control, all derived client-side via `useMemo` over the already-fetched entries; a "Manage tags" button opening `TagManagerModal`
- `client/src/pages/LibraryEntryEdit.jsx` — a "Tags" section rendering every one of the user's tags as an immediate-effect toggle button (`POST`/`DELETE` on click, independent of the "Save changes" button)
- `client/src/components/MediaCard.jsx` — renders `media.tags` as small chips (color swatch dot + name, never the raw user-picked color as background/text); **fixed a real bug** found during verification (see below)
- `client/src/hooks/useFetch.js` — tolerates a falsy `url` (skips fetching, stays in `loading` state) so `LibraryEntryEdit` can defer its tags fetch until the entry (and its `user_id`) has loaded
- `client/src/App.css` — `.filter-bar`, `.tag-chip`/`.tag-swatch`, `.tag-toggle`/`.tag-toggle.assigned`, `.tag-manager-*`, `.hint-text`, all from existing `DESIGN.md` tokens

**Decisions and rationale:**

- `position` on `library_entry_tags` is set automatically on assignment (`COUNT(*)` of the entry's existing tags — an append-to-end counter), not user-supplied or reorderable. Every read orders `ORDER BY position`, so a given entry's tags render in stable, deterministic assignment order. No drag-and-drop reordering UI — not requested, and gaps left by removed tags don't affect `ORDER BY` correctness, so nothing needs the sequence to stay contiguous.
- Filtering and sorting are pure client-side derivations (`useMemo`) over the single already-fetched `GET /api/library/:userId` response — no additional request fires when a filter/sort `<select>` changes, and the URL never changes. Confirmed via `browser_network_requests` (zero new `/api/*` calls after changing any control) rather than just asserting it.
- Tag chips use a small color swatch dot, never the user's chosen color as the chip's own background/text — sidesteps any contrast/legibility risk from an arbitrary picked color, consistent with `DESIGN.md`'s restrained-chrome thesis.
- `TagManagerModal` mutations call both the tags list's and the entries list's `refetch()` (both exposed by `useFetch` since Phase 5), so deleting a tag removes its chips from already-rendered cards immediately — verified live: deleting "Sci-Fi" removed it from the filter dropdown, the tag list, and the Dune card's chip in the same interaction, no manual refresh needed.

**Bugs found and fixed during verification:**

- `tagsController.createTag` reused a PATCH-oriented validation helper that treats `undefined` as "field not being changed, skip validation" — correct for `updateTag` (optional fields) but wrong for `createTag`, where `name` is mandatory. A request with no `name` at all skipped validation entirely and hit the database's `NOT NULL` constraint, producing a raw 500 instead of a 400. Rewrote `createTag`'s required-field check to run unconditionally rather than reusing the "if present" helper.
- `MediaCard`'s cover-image link used `media.id` unconditionally. That's correct when rendering plain `media` rows (`Browse`), but `UserCollection` passes library *entry* objects, where `.id` is the entry's own id, not the linked media's — cards for any entry whose `id` didn't coincidentally match its `media_id` linked to the wrong media detail page (caught concretely: an "Inception" entry with `id=2` linked to `/media/2`, which is "The Hobbit"). Fixed to `media.media_id ?? media.id`, correctly preferring the entry's `media_id` when present and falling back to `id` for plain media objects.

**Assumptions:** none beyond the above.

**Not done:** drag-and-drop tag reordering (not requested; `position` is assignment-order only); auth/ownership checks on tag or assignment mutations (still Phase 7, consistent with every prior phase).

**Verification (via Playwright against the live app, plus curl/psql spot-checks):**

- curl: created two tags, hit the `POST /api/tags` duplicate-name case (409) and missing-name case (400, after the bug fix above); assigned two tags to one entry and confirmed `position` 0 and 1 in assignment order via `GET /api/library/entry/:id`; confirmed the composite-PK duplicate-assignment case returns 409
- Playwright: created a tag via the manager, assigned it to an entry via the edit page's toggle (confirmed `POST .../tags/:tagId` → 201 in the network log), navigated back to the collection and confirmed the chip appeared on the card
- Selected the tag filter, the media-type/status filters, and each sort option in turn — confirmed via `browser_network_requests` that no new request fired for any of them and the URL bar never changed; filtering by the new tag correctly narrowed the grid to just the tagged entry; sorting by rating correctly ordered rated entries above the unrated one
- Deleted the tag via the manager — confirmed it disappeared from the filter dropdown, the manager's own list, and the already-rendered card's chip, all without a page refresh
- Refreshed `/collections/:userId` — filter/sort controls reset to defaults (expected, in-memory only); tag deletion and the earlier bug-fixed link behavior both persisted (confirmed database-backed, not local-state artifacts)
- `cd client && npm run build` — succeeds; `npm run lint` (oxlint) — clean
- `cd server && npm run reset` re-run afterward to restore the clean seed state

### 2026-07-25 — Phase 7 — GitHub OAuth

**Issues addressed:** #10 (Access Control)

**Files created:**

- `server/config/auth.js` — GitHub strategy (`passport-github2`) plus `serializeUser`/`deserializeUser`; verify function looks up by `username`, inserts a new `collector` row if absent, nothing more — matches the guide literally, no update-on-repeat-login embellishment
- `server/middleware/requireAuth.js` — 401s if `!req.isAuthenticated()`
- `server/routes/auth.js` — `/github`, `/github/callback`, `/login/success`, `/login/failed`, `/logout`, mounted at `/auth`
- `client/src/hooks/useCurrentUser.js` — session-check hook; unlike `useFetch`, a 401 here is an expected logged-out state (`user: null`), not an error to render
- `client/src/pages/Login.jsx` — a real `<a href=".../auth/github">`, not a `fetch`/`<Link>`, since it has to leave the SPA

**Files modified:**

- `server/server.js` — `cors()` → `cors({ origin: 'http://localhost:5173', credentials: true })`; added `express-session` (default `MemoryStore`, no new package), `passport.initialize()`, `passport.session()`; mounted `/auth`
- `server/controllers/libraryEntriesController.js` — `createEntry` takes `user_id` from `req.user.id`, never the request body; `updateEntry`/`deleteEntry`/`assignTag`/`removeTag` gained ownership checks (403 if the entry — and for tag assignment, the tag too — doesn't belong to `req.user.id`)
- `server/controllers/tagsController.js` — same pattern: `createTag` uses `req.user.id`; `updateTag`/`deleteTag` gained ownership checks
- `server/controllers/mediaController.js` — `createMedia` takes `created_by_user_id` from `req.user.id`, not the body (per your call to gate media mutations too)
- `server/routes/media.js`, `routes/libraryEntries.js`, `routes/tags.js` — `requireAuth` added to every mutating route (`POST`/`PATCH`/`DELETE`); every `GET` stays open
- `client/src/App.jsx` — hardcoded URL refactored into `SERVER_URL` → derived `API_URL`/`AUTH_URL` (now genuinely one line changes at deploy time, not two independently-hardcoded URLs); `currentUserId` constant removed, replaced by `useCurrentUser()`; added `/login` route
- `client/src/components/Header.jsx` — logged out: "Login" link; logged in: avatar + username, "My Collection", "Logout" (the credentials place 3)
- `client/src/pages/UserCollection.jsx` — takes `currentUserId`; computes a page-level `isOwnCollection` boolean (every entry on the page belongs to the same viewed user); only shows "Manage tags" and per-card "Edit" links when true
- `client/src/pages/Browse.jsx` — "Add media" button only renders when logged in
- `client/src/components/AddMediaModal.jsx`, `TagManagerModal.jsx`, `client/src/pages/LibraryEntryEdit.jsx` — every existing mutating `fetch` gained `credentials: 'include'`; `TagManagerModal`'s create-tag call also dropped the now-meaningless `user_id` field from its request body, since the server ignores it in favor of the session user
- `client/src/App.css` — `.nav-auth`/`.header-user`/`.header-avatar`; also fixed a pre-existing `.btn` gap (no `text-decoration: none`, so an anchor styled as a button showed a browser-default underline — caught visually on the new Login page)
- `server/.env` — `PGHOST`/`PGUSER`/`PGDATABASE`/`PGPASSWORD` restored to the local Postgres sandbox (see Decisions)

**Decisions and rationale:**

- The "three credentials places" `BUILD_GUIDE.md` names (CORS config, get-user fetch, logout fetch) are specifically what make the login/logout *mechanism* work at all. Every other mutating fetch from Phases 5–6 also needed `credentials: 'include'` added — a necessary consequence of adding real auth, not optional, or every mutation would look unauthenticated regardless of login state. Listed separately in the plan and here so the distinction is clear.
- `Passport` configuration (strategy + `serializeUser`/`deserializeUser`) lives entirely in `auth.js`, not split with `server.js` — standard Passport convention; `server.js` only mounts the session/init middleware and imports `auth.js` for its side effect.
- Session store is `express-session`'s default in-memory store — no new package, consistent with "no migration framework." Resets on server restart; acceptable for this scope.
- **Found `server/.env` pointed `PGHOST` at Render's internal-only database hostname** (`dpg-d9hl8uvaqgkc73ak78sg-a`, confirmed NXDOMAIN from this machine) rather than local Postgres, alongside what looked like real GitHub OAuth credentials from an earlier session. Stopped before running `npm run reset` or starting the server against it — flagged it and confirmed with the user before touching anything. Restored only the `PG*` variables to the local sandbox every prior phase has used; left `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`/`SESSION_SECRET` untouched, since those are the user's real values, added deliberately.

**Assumptions:** none beyond the above.

**Not done — a real, stated limit, not a hidden gap:** I did not complete an actual GitHub login. Doing so requires the user's real GitHub identity (username/password), which I should not drive through browser automation even indirectly. Verified everything up to that boundary instead: every mutation route returns 401 with no session; `GET /auth/github` redirects to a correctly-formed `https://github.com/login/oauth/authorize?...` URL carrying the real `client_id` and the exact required `redirect_uri` (confirmed via `curl -D -`, no credentials submitted); `/login`'s "Log in with GitHub" link's `href` confirmed exactly `http://localhost:3001/auth/github` via Playwright; every ownership check reviewed at the code level. The full "avatar visible after login" / "logged-in user can't edit another user's entries" acceptance criteria still need the user to complete a real login themselves and confirm.

**Verification:**

- curl, no cookie: `POST /api/media`, `POST /api/library`, `PATCH /api/library/1`, `POST /api/tags`, `POST /api/library/1/tags/1` all → 401 `{"error":"You must be logged in to do that."}`; `GET /api/media` and `GET /api/library/1` still → 200 (unauthenticated browsing stays open)
- curl: `GET /auth/login/success` (no session) → 401; `GET /auth/logout` (no session) → 200 `{"success":true}`; `GET /auth/login/failed` → 401
- curl `-D -`: `GET /auth/github` → `302` with `Location: https://github.com/login/oauth/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fgithub%2Fcallback&client_id=<real client id>` — confirms the strategy config and exact callback URL are correct without touching any credentials
- Playwright: logged-out `/` shows "Login" in nav and no "Add media" button; `/login` renders the GitHub link with the exact expected `href`; caught and fixed the `.btn` underline bug visually
- `cd client && npm run build` — succeeds; `npm run lint` (oxlint) — clean
- `cd server && npm run reset` re-run afterward to restore the clean seed state

### 2026-07-26 — Phase 8 — Documentation updates

**Issues addressed:** none directly — documentation only, reconciling `README.md`/`milestones/` with the work closed in Phases 2–7

**Files created:**

- `milestones/progress_report_4.md` — mirrors `progress_report_3.md`'s structure; completion percentage left blank for the team

**Files modified:**

- `README.md` — added ✅ to Add Custom Media, Sort Media, Link to Media, Browse Collections, Filter Collections, Custom Tags (all verifiably complete per DEVLOG); left Search Pre-existing Media and Access Control unchecked; filled in the previously-blank Tech Stack section from `CLAUDE.md`'s stack list
- `milestones/milestone3.md` — ticked the project-board, issues-created, and milestones-created boxes (sourced from `progress_report_3.md`'s already-recorded facts) and filled both title lists; ticked the README ✅/GIF box (true as of Unit 7, when only Link to Media was done and already had a real GIF); left the two live-GitHub-state boxes (issue-board status, milestone completion %) and the Reflection section untouched
- `milestones/milestone4.md` — ticked the README ✅ box; left the GIF-per-feature box unchecked (only 1 of 6 now-checked features has a real GIF file) and the milestone-percentage box unchecked (live GitHub state); wrote all five Reflection answers

**Decisions and rationale:**

- Only `Feature_Gifs/LinkToMediaFeature.gif` exists on disk, so it's the only feature with a real `<img>` embed; every other now-checked feature keeps `[gif goes here]` rather than a broken embed, since the guide's own acceptance criterion requires GIF paths to resolve on GitHub.
- Access Control got code built in Phase 7 but no ✅: the actual GitHub login was never completed by the agent (by design — see Phase 7's "Not done" note) and, confirmed directly with the user this phase, hasn't been completed by them yet either. Code-complete isn't the same as verified-complete for a login flow, so it stays unchecked until someone actually clicks through it.
- `milestones/milestone3.md`'s Reflection section was deliberately left untouched even though the user asked for reflections generally: `DEVLOG.md` only begins at Phase 2, which — per `progress_report_3.md`'s own numbers (33.33% complete, 2 issues closed) — postdates all of Unit 7's actual work. There's no factual record of what happened during Unit 7 to draw on, so writing that reflection would mean fabricating the team's experience rather than reporting it.
- `milestones/milestone4.md`'s Reflection section was written despite `CLAUDE.md`'s and `BUILD_GUIDE.md`'s explicit rule against generating reflection answers in `milestones/` — the user asked directly for this, after being shown the conflict, and confirmed the override. Content is grounded entirely in `DEVLOG.md`'s actual entries (the `createTag` validation bug, the `MediaCard` wrong-link bug, the `.btn` underline bug, the `server/.env` security finding, and the two explicitly-deferred items), no invented claims or percentages.
- `milestones/progress_report_4.md`'s "Issues completed this unit" list is exactly the set of `DEVLOG.md` "Issues addressed" entries since `progress_report_3.md` (#1, #2, #3, #5, #7, #8, #9, #10); "Features Completed This Unit" is exactly the six README checkmarks added this phase, deliberately excluding Access Control for the same reason its README checkmark was withheld.

**Assumptions:** none beyond the above — every checkbox, list entry, and reflection claim traces to either `DEVLOG.md`, `progress_report_3.md`, or direct user confirmation this phase.

**Not done:** GitHub-side state (project board issue statuses, GitHub Milestone completion percentages) was not touched or asserted, since it isn't visible from the repo; recording real feature GIFs beyond the one that already existed, since no new GIF files were provided this phase.

**Verification:**

- Confirmed `Feature_Gifs/LinkToMediaFeature.gif` exists on disk before treating it as the one real embed
- `grep -c '^### ✅' README.md` → 6, matching the six features determined complete; `grep -c '\[gif goes here\]' README.md` → 7, matching the seven features without a real GIF file
- Confirmed no completion-percentage field was filled in anywhere (`milestone4.md` has no such field to leave blank in-document; `progress_report_4.md`'s is left as `__%`)
- Re-read the final `README.md`, `milestone3.md`, `milestone4.md`, and `progress_report_4.md` in full to confirm no unrelated text was touched
