# Tag-first archive filters implementation plan

Status: Implemented; automated checks and tablet-width browser checks passed.
Desktop/320px and physical-device QA remain outstanding.
Date: October 21, 2026
Selected direction: **Persistent tags** from the reviewed filter mockup.
Related work: `items-layout-and-project-modal.md` (completed).

## Outcome

Make tags the primary way to explore the archive, with immediate results on
desktop and an explicit apply step on mobile. Keep the compact project rows,
project dialog, search, sorting, pagination, and shareable URLs working together.
The Focused panel alternative informs the mobile controls; it is not a second
user-selectable desktop layout. Mockup records and counts are illustrative and
must not be copied into the application.

This plan covers frontend implementation and verification. It does not begin
implementation, change archive records, migrate tags, or authorize deployment.

## Product decisions

### Primary filters: tags

- Display a persistent tag rail beside results at desktop widths. Start with a
  1,024px breakpoint and verify it against actual row readability; below that
  width use the modal panel described below, including on tablets.
- Give the rail a visible Tags heading, Find a tag search, a compact popular-tag
  list, Browse all tags, and Clear tags. Keep selected tags visible even when
  they fall outside the popular list. A separate selected-tag area must remain
  visible while searching for another tag.
- Rank the initial eight popular tags by distinct project count across the full
  loaded archive, with alphabetical tie-breaking. Keep that order stable while
  filtering. Browse all tags presents the full list alphabetically.
- Tag search filters the tag vocabulary, not the project results. Match labels
  case-insensitively, tolerate an optional leading # and surrounding whitespace,
  and preserve the stored spelling/value for filtering and URLs. Show a useful
  no-matching-tags state without clearing selected tags.
- New UI selections default to **All selected tags**. Expose **Any selected tag**
  as an explicit alternative. Across different filter groups, conditions combine
  with AND. An empty selected-tag set imposes no tag restriction in either mode.
- Show a count beside each tag: the total matching projects with that tag added
  to the current selection, respecting All/Any and all other active conditions.
  For an already selected tag, show the current total. Provide a concise help
  label explaining that these are prospective result counts, not global totals.
- Count each project once, even if its tag array contains duplicates. Counts
  come from the complete archive before pagination and before any legacy result
  limit. Keep zero-count choices visible and selectable; zero results must be
  recoverable by removing a selection or clearing filters.
- Use native checkbox semantics and readable labels, rather than a large wall
  of colored pills. Active selections remain removable above the results.

### Secondary filters

Put these controls in a collapsed **More filters** section:

- **Source code linked:** one checkbox; unchecked means no source-code restriction,
  checked means the existing `hasCode=true` predicate. It does not claim that a
  repository is reachable, maintained, or licensed for reuse.
- **Author:** searchable multi-select. Match any selected author and retain all
  credits on matching projects. The mockup's single selector is simplified; the
  implementation must preserve existing multiple-author URL/state support.
- **Year:** From and To, each with Any year. Use valid years from archive records,
  not a hardcoded range. Use UTC consistently and reject/disable reversed ranges.
  Missing dates remain eligible when no year constraint is active.

Remove completion status, collaboration/author-count filters, entry-ID controls,
and result-limit controls from the main visitor UI. Preserve their existing URL
behavior and removable compatibility chips so an old link never applies an
invisible constraint. Do not add a new advanced-filter panel for these controls.

Search and sorting stay outside the filter panel. Preserve the current search
behavior; this work does not redesign keyword matching or global navigation.

### Desktop and mobile behavior

- Desktop rail edits apply immediately and reset results to page one only when
  values actually change. Keep keyboard focus on the edited control and avoid
  scrolling the page to the top after every selection.
- On smaller screens, one archive Filters button opens a full-screen native
  dialog with Tags first and More filters below. Keep the header and action
  footer reachable; use one scrolling content area with safe-area padding.
- Opening the mobile panel copies applied filters into a local draft. Draft
  selection changes update its preview count, not the background archive.
