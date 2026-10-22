# Recently added home page and carousel cleanup

Status: Implemented locally; automated and fixture-browser verification completed.
No deployment or historical data migration performed.
Date: October 21, 2026

Current user-approved adjustment: use valid legacy `createdAt` as a temporary
recency fallback when no valid `addedAt` is available. This supersedes the
original strict legacy-date exclusion below. `addedAt` stays preferred; the
fallback applies consistently to selection, added sorting, displayed dates,
badges, and their expiry clock. Legacy creation dates may reflect past edit
approvals. This is a read-time policy; no stored dates are backfilled.
Related work: `tag-first-filter-system.md`, `items-layout-and-project-modal.md`.
Design reference: reviewed “Preview cards” mockup in this chat. Its dates and
illustrations are illustrative, not archive data.

## Outcome

Give returning visitors a clear view of additions, then let them explore the
complete archive using the existing filters. Replace the home page's discovery
carousels with one **Recently added to the archive** section above the archive.
Use the same **Just added** badge in recent cards and archive rows.

This document records the implementation and its verification. It does not authorize
deployment, commits, historical migration, or live submissions/moderation actions.

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
- User-requested follow-up: remove the **View all recent additions** link from
  the carousel header. Added-date sorting remains available in the full archive.
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
- User-approved follow-up: use valid historical `createdAt` as the temporary
  fallback for missing/invalid `addedAt`, accepting that past edit approvals
  may have reset it. Keep the two stored fields separate. Any historical
  backfill still needs explicit authorization before writing records.
- Unknown, invalid, and future dates receive no badge. Unknown/invalid dates sort
  after known dates in full-archive added ordering and are excluded from the
  recent carousel. Future dates must not lead the recent carousel.
- If fewer than 10 entries have a valid preferred/fallback addition date, show fewer. If none exist,
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

- [x] One recent carousel above the archive on the home page; old carousels removed.
- [x] Latest 10 known additions ordered deterministically from complete public data.
- [x] Added dates are distinct from original project dates and edit timestamps.
- [x] New publication sets addition time; edits and republishing do not reset it.
- [x] Shared 10-day badge behavior agrees between cards and archive rows.
- [x] Missing/future dates and historical timestamp coverage handled truthfully.
- [x] Full-archive added sorting remains available; the carousel View all link was removed at the user’s request.
- [x] Existing filter URLs, sort meanings, pagination and project history preserved.
- [x] Keyboard, touch, focus, resize and reduced-motion carousel behavior verified.
- [x] Dead carousel code/dependencies removed only after caller checks.
- [x] Automated checks/build pass; actual device/data limitations documented.

## Scope boundaries

No taxonomy changes, editorial collections, saved searches, analytics additions,
account redesign or moderation UX redesign. Backend changes are limited to truthful
addition timestamps and complete retrieval needed by this feature. Do not treat a
historical timestamp backfill as routine implementation: prepare it for review
separately. No deployment, merge, commit, or live data migration without a subsequent
request. Implementation should proceed by these phases, with timestamp provenance
and data completeness settled before the first UI QA milestone.


## Implementation record — October 21, 2026

### Timestamp audit and contract

The code audit found these previous behaviors:

| Write path | Previous behavior | Implemented behavior |
| --- | --- | --- |
| Direct published `/add` | `createEntriesBatch` overwrote `createdAt` and `updatedAt`, including an existing target ID | `createEntry` reads the destination in a Firestore transaction; new publication gets server `addedAt`; existing dates are retained |
| Pending `/add` | Incoming document got submission-time `createdAt`/`updatedAt` | Incoming `addedAt` is null; it cannot establish public recency |
| Approve new submission | Separate incoming/public batches; public creation dates reset | One transaction reads pending and destination documents, publishes with server `addedAt`, and records the review decision atomically |
| Approve existing-project edit | Public document replaced, creation date reset | Existing `createdAt` and `addedAt` retained; edit history merged |
| Direct PATCH/edit | `updatedAt` changed | Transaction reads persisted timestamps and retains them; only `updatedAt` advances |
| Hide/republish | PATCH status changed and creation history was not proven | Known `addedAt` retained; unknown legacy history remains null |
| Unused `addDoomPort` helper | Could overwrite an explicit public ID | Uses the same transactional timestamp contract, including unpublished-to-published transitions |

