import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHomePage } from './home';

// Mock content API
vi.mock('@api/index', () => ({
    getCategories: vi.fn(() => [
        {
            id: 'parliament-basics',
            title: 'Parliament Basics',
            description: 'How Parliament works',
            icon: '🏛️',
            order: 1,
            folder: 'parliament-basics',
        },
        {
            id: 'elections-and-representation',
            title: 'Elections & Representation',
            description: 'How elections work',
            icon: '🗳️',
            order: 2,
            folder: 'elections-and-representation',
        },
    ]),
    getTopics: vi.fn(() => [
        {
            id: 'what-is-parliament',
            title: 'What is Parliament?',
            slug: 'what-is-parliament',
            metadata: {
                category: 'parliament-basics',
                tags: [],
                last_updated: '2024-01-01',
                status: 'published',
                order: 1,
            },
            explanations: {
                child: { summary: '', body: '' },
                teenager: { summary: '', body: '' },
                adult: { summary: '', body: '' },
                researcher: { summary: '', body: '' },
            },
        },
        {
            id: 'house-of-commons',
            title: 'House of Commons',
            slug: 'house-of-commons',
            metadata: {
                category: 'parliament-basics',
                tags: [],
                last_updated: '2024-01-01',
                status: 'published',
                order: 2,
            },
            explanations: {
                child: { summary: '', body: '' },
                teenager: { summary: '', body: '' },
                adult: { summary: '', body: '' },
                researcher: { summary: '', body: '' },
            },
        },
        {
            id: 'elections-and-voting',
            title: 'Elections and Voting',
            slug: 'elections-and-voting',
            metadata: {
                category: 'elections-and-representation',
                tags: [],
                last_updated: '2024-01-01',
                status: 'published',
                order: 1,
            },
            explanations: {
                child: { summary: '', body: '' },
                teenager: { summary: '', body: '' },
                adult: { summary: '', body: '' },
                researcher: { summary: '', body: '' },
            },
        },
    ]),
}));

// Mock router navigate
vi.mock('@core/router', () => ({
    navigate: vi.fn(),
}));

describe('renderHomePage', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    it('renders a heading', () => {
        renderHomePage(container);
        const heading = container.querySelector('h2');
        expect(heading).not.toBeNull();
        expect(heading!.textContent).toContain('Parliament');
    });

    it('renders a card for each category', () => {
        renderHomePage(container);
        const cards = container.querySelectorAll('[data-category-id]');
        expect(cards.length).toBe(2);
    });

    it('renders category titles', () => {
        renderHomePage(container);
        expect(container.textContent).toContain('Parliament Basics');
        expect(container.textContent).toContain('Elections & Representation');
    });

    it('renders category descriptions', () => {
        renderHomePage(container);
        expect(container.textContent).toContain('How Parliament works');
        expect(container.textContent).toContain('How elections work');
    });

    it('renders correct topic counts', () => {
        renderHomePage(container);
        expect(container.textContent).toContain('2 topics'); // parliament-basics has 2 topics
        expect(container.textContent).toContain('1 topic'); // elections-and-representation has 1 topic
    });

    it('uses singular "topic" for count of 1', () => {
        renderHomePage(container);
        // elections-and-representation has exactly 1 topic
        const cards = container.querySelectorAll('[data-category-id]');
        let found = false;
        for (const card of cards) {
            if (card.getAttribute('data-category-id') === 'elections-and-representation') {
                expect(card.textContent).toContain('1 topic');
                expect(card.textContent).not.toContain('1 topics');
                found = true;
            }
        }
        expect(found).toBe(true);
    });

    it('cards have role=button and tabindex=0 for keyboard accessibility', () => {
        renderHomePage(container);
        const cards = container.querySelectorAll('[data-category-id]');
        for (const card of cards) {
            expect(card.getAttribute('role')).toBe('button');
            expect(card.getAttribute('tabindex')).toBe('0');
        }
    });

    it('cards have aria-label including title and topic count', () => {
        renderHomePage(container);
        const card = container.querySelector('[data-category-id="parliament-basics"]');
        expect(card).not.toBeNull();
        const ariaLabel = card!.getAttribute('aria-label') ?? '';
        expect(ariaLabel).toContain('Parliament Basics');
        expect(ariaLabel).toContain('2 topics');
    });

    it('navigates to category page on card click', async () => {
        const { navigate } = await import('@core/router');
        renderHomePage(container);
        const card = container.querySelector<HTMLElement>('[data-category-id="parliament-basics"]');
        expect(card).not.toBeNull();
        card!.click();
        expect(navigate).toHaveBeenCalledWith('/category/parliament-basics');
    });

    it('renders category grid list', () => {
        renderHomePage(container);
        const grid = container.querySelector('.category-grid');
        expect(grid).not.toBeNull();
        expect(grid!.getAttribute('role')).toBe('list');
    });

    it('orders categories by order field', () => {
        renderHomePage(container);
        const cards = container.querySelectorAll('[data-category-id]');
        expect(cards[0]!.getAttribute('data-category-id')).toBe('parliament-basics');
        expect(cards[1]!.getAttribute('data-category-id')).toBe('elections-and-representation');
    });
});
