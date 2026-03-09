import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderCategoryPage } from './category';

const mockTopics = [
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
            child: { summary: 'Simple summary', body: '' },
            teenager: { summary: '', body: '' },
            adult: { summary: 'Adult summary', body: '' },
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
];

vi.mock('@api/index', () => ({
    getCategory: vi.fn((id: string) => {
        if (id === 'parliament-basics') {
            return {
                id: 'parliament-basics',
                title: 'Parliament Basics',
                description: 'How Parliament works',
                icon: '🏛️',
                order: 1,
                folder: 'parliament-basics',
            };
        }
        return undefined;
    }),
    getTopics: vi.fn(() => mockTopics),
}));

vi.mock('@core/router', () => ({
    navigate: vi.fn(),
}));

describe('renderCategoryPage', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        vi.clearAllMocks();
    });

    it('renders category title and description', () => {
        renderCategoryPage(container, 'parliament-basics');
        expect(container.textContent).toContain('Parliament Basics');
        expect(container.textContent).toContain('How Parliament works');
    });

    it('renders category icon', () => {
        renderCategoryPage(container, 'parliament-basics');
        expect(container.textContent).toContain('🏛️');
    });

    it('renders only topics belonging to the category', () => {
        renderCategoryPage(container, 'parliament-basics');
        const items = container.querySelectorAll('[data-topic-id]');
        expect(items.length).toBe(2);
        const ids = Array.from(items).map(el => el.getAttribute('data-topic-id'));
        expect(ids).toContain('what-is-parliament');
        expect(ids).toContain('house-of-commons');
        expect(ids).not.toContain('elections-and-voting');
    });

    it('renders topic titles', () => {
        renderCategoryPage(container, 'parliament-basics');
        expect(container.textContent).toContain('What is Parliament?');
        expect(container.textContent).toContain('House of Commons');
    });

    it('renders adult summary when present', () => {
        renderCategoryPage(container, 'parliament-basics');
        expect(container.textContent).toContain('Adult summary');
    });

    it('topics have role=button and tabindex=0', () => {
        renderCategoryPage(container, 'parliament-basics');
        const items = container.querySelectorAll('[data-topic-id]');
        for (const item of items) {
            expect(item.getAttribute('role')).toBe('button');
            expect(item.getAttribute('tabindex')).toBe('0');
        }
    });

    it('topics have aria-label with topic title', () => {
        renderCategoryPage(container, 'parliament-basics');
        const item = container.querySelector('[data-topic-id="what-is-parliament"]');
        expect(item).not.toBeNull();
        expect(item!.getAttribute('aria-label')).toContain('What is Parliament?');
    });

    it('orders topics by metadata.order', () => {
        renderCategoryPage(container, 'parliament-basics');
        const items = container.querySelectorAll('[data-topic-id]');
        expect(items[0]!.getAttribute('data-topic-id')).toBe('what-is-parliament');
        expect(items[1]!.getAttribute('data-topic-id')).toBe('house-of-commons');
    });

    it('renders breadcrumb with home link', () => {
        renderCategoryPage(container, 'parliament-basics');
        const homeLink = container.querySelector('a[href="#/"]');
        expect(homeLink).not.toBeNull();
        expect(homeLink!.textContent).toContain('Home');
    });

    it('renders error state for unknown category', () => {
        renderCategoryPage(container, 'unknown-category');
        const alert = container.querySelector('[role="alert"]');
        expect(alert).not.toBeNull();
        expect(alert!.textContent).toContain('Category not found');
    });

    it('navigates to topic page on item click', async () => {
        const { navigate } = await import('@core/router');
        renderCategoryPage(container, 'parliament-basics');
        const item = container.querySelector<HTMLElement>('[data-topic-id="what-is-parliament"]');
        expect(item).not.toBeNull();
        item!.click();
        expect(navigate).toHaveBeenCalledWith('/topic/what-is-parliament');
    });
});
