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

Several harder, less comfortable lessons came out of finishing Phase 7's loose ends and shipping Phase 8's follow-up work as a string of PRs:

- A real security bug shipped and sat unnoticed for a while: `GET /auth/login/success` was returning the entire `users` row — including `accesstoken` — directly to the client, not just the fields the UI actually needed. It was only caught during a later, deliberate audit of "what does this endpoint actually hand back," not by any earlier functional test, since the feature worked correctly either way. That's a real gap in the testing approach used up to that point: "does it work" and "does it leak something it shouldn't" turned out to be two different questions.
- Diagnosing a GitHub OAuth "redirect_uri is not associated with this application" error took genuine, methodical elimination — checking whether the server process was stale, whether `.env` had drifted, and confirming the exact live redirect URL — before finding the real cause: a stray `/api` segment in the GitHub OAuth App's own registered callback URL, a typo in a completely different system (GitHub's own settings page) than the one throwing the error.
- Git and merge mechanics cost more time and lost work than any actual code bug did. A finished, verified fix that existed only as an uncommitted working-tree edit got silently dropped — not once but twice — when branch-switch and merge operations ran before it was ever committed. "The file looks right on disk" turned out not to mean "the fix is safe." Separately, `git merge` opening an editor for the commit message looked indistinguishable from the terminal freezing, which burned real time before realizing it just needed `:wq`.
- Stacking several PRs on top of each other (#14 → #15 → #17, each depending on the last), combined with GitHub Copilot leaving "Commit suggestion" buttons that got clicked independently on different branches, produced the same merge conflict three separate times as each PR merged and the next one had to catch up with `main`. Each individual conflict was small once found, but not recognizing the recurring pattern early cost a few rounds of confusion that could have been avoided.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

All of Milestone 4's scope is now built and verified — full CRUD, tags, filtering/sorting, and GitHub OAuth, including the live login/logout/ownership checks that were still outstanding partway through the unit. The one thing intentionally not done is "Search Pre-existing Media" (adding an already-catalogued media item to your own library from the Browse view), since it's a distinct feature from creating new media and wasn't part of this unit's planned scope.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

Access Control was flagged at risk earlier this unit, specifically the live confirmation step — that's since been resolved: a real GitHub login was completed, the avatar and username showed correctly, logout returned to a logged-out state, and a direct attempt to edit another user's library entry was confirmed blocked with a 403, both at the API level and by the edit page no longer even rendering the form for a non-owner.

What's at risk now is deployment itself. `client/src/App.jsx`'s `SERVER_URL`, `server/config/auth.js`'s `callbackURL`, the post-login redirect in `server/routes/auth.js`, and the CORS origin in `server/server.js` are all still hardcoded to `localhost` and have never been exercised against a real deployed environment. They're tracked explicitly in `BUILD_GUIDE.md` now so they aren't forgotten once deployment starts, but until they're actually fixed and tested against Render, deployment is the step most likely to surface new problems — the GitHub OAuth callback URL in particular already caused one confusing debugging session in dev, and a deployed domain is exactly the kind of change that class of bug reappears for. "Search Pre-existing Media" remains the one unbuilt feature, but is lower risk since it's simple to add on top of the existing media list and library-entry endpoints.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

Beyond continuing the current review-and-fix pattern (curl for API correctness, browser verification for UI behavior) into the deployment unit, this unit's git/merge friction was a real gap — a clearer shared understanding of stacked-branch workflows, what actually gets included when a merge commit is created, and how automated PR review tools (Copilot's "Commit suggestion" button, specifically) interact with in-progress branch work would have saved real time this unit and will likely matter again once deployment introduces its own branch/environment coordination.
