import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQueryFromHash, renderSearchPage } from './search';

// Mock the API and search index modules
vi.mock('@api/index', () => ({
    getTopics: () => [
        {
            id: 'house-of-commons',
            title: 'House of Commons',
            slug: 'house-of-commons',
            metadata: {
                category: 'parliament-basics',
                tags: [],
                last_updated: '2024-01-01',
                status: 'published',
                order: 1,
            },
            explanations: {
                child: {
                    summary: 'The elected chamber',
                    body: 'The House of Commons is elected by the public.',
                },
                teenager: { summary: 'The elected chamber', body: 'MPs sit here after elections.' },
                adult: { summary: 'Lower house', body: 'The primary legislative chamber.' },
                researcher: { summary: 'Lower house', body: 'Detailed analysis.', sources: [] },
            },
        },
    ],
    getGlossary: () => {
        const map = new Map();
        map.set('parliament', {
            term: 'Parliament',
            definition_simple: 'Law-making body',
            definition_full: 'The UK Parliament',
        });
        return map;
    },
}));

describe('getQueryFromHash', () => {
    it('returns empty string when no query in hash', () => {
        expect(getQueryFromHash('#/search')).toBe('');
    });

    it('returns empty string for unrelated hash', () => {
        expect(getQueryFromHash('#/home')).toBe('');
    });

    it('extracts query from hash with ?q=', () => {
        expect(getQueryFromHash('#/search?q=parliament')).toBe('parliament');
    });

    it('decodes URI-encoded query', () => {
        expect(getQueryFromHash('#/search?q=house%20of%20commons')).toBe('house of commons');
    });

    it('returns full query including special characters', () => {
        expect(getQueryFromHash('#/search?q=royal+assent')).toBe('royal+assent');
    });
});

describe('renderSearchPage', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        // Reset window.location.hash before each test
        window.location.hash = '#/search';
    });

    it('renders search form and heading', () => {
        renderSearchPage(container);
        expect(container.querySelector('h2')?.textContent).toContain('Search');
        expect(container.querySelector('form')).not.toBeNull();
        expect(container.querySelector('input[type="search"]')).not.toBeNull();
    });

    it('renders hint when no query', () => {
        window.location.hash = '#/search';
        renderSearchPage(container);
        expect(container.querySelector('.search-hint')).not.toBeNull();
    });

    it('renders results when query matches a topic', () => {
        window.location.hash = '#/search?q=commons';
        renderSearchPage(container);
        const results = container.querySelector('.search-results-list');
        expect(results).not.toBeNull();
        expect(results!.querySelectorAll('.search-result').length).toBeGreaterThan(0);
    });

    it('renders no-results message when query matches nothing', () => {
        window.location.hash = '#/search?q=zzznomatch99999';
        renderSearchPage(container);
        expect(container.querySelector('.search-no-results')).not.toBeNull();
    });

    it('populates input value with current query', () => {
        window.location.hash = '#/search?q=parliament';
        renderSearchPage(container);
        const input = container.querySelector<HTMLInputElement>('input[type="search"]');
        expect(input?.value).toBe('parliament');
    });

    it('shows topic badge for topic results', () => {
        window.location.hash = '#/search?q=commons';
        renderSearchPage(container);
        const topicBadge = container.querySelector('.search-result__badge--topic');
        expect(topicBadge).not.toBeNull();
    });

    it('shows glossary badge for glossary results', () => {
        window.location.hash = '#/search?q=parliament';
        renderSearchPage(container);
        // Parliament appears in both topic and glossary — at least one glossary badge should exist
        const glossaryBadge = container.querySelector('.search-result__badge--glossary');
        expect(glossaryBadge).not.toBeNull();
    });

    it('result count message reflects number of results', () => {
        window.location.hash = '#/search?q=commons';
        renderSearchPage(container);
        const count = container.querySelector('.search-count');
        expect(count?.textContent).toMatch(/result/);
    });

    it('topic results link to topic page', () => {
        window.location.hash = '#/search?q=commons';
        renderSearchPage(container);
        const links = container.querySelectorAll<HTMLAnchorElement>('.search-result__title');
        const topicLink = [...links].find(l => l.getAttribute('href')?.startsWith('#/topic/'));
        expect(topicLink).not.toBeUndefined();
    });

    it('glossary results link to glossary page', () => {
        window.location.hash = '#/search?q=parliament';
        renderSearchPage(container);
        const links = container.querySelectorAll<HTMLAnchorElement>('.search-result__title');
        const glossaryLink = [...links].find(l => l.getAttribute('href') === '#/glossary');
        expect(glossaryLink).not.toBeUndefined();
    });

    it('form submit navigates to search URL', () => {
        window.location.hash = '#/search';
        renderSearchPage(container);
        const input = container.querySelector<HTMLInputElement>('#search-page-input');
        const form = container.querySelector<HTMLFormElement>('#search-page-form');
        if (input && form) {
            input.value = 'democracy';
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            expect(window.location.hash).toBe('#/search?q=democracy');
        }
    });
});
