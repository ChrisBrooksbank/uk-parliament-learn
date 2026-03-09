# Quizzes & Engagement

## Overview

Interactive quizzes per topic, glossary tooltips on key terms, and full-text search across all content.

## User Stories

- As a student, I want to take quizzes after reading a topic to test my understanding
- As a user, I want to hover over key terms to see glossary definitions inline
- As a user, I want to search for any topic or term across the entire site

## Requirements

### Quizzes

- [ ] Render quizzes from topic YAML data (quiz types: multiple_choice, true_false, short_answer, essay)
- [ ] Multiple choice: show options, highlight correct/incorrect on submit
- [ ] True/false: binary choice with feedback
- [ ] Short answer: text input with model answer reveal
- [ ] Essay: text area with guidance prompt (no auto-grading)
- [ ] Show score summary after completing a quiz
- [ ] Quizzes filtered by audience level

### Glossary Tooltips

- [ ] Detect glossary terms in topic text and make them hoverable/tappable
- [ ] Tooltip shows term definition from glossary data
- [ ] Works on both desktop (hover) and mobile (tap)

### Search

- [ ] Full-text search across all topic titles, explanations, and glossary terms
- [ ] Search results page showing matching topics with snippets
- [ ] Search input accessible from header on all pages
- [ ] Client-side search index (no server needed)

## Acceptance Criteria

- [ ] All 4 quiz types render and accept user input
- [ ] Quiz scoring is correct for auto-gradable types
- [ ] Glossary tooltips appear for known terms in topic text
- [ ] Search returns relevant results for topic and glossary queries
- [ ] Unit tests for quiz scoring, term detection, and search indexing
- [ ] E2e test: complete a quiz and verify score display

## Out of Scope

- Quiz progress persistence across sessions
- Leaderboards or social features
- Server-side search
- AI-powered essay grading
