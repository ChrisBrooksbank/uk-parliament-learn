# UK Parliament Learn — PWA Implementation Plan

## Context

This repo contains 36 richly structured YAML topic files across 8 categories teaching UK Parliament and political systems. Each topic has 4 audience levels (child, teenager, adult, researcher), quizzes, glossary terms, key dates/figures, video links, and cross-references. ~185,000 words total. No frontend exists yet.

The goal is to build a Progressive Web App that makes this content accessible, engaging, and available offline. The tech stack and patterns follow the developer's existing project [noself](https://github.com/ChrisBrooksbank/noself) — a Buddhist teaching PWA using Vite + TypeScript + vite-plugin-pwa.

UK Parliament should be presented in a positive light. This is an unofficial side project — no official Parliament branding or logos.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Tech stack | Vite + TypeScript + vite-plugin-pwa + Vitest + ESLint/Prettier/Husky/Knip (mirrors noself) |
| UI framework | None — vanilla TypeScript |
| Repo structure | Same repo, `src/` alongside existing `content/` |
| Audience | All 4 levels are first-class citizens |
| Design | Minimal & content-first — calm, typography-focused |
| Features (v1) | Full: browse, read, glossary, quizzes, progress, search, bookmarks, videos, related topics, sharing |
| Data layer | Build-time YAML→JSON via Vite `import.meta.glob` + `yaml` package |
| Level UX | Onboarding picker on first visit + persistent switcher |
| Hosting | Netlify |

---

## Architecture

### Directory Structure

```
uk-parliament-learn/
  content/                          # EXISTING — untouched
  src/
    main.ts                         # Entry point
    styles/
      main.css                      # Single CSS file
    config/
      schema.ts                     # Zod schema for app config
      loader.ts                     # Load & validate config
    types/
      content.ts                    # Topic, Category, Glossary, Quiz types
      state.ts                      # Progress, Bookmark, Preferences types
    content/
      categories/loader.ts          # Glob-import category YAML
      topics/loader.ts              # Glob-import topic YAML
      glossary/loader.ts            # Glob-import glossary YAML
    core/
      router.ts                     # Hash-based SPA router
      nav.ts                        # Top navigation bar
      preferences.ts                # Level, theme, font-size (localStorage)
      settingsPanel.ts              # Settings slide-out panel
      onboarding.ts                 # First-visit level picker
      installPrompt.ts              # PWA install prompt
      updatePrompt.ts               # SW update prompt
      views/
        homeView.ts
        categoryListView.ts
        categoryView.ts
        topicView.ts
        glossaryView.ts
        glossaryTermView.ts
        searchView.ts
        bookmarksView.ts
        progressView.ts
        quizView.ts
      components/
        levelSwitcher.ts
        quizEngine.ts
        videoEmbed.ts
        relatedTopics.ts
        shareButton.ts
        searchIndex.ts
        topicRenderer.ts
        glossaryHighlighter.ts
      state/
        progress.ts                 # Topics read, quiz scores, streaks
        bookmarks.ts                # Bookmarked topic IDs
    utils/
      formatText.ts                 # Plain text → HTML paragraphs
      logger.ts
      helpers.ts
  public/
    favicon.svg
    icons/icon-192.png, icon-512.png
    fonts/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  eslint.config.js
  .prettierrc.json
  knip.json
  netlify.toml
  .husky/pre-commit
```

### Routing (Hash-based)

| Hash | View |
|------|------|
| `#/` | Home |
| `#/categories` | All categories |
| `#/category/:id` | Single category with topic list |
| `#/topic/:categoryId/:topicId` | Topic reading view |
| `#/quiz/:topicId` | Quiz for topic |
| `#/glossary` | Searchable glossary |
| `#/glossary/:term-slug` | Single glossary term |
| `#/search?q=...` | Search results |
| `#/bookmarks` | Saved bookmarks |
| `#/progress` | Progress dashboard |

### Data Layer

Content YAML is loaded at build time via Vite's `import.meta.glob` with `?raw` query, parsed with the `yaml` npm package, and validated with Zod schemas during module initialization. A Vite alias `@content` points to the project-root `content/` directory.

All ~185K words inline into the JS bundle (~1MB raw, ~300KB gzipped). Acceptable for a PWA that caches everything offline. Can code-split by category later if needed.

### State (localStorage)

| Key | Purpose |
|-----|---------|
| `ukpl:level` | Selected audience level |
| `ukpl:theme` | Dark/light/auto |
| `ukpl:fontSize` | Text size preference |
| `ukpl:onboarded` | Has completed onboarding |
| `ukpl:progress` | Topics read, quiz scores, streaks (JSON) |
| `ukpl:bookmarks` | Bookmarked topic IDs (JSON) |

---

## Key Module Designs

### Content Loaders
Three loaders (categories, topics, glossary) following noself's pattern: `import.meta.glob` → `yaml.parse()` → Zod validation. Provide functions like `getTopicById()`, `getTopicsByCategory()`, `searchTerms()`.

### Onboarding
First visit: full-screen "Who are you?" with 4 cards (child 7-11, teenager 12-17, adult, researcher). Sets level in localStorage, then navigates to home.

### Level Switcher
Settings panel (gear icon in nav) with radio buttons for all 4 levels. Changing level re-renders the current view.