- **Show N projects** commits the draft in one transaction, resets page one when
  narrowing changes, closes the panel, and returns focus to the opener.
  Allow Show 0 projects; the archive empty state must explain recovery.
- **Cancel**, Close, Escape, and backdrop dismissal discard the draft. Closing
  must not publish draft values to Redux, the URL, or project links.
- Clear tags removes only draft tags; Clear filters removes narrowing filters,
  including search and legacy restrictions, but preserves sorting. On mobile
  these remain draft changes until Show N projects is selected. Result-area
  Clear filters and chip removals apply immediately.
- A breakpoint change while a draft is open discards it and shows the applied
  desktop state; never commit pending selections just because the window grew.
- Desktop does not need a second overlay containing the same controls. Update
  existing navbar/toolbar filter triggers so they target the rail on desktop and
  the single dialog on small screens; remove duplicate/obsolete drawer behavior.
  On non-archive routes, retain the existing route availability rules.

## Compatibility and state ownership

### Tag matching and old links

The current `filterItemsByTags` helper uses OR for positive tags, and some shared
callers may depend on that behavior. Do not silently change its global default.

- Add a typed `tagMatch` value (`all` or `any`) to the archive filter model and URL
  parsing/serialization. Keep new matching logic scoped to archive results or use
  an explicit helper parameter; inspect all category callers before altering it.
- Fresh unfiltered browsing starts in All mode. Serialize an explicit mode when
  tags are selected through the new controls.
- Existing URLs with positive `tag` values and no `tagMatch` retain Any semantics;
  make that choice visible in the UI. Unknown mode values fall back consistently
  to the same compatibility rule. Never reinterpret a saved old OR link as AND.
- Preserve repeated/comma-separated tags, encoded characters, multi-author values,
  and legacy ID/filter parameters. Inventory and characterize existing `!tag`
  exclusions before changing the helper; retain their compatibility path and
  show clearly labeled removable exclusion chips. Do not introduce exclusion UI
  or silently correct unrelated legacy matching behavior in this redesign.

### URL and history rules

- Applied state owns results, active chips, pagination, and project-link targets.
  Mobile drafts and tag-list search/expansion are local presentation state.
- Synchronize committed browsing changes to shallow URLs on both `/` and
  `/entries`. Replace the current browsing entry for filter/sort edits; debounce
  keyword input updates so typing does not create history entries or route races.
  Explicit page navigation pushes a browsing entry. A mobile apply is one URL
  update, not one update per draft checkbox.
- Hydration, refresh, and Back/Forward must restore the URL's requested page and
  filters without causing an update loop. User edits reset the page; hydration
  does not. Preserve unrelated parameters and remove cleared known values.
- Keep the existing project-dialog history contract: opening pushes a project
  entry; Close/Back restores the exact applied browsing state and scroll, and
  Forward reopens it. Draft values never leak into project URLs.
- All/Any is an operator, not an extra removable filter chip or a second active
  filter in the badge count. Clearing tags restores the new-selection All default.

### Upcoming tag taxonomy

Keep this implementation flat and data-driven. Do not hardcode hardware/software
categories, rename tags, merge tags, add aliases, or introduce backend schema
fields. Isolate tag label/value normalization and facet calculation so a later
canonical-ID/alias migration can replace that boundary. Stable canonical IDs,
searchable old labels, and backward-compatible links belong in that later plan.

## Implementation phases

### 1. Filter semantics and facet calculations

- Inspect all shared tag-filter, query, clear/reset, and category callers.
- Update `src/types/FiltersType.ts`, `src/store/filters.ts`,
  `src/utils/archiveResults.ts`, and `src/utils/projectNavigation.ts`.
- Extract pure matching/count helpers (for example `src/utils/archiveFacets.ts`)
  that share the same predicates with result rendering. Supply the full archive,
  not only current matches or a visible page, to the facet engine.
- Separate narrowing resets from sort resets and add one atomic mobile-apply
  action; avoid dispatching separate actions that render partial draft state.