`addedAt` is optional in stored records, stored as a Firestore Timestamp, and
serialized publicly as an ISO UTC string or null. Only server timestamps are
serialized; client strings are never promoted to trusted publication dates.
`publicationState` is a server-owned internal provenance marker for new writes:
`unpublished` distinguishes a proven never-published new record from an unknown
legacy record. It is stripped from public responses. Client-supplied timestamp
and provenance fields are ignored by every archive writer.

An existing public-collection record without a trustworthy `addedAt` remains
unknown, even if its `createdAt` looks plausible. Approval previously overwrote
that field, so the audit does **not** justify a blanket historical backfill.
New approval timestamps refer to first creation in the public collection;
creation timestamps on existing public records are preserved.

The audit also found rejection using the same publication path as approval.
Rejection now updates only the incoming decision, never the public archive.
Already-reviewed submissions fail the transactional pending-state check, and
invalid review decisions are rejected before processing.

No production timestamp-coverage query was made and no live records were changed.
A later read-only local check found 68 projects and no `addedAt` values. The user
approved `createdAt` as a temporary legacy fallback so existing projects appear.
The section is omitted only when neither field supplies valid eligible instants.
There is no fallback to `updatedAt`, original project year, ID, or request time.
The fallback does not mutate stored `addedAt` values. A separate backfill proposal
would require read-only inventory, evidence for each historical first-publication
instant, an ID-to-date mapping with provenance, a dry-run diff, and explicit
approval before any writes.

### Complete retrieval and recency

The chosen path is opt-in `pagination=cursor&perPage=200` on the existing public
endpoint. It orders by document ID, reads one look-ahead document, and returns
`pagination.nextCursor` (a document ID or null). `cursor` uses `startAfter` on
that unique order. Status authorization remains in place; cursor mode supports
only the complete published collection. Legacy response shape and default
updated-date ordering remain available, including larger legacy page sizes.

The shared archive fetcher follows every page, validates pagination, deduplicates
IDs, rejects repeated/stalled cursors, normalizes addition dates, and restores
the existing updated-date archive order. Any failed page makes the archive
unavailable instead of displaying a partial set. `sort=added` and recent
selection operate on that complete result. Fetches span multiple queries rather
than a single snapshot; concurrent publication/removal during retrieval remains
a general consistency limitation. Subsequent requests refresh the archive.

A 425-record fixture verified retrieval past the previous cutoff, including the
newest addition in the last page. The fixture SSR payload was approximately
182 kB and Next reported its existing 128-kB advisory threshold. This is usable
for the current implementation, but archive growth warrants measuring real
payloads and moving browsing to server pagination if needed. No partial/subset
sort shortcut was introduced.

The pure recency helpers use explicit instants and stable ID ties. The page
shares one SSR reference time between cards and rows, then one timer schedules
the next arrival/expiry boundary. Tab visibility refreshes the clock. Public API
and archive SSR responses use `Cache-Control: no-store` so cached badges cannot
outlive their exact boundary.

### UI and cleanup

`RecentAdditions` renders server-side semantic section/list/card markup with
native horizontal overflow and scroll snap. Cards display preview/fallback,
title, credits, project year, explicit added date, shared badge, and the existing
project-navigation link. Navigation uses measured card positions, native disabled
buttons, reduced-motion preferences, focus reveal, and cleaned-up resize/load/
scroll observers. The first-card scroll-padding boundary issue found during QA
was fixed. The home route alone renders the section before the archive, hides
it for narrowing filters/standalone projects, and retains it under overlays.

