# Recently added home page and carousel cleanup

Status: Planned; implementation has not started.
Date: October 21, 2026
Related work: `tag-first-filter-system.md`, `items-layout-and-project-modal.md`.
Design reference: reviewed “Preview cards” mockup in this chat. Its dates and
illustrations are illustrative, not archive data.

## Outcome

Give returning visitors a clear view of additions, then let them explore the
complete archive using the existing filters. Replace the home page's discovery
carousels with one **Recently added to the archive** section above the archive.
Use the same **Just added** badge in recent cards and archive rows.

This document plans implementation; it does not implement, deploy, commit, migrate
records, or authorize live submissions or moderation actions.

## Product decisions

- `/`: recent additions first, full searchable/filterable archive below.
- `/entries`: full archive only, without a recent carousel.
- Remove the home-page All Ports, Latest Submissions, Source Code Enthusiasts,
  First Level Completed, and Collaborators carousels. Do not replace them with
  other collections in this change.
- Recent section: latest **10 archive additions**, descending by addition instant.
  This is chronological, not random or editorially selected.
- Three cards visible on desktop, two on suitable tablet widths, one with a small
  next-card preview on phones. Validate widths against real card titles.
- Always start at the newest card. No automatic advance, infinite wrapping,
  autoplay, randomized content, or initial slide offset.
- **Just added** applies for a rolling 10-day window: addition instant is not in
  the future and `0 <= now - addedAt < 10 * 24 hours`. Use UTC instants, not local
  midnight boundaries. At exactly 10 days, the badge expires.
- The latest 10 remain in the carousel even when older than 10 days; only
  qualifying entries receive the badge.
- Show an explicit **Added [date]** on recent cards, separate from the original
  project's year. Do not label the original project date as an archive addition.
- Badges appear on recent cards and full-archive rows on both archive routes,
  including filtered results. Do not add them to moderation/submission previews.
- A project may appear in both the carousel and archive; that is intentional.
- Card content: preview, title, author credit, original project year, addition
  date, badge when eligible, and View project. Keep cards compact; no long
  description or duplicate tag-filter interface inside the carousel.
- **View all recent additions** opens `/entries?sort=added&page=1`. It sorts all
  archive additions, without a 10-entry result limit or a 10-day restriction.
- Keep existing `latest`/`oldest` URL semantics for original project date. Add a
  distinct `added` sort option labeled **Recently added to archive**.
- On `/`, hide the recent section while narrowing filters are active so the
  carousel does not display projects outside the user's results. Sorting alone
  does not hide it. Clearing narrowing filters restores it.
- Standalone `?id=...` project views do not render the section. A `?project=...`
  overlay preserves its underlying browsing view and carousel position.

## Findings from the current code

- Both archive routes share `ArchivePage`; `MiniCategorizedView` currently renders
  below archive results on both routes when no narrowing filter is active.
- “Latest Submissions” sorts by `publishDate`, not archive addition time. Its More
  link applies `sort=latest&limit=10`, which is not the proposed recent browsing.
- `CategoryContainer` and `GrouppedMiniShowcase` each configure `react-slick`.
  Settings are duplicated; a breakpoint sets `initialSlide: 2`, cards have fixed
  35rem heights, and custom arrow controls are clickable divs.
- `ItemsCollection` computes randomized lists and dispatches Redux updates during
  rendering. Recent additions need neither collection caching nor randomness.
- API models include `createdAt`, and `getEntries.ts` serializes it through JSON,
  but the frontend archive type does not declare it.
- `createEntriesBatch` sets `createdAt` on writes; approval calls that helper and
  can target an existing entry. Therefore `createdAt` is not yet proven to mean
  first public archive addition. `updatedAt` is explicitly an edit timestamp.
- Public fetching currently defaults to 200 entries ordered by `updatedAt` before
  the frontend sees them. Sorting that subset cannot guarantee the true latest
  additions or a complete “View all” list as the archive grows.

## Phase 1 — Establish truthful addition timestamps

Trace direct published creation, pending creation, approval of a new submission,
approval of an edit to an existing project, direct edits, and hide/republish flows.
Document where dates are retained, reset, and serialized. Inspect legacy timestamp
coverage read-only if suitable access exists; do not modify live records.

Introduce a server-owned, optional **`addedAt`** timestamp for first publication to
the public archive. Keep `publishDate`, `createdAt`, and `updatedAt` meanings intact.