### Topic Renderer
1. Render `explanations[level].summary` as lead paragraph
2. Render `explanations[level].body` via `formatText()` (blank-line → `<p>` elements)
3. Auto-link glossary terms (first occurrence only, from topic's own glossary array)
4. Filter `did_you_know`, `key_dates`, `key_figures`, `video_links` by current level
5. Show `sources` only at researcher level
6. Show "Take the Quiz" button if quizzes exist for current level
7. Show related topics as navigation links

### Quiz Engine
- **multiple_choice / true_false**: Auto-scored with radio buttons
- **short_answer / essay**: Show model answer, user self-assesses ("Did you get it right?")
- Questions presented one at a time for engagement
- Score saved to progress store

### Glossary
- Alphabetical list of 185 terms with real-time search/filter
- Definition shown depends on level: `definition_simple` (child/teenager) vs `definition_full` (adult/researcher)
- `glossaryHighlighter` auto-links terms in topic body text (single regex pass over topic's own glossary terms)

### Search
Client-side inverted index built from all topics. Weighted scoring: title > summary > tags > body. No external library needed for 36 topics.

### Video Embeds
Click-to-load pattern: thumbnail placeholder with play button, loads `youtube-nocookie.com` iframe on click. Privacy-friendly and performant.

### Share
Web Share API where available, clipboard copy fallback.

### Progress Tracking
- Topics read count (X of 36) with per-category breakdown
- Daily reading streak (consecutive calendar days)
- Quiz scores per topic
- Visual grid of all topics grouped by category

---

## Design

### Visual
- **Palette**: Parliamentary green (`#006b3f`) as primary accent, neutral warm background. Light theme default, dark theme available.
- **Typography**: Clean serif for body (e.g. Source Serif 4), system sans-serif for UI. Self-hosted woff2.
- **Layout**: Single-column, max-width ~720px for optimal reading. Minimal chrome, generous whitespace.

### Accessibility (WCAG AA)
- Visible focus indicators (`:focus-visible`)
- Colour contrast ≥ 4.5:1 normal text, ≥ 3:1 large text
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`
- ARIA landmarks, labels, `aria-current`, `aria-live` for dynamic updates
- Skip-to-content link
- Full keyboard navigation
- `prefers-reduced-motion` respected
- Font size preference (small/medium/large/xl)

### Mobile-First
- Base styles target 320px+
- Breakpoints: 600px (tablet), 900px (desktop)
- Touch targets ≥ 44x44px
- Collapsible navigation on mobile

### Disclaimer Footer
"This is an unofficial educational resource. It is not affiliated with or endorsed by the UK Parliament."

---

## Implementation Phases

### Phase 1: Foundation & Core Reading
Working SPA: browse categories, read topics at chosen level, navigate between topics.

1. Project scaffolding: package.json, tsconfig, vite config, ESLint, Prettier, Husky, Knip, netlify.toml, index.html
2. TypeScript interfaces matching YAML schema
3. Content loaders (categories, topics, glossary) with Zod validation
4. Hash-based router
5. Preferences module (level, theme, font-size in localStorage)
6. Onboarding flow (level picker)
7. Navigation bar + settings panel with level switcher
8. Views: home, category list, category, topic
9. `formatText` utility + topic renderer
10. CSS: reset, design tokens, layout, typography, components
11. Tests for router, loaders, formatText
12. Wire up main.ts entry point, deploy to Netlify

### Phase 2: Glossary & Content Enrichment
Full topic richness: glossary, facts, dates, figures, videos, sources.

1. Glossary view with search/filter
2. Individual glossary term view
3. Glossary term auto-linking in topic body
4. Did-you-know, key dates, key figures sections (level-filtered)
5. Click-to-load video embeds (level-filtered)
6. Sources section (researcher only)
7. Tests for glossary, highlighter, filtering

### Phase 3: Quizzes
Interactive quiz engine for all 4 question types.

1. Quiz engine: question presentation, answer checking, scoring
2. Quiz view with topic-level quiz flow
3. Renderers: multiple choice, true/false, short answer, essay
4. "Take the Quiz" integration in topic view
5. Tests for quiz scoring and rendering

### Phase 4: Progress & Bookmarks
Persistent tracking and motivation features.

1. Progress state module (topics read, quiz scores, streaks)
2. Bookmarks state module
3. Progress dashboard view
4. Bookmarks list view
5. Bookmark toggle in topic header
6. "Read" indicators in category/topic lists
7. Streak logic
8. Tests for state management

### Phase 5: Search & Share
Discovery and sharing features.

1. Search index (inverted index from all topics)
2. Search view with real-time results
3. Share button (Web Share API + clipboard fallback)
4. Search icon in navigation
5. Tests for search index

### Phase 6: PWA Polish & Performance
Production-ready PWA.

1. Install prompt banner
2. Service worker update notification
3. Offline status indicator
4. PWA icons (simple design, no official branding)
5. Apple touch icon + mobile meta tags
6. Bundle size audit, lazy loading if needed
7. Lighthouse audit (target 90+ all categories)
8. Cross-browser testing
9. Accessibility audit with axe-core

---

## Verification

After each phase:
1. `npm run check` — typecheck + lint + knip (no errors)
2. `npm run test:run` — all tests pass
3. `npm run build` — clean production build
4. `npm run preview` — manual smoke test in browser
5. Deploy to Netlify — verify live site works
6. Phase 6: Lighthouse audit ≥ 90 on Performance, Accessibility, Best Practices, PWA

---

## Critical Files

| File | Role |
|------|------|
| `content/_schema.yaml` | Defines YAML structure — TS interfaces must match exactly |
| `content/_categories.yaml` | Category registry driving navigation |
| `content/_glossary-master.yaml` | 185 aggregated glossary terms |
| `content/parliament-basics/what-is-parliament.yaml` | Representative full topic (all fields populated) |
| noself `src/content/concepts/loader.ts` | Reference pattern for YAML loading |
| noself `src/core/router.ts` | Reference pattern for hash-based routing |