- Add focused tests for All/Any, old links, duplicate/null tags, prospective
  counts, multi-author matches, year bounds, and clear/apply page behavior.

Deliverable: tested filter semantics and URL compatibility, with no layout switch.

### 2. Applied-state URL integration

- Extend serialization/hydration for tagMatch and committed filter changes.
  Reuse the existing navigation helpers instead of creating a second encoder.
- Coordinate `ArchivePage`, `ProjectNavigation`, keyword search, and pagination
  so hydration and user edits have distinct paths and pending search updates
  cannot overwrite a page selection or project navigation.
- Test ordinary updates, refresh/direct URLs, rapid consecutive edits, and
  Back/Forward transitions before adding the mobile draft interface.

Deliverable: applied filters are shareable independently of opening a project.

### 3. Persistent desktop tags — first browser QA milestone

- Extract shared filter controls from `src/components/Menus/FiltersMenu.tsx` into
  focused components for tag search/list, matching mode, and secondary controls.
  Add rail composition without coupling the controls to modal state.
- Update `ArchiveDataView.tsx`, scoped `archive.scss`, and necessary navbar trigger
  handling. Keep meaningful row width beside the rail; expand the archive's
  desktop container only as needed and retain consistent gutters.
- Wire popular/all tag views, counts, selections, empty states, source-code
  checkbox, searchable authors, year constraints, clear actions, and active chips.
- Preserve only View project as the project-opening row link. Do not turn the
  row or its tags into new project triggers.
- Check desktop keyboard use, count accuracy, live updates, and URL restoration.

Deliverable: desktop tag-first browsing ready for QA on `/` and `/entries`.

### 4. Responsive draft filter dialog

- Reuse controls in an archive-specific native dialog; preserve the unrelated
  moderation modal and project-dialog behavior.
- Add local draft lifecycle, draft preview counts, Cancel/discard, atomic apply,
  responsive trigger behavior, focus trapping/restoration, and body-scroll cleanup.
- Make changes to `settings.isFiltersMenu` ownership explicit; one state controls
  one small-screen filter dialog, not a rail and legacy drawer simultaneously.
- Verify resize transitions, long tag vocabularies, virtual keyboards, portrait,
  landscape, safe areas, and reachable footer controls. A bounded, scrollable
  tag list must not create competing scrolling areas in the mobile dialog.

Deliverable: the same filter system usable on phones and tablets.

### 5. Regression checks and handoff

- Run Node 20 package-local tests, TypeScript, direct ESLint, SCSS compilation,
  and an isolated production build without disturbing the running dev server.
- Reuse the lightweight existing test setup. Add fixtures for edge cases; do not
  introduce a broad test framework or write to live archive records for QA.
- Verify project modal/history flows, category navigation, and submission/review
  previews after changing shared filter/tag components. Do not submit records or
  moderation decisions as part of verification.
- Document observed results and explicit environment/device blockers in this
  file. Remove temporary fixture routes and reset browser viewport overrides.

## Acceptance checklist

- [ ] Tags dominate the desktop filter rail; secondary filters start collapsed.
- [ ] Popular tags stay stable; Browse all, tag search, selected-tag visibility,
  no-matching-tags recovery, Clear tags, and Clear filters work independently.
- [ ] All/Any matching, author OR matching, cross-group AND, and prospective counts
  agree with full matching results before pagination; duplicate tags do not inflate counts.
- [ ] Old multi-tag links retain OR semantics, including refresh and re-sharing;
  new All-mode links retain AND semantics. Unknown modes have a tested fallback.
- [ ] Legacy restrictions are visible and removable; new UI omits low-value controls.
- [ ] Clearing narrowing filters preserves sort; selecting filters resets page one;
  hydration preserves requested pages and pagination remains recoverable.
- [ ] Draft previews do not change background results/URLs. Apply commits once;
  Cancel, Escape, Close, backdrop, and desktop resize discard uncommitted edits.
- [ ] Keyword search, tag search, sort, and browsing-state URLs do not overwrite
  each other during fast input or navigation.
