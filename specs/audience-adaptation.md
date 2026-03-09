# Audience Adaptation

## Overview

Implement audience level switching so content adapts between child (7-11), teenager (12-17), adult, and researcher levels.

## User Stories

- As a parent, I want to set the level to "child" so my kid sees age-appropriate explanations
- As a researcher, I want to see sources and citations that other levels don't show
- As a user, I want my level preference to persist across sessions

## Requirements

- [ ] Audience level selector UI (child, teenager, adult, researcher) accessible from any page
- [ ] Topic page renders the correct explanation level based on selection
- [ ] `did_you_know`, `key_dates`, `key_figures` filtered by their `levels` arrays
- [ ] Researcher level shows `sources` section with clickable URLs
- [ ] Glossary definitions adapt to selected level where applicable
- [ ] Persist selected level in localStorage
- [ ] Default to "adult" level if no preference stored
- [ ] Visual indicator showing current level (e.g., badge in header)

## Acceptance Criteria

- [ ] Switching levels updates content without page reload
- [ ] Level persists across browser sessions (localStorage)
- [ ] Researcher level shows sources; other levels do not
- [ ] Filtered items match their `levels` arrays correctly
- [ ] Unit tests for level filtering logic
- [ ] E2e test: switch level and verify content changes

## Out of Scope

- Per-topic level overrides
- Age verification
- Analytics on level usage
