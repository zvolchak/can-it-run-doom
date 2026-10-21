# Items layout and project modal implementation plan

Status: Phases 1–4 implemented; the compact archive is ready for browser QA. Phase 5 final verification remains.
Date: October 21, 2026

## Progress

Phase 1 adds exported `ProjectSummary` and `ProjectDetails` components, a shared
preview with a missing/broken-image fallback, scoped responsive styles, and
presentation helpers for authors, sources, tags, dates, and supported URLs.
The components accept data and explicit navigation props; they do not own
Redux selection, routing, or modal state. Existing archive views remain on their
current components until the integration phases.

Verified with Node 20: TypeScript, targeted ESLint, SCSS compilation, a production
Next.js webpack build, and 12 isolated data/rendering checks using a temporary
Node test harness. Checks cover zero/one/many collections, invalid URLs and
dates, stable keys, timezone consistency, complete credits/link rendering,
missing optional fields, and escaped text. No test framework was added.
The Phase 1 build reports an existing stale
`baseline-browser-mapping` data warning but completes successfully.

### First browser QA milestone: project preview dialog

Phase 2 connects `ProjectDetails` to the existing `ItemPreviewModal` using a
project-specific native `ProjectDialog`. The shared moderation modal remains
unchanged. Main archive cards now include a **View project** button, and mini
cards open the same preview with native button keyboard behavior.

The dialog has a dimmed, inert background; initial Close focus; forward/reverse
Tab cycling; Escape, Close, and backdrop dismissal; restored opener focus; and
restored body scroll styles. Desktop has one bounded content scroller with a
persistent close header; mobile uses the full dynamic viewport with safe-area
padding. The preview preserves the complete image and has a bounded height.

Verified in the running application at `http://localhost:3000`:

- One active native modal with the selected entry's accessible name.
- Desktop layouts at 739px and 1280px; full-screen mobile at 320px without
  horizontal overflow, with stacked source sections and a reachable header.
- Real data: **Doom as Neural Model** (four authors, two code links), **Doom in a
  PDF file** (three media links), and **Digital Camera: Kodak dc210 (1998)** (two
  code links, opened using Enter on its mini card).
- Forward/reverse focus boundaries, Escape, explicit Close, backdrop dismissal,
  restored trigger focus, preserved search and scroll position, and independent
  dialog scrolling while background scrolling stays locked.
- Node 20 TypeScript, targeted ESLint, and global SCSS compilation pass. A browser
  console form-field warning already present before this work remains unrelated.

QA steps: open the local archive, search for `Neural`, and select **View project**.
Inspect credits and both source lists; try Tab/Shift+Tab, Escape, Close, and a
backdrop click. Narrow the browser to check the full-screen mobile layout and
scroll to the last source link. Search for `PDF` to inspect multiple media links.

At the first visible milestone, the archive retained its existing full cards and
the dialog used Redux selection. Phase 3 replaces that selection mechanism as
described below. Client-side broken-image fallback still needs a controlled
browser check. No archive records or backend contracts were changed.

### Phase 3: shareable URLs and browser history

One page-level `ProjectNavigation` controller now owns project selection through
`project=<id>`. Archive and category links have real destinations; ordinary
clicks open shallow routes while modifier clicks keep native link behavior.
Before opening, current Redux filters and pagination replace the underlying
archive URL. A known in-app modal entry closes through Back; a copied or
refreshed entry closes by removing only `project`. Opening and closing do not
refetch the archive or reset its background filter state.

Both `/` and `/entries` now share `ArchivePage`, URL hydration, and null-safe
project metadata. A single legacy `id` uses shared standalone project details;
multiple IDs retain archive filtering. Unknown IDs have recoverable standalone
or modal states. Project lookup uses the complete collection, independently of
active search results. Explicit false completion/code filters are handled
consistently before and after URL serialization.

Verification:

- Browser Back, Forward, Close, and Escape preserve search, page two, opener
  focus, and the exact recorded scroll position.
- Direct and refreshed modal links work, including a Neural project over PDF
  search results. Direct-link dismissal stays in the archive and preserves
  unrelated query parameters.
- Both archive routes support legacy single IDs, multiple-ID filtering, and
  unknown IDs. Copied modal URLs show selected-project metadata.
- Literal percent signs, plus signs, and accented search text survive navigation.
  The completion **No** filter keeps the same results across opening/closing.
