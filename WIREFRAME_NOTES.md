# Wireframe Notes

Working notes comparing `planning/wireframes.md` (and its five images) against what `BUILD_GUIDE.md`/`CLAUDE.md` actually direct us to build, plus a live-screenshot read of the current UI. This is a reference doc, not a graded deliverable — update freely, unlike `planning/` or `milestones/`.

## What the wireframes show

Five hand-drawn screens, all sharing one visual language: rounded-rect media cards, circular avatars, a plain two-link nav bar (`My Collection | Browse Collections`) with login/logout on the right, heart-icon ratings, and media grouped into labeled sections by type (Books, Movies, Podcasts...). That's a clean, minimal, already-2020s-friendly *layout* language — the dated feel in our current build is a CSS/styling problem, not a structural one.

1. **Browse Collections** — a feed of other users' profile summaries (avatar, username, "Currently Enjoying," about-me snippet, top favorite media), each hyperlinked to that user's profile.
2. **User Profile (Logged In)** — avatar with "Edit Picture" overlay, editable "Currently Enjoying"/"About Me" fields, then per-type rows of media (Books, Movies, ...) each ending in a `+` add tile, plus a page-level `+ Add Section` control.
3. **User Profile (Logged Out)** — same layout, minus the edit affordances.
4. **Sort User's Media** — a single user's media in a grid, with sort dropdowns for Genre, Mood, Rating, and Date Added.
5. **Media Detail View** — cover on the left, title/author/hearts/review on the right, a "Return to Collection" button, and a comments thread below.

## Where our plan diverges (deliberately)

These aren't oversights — `BUILD_GUIDE.md`/`CLAUDE.md` made explicit calls that supersede the wireframes, same as the schema deviations already logged in `CLAUDE.md`:

| Wireframe shows | We're building instead | Why |
|---|---|---|
| "Browse Collections" = a feed of **user profile summaries** | Our `/` (`Browse`) is a feed of **all media** in the catalog; the wireframe's actual page (a list of users) is our `/collections` | `BUILD_GUIDE.md` Phase 4 defines `/` as "browse all media in the catalog" explicitly — the wireframe's naming and our route naming don't line up 1:1, but the underlying pages (list-of-users, one-user's-library) both exist, just at different paths (`/collections`, `/collections/:userId`) |
| Sort by **Genre** and **Mood** | Sort by `title`, `date added`, `rating` only (`BUILD_GUIDE.md` Phase 6) | Our schema has no `genre` or `mood` column on `media` — adding either would mean a schema change nowhere in `BUILD_GUIDE.md`. Not planned. |
| Media grouped into **per-type sections** (Books, Movies, ...) with a `+` tile per section, plus `+ Add Section` | A single filterable/sortable grid (`BUILD_GUIDE.md` Phase 6: filter by tag/type/status, sort by title/date/rating) | Per-type sections are a valid layout choice we could still adopt visually, but "Add Section" implies user-defined sections/collections, which isn't in the schema or any phase |
| Profile has inline **"Edit Picture"** and inline **Edit** buttons next to "Currently Enjoying"/"About Me" | `user_profiles` (`display_name`, `bio`, `favorite_genres`) is editable via a form, not specced yet in any phase we've built | Not contradicted, just not reached yet — no phase has built profile editing |
| Media Detail has a **Comments** thread | Not built | No `comments` table anywhere in the ERD (post-pivot or not), not mentioned once in `BUILD_GUIDE.md`. This is pre-OAuth-pivot scope creep in the original wireframe — treating it as dropped unless you say otherwise |
| Nav says **"My Collection"** | Same, now literally routes to `/collections/:currentUserId` | No change — Phase 4 built this to match |

Everything else — heart ratings, cover-left/info-right detail layout, card-grid browsing, a "return" navigation affordance — is already consistent with what's built or planned.

## Current UI, live screenshots (`localhost:5199`, 2026-07-25)

Confirms your read: the actual rendered app looks noticeably older than the wireframe's intent, and it's a CSS problem, not a layout one.

- **Background**: solid `bisque` (`#FFE4C4`) page-wide — a very late-90s/early-2000s color choice, clashing with the cover art instead of framing it.
- **Typography**: `Verdana` everywhere — a system-UI-era web-safe font, not a 2020s type choice.
- **Nav bar**: heavy blue gradient background, a hard `box-shadow`, and dotted-underline links — reads like an early Bootstrap/table-based nav, not a modern minimal bar.
- **Cards**: dark gradient `.media-img` background boxes with a heavy `box-shadow`, inconsistent card heights, and a real layout bug — two-line titles overlap the type badge sitting directly beneath them (see `Dune`/`The Hobbit`/`Educated` cards, all clipped).
- **Row layout**: `Browse` clips to a fixed-height horizontally-scrolling strip (`max-height: 350px`, `overflow-x: auto`) with a visible custom purple scrollbar — hides most of the catalog behind a scroll interaction instead of wrapping into a grid.
- **Detail page**: plain black `<h2>`/`<h4>` stacked on the same bisque background, no visual hierarchy beyond font-size/weight.
- **Collections page**: functionally fine (circular avatars, username, working links) — the least dated-looking page, mostly because it's the sparsest.

## Next step

Not attempting a redesign in this doc — this is the "what we noticed" pass. The actual 2020s minimalist restyling (color palette, type scale, spacing, card/nav treatment, fixing the title/badge overlap bug) is a separate pass, informed by this comparison plus your direction on palette/tone.