Removed the unreachable discovery views, category wrappers, mini/simple cards,
lazy loader, unused custom Carousel, collection-cache reducer/type, and barrel
exports after checking callers. `react-slick`, `slick-carousel`, and exclusively
owned transitive lock entries were removed. Existing form/review cards, category
query helpers, the single project dialog, and the scroll-to-top control remain.

### Verification

- Node 20.20.2 used throughout; 40 frontend tests and five API tests pass (frontend suite rerun for the fallback change).
- API tests execute actual creation, edit, approval, and retrieval modules against
  an in-memory transactional fixture, including retry replay and repeated review.
  They do not initialize Firebase or make network/live writes.
- Both package TypeScript checks pass with `--noEmit --incremental false`.
- Direct ESLint passes on affected frontend/API TypeScript. The API has no own
  lint config, so its files were checked with the frontend's installed ESLint 9
  and config; only irrelevant React/pages detection advisories were emitted.
- SCSS compilation passes. A clean isolated production webpack build passes with
  fake local configuration; the running development server and its `.next` output
  were untouched. Build output notes the installed baseline-browser-mapping
  dataset age; no dependency update was included for that advisory.
- Headless installed Chrome with all external requests blocked verifies widths
  320, 390, 768, 1024, and 1440; long titles, missing images, no horizontal page
  overflow, and one/two/three visible-card layouts. Collection counts 0/1/2/3/10,
  all-old dates, and all-unknown dates are covered.
- Browser checks cover order, added labels, cards/rows badges, complete 425-item
  counts, arrow boundaries, keyboard focus reveal, reduced motion, and resize.
  A later-card project opens exactly one dialog; Close/Back restores carousel
  position and opener focus, and Forward reopens it. Direct standalone, overlay,
  filtered overlay, and added-sort URLs behave as intended.
- Browser checks cover row-tag hide/clear restoration and the clean
  `/entries?sort=added&page=1` link without inherited restrictions.
- Additional browser checks pass for added-sort page two, refresh and Back;
  search/source/author/year filter hide/clear; native horizontal wheel, normal
  smooth motion, Chrome touch-swipe emulation, and portrait-to-landscape resize.
  A controlled browser clock verifies that the single timer removes both card
  and row badges at expiry while retaining the older recent card. Submission and
  review views render no badges. These checks used only the local fixture API.

### Remaining QA and operational limits

No physical-device or Safari/Firefox testing was performed. Chrome touch
emulation cannot establish actual device ergonomics. A real hidden/suspended tab
and OS clock-change check remain useful manual follow-up. Authenticated Firebase
emulator/production integration and real moderation actions were deliberately not
used; writer tests are isolated fixtures. Real historical coverage remains
unmeasured, and no dates were backfilled. Deploy the API cursor contract with or
before the frontend; an older API lacking pagination metadata will fail closed.
The temporary fixture servers were stopped and the isolated QA application and
fixture scripts removed. No temporary routes, fake configuration, or viewport
settings were added to the repository's application routes.


### Follow-up — accepted legacy createdAt fallback

The shared `archiveAdditionDate` helper now prefers valid `addedAt`, then valid
`createdAt`. The public-data boundary normalizes both independently to ISO UTC
strings/null; it never copies the fallback into `addedAt`. Carousel selection,
added sorting, card dates, card/row badges, and the single expiry scheduler all
use the same effective date. A valid future `addedAt` retains precedence and is
excluded from the carousel, even if its `createdAt` is older. Entries older than
ten days still appear among the latest ten; only badges expire.

A focused regression test covers mixed old/new records, field priority,
time-zone normalization, invalid/missing/future dates, sorting, exact badge
expiry and preservation of the original fields. The frontend's 40 tests,
TypeScript and affected-file ESLint checks pass, as does a fresh isolated
production webpack build. Read-only SSR verification of the running local
68-project archive confirms ten carousel cards in descending `createdAt` order.
No API or stored-data changes were needed for this adjustment.

