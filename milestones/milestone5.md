# Milestone 5

This document should be completed and submitted during **Unit 9** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Deploy your project on Render
  - [x] In `readme.md`, add the link to your deployed project
- [ ] Update the status of issues in your project board as you complete them
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of their title
  - [ ] Under each feature you have completed, **include a GIF** showing feature functionality
- [ ] In this document, complete the **Reflection** section below
- [x] 🚩🚩🚩**Complete the Final Project Feature Checklist section below**, detailing each feature you completed in the project (ONLY include features you implemented, not features you planned)
- [ ] 🚩🚩🚩**Record a GIF showing a complete run-through of your app** that displays all the components included in the **Final Project Feature Checklist** below
  - [ ] Include this GIF in the **Final Demo GIF** section below

## Final Project Feature Checklist

Complete the checklist below detailing each baseline, custom, and stretch feature you completed in your project. This checklist will help graders look for each feature in the GIF you submit.

### Baseline Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project includes an Express backend app and a React frontend app
- [x] The project includes these backend-specific features:
  - [x] At least one of each of the following database relationships in Postgres
    - [x] one-to-many
    - [x] many-to-many with a join table
  - [x] A well-designed RESTful API that:
    - [x] supports all four main request types for a single entity (ex. tasks in a to-do list app): GET, POST, PATCH, and DELETE
      - [x] the user can **view** items, such as tasks
      - [x] the user can **create** a new item, such as a task
      - [x] the user can **update** an existing item by changing some or all of its values, such as changing the title of task
      - [x] the user can **delete** an existing item, such as a task
    - [x] Routes follow proper naming conventions
  - [x] The web app includes the ability to reset the database to its default state
- [x] The project includes these frontend-specific features:
  - [x] At least one redirection, where users are able to navigate to a new page with a new URL within the app
  - [x] At least one interaction that the user can initiate and complete on the same page without navigating to a new page
  - [x] Dynamic frontend routes created with React Router
  - [x] Hierarchically designed React components
    - [x] Components broken down into categories, including Page and Component types
    - [x] Corresponding container components and presenter components as appropriate
- [x] The project includes dynamic routes for both frontend and backend apps
- [x] The project is deployed on Render with all pages and features that are visible to the user are working as intended

### Custom Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project gracefully handles errors
- [x] The project includes a one-to-one database relationship
- [x] The project includes a slide-out pane or modal as appropriate for your use case that pops up and covers the page content without navigating away from the current page
- [x] The project includes a unique field within the join table
- [x] The project includes a custom non-RESTful route with corresponding controller actions
- [x] The user can filter or sort items based on particular criteria as appropriate for your use case
- [x] Data is automatically generated in response to a certain event or user action. Examples include generating a default inventory for a new user starting a game or creating a starter set of tasks for a user creating a new task app account
- [x] Data submitted via a POST or PATCH request is validated before the database is updated (e.g. validating that an event is in the future before allowing a new event to be created)
  - [ ] *To receive full credit, please be sure to demonstrate in your walkthrough that for certain inputs, the item will NOT be successfully created or updated.*

### Stretch Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] A subset of pages require the user to log in before accessing the content
  - [x] Users can log in and log out via GitHub OAuth with Passport.js
- [x] Restrict available user options dynamically, such as restricting available purchases based on a user's currency
- [x] Show a spinner while a page or page element is loading
- [x] Disable buttons and inputs during the form submission process
- [ ] Disable buttons after they have been clicked
  - *At least 75% of buttons in your app must exhibit this behavior to receive full credit*
- [ ] Users can upload images to the app and have them be stored on a cloud service
  - *A user profile picture does **NOT** count for this rubric item **only if** the app also includes "Login via GitHub" functionality.*
  - *Adding a photo via a URL does **NOT** count for this rubric item (for example, if the user provides a URL with an image to attach it to the post).*
  - *Selecting a photo from a list of provided photos does **NOT** count for this rubric item.*
- [ ] 🍞 [Toast messages](https://www.patternfly.org/v3/pattern-library/communication/toast-notifications/index.html) deliver simple feedback in response to user events

## Final Demo GIF

🔗 [Here's a GIF walkthrough of the final project](👉🏾👉🏾👉🏾 your link here)

## Reflection

### 1. What went well during this unit?

Deployment itself went smoothly on the infrastructure side — Render's Root Directory setup made the one-repo, two-services split painless, and the earlier work env-driving every hardcoded URL (`VITE_SERVER_URL`, `GITHUB_CALLBACK_URL`, `CLIENT_URL`) meant zero code changes were needed to point the app at production, just dashboard configuration. The database side was similarly clean: seeding production with the same `npm run reset` script used all along worked on the first real attempt.

### 2. What were some challenges your group faced in this unit?

Getting GitHub OAuth working across two different Render subdomains turned into the unit's real fight, and it came in layers rather than one bug:

- The static site initially 404'd on any deep-link refresh (`/media/3`, `/collections/2`) — Render's Static Site serves literal files by default and has no idea a React Router path should fall back to `index.html`. Fixed with an explicit Rewrite rule, but it's exactly the kind of thing that works perfectly in local dev (where Vite's dev server handles it invisibly) and only breaks once deployed.
- The session cookie itself went through two rounds of failure before it actually worked. The first fix (`sameSite: 'none'`, `secure: true`, gated behind `NODE_ENV=production`) was necessary but not sufficient — login would redirect successfully and land back on the homepage, but every subsequent request still came back 401, as if nothing had happened. Root-causing it took actually reading the cookie out of the browser via DevTools rather than guessing: the `Partitioned` (CHIPS) attribute we'd added as extra defense-in-depth was the real culprit. It ties a cookie to whichever site is "top-level" at the moment it's stored — during the OAuth redirect that's briefly the server's own domain, not the client's — so by the time the client tried to read it back as a cross-site cookie, the partition key didn't match and the browser silently withheld it. Removing that one attribute fixed it.
- Even after that fix was correct and merged, the site kept failing in testing — because the redeploy had never actually been triggered. The dashboard looked fine; the deploy log's checked-out commit hash told the real story. That was a useful, if humbling, reminder that "I clicked redeploy" and "the new code is actually running" aren't the same claim, and the only way to be sure is to check the evidence directly.

### 3. What were some of the highlights or achievements that you are most proud of in this project?

Root-causing the cookie bug without guessing: the difference between "add `partitioned: true` because it seemed like reasonable extra security" and correctly diagnosing *why* it broke things required going all the way down to inspecting actual `Set-Cookie` headers and cookie partition keys in the browser — a level of "prove it, don't assume it" that paid off directly.

### 4. Reflecting on your web development journey so far, how have you grown since the beginning of the course?

[👉🏾👉🏾👉🏾 your answer here]

### 5. Looking ahead, what are your goals related to web development, and what steps do you plan to take to achieve them?

[👉🏾👉🏾👉🏾 your answer here]
