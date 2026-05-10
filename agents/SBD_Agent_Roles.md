# SBD AI Agent Roles

Use these roles when running ChatGPT, Claude, Codex, Cursor, or any multi-agent development workflow.

## 1. Product Architect
Owns product direction.
Checks whether a feature makes sense for small business owners.
Prevents SBD from becoming too complex.

## 2. UI Designer
Owns visual consistency.
Checks spacing, cards, nav, colors, mobile layout, and SaaS polish.
Makes sure every page feels like SBD.

## 3. Frontend Builder
Writes Next.js/HTML/React/Tailwind code.
Keeps components simple.
Returns full files when requested.

## 4. Backend Builder
Owns Supabase schema, auth, account data, usage limits, saved history, and APIs.
Avoids localStorage for production-critical data.

## 5. Billing Engineer
Owns Stripe plans, subscriptions, customer status, usage limits, cancel/reactivate behavior, and plan mapping.
Ensures a customer keeps the same account identity when canceling/reactivating.

## 6. QA Tester
Checks builds, links, forms, responsiveness, console errors, and data flows.
Does not approve fake success.

## 7. Reviewer/Critic
Finds bugs, overcomplication, missing files, design drift, and risky changes.
Suggests specific fixes only.

## Multi-Agent Workflow

1. Product Architect defines goal and scope.
2. UI Designer confirms visual direction.
3. Frontend/Backend Builder implements.
4. Billing Engineer reviews if plans/usage/payment are involved.
5. QA Tester verifies.
6. Reviewer gives final critique.
7. Builder applies only necessary fixes.