- Nine persistent Node tests cover serialization, cleared and false filters,
  repeated parameters, browsing-state identity, encoding, and invalid pages.
  Run `npm run test:project-navigation` from `webapp/` with Node 20.
- Node 20 TypeScript, targeted ESLint, SCSS compilation, and an isolated
  production webpack build pass. The build used a temporary project copy to
  preserve the running development server's build directory.

QA link: `http://localhost:3000/?search=Neural&page=1&project=1043`. Open it,
refresh, and close; search should remain `Neural`. Then select View project in
the archive, use Back to close, and Forward to reopen. A standalone view is
available at `http://localhost:3000/entries?id=1043`.

### Phase 4: archive container and compact browsing

The main archive now uses its own responsive `archive-browser` container, capped
at 1,088px with consistent gutters, instead of the old centered grid and `.item`
card width rules. The toolbar groups the full result count and visible range,
filter access, and sorting. Removable chips cover all active narrowing filters,
including false boolean choices, author/ID selections, year bounds, and limits.

`ProjectSummary` now renders the list: uncropped thumbnails, complete accessible
project titles, two-author summaries with an accurate additional-author count,
year, a short description, tags, and View project. At narrow widths the synopsis
and secondary tags are hidden to keep rows compact; complete information is in
the modal. Only the View project action is a semantic project link; the image, title, metadata, description, and tags are non-interactive.

Filtering and pagination are derived before rendering. Counts and drawer facets
use the complete matching set; the visible page remains ten entries. User
filter/sort edits reset pagination, URL hydration preserves the requested page,
and out-of-range pages clamp safely. Pagination now uses native buttons with
current-page and disabled-boundary semantics. Empty results offer clear-all
recovery. Discovery carousels remain in the unfiltered archive and are hidden
while narrowing results so they do not contradict a search or empty state.

The existing filter drawer is scrollable, restores focus on close, is inert
while closed, and uses keyboard-operable tag buttons. Year choices are sorted
and start-year changes use the native change event; the completion control has
a unique ID. Null legacy authors/tags and missing dates are handled safely by
search, facets, and range filtering.

Verification:

- Node 20 TypeScript, targeted ESLint, SCSS compilation, and an isolated
  production webpack build pass. `npm run test:archive` runs 21 passing tests
  (nine navigation tests and twelve result/filter/pagination regressions).
- At 320px and 1280px the document has no horizontal overflow. The desktop
  container measures 1,088px. Mobile rows, wrapping controls, pagination, and
  full-screen project dialogs fit the viewport.
- With the current data, the toolbar and drawer correctly show 68 projects on
  page two; page seven shows 61–68, eight rows, and disabled Next. Filtering
  from page seven down to one result returns to page one without an empty page.
- Newest/oldest ordering, year filtering, individual chip removal, No completion
  filtering, keyboard tag toggling, clear-all, and zero-result recovery work in
  the browser. Empty filtered views do not show unrelated discovery sections.
- Opening from the last row on page two, Back, Forward, and Escape restore page
  two and the recorded scroll position (1,242.5px in the desktop check). Enter
  on a mobile row opens exactly one 320px-wide project dialog.

QA at `http://localhost:3000/`: browse rows, change sorting, page forward, then
search for `Neural` or a nonexistent title. Remove chips or clear filters, open
a project, and use browser Back/Forward. Repeat at a narrow viewport.

Next: Phase 5 final cross-route/accessibility checks and controlled missing-image
verification, plus any adjustments identified during user QA. No archive data,
backend contracts, or moderation-dialog behavior changed in this phase.

## Goal

Make archive entries easy to scan, then open an accessible project modal that
credits every author and exposes every media and source code link. Preserve the
visitor's browsing context when opening, closing, and sharing a project.

## Design direction

- Start with **compact rows**, the selected browsing mockup. Keep summary content
  reusable so an image-led grid can be added without duplicating data logic.
  A grid/list switch is a follow-up, not a prerequisite for this work.
- Each row includes a consistently sized image, title, up to two author names
  with a `+N more` summary, year, a short description, a small tag selection, and
  a clear **View project** link. Stack content on narrow screens.
- Open a centered modal over a dimmed archive on desktop. On mobile, use an
  edge-to-edge dialog with a clear **Back to archive** control.
- Inside the modal, show title/date, the complete wrapping author list, a wide
  uncropped preview image, description, **Media & references**, **Source code**,
  tags, and completion information. Put the two link sections side by side when
  space allows and stack them on mobile.
- Use one scrolling modal content surface. Keep Close reachable without adding
  independently scrolling image, author, or link panels.
