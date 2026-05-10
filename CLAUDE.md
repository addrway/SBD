# SBD AI Engineering Rules

Project: Simple Business Dashboard (SBD)
Mission: Build a simple, beautiful SaaS dashboard system for small business owners who want to enter simple data and instantly understand their business.

Core product philosophy:
"Enter your data. See your business clearly."

SBD is not trying to be Power BI or Tableau. SBD wins by being easier, faster, cleaner, and less overwhelming for non-technical business owners.

---

## 1. Think Before Coding

Before changing code, state:
- What page or feature you are changing.
- What problem the change solves.
- What files will be touched.
- What assumptions you are making.
- How the change will be verified.

Do not silently guess when business logic is unclear.

For SBD, ask especially before changing:
- Pricing logic.
- User account logic.
- Supabase schema.
- Stripe billing logic.
- Dashboard data model.
- Existing visual design system.

---

## 2. Preserve the SBD Design System

All SBD customer-facing pages must feel like the same product.

Use:
- Clean SaaS layout.
- White/light background.
- Blue accent color.
- Rounded cards.
- Soft shadows.
- Simple KPI cards.
- Clear dashboard sections.
- Beginner-friendly labels.

Do not randomly redesign pages unless explicitly asked.

When editing existing pages:
- Preserve layout structure where possible.
- Preserve navigation labels.
- Preserve brand tone.
- Preserve full file structure.
- Do not remove working sections unless required.

Admin/internal pages may use a darker command-center style only when the file already uses that style or the request explicitly asks for admin UI.

---

## 3. Simplicity First

SBD is for small business owners, not data analysts.

Every feature must answer a practical business question:
- Are we making money?
- Are sales going up or down?
- What is falling behind?
- What needs attention today?
- What changed since last week/month?

Avoid:
- Overcomplicated menus.
- Heavy enterprise BI language.
- Too many filters.
- Developer-only settings.
- Complex setup flows.
- Fake features that do not work.

Prefer:
- Simple forms.
- Clear charts.
- Plain-English insights.
- CSV import/export.
- Saved history.
- Small-business templates.

---

## 4. Surgical Changes Only

Touch only the files required by the request.

Do not:
- Refactor unrelated code.
- Rename files without need.
- Change unrelated UI.
- Delete working logic.
- Replace full architecture unless asked.

If a bug is found outside the request, mention it separately instead of changing it automatically.

Every changed line must support the user's request.

---

## 5. Full-File Delivery Preference

The user prefers full updated files, not tiny snippets.

When asked to fix or update a page:
- Return the full updated file.
- Keep the existing structure.
- Integrate the fix directly.
- Do not shorten the file just to make the answer smaller.
- Do not say "add this somewhere" unless the user specifically asks for a snippet.

---

## 6. Real SaaS Mode

SBD should be production-minded.

Use Supabase or the real backend as the source of truth for:
- Users.
- Accounts.
- Plans.
- Usage.
- Saved dashboard history.
- Client/project records.
- Billing state.

Do not use localStorage for business-critical data in production logic.

localStorage is allowed only for temporary demos, UI-only preferences, or clearly marked prototypes.

---

## 7. Verification Loop

Every change must define success criteria.

Examples:
- Page loads without console errors.
- Navigation links point to existing pages.
- Form saves data correctly.
- Dashboard cards update from real data.
- Supabase read/write works.
- Stripe plan status maps to app plan limits.
- Build passes on Vercel.

For bugs:
1. Reproduce the issue.
2. Identify the root cause.
3. Apply the smallest fix.
4. Verify the fix.
5. Mention anything still uncertain.

---

## 8. SBD Product Boundaries

Do not turn SBD into a generic BI platform.

SBD should focus on:
- Business snapshot dashboards.
- Sales dashboards.
- Finance dashboards.
- Inventory dashboards.
- Project/task dashboards.
- Simple client/business history.
- Simple AI insights.
- Templates for common small-business use cases.

SBD should not start with:
- Enterprise data warehouses.
- Complex role hierarchies.
- Custom SQL builders for users.
- Advanced analyst dashboards.
- Complex report designers.

Those can come later only after the simple product works.

---

## 9. Agent Collaboration Rules

When multiple AI agents are used:
- Planner defines the goal and files.
- Builder writes the code.
- Reviewer checks for bugs and overcomplication.
- UI Designer checks visual consistency.
- QA Tester verifies build, links, forms, and data flow.

Agents must not fight or rewrite each other randomly.

Reviewer should critique with specific fixes, not vague opinions.

---

## 10. Definition of Done

A task is complete only when:
- The requested feature/fix is implemented.
- The design still feels like SBD.
- No unrelated code was changed.
- The app can build or the page can run.
- Success criteria are verified or clearly marked as unverified.
- The final answer explains exactly what changed.
