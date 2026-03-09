# Content Loading

## Overview

Parse YAML topic files, validate against schema, and serve structured content to the UI layer.

## User Stories

- As a developer, I want content loaded and validated at startup so that invalid data is caught early
- As a user, I want content to load fast so that pages feel instant

## Requirements

- [ ] YAML parser that loads all 36 topic files from `content/` directory
- [ ] Parse `_categories.yaml` to build category index (8 categories)
- [ ] Parse `_glossary-master.yaml` to build glossary lookup
- [ ] Validate loaded content against `_schema.yaml` rules using Zod
- [ ] Expose typed content API: `getTopics()`, `getTopic(id)`, `getCategory(id)`, `getCategories()`, `getGlossary()`
- [ ] Handle cross-references between topics (related_topics field)
- [ ] Cache parsed content in memory after first load
- [ ] Error handling: graceful fallback if a single topic fails to parse

## Acceptance Criteria

- [ ] All 36 topics load and pass validation
- [ ] Category and glossary data accessible via typed API
- [ ] Cross-references resolve to valid topic IDs
- [ ] Unit tests cover loader, validator, and API functions
- [ ] Content loads in under 500ms in dev mode

## Out of Scope

- Server-side rendering
- Content editing or CMS
- Real-time content updates