- Set `addedAt` on first public publication, not on pending submission creation.
- Preserve the existing value on all edits, edit approvals, and republishing.
- Determine first publication from persisted state; never trust a client-supplied
  timestamp. Validate every writer and protect against concurrent/retried writes.
- Normalize the public response to a documented ISO UTC string or null. Add the
  corresponding optional frontend field and shared parsing/validation boundary.
- Do not fall back to `updatedAt`, project date, numeric ID, API array order, or
  “now” when the addition date is missing.
- Use historical `createdAt` only if the audit demonstrates it represents first
  publication for the affected records. Never silently claim all legacy dates
  are reliable. Any historical backfill needs its own reviewed mapping/dry run
  and explicit authorization before writing records.
- Unknown, invalid, and future dates receive no badge. Unknown/invalid dates sort
  after known dates in full-archive added ordering and are excluded from the
  recent carousel. Future dates must not lead the recent carousel.
- If fewer than 10 reliably dated additions exist, show fewer. If none exist,
  omit the recent section while leaving the archive available. Do not invent
  dates to fill the section. Record this data-coverage limitation at handoff.

Deliverable: explicit timestamp contract and tests for first publication versus
editing. Resolve timestamp provenance before shipping the “Recently added” claim.

## Phase 2 — Pure recency logic and complete data access

Create a small utility module for parsing addition dates, deterministic descending
ordering (stable ID tie-break), selecting the latest 10, and computing eligibility
for Just added. Keep it independent of React and carousel state.

- Pass an explicit reference time to helpers for deterministic tests.
- Supply one server reference time to the page so SSR and hydration agree. After
  hydration, expire badges at their next boundary and refresh on tab visibility;
  avoid a per-row timer and unnecessary polling. Account for existing page/API
  cache lifetimes near badge boundaries.
- Reuse the same predicate and reference time for cards and archive rows.
- Do not change archive order by default or the semantics of project-date sorts.
- Ensure recent selection and added sorting operate across the published archive,
  not a page, filtered subset, or the current API's 200-record cutoff.
- Preferred data path: extend public archive retrieval with backward-compatible
  cursor pagination and have the shared SSR fetcher retrieve all published pages.
  Use stable ordering/ties, deduplicate IDs, detect stalled/repeated cursors, and
  handle fetch failures without presenting a partial set as a complete archive.
  Preserve existing API consumers and status authorization rules.
- If fetching the whole archive is unsuitable after measuring, explicitly replace
  this with a server-ordered recent query and paginated added browsing; do not
  ship the subset-sort shortcut. Document the chosen path before UI integration.
- Extend sort types, result helpers, select options and URL tests for `sort=added`.
  Reuse `archiveQuery` and existing shallow/history coordination.

Test dates at zero age, just before/exactly/after 10 days, UTC/time-zone offsets,
future/invalid/null values, ties, fewer than 10 records, and edits that preserve
addition time. Test a fixture larger than 200 entries and recent records outside
its first updated-order page. Test that existing sort URLs remain unchanged.

## Phase 3 — One focused carousel

Build `RecentAdditions` with a small presentational card and a scoped stylesheet.
Prefer **native horizontal overflow with CSS scroll snap** over another slider
configuration. Keep data selection outside the presentation component.

- Render accessible semantic section/list markup on the server, including the
  first cards; avoid client-only mount gates and loading a whole slider library.
- Native buttons for previous/next with descriptive accessible names. Keep them
  keyboard accessible; expose boundary disabled states from actual scroll state.
- Touch swipe, trackpad and buttons navigate the same scroll area. Determine
  movement from measured card positions rather than assumed fixed pixel widths.
- Scope scrolling to this carousel; never move page scroll or keyboard focus
  when advancing. Offscreen cards must scroll into view when keyboard-focused.
- Recalculate boundaries after resize, item/image layout changes, and viewport
  changes. Clean up observers and event listeners; respect reduced motion.
- Hide unnecessary navigation when every card fits. Test 0, 1, 2, 3 and 10 items.
- Maintain visible focus, readable title wrapping, adequate touch targets, and
  image dimensions/fallbacks without horizontal page overflow.
- Reuse existing preview, credit, date and external-link formatting where useful;
  do not force the full archive row into a card or reuse fixed-height old cards.
- Recent-card View project uses `useProjectLink`, with unique project IDs as keys.
  Reuse the single existing project dialog; no second modal/navigation encoder.
- Card and row badges use one presentational badge component with readable text;
  do not rely on color or add an extra accessibility announcement per item.

