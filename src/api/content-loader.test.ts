import { describe, it, expect, beforeEach } from 'vitest';
import {
    loadTopics,
    loadCategories,
    loadGlossary,
    clearCache,
    getTopics,
    getTopic,
    getCategories,
    getCategory,
    getGlossary,
} from './content-loader';

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

describe('loadGlossary', () => {
    beforeEach(() => {
        clearCache();
    });

    it('returns a Map with entries', () => {
        const glossary = loadGlossary();
        expect(glossary).toBeInstanceOf(Map);
        expect(glossary.size).toBeGreaterThan(0);
    });

    it('loads all 185 glossary terms', () => {
        const glossary = loadGlossary();
        expect(glossary.size).toBe(185);
    });

    it('keys are lowercase for case-insensitive lookup', () => {
        const glossary = loadGlossary();
        for (const key of glossary.keys()) {
            expect(key).toBe(key.toLowerCase());
        }
    });

    it('each entry has required fields', () => {
        const glossary = loadGlossary();
        for (const term of glossary.values()) {
            expect(term.term).toBeTruthy();
            expect(term.definition_simple).toBeTruthy();
            expect(term.definition_full).toBeTruthy();
        }
    });

    it('lookup by lowercase key returns the term', () => {
        const glossary = loadGlossary();
        const entry = glossary.get('act of parliament');
        expect(entry).toBeDefined();
        expect(entry!.term).toBe('Act of Parliament');
    });

    it('returns cached result on second call', () => {
        const first = loadGlossary();
        const second = loadGlossary();
        expect(first).toBe(second);
    });

    it('returns fresh result after clearCache', () => {
        const first = loadGlossary();
        clearCache();
        const second = loadGlossary();
        expect(first).not.toBe(second);
        expect(second.size).toBeGreaterThan(0);
    });
});

describe('getTopics', () => {
    beforeEach(() => {
        clearCache();
    });

    it('returns all 36 topics', () => {
        expect(getTopics()).toHaveLength(36);
    });

    it('returns same array as loadTopics', () => {
        expect(getTopics()).toBe(loadTopics());
    });
});

describe('getTopic', () => {
    beforeEach(() => {
        clearCache();
    });

    it('returns a topic by id', () => {
        const topic = getTopic('what-is-parliament');
        expect(topic).toBeDefined();
        expect(topic!.id).toBe('what-is-parliament');
    });

    it('returns undefined for unknown id', () => {
        expect(getTopic('non-existent-topic-id')).toBeUndefined();
    });
});

describe('getCategories', () => {
    beforeEach(() => {
        clearCache();
    });

    it('returns all 8 categories', () => {
        expect(getCategories()).toHaveLength(8);
    });

    it('returns same array as loadCategories', () => {
        expect(getCategories()).toBe(loadCategories());
    });
});

describe('getCategory', () => {
    beforeEach(() => {
        clearCache();
    });

    it('returns a category by id', () => {
        const category = getCategory('parliament-basics');
        expect(category).toBeDefined();
        expect(category!.id).toBe('parliament-basics');
    });

    it('returns undefined for unknown id', () => {
        expect(getCategory('non-existent-category')).toBeUndefined();
    });
});

describe('getGlossary', () => {
    beforeEach(() => {
        clearCache();
    });

    it('returns the glossary map', () => {
        const glossary = getGlossary();
        expect(glossary).toBeInstanceOf(Map);
        expect(glossary.size).toBe(185);
    });

    it('returns same map as loadGlossary', () => {
        expect(getGlossary()).toBe(loadGlossary());
    });
});
