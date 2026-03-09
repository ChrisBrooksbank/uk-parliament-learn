# Core UI & Navigation

## Overview

Build the app shell, routing, topic browsing, and category pages for the PWA.

## User Stories

- As a user, I want to browse categories and topics so that I can find content that interests me
- As a user, I want responsive navigation so that the app works on mobile and desktop
- As a user, I want a home page that introduces the app and shows categories

## Requirements

- [ ] App shell with header, main content area, and navigation
- [ ] Client-side routing (hash-based or History API) with routes:
    - `/` — Home page
    - `/category/:id` — Category page listing its topics
    - `/topic/:id` — Topic detail page
    - `/glossary` — Glossary page
    - `/search` — Search results page
- [ ] Home page showing all 8 categories as cards with topic counts
- [ ] Category page listing topics within that category
- [ ] Topic page rendering the explanation for the selected audience level
- [ ] Glossary page with alphabetical term listing and definitions
- [ ] Responsive layout — mobile-first, works at 320px to 1440px+
- [ ] PWA manifest and service worker for offline support
- [ ] Accessible: semantic HTML, ARIA labels, keyboard navigation

## Acceptance Criteria

- [ ] All routes render correct content
- [ ] Navigation between pages works without full reload
- [ ] Layout is responsive from 320px to 1440px
- [ ] Lighthouse accessibility score > 90
- [ ] Unit tests for router and page components
- [ ] E2e smoke tests pass (existing Playwright setup)

## Out of Scope

- User accounts or authentication
- Dark mode (can be added later)
- Animations or transitions