- Preserve charcoal surfaces and Doom red accents. Use readable body text,
  restrained borders, visible focus states, and text labels alongside icons.
- The mockup's extra authors, repositories, descriptions, and completion status
  are illustrative. Production content must come from actual entry records.

## Current implementation and constraints

- `webapp/src/components/Views/ArchiveDataView.tsx` renders full `ItemCard` detail
  panels in one column, with ten entries per page.
- `ItemCard`, `ItemCardSimple`, and `ItemCardMini` have different content and
  interaction patterns. Mini cards dispatch Redux selection from a clickable
  `div`; the full card's ID navigates to `/?id=...`.
- `ItemPreviewModal` is mounted in categorized views and reads selection from
  both its `item` prop and Redux. Consolidate ownership when connecting rows.
- The shared `webapp/src/components/Modal.tsx` is also used by moderation.
  Changes to its behavior or styling require a moderation regression check.
- Both `/` and `/entries` render `ArchiveDataView` and `MiniCategorizedView`.
  Mount one project modal controller per page; do not leave duplicate dialogs
  in category sections.
- Entry selection is currently independent of the URL. Filters and pagination
  also update Redux without consistently updating the URL.
- Existing `id` query parameters filter results and provide project metadata.
  Do not silently turn that filter into modal state.
- `IArchiveItem` already supports arrays of authors, media sources, and code
  links. Each source supplies only `name` and `url`; there are no per-link
  descriptions, repository roles, or media-type fields to display verbatim.
- Live data comes through the API. Bundled JSON can inform development fixtures
  but must not replace the production fetch path.

## Implementation sequence

### 1. Define shared presentation and data handling

- Introduce a compact summary component and a project-details component under
  `webapp/src/components/Item/`. Reuse the details component in the modal and in
  direct project views.
- Keep filtering, routing, and modal selection outside presentation components.
  Pass the item and explicit callbacks or link destinations as props.
- Format author summaries and dates consistently. Preserve full titles in the
  detail view and accessible names when visual summaries are truncated.
- Handle missing arrays, null legacy fields, long names, missing images, absent
  descriptions, invalid dates, and missing author URLs without crashing.
- Render every valid media/code link using its stored name and a secondary
  hostname. If a name is absent, use the hostname as a fallback. Do not invent
  labels such as “firmware” or classify every source as a video.
- Use stable link keys that distinguish repeated names with different URLs.
  Link only supported external HTTP(S) destinations; show unlinked author names
  when no usable URL exists.
- Omit empty optional sections. Show completion as recorded; a false value
  must not imply that a project cannot run Doom.

### 2. Build the project dialog and its responsive layout

- Adapt the shared modal or add a project-specific shell without changing the
  moderation dialog's intended content layout.
- Add an accessible dialog name, initial focus, focus containment, Escape,
  explicit Close, backdrop dismissal, and focus restoration to the opener.
  Make the underlying archive inert while open.
- Lock background scrolling and restore the previous body styles on close or
  unmount. Account for scrollbar width so opening the dialog does not shift the
  archive horizontally.
- Keep all authors visible and linked where possible. Render media and source
  code as separate semantic lists with labels and optional counts.
- Use `object-fit: contain` for previews, meaningful alternative text, and a
  working missing/broken-image fallback. Check `ImageLoader`'s current error
  handling before reusing it.
- Constrain desktop height to the available viewport. Use the mobile viewport
  and safe-area insets so the close control and footer remain reachable.

### 3. Connect project state to navigation

- Use a distinct `project=<id>` query parameter for the modal, retaining `id`
  as the existing archive filter. Use the URL as the source of truth for which
  project is open; Redux selection may remain a derived compatibility value.
- On View project, push a same-page URL with the project ID and current search,
  filters, sort, and page. Use Pages Router shallow navigation and `scroll:
  false` where appropriate so the archive remains mounted.
- Serialize the current Redux browsing state when opening a project; simply
  copying `router.query` would lose filters or pagination changed only in Redux.
  Keep unrelated query parameters intact.
- Opening a project must not add it to the archive's ID filter or alter the
  underlying result set. Review page initialization effects that currently
  clear selection or replace filters when query props change.
- For an in-app open, Close/Escape/backdrop and browser Back return to the
  captured archive URL and scroll position. Only call history Back when this
  controller knows it created the modal history entry.
- On a direct `project` URL, show the project over the archive; Close removes
  only `project` via replacement rather than leaving the site. Browser Forward
  should reopen a project after an in-app Back action.
