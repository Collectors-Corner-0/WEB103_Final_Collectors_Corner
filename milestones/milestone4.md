# Milestone 4

This document should be completed and submitted during **Unit 8** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [ ] Update the completion percentage of each GitHub Milestone. The milestone for this unit (Milestone 4 - Unit 8) should be 100% completed when you submit for full points.
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [ ] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this document, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

The full REST API (media, library entries, tags, tag assignment, users) and the frontend that consumes it came together cleanly — every mutating endpoint follows the same validate-before-write and ownership-check pattern, and every async action on the frontend shows a loading state and disables its submit button, so that consistency didn't have to be retrofitted later. GitHub OAuth via Passport also went in with fewer surprises than expected: the session/CORS/credentials wiring worked on the first real end-to-end check (redirect URL, 401 enforcement) once the three `credentials`-setting spots were accounted for.

### 2. What were some challenges your group faced in this unit?

A few real bugs only surfaced under live testing rather than code review: `tagsController.createTag` was reusing a PATCH-oriented validation helper that let a missing `name` fall through to a raw database error instead of a clean 400, and `MediaCard` linked to the wrong media detail page for library entries whose `id` didn't happen to match their `media_id`. Both were caught and fixed. Separately, `server/.env` was found pointing at an unreachable Render-internal database host instead of local Postgres — caught before it caused a confusing connection failure, and fixed without touching the real OAuth credentials alongside it.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

Most of Milestone 4's scope — full CRUD, tags, filtering/sorting, and GitHub OAuth — is built and passing curl/Playwright verification. Two things are intentionally not done: "Search Pre-existing Media" (adding an already-catalogued media item to your own library from the Browse view) was never built, since it's a distinct feature from creating new media. And Access Control's actual GitHub login flow has not yet been completed end-to-end by a real user, only verified up to the point automation can safely reach (redirect URLs, 401s, ownership logic in code) — completing a real login is next on the list before that feature can be marked done.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

Access Control is the one at risk, specifically the live confirmation step — the code is written and every piece that can be tested without a real GitHub identity has been, but nobody has yet clicked through a real login to confirm the avatar appears, logout clears the session, and cross-user edits are actually rejected in the browser. If that slips further, the plan is to do that check first, before any new feature work, since it's the last gap between "code complete" and "verified complete." "Search Pre-existing Media" is lower risk since it's simple to add on top of the existing media list and library-entry endpoints.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

None identified beyond continuing the current review-and-fix pattern (curl for API correctness, browser verification for UI behavior) into the deployment unit.