- [ ] Filter panel focus is contained, returns to its opener, and restores body
  scrolling. Selection announcements are useful and not excessively repetitive.
- [ ] Layout works at 320px, tablet, and desktop widths without horizontal overflow,
  clipped labels, unreadable rows, or inaccessible apply/close actions.
- [ ] Project Close/Back/Forward preserves filters, mode, sorting, page, and scroll;
  copied/refreshed links work on both archive routes.
- [ ] Category links and submission/review behavior retain their intended behavior.
- [ ] Automated checks and production build pass, with unrelated warnings and any
  physical-device verification limits recorded explicitly.

## Scope boundaries

Do not redesign global navigation, project details, accounts, submissions, or
moderation. Navbar changes are limited to integrating existing filter/search
controls. Do not migrate taxonomy/data, change API contracts, remove legacy URL
support, add saved searches/accounts for filters, introduce analytics, deploy,
merge, or commit without a subsequent request. Implementation proceeds in the
phases above, with desktop phase 3 as the first substantial browser QA milestone.


## Implementation and verification — October 21, 2026

Implemented the shared tag-first controls, 1,024px desktop rail, native responsive
filter dialog with local drafts, atomic apply, stable popular tags, tag search,
prospective counts, All/Any operator, searchable multi-author selection, UTC year
bounds, source-code checkbox, and sort-preserving clearing. Legacy restrictions
remain removable chips; exclusions are explicitly labeled. Shared legacy tag
matching remains unchanged (including exclusion-only links matching no records).
The archive uses explicit All matching in addition to that compatibility path.
No taxonomy, archive records, API contracts, or submission/review components changed.

Committed browsing state now writes shallow URLs on both archive routes. Keyword
writes debounce for 300ms; page-only navigation pushes, other edits replace.
The coordinator cancels pending keyword writes on navigation and retains newer
edits made during an in-flight URL write. URL hydration preserves requested page
state; rendering clamps invalid/out-of-range pages without publishing a user edit.
Project links continue to use applied state, never the mobile draft.

Observed checks:

- Node 20.20.2: all 30 package-local tests pass, including explicit modes, old-link
  fallback, duplicate/null tags, exclusions, facet counts before limits, UTC year
  boundaries, author OR, atomic apply, clearing, and URL serialization.
- TypeScript `tsc --noEmit`, direct ESLint on all changed TypeScript/TSX files,
  and standalone Sass compilation pass.
- Isolated production build passes with `next build --webpack`, using a temporary
  source copy and the existing dependencies. Default Turbopack rejected the
  temporary node_modules symlink because it crosses its filesystem root; the
  Webpack build completed type checking, compilation, page generation and traces.
  Existing baseline-browser-mapping age warnings remain. The running development
  server and its build directory were left in place.
- At the available 739px browser viewport, verified the native dialog, reachable
  fixed header/footer, preview count, unchanged URL during draft edits, Cancel
  discard, Escape dismissal, focus restoration, focus retention on tag edits,
  atomic apply, active chips, and applied project links. Selecting baremetal
  previewed and applied 39 projects from the current 68-record archive.
- Verified `/entries` All-mode refresh, project opening, Close, Back and Forward.
  Verified a legacy `/` two-tag link restores Any mode and page 2 (53 projects),
  page navigation pushes page 3, and Back restores page 2 and results 11–20.
- Code inspection confirms the archive is the only caller of the shared tag
  matcher. Category navigation and submission/review components were not altered;
  their full interactive regression flows were not exercised.

Remaining verification limits: this browser surface exposes no viewport resizing
control, so desktop rail readability, 320px overflow, resize dismissal, portrait/
landscape and virtual-keyboard/safe-area behavior need visual QA on those devices.
No viewport overrides or fixture routes were introduced. Rapid mixed navigation,
backdrop dismissal, screen-reader announcements and physical-device focus/scroll
behavior have not received a complete manual matrix. Unchecked acceptance items
above remain a QA checklist rather than a claim of observed coverage.

No deployment, commit, merge, submission, or moderation action was performed.