- Resolve the selected project from the complete loaded collection, not only
  the current page or filtered results. Unknown IDs show a recoverable
  project-not-found state with a working close action.
- Preserve legacy `/?id=...` and `/entries?id=...` links. For a single matching
  ID, reuse the project details in a standalone view; preserve existing
  multiple-ID filtering. Use the existing single-entry URL for **Open project
  page** and support normal new-tab navigation from summary links.
- Share the selected project's title, description, and image metadata on direct
  requests. Handle missing IDs safely in both pages' current metadata code.

### 4. Integrate compact browsing

- Replace expanded detail panels in `ArchiveDataView` with compact summaries.
  Keep the current page size initially and retain pagination.
- Group the filtered result count, existing sort choices, filter access, and
  active-filter summary above the rows. Calculate counts before pagination;
  show a useful filtered-empty state with a clear-filters action.
- Preserve existing filter meanings. Reset or clamp pagination when filters
  make the selected page invalid.
- Replace clickable `div`/`span` project triggers with semantic links/buttons.
  Avoid nesting author/tag links inside another clickable control.
- Route category cards and mini showcases through the same project-opening
  behavior. Reuse summary presentation where appropriate without forcing
  carousel cards to use the row geometry.
- Consolidate modal mounts and retire redundant item markup only after checking
  all callers, including category containers and moderation views.
- Scope new styles in `webapp/src/styles/items.scss` and related components.
  Remove conflicting global `.item` width rules from redesigned components
  without changing unrelated forms or page layouts.

### 5. Verify the complete flow

- Run package-local TypeScript and ESLint checks against the changes and a
  frontend production build using Node 20 and the required local configuration.
  Invoke ESLint directly: `webapp` currently maps `npm run lint` to `next lint`,
  which is not a valid lint command for its declared Next.js 16 version.
- Compare any check failures with the pre-change baseline; record unrelated
  failures rather than expanding this design change into general cleanup.
- Add focused automated coverage for URL/history transitions and collection
  rendering if suitable tooling exists. No test runner is currently declared
  in `webapp/package.json`; avoid introducing a broad test framework solely for
  presentational assertions.
- Perform the acceptance checks below in the running application. Use the live
  API or supported local configuration; use isolated fixtures for edge cases.
  Report environment blockers without claiming unperformed browser checks.

## Acceptance checks

- [ ] Rows remain readable at 320px, tablet widths, and desktop widths without
  horizontal overflow or cropped device imagery.
- [ ] Opening from rows or category cards shows one centered desktop modal or
  one mobile dialog; it does not expand content below the results.
- [ ] Entries with zero, one, two, and many authors render correctly; all authors
  appear in details, and `+N more` is accurate in summaries.
- [ ] Zero, one, and many links in each source section render independently.
  Duplicate display names, long URLs, and absent names do not break layout.
- [ ] Missing/broken images and absent optional metadata have usable fallbacks.
- [ ] Keyboard users can open, traverse, and close the dialog. Focus returns to
  the opener, and background controls cannot receive focus while it is open.
- [ ] Close, Escape, backdrop, Back, and Forward preserve the expected archive
  filters, ordering, page, and scroll position.
- [ ] Refresh, copied modal URLs, new-tab project links, legacy single-ID links,
  multiple-ID filters, and unknown IDs behave as specified above.
- [ ] Result counts represent all filtered matches, not just the visible page;
  empty results and invalid page numbers are recoverable.
- [ ] Long project content uses one scroll surface; mobile safe areas and
  reachable close controls work in portrait and landscape.
- [ ] Category browsing, submission/review dialogs, and external links retain
  their intended behavior.

## Scope boundaries

This is frontend work unless implementation reveals a data-contract requirement.
Do not add schema fields to reproduce illustrative mockup text. Exclude global
navigation redesign, account/submission redesign, archive-data edits, deployment,
and a comprehensive testing-tool migration. Preserve unrelated working-tree
changes in `api/index.ts`, `api/utils/loadEnv.ts`, and `webapp/next-env.d.ts`.

## Delivery order

1. Shared project details and accessible dialog shell.
2. URL-driven selection, direct-link compatibility, and history behavior.
3. Compact rows and category integration.
4. Responsive polish, verification, and a concise implementation report.

The work is complete when the acceptance checks pass or any unmet checks are
explicitly documented with their blockers. Creating this plan does not begin
implementation or authorize publishing/deployment.
