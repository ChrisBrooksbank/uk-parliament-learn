import { describe, it, expect } from 'vitest';
import { buildSearchIndex, search } from './searchIndex';
import type { Topic, GlossaryTerm } from '../types/index';

function makeTopic(id: string, title: string, bodyText = ''): Topic {
    const level = {
        summary: bodyText || `Summary of ${title}`,
        body: bodyText || `Body of ${title}`,
    };
    return {
        id,
        title,
        slug: id,
        metadata: {
            category: 'test',
            tags: [],
            last_updated: '2024-01-01',
            status: 'published',
            order: 1,
        },
        explanations: {
            child: { ...level },
            teenager: { ...level },
            adult: { ...level },
            researcher: { ...level, sources: [] },
        },
    };
}

function makeGlossary(
    terms: { term: string; definition_simple: string; definition_full?: string }[]
): Map<string, GlossaryTerm> {
    const map = new Map<string, GlossaryTerm>();
    for (const t of terms) {
        map.set(t.term.toLowerCase(), {
            term: t.term,
            definition_simple: t.definition_simple,
            definition_full: t.definition_full ?? t.definition_simple,
        });
    }
    return map;
}

describe('buildSearchIndex', () => {
    it('creates an index with docs from topics and glossary', () => {
        const topics = [makeTopic('topic-1', 'Parliament')];
        const glossary = makeGlossary([
            { term: 'Act', definition_simple: 'A law passed by Parliament' },
        ]);
        const index = buildSearchIndex(topics, glossary);

        expect(index.docs).toHaveLength(2);
        expect(index.docs[0]!.type).toBe('topic');
        expect(index.docs[1]!.type).toBe('glossary');
    });

    it('builds an inverted index for topic title tokens', () => {
        const topics = [makeTopic('house-of-commons', 'House of Commons')];
        const index = buildSearchIndex(topics, new Map());

        expect(index.invertedIndex.has('house')).toBe(true);
        expect(index.invertedIndex.has('commons')).toBe(true);
    });

    it('builds an inverted index for glossary term tokens', () => {
        const glossary = makeGlossary([
            { term: 'Royal Assent', definition_simple: 'Monarch approval' },
        ]);
        const index = buildSearchIndex([], glossary);

        expect(index.invertedIndex.has('royal')).toBe(true);
        expect(index.invertedIndex.has('assent')).toBe(true);
    });

    it('returns empty index for no content', () => {
        const index = buildSearchIndex([], new Map());
        expect(index.docs).toHaveLength(0);
        expect(index.invertedIndex.size).toBe(0);
    });
});

describe('search', () => {
    it('returns empty array for empty query', () => {
        const topics = [makeTopic('parliament', 'Parliament')];
        const index = buildSearchIndex(topics, new Map());
        expect(search('', index)).toEqual([]);
        expect(search('   ', index)).toEqual([]);
    });

    it('finds a topic by title', () => {
        const topics = [
            makeTopic('house-of-commons', 'House of Commons'),
            makeTopic('lords', 'House of Lords'),
        ];
        const index = buildSearchIndex(topics, new Map());
        const results = search('commons', index);

        expect(results.length).toBeGreaterThan(0);
        expect(results[0]!.id).toBe('house-of-commons');
        expect(results[0]!.type).toBe('topic');
    });

    it('finds a glossary term', () => {
        const glossary = makeGlossary([
            { term: 'Prorogation', definition_simple: 'Suspension of Parliament' },
        ]);
        const index = buildSearchIndex([], glossary);
        const results = search('prorogation', index);

        expect(results.length).toBeGreaterThan(0);
        expect(results[0]!.type).toBe('glossary');
        expect(results[0]!.title).toBe('Prorogation');
    });

    it('returns title match scored higher than body-only match', () => {
        const topics = [
            makeTopic(
                'elections',
                'Elections and Voting',
                'Parliament holds elections periodically'
            ),
            makeTopic('parliament-basics', 'Parliament', 'Parliament is the legislature'),
        ];
        const index = buildSearchIndex(topics, new Map());
        const results = search('parliament', index);

        // "Parliament" as a title should score higher
        const parliamentIdx = results.findIndex(r => r.id === 'parliament-basics');
        const electionsIdx = results.findIndex(r => r.id === 'elections');
        expect(parliamentIdx).toBeLessThan(electionsIdx);
    });

    it('supports partial/prefix matching', () => {
        const topics = [makeTopic('democracy', 'Democracy', 'Democratic systems of government')];
        const index = buildSearchIndex(topics, new Map());
        const results = search('democr', index);

        expect(results.length).toBeGreaterThan(0);
        expect(results[0]!.id).toBe('democracy');
    });

    it('returns snippet containing query text', () => {
        const topics = [
            makeTopic(
                'parliament',
                'Parliament',
                'The Parliament of the United Kingdom is the supreme legislative body'
            ),
        ];
        const index = buildSearchIndex(topics, new Map());
        const results = search('supreme legislative', index);

        expect(results.length).toBeGreaterThan(0);
        expect(results[0]!.snippet.toLowerCase()).toContain('supreme');
    });

    it('respects maxResults limit', () => {
        const topics = Array.from({ length: 10 }, (_, i) =>
            makeTopic(`topic-${i}`, `Topic ${i}`, 'parliament government')
        );
        const index = buildSearchIndex(topics, new Map());
        const results = search('parliament', index, 3);

        expect(results.length).toBeLessThanOrEqual(3);
    });

    it('includes id and type in results', () => {
        const topics = [makeTopic('elections', 'Elections')];
        const index = buildSearchIndex(topics, new Map());
        const results = search('elections', index);

        expect(results[0]).toMatchObject({ id: 'elections', type: 'topic', title: 'Elections' });
    });

    it('handles multi-word queries', () => {
        const topics = [makeTopic('house-of-commons', 'House of Commons')];
        const index = buildSearchIndex(topics, new Map());
        const results = search('house commons', index);

        expect(results.length).toBeGreaterThan(0);
        expect(results[0]!.id).toBe('house-of-commons');
    });
});