Deliverable: responsive, keyboard-usable recent carousel and shared badge.

## Phase 4 — Page integration and remove obsolete carousel paths

- Render the recent section before `ArchiveDataView` only on `/`, subject to the
  narrowing/standalone rules above. Keep it within `ProjectNavigation`.
- Keep heading hierarchy and page landmarks valid; the new section must not add a
  second main landmark or displace the archive heading used by pagination.
- Integrate badges into `ProjectSummary` without changing tag ranking/toggling,
  mobile metadata rows, or View project separation.
- Remove the old `MiniCategorizedView` render path and its obsolete carousel UI.
- Trace actual page/layout imports and barrel exports before deleting:
  `MiniCategorizedView`, `CategorizedDataView`, `PaginatedDataView`,
  `CategoryContainer`, `GrouppedMiniShowcase`, `MultirowCategoryContainer`,
  `ItemsCollection`, and their card/title helpers.
- Delete only code proven unreachable or exclusively supporting removed sections.
  Preserve helpers used by entry forms/review, category URLs, project details,
  and other live routes. Existing shared category links must continue to resolve.
- Remove unused collection-cache actions/state only after checking every caller.
- If no live consumer remains, remove `react-slick`, `slick-carousel`, their type
  package, style imports and corresponding package-local lockfile entries.
- Keep unrelated scroll-to-top functionality if it is still needed; do not remove
  it accidentally with a carousel wrapper.

## Phase 5 — Regression checks and handoff

Use Node 20 and existing lightweight test setup. Add focused frontend/API tests
without a broad framework or live writes. Use local fixtures/emulators for writer
and approval tests; never publish or moderate real submissions during QA.

Run package-local tests, frontend/API TypeScript, direct ESLint on affected files,
SCSS compilation, and an isolated production build without disturbing the running
dev server. Record any bundler/runtime/environment limits rather than masking them.

Browser matrix:

- `/`: recent section above archive; correct card count/order/date labels/badges;
  latest 10 remain present when all are older than 10 days.
- `/entries`: no carousel; added sort works across complete data and paginates.
- 320px, 390px, tablet, 1,024px and wide desktop; portrait/landscape, long titles,
  missing images, one card, fewer-than-visible cards, all 10, and empty data.
- Swipe, trackpad, keyboard navigation, focus visibility, arrow boundaries,
  reduced motion, resize recalculation and no horizontal page overflow.
- Apply/remove tags, author/year/source filters, search and clear; recent section
  hides/restores appropriately without clearing filters or resetting pagination.
- Direct/refresh/Back/Forward for `sort=added` and existing sorts; View all recent
  starts clean browsing at page one without an inherited filter or limit.
- Open a project from a later carousel card; Close/Back restores page scroll,
  carousel scroll and opener focus; Forward reopens the project. Repeat with
  copied/refreshed project URLs and an active archive filter.
- No double URL synchronization, duplicate project dialogs or draft-filter leakage.
- Verify submission/review previews and existing category links still behave as
  intended after removing old helpers; no real submissions/moderation decisions.

Update this plan with observed results, remaining QA gaps, timestamp coverage,
and any separate backfill proposal. No temporary fixture routes or viewport
settings left behind.

## Acceptance checklist

- [ ] One recent carousel above the archive on the home page; old carousels removed.
- [ ] Latest 10 known additions ordered deterministically from complete public data.
- [ ] Added dates are distinct from original project dates and edit timestamps.
- [ ] New publication sets addition time; edits and republishing do not reset it.
- [ ] Shared 10-day badge behavior agrees between cards and archive rows.
- [ ] Missing/future dates and historical timestamp coverage handled truthfully.
- [ ] View all recent opens unlimited added-order browsing on `/entries`.
- [ ] Existing filter URLs, sort meanings, pagination and project history preserved.
- [ ] Keyboard, touch, focus, resize and reduced-motion carousel behavior verified.
- [ ] Dead carousel code/dependencies removed only after caller checks.
- [ ] Automated checks/build pass; actual device/data limitations documented.

## Scope boundaries

No taxonomy changes, editorial collections, saved searches, analytics additions,
account redesign or moderation UX redesign. Backend changes are limited to truthful
addition timestamps and complete retrieval needed by this feature. Do not treat a
historical timestamp backfill as routine implementation: prepare it for review
separately. No deployment, merge, commit, or live data migration without a subsequent
request. Implementation should proceed by these phases, with timestamp provenance
and data completeness settled before the first UI QA milestone.
