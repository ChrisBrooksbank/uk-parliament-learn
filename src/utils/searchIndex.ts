import type { Topic, GlossaryTerm } from '../types/index';

export interface SearchResult {
    id: string;
    type: 'topic' | 'glossary';
    title: string;
    snippet: string;
    score: number;
}

interface IndexedDoc {
    id: string;
    type: 'topic' | 'glossary';
    title: string;
    /** All searchable text concatenated for snippet extraction */
    fullText: string;
    /** Tokenised bags by field weight */
    fields: { tokens: string[]; weight: number }[];
}

export interface SearchIndex {
    /** inverted index: token → Set of doc indices */
    invertedIndex: Map<string, Set<number>>;
    docs: IndexedDoc[];
}

function tokenise(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1);
}

function extractSnippet(text: string, query: string, maxLength = 160): string {
    const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
    const lower = text.toLowerCase();

    // Find the position of the first query word
    let pos = -1;
    for (const word of queryWords) {
        const idx = lower.indexOf(word);
        if (idx !== -1) {
            pos = idx;
            break;
        }
    }

    if (pos === -1) {
        return text.slice(0, maxLength).trim() + (text.length > maxLength ? '…' : '');
    }

    const start = Math.max(0, pos - 40);
    const end = Math.min(text.length, start + maxLength);
    const snippet = text.slice(start, end).trim();
    return (start > 0 ? '…' : '') + snippet + (end < text.length ? '…' : '');
}

/**
 * Build a client-side inverted search index from topic and glossary data.
 * Topics are indexed by title (weight 4), summaries (weight 2), and body text (weight 1).
 * Glossary terms are indexed by term name (weight 3) and definitions (weight 1).
 */
export function buildSearchIndex(
    topics: Topic[],
    glossary: Map<string, GlossaryTerm>
): SearchIndex {
    const docs: IndexedDoc[] = [];

    for (const topic of topics) {
        const summaries = [
            topic.explanations.child.summary,
            topic.explanations.teenager.summary,
            topic.explanations.adult.summary,
            topic.explanations.researcher.summary,
        ].join(' ');

        const bodies = [
            topic.explanations.child.body,
            topic.explanations.teenager.body,
            topic.explanations.adult.body,
            topic.explanations.researcher.body,
        ].join(' ');

        docs.push({
            id: topic.id,
            type: 'topic',
            title: topic.title,
            fullText: `${topic.title}. ${summaries} ${bodies}`,
            fields: [
                { tokens: tokenise(topic.title), weight: 4 },
                { tokens: tokenise(summaries), weight: 2 },
                { tokens: tokenise(bodies), weight: 1 },
            ],
        });
    }

    for (const term of glossary.values()) {
        const definitions = `${term.definition_simple} ${term.definition_full}`;
        docs.push({
            id: `glossary:${term.term}`,
            type: 'glossary',
            title: term.term,
            fullText: `${term.term}. ${definitions}`,
            fields: [
                { tokens: tokenise(term.term), weight: 3 },
                { tokens: tokenise(definitions), weight: 1 },
            ],
        });
    }

    // Build inverted index
    const invertedIndex = new Map<string, Set<number>>();
    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]!;
        const seen = new Set<string>();
        for (const field of doc.fields) {
            for (const token of field.tokens) {
                if (!seen.has(token)) {
                    seen.add(token);
                    if (!invertedIndex.has(token)) {
                        invertedIndex.set(token, new Set());
                    }
                    invertedIndex.get(token)!.add(i);
                }
            }
        }
    }

    return { invertedIndex, docs };
}

/**
 * Search the index for a query string.
 * Returns results sorted by descending relevance score.
 */
export function search(query: string, index: SearchIndex, maxResults = 20): SearchResult[] {
    const tokens = tokenise(query);
    if (tokens.length === 0) return [];

    // Accumulate scores: docIndex → total score
    const scores = new Map<number, number>();

    for (const token of tokens) {
        // Exact token match
        const exactMatches = index.invertedIndex.get(token);
        if (exactMatches) {
            for (const docIdx of exactMatches) {
                const doc = index.docs[docIdx]!;
                let tokenScore = 0;
                for (const field of doc.fields) {
                    // Count how many times this token appears in the field
                    const count = field.tokens.filter(t => t === token).length;
                    tokenScore += count * field.weight;
                }
                scores.set(docIdx, (scores.get(docIdx) ?? 0) + tokenScore);
            }
        }

        // Prefix matching for partial queries (lower weight)
        for (const [indexToken, docSet] of index.invertedIndex) {
            if (indexToken !== token && indexToken.startsWith(token)) {
                for (const docIdx of docSet) {
                    const doc = index.docs[docIdx]!;
                    let tokenScore = 0;
                    for (const field of doc.fields) {
                        const count = field.tokens.filter(t => t === indexToken).length;
                        tokenScore += count * field.weight * 0.5;
                    }
                    scores.set(docIdx, (scores.get(docIdx) ?? 0) + tokenScore);
                }
            }
        }
    }

    // Sort by score descending
    const ranked = [...scores.entries()]
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxResults);

    return ranked.map(([docIdx, score]) => {
        const doc = index.docs[docIdx]!;
        return {
            id: doc.id,
            type: doc.type,
            title: doc.title,
            snippet: extractSnippet(doc.fullText, query),
            score,
        };
    });
}