Browser verification against the same 68 local records confirms ten correctly
ordered cards, normalized added-date labels, next-card navigation, mobile layout
without page overflow, and matching added-sort rows on `/entries`. It used an
isolated production build with external requests blocked and reported no page
errors. The development overlay triggered by blocked external fetches was a QA
environment limitation. The temporary build server was stopped and its copy and
browser script removed; the existing development server remains running.


### Follow-up — modal URL/render synchronization

The reported failure affected carousel and archive links: browser history changed
but the dialog did not mount until a full reload. Fresh headless Chrome tests
passed, while the in-app browser reproduced both the initial browse-normalization
stall and the URL-only project navigation. The shared controller depended on the
Pages Router's concurrent React snapshot becoming available before rendering the
dialog.

`ProjectNavigation` now uses `useSyncExternalStore` to observe the committed
browser location. The observer queues notification after Next's
`beforeHistoryChange` event so it reads the URL after the actual history write,
and also observes route completion and Back/Forward (`popstate`). SSR still uses
`router.asPath`. Query parsing preserves repeated filters and normal decoding.
The existing Next router remains the sole writer of navigation/history, and the
existing single dialog, opener restoration, and browse-state coordinator remain
in use. No extra local selection state, custom history writes, or reload fallback
was introduced.

In the browser that reproduced the failure, opening from a recent card and an
archive row now mounts the dialog without a refresh. Verified Close/Back focus
restoration, Forward reopening, active-tag preservation, copied/refreshed project
URLs and keyboard Enter reopening. The project title updates correctly and no
browser errors were recorded. A screenshot was saved outside the repository as
`/tmp/doom-modal-fixed.jpg`.

Two regression tests cover notification before route completion, Back/Forward,
unsubscription with queued notifications, and repeated/encoded query values.
All 42 frontend tests, TypeScript, affected-file ESLint, and a clean isolated
production webpack build pass. The existing development server was left running;
no live data or moderation actions were performed.


### Follow-up — search cleanup

Search now applies only on Enter or the search button. Typing and blur leave the
applied query, results and URL unchanged. An explicit Clear button removes only
search, preserves other filters and sorting, and returns focus to the input.
Search from another page navigates to `/entries`.

One typed matcher replaces the inconsistent legacy helpers. Every term must
match, using case-insensitive Unicode word prefixes across titles, author-name
words, tags, IDs and validated original-project dates. Hashtag terms search tags
only. Whitespace normalizes on apply; missing and invalid dates contribute no
search text. Project presentation and search share the UTC calendar validator.

The archive URL coordinator now reads committed browser history, pushes submitted
searches and page navigation, and replaces other filter edits. It coalesces edits
without a typing debounce and protects newer edits during in-flight writes.
Back/Forward restores filters and results; modal-only changes do not rehydrate
browse state. Redux stores are created per server request and seeded from URL
filters, so direct search URLs render the right input and results immediately.

All 54 frontend tests pass, including new matching, reducer, SSR store-isolation,
history-race and cleanup regressions. TypeScript, affected-file ESLint and a clean
isolated production webpack build pass. The temporary build uses a tracing root
that accommodates its symlink to the existing dependencies; repository build
configuration is unchanged. The temporary build copy was removed afterward.

Browser verification against the local 68-record archive covered draft/blur,
button and Enter submit, AND matching, uppercase hashtags, author surnames,
pagination, unchanged submissions, Clear preserving tags/sort, Back/Forward,
project modal open/close and navbar search from another page. Direct HTML checks
confirmed correct initial search counts and input values. Mobile layouts at 320
and 390 pixels have no page overflow; no browser errors were recorded. Preview:
`/tmp/doom-search-cleanup.jpg`. The existing development server remains running.
