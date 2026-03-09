import { describe, it, expect, beforeEach } from 'vitest';
import { loadTopics, loadCategories, clearCache } from './content-loader';

describe('loadTopics', () => {
    beforeEach(() => {
        clearCache();
    });

    it('loads all 36 topic files', () => {
        const topics = loadTopics();
        expect(topics).toHaveLength(36);
    });

    it('returns Topic objects with required fields', () => {
        const topics = loadTopics();
        for (const topic of topics) {
            expect(topic.id).toBeTruthy();
            expect(topic.title).toBeTruthy();
            expect(topic.slug).toBeTruthy();
            expect(topic.metadata).toBeDefined();
            expect(topic.explanations).toBeDefined();
            expect(topic.explanations.child).toBeDefined();
            expect(topic.explanations.teenager).toBeDefined();
            expect(topic.explanations.adult).toBeDefined();
            expect(topic.explanations.researcher).toBeDefined();
        }
    });

    it('returns cached result on second call', () => {
        const first = loadTopics();
        const second = loadTopics();
        expect(first).toBe(second);
    });

    it('returns fresh result after clearCache', () => {
        const first = loadTopics();
        clearCache();
        const second = loadTopics();
        expect(first).not.toBe(second);
        expect(second).toHaveLength(36);
    });

    it('all topics have published status', () => {
        const topics = loadTopics();
        for (const topic of topics) {
            expect(topic.metadata.status).toBe('published');
        }
    });

    it('all topics have a valid category', () => {
        const validCategories = [
            'parliament-basics',
            'parliamentary-procedure',
            'law-and-legislation',
            'elections-and-representation',
            'government',
            'political-systems',
            'devolution-and-local-government',
            'constitution-and-justice',
        ];
        const topics = loadTopics();
        for (const topic of topics) {
            expect(validCategories).toContain(topic.metadata.category);
        }
    });
});

describe('loadCategories', () => {
    beforeEach(() => {
        clearCache();
    });

    it('loads all 8 categories', () => {
        const categories = loadCategories();
        expect(categories).toHaveLength(8);
    });

    it('returns Category objects with required fields', () => {
        const categories = loadCategories();
        for (const category of categories) {
            expect(category.id).toBeTruthy();
            expect(category.title).toBeTruthy();
            expect(category.description).toBeTruthy();
            expect(category.icon).toBeTruthy();
            expect(typeof category.order).toBe('number');
            expect(category.folder).toBeTruthy();
        }
    });

    it('returns cached result on second call', () => {
        const first = loadCategories();
        const second = loadCategories();
        expect(first).toBe(second);
    });

    it('returns fresh result after clearCache', () => {
        const first = loadCategories();
        clearCache();
        const second = loadCategories();
        expect(first).not.toBe(second);
        expect(second).toHaveLength(8);
    });

    it('categories are ordered 1 through 8', () => {
        const categories = loadCategories();
        const orders = categories.map(c => c.order).sort((a, b) => a - b);
        expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
});
