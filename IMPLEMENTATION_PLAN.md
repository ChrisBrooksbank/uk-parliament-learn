# Implementation Plan

## Status

- Planning iterations: 1
- Build iterations: 0
- Last updated: 2026-03-09

## Notes

### Architectural Decisions

- **YAML loading strategy**: Vite bundles browser apps — YAML files in `content/` must be either imported via a Vite YAML plugin (`@modyfi/vite-plugin-yaml` or similar) or pre-converted to JSON at build time. Recommended: use a vite plugin so imports are typed and tree-shaken.
- **Routing**: Hash-based routing (`/#/topic/foo`) requires no server config — correct for a PWA served statically.
- **Content API**: Lives in `src/api/` (placeholder already exists). Singleton with in-memory cache after first load.
- **Level state**: Global state via a lightweight reactive store (no Redux needed — a simple signal or Zustand-style atom). Store in `src/core/`.
- **Search index**: Build at startup from loaded content using Fuse.js (fuzzy) or a simple inverted index. No server needed.
- **Glossary tooltips**: Post-process rendered topic HTML to wrap known terms — use a custom renderer step.
- **Test structure**: Unit tests alongside source files (`*.test.ts`). E2e in `e2e/` (Playwright already configured).

---

## Tasks

### Phase 1 — Content Loading (spec: content-loading.md)

_Everything depends on this. Build first._

- [x] Install YAML loader dependency (vite plugin + js-yaml) and add TypeScript types for Topic, Category, Glossary matching `_schema.yaml` (spec: content-loading.md)
- [x] Implement content loader: load all 36 topic YAML files and `_categories.yaml` into memory with in-memory cache (spec: content-loading.md)
- [x] Implement glossary loader: parse `_glossary-master.yaml` into a keyed lookup map (spec: content-loading.md)
- [x] Implement Zod validation for loaded topics and categories against schema rules (spec: content-loading.md)
- [x] Expose typed content API: `getTopics()`, `getTopic(id)`, `getCategory(id)`, `getCategories()`, `getGlossary()` in `src/api/` (spec: content-loading.md)
- [x] Unit tests for content loader, validator, and all API functions (spec: content-loading.md)

### Phase 2 — Core UI & Navigation (spec: core-ui-navigation.md)

_App shell and routing required before any page work._

- [x] Create `index.html` app shell with header, main content area, and nav; wire up Vite entry point (spec: core-ui-navigation.md)
- [x] Implement hash-based client-side router with routes: `/`, `/category/:id`, `/topic/:id`, `/glossary`, `/search` (spec: core-ui-navigation.md)
- [x] Implement Home page: 8 category cards with name, description, and topic count (spec: core-ui-navigation.md)
- [x] Implement Category page: lists topics in the category with links to topic pages (spec: core-ui-navigation.md)
- [x] Implement Topic page: renders title, introduction, and explanation body for current audience level (spec: core-ui-navigation.md)
- [x] Implement Glossary page: alphabetically sorted terms with definitions (spec: core-ui-navigation.md)
- [ ] Add mobile-first responsive CSS (320px–1440px), semantic HTML, and ARIA labels across all pages (spec: core-ui-navigation.md)
- [ ] Add PWA manifest (`manifest.webmanifest`) and register service worker via `vite-plugin-pwa` for offline support (spec: core-ui-navigation.md)
- [ ] Unit tests for router; verify E2e smoke tests pass (spec: core-ui-navigation.md)

### Phase 3 — Audience Adaptation (spec: audience-adaptation.md)

_Depends on Phase 1 (content API) and Phase 2 (topic page exists)._

- [ ] Implement global audience level store in `src/core/` with localStorage persistence and default of "adult" (spec: audience-adaptation.md)
- [ ] Add audience level selector UI to header (child / teenager / adult / researcher) with current-level badge (spec: audience-adaptation.md)
- [ ] Wire topic page to read from level store: render correct explanation level, filter `did_you_know`/`key_dates`/`key_figures` by their `levels` arrays (spec: audience-adaptation.md)
- [ ] Show `sources` section with clickable URLs only when level is "researcher" (spec: audience-adaptation.md)
- [ ] Unit tests for level filtering logic; E2e test: switch level and verify content updates without page reload (spec: audience-adaptation.md)

### Phase 4 — Quizzes & Engagement (spec: quizzes-and-engagement.md)

_Depends on Phase 1–3._

- [ ] Implement `multiple_choice` quiz renderer: show options, highlight correct/incorrect on submit (spec: quizzes-and-engagement.md)
- [ ] Implement `true_false` quiz renderer: binary choice with feedback (spec: quizzes-and-engagement.md)
- [ ] Implement `short_answer` quiz renderer: text input with model answer reveal on submit (spec: quizzes-and-engagement.md)
- [ ] Implement `essay` quiz renderer: textarea with guidance prompt (no auto-grading) (spec: quizzes-and-engagement.md)
- [ ] Add quiz score summary after completing all questions; filter quiz questions by current audience level (spec: quizzes-and-engagement.md)
- [ ] Implement glossary term detection in rendered topic text and wrap matched terms (spec: quizzes-and-engagement.md)
- [ ] Implement glossary tooltip component: shows definition on hover (desktop) and tap (mobile) (spec: quizzes-and-engagement.md)
- [ ] Build client-side search index at startup (Fuse.js or inverted index over titles, explanations, glossary terms) (spec: quizzes-and-engagement.md)
- [ ] Implement Search page UI: input in header on all pages, results page with matched topics and snippets (spec: quizzes-and-engagement.md)
- [ ] Unit tests for quiz scoring, glossary term detection, and search indexing; E2e test: complete a quiz and verify score display (spec: quizzes-and-engagement.md)

---

## Completed

<!-- Completed tasks move here -->
