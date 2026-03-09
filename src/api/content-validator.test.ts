import { describe, it, expect } from 'vitest';
import {
    validateTopic,
    validateCategory,
    validateGlossaryTerm,
    TopicSchema,
    CategorySchema,
    GlossaryTermSchema,
} from './content-validator';
import { loadTopics, loadCategories, loadGlossary } from './content-loader';

// --- Minimal valid fixtures ---

const validExplanationLevel = {
    summary: 'Short summary',
    body: 'Full body text',
};

const validTopic = {
    id: 'test-topic',
    title: 'Test Topic',
    slug: 'test-topic',
    metadata: {
        category: 'parliament-basics',
        tags: ['tag1'],
        last_updated: '2024-01-01',
        status: 'published',
        order: 1,
    },
    explanations: {
        child: validExplanationLevel,
        teenager: validExplanationLevel,
        adult: validExplanationLevel,
        researcher: {
            ...validExplanationLevel,
            sources: [{ citation: 'A source', url: 'https://example.com', type: 'official' }],
        },
    },
};

const validCategory = {
    id: 'parliament-basics',
    title: 'Parliament Basics',
    description: 'About parliament',
    icon: '🏛️',
    order: 1,
    folder: 'parliament-basics',
};

const validGlossaryTerm = {
    term: 'Act of Parliament',
    definition_simple: 'A law passed by Parliament.',
    definition_full: 'A more detailed explanation of an Act of Parliament.',
};

// --- Unit tests for validateTopic ---

describe('validateTopic', () => {
    it('returns success for a valid topic', () => {
        const result = validateTopic(validTopic);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.errors).toBeUndefined();
    });

    it('returns failure when id is missing', () => {
        const { id: _id, ...noId } = validTopic;
        const result = validateTopic(noId);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors!.some(e => e.includes('id'))).toBe(true);
    });

    it('returns failure when an explanation level is missing', () => {
        const bad = { ...validTopic, explanations: { child: validExplanationLevel } };
        const result = validateTopic(bad);
        expect(result.success).toBe(false);
    });

    it('returns failure for invalid status', () => {
        const bad = {
            ...validTopic,
            metadata: { ...validTopic.metadata, status: 'unknown' },
        };
        const result = validateTopic(bad);
        expect(result.success).toBe(false);
        expect(result.errors!.some(e => e.includes('status'))).toBe(true);
    });

    it('returns failure for invalid source URL', () => {
        const bad = {
            ...validTopic,
            explanations: {
                ...validTopic.explanations,
                researcher: {
                    ...validExplanationLevel,
                    sources: [{ citation: 'Src', url: 'not-a-url', type: 'official' }],
                },
            },
        };
        const result = validateTopic(bad);
        expect(result.success).toBe(false);
    });

    it('accepts optional fields when absent', () => {
        const result = validateTopic(validTopic);
        expect(result.success).toBe(true);
    });

    it('accepts valid related_topics', () => {
        const withRelated = {
            ...validTopic,
            related_topics: [{ id: 'house-of-commons', relationship: 'see-also' }],
        };
        const result = validateTopic(withRelated);
        expect(result.success).toBe(true);
    });

    it('rejects invalid relationship type', () => {
        const bad = {
            ...validTopic,
            related_topics: [{ id: 'house-of-commons', relationship: 'invalid' }],
        };
        const result = validateTopic(bad);
        expect(result.success).toBe(false);
    });

    it('accepts valid quiz entries', () => {
        const withQuiz = {
            ...validTopic,
            quizzes: {
                adult: [
                    {
                        question: 'What is Parliament?',
                        type: 'multiple_choice',
                        correct_answer: 'A',
                        explanation: 'Because',
                        options: ['A', 'B', 'C'],
                    },
                ],
            },
        };
        const result = validateTopic(withQuiz);
        expect(result.success).toBe(true);
    });

    it('rejects invalid quiz type', () => {
        const bad = {
            ...validTopic,
            quizzes: {
                adult: [
                    {
                        question: 'Q?',
                        type: 'bad_type',
                        correct_answer: 'A',
                        explanation: 'E',
                    },
                ],
            },
        };
        const result = validateTopic(bad);
        expect(result.success).toBe(false);
    });
});

// --- Unit tests for validateCategory ---

describe('validateCategory', () => {
    it('returns success for a valid category', () => {
        const result = validateCategory(validCategory);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
    });

    it('returns failure when title is missing', () => {
        const { title: _t, ...noTitle } = validCategory;
        const result = validateCategory(noTitle);
        expect(result.success).toBe(false);
        expect(result.errors!.some(e => e.includes('title'))).toBe(true);
    });

    it('returns failure when order is not a positive integer', () => {
        const bad = { ...validCategory, order: -1 };
        const result = validateCategory(bad);
        expect(result.success).toBe(false);
    });
});

// --- Unit tests for validateGlossaryTerm ---

describe('validateGlossaryTerm', () => {
    it('returns success for a valid term', () => {
        const result = validateGlossaryTerm(validGlossaryTerm);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
    });

    it('returns failure when definition_simple is empty', () => {
        const bad = { ...validGlossaryTerm, definition_simple: '' };
        const result = validateGlossaryTerm(bad);
        expect(result.success).toBe(false);
    });

    it('accepts optional source_topics', () => {
        const withSources = { ...validGlossaryTerm, source_topics: ['topic-a'] };
        const result = validateGlossaryTerm(withSources);
        expect(result.success).toBe(true);
    });
});

// --- Integration: validate all loaded content ---

describe('Zod schemas against real content', () => {
    it('all 36 loaded topics pass TopicSchema', () => {
        const topics = loadTopics();
        expect(topics).toHaveLength(36);
        for (const topic of topics) {
            const result = TopicSchema.safeParse(topic);
            if (!result.success) {
                throw new Error(
                    `Topic "${(topic as { id?: string }).id ?? 'unknown'}" failed validation:\n` +
                        result.error.errors
                            .map(e => `  ${e.path.join('.')}: ${e.message}`)
                            .join('\n')
                );
            }
        }
    });

    it('all 8 loaded categories pass CategorySchema', () => {
        const categories = loadCategories();
        expect(categories).toHaveLength(8);
        for (const category of categories) {
            const result = CategorySchema.safeParse(category);
            if (!result.success) {
                throw new Error(
                    `Category "${(category as { id?: string }).id ?? 'unknown'}" failed validation:\n` +
                        result.error.errors
                            .map(e => `  ${e.path.join('.')}: ${e.message}`)
                            .join('\n')
                );
            }
        }
    });

    it('all glossary terms pass GlossaryTermSchema', () => {
        const glossary = loadGlossary();
        expect(glossary.size).toBeGreaterThan(0);
        for (const term of glossary.values()) {
            const result = GlossaryTermSchema.safeParse(term);
            if (!result.success) {
                throw new Error(
                    `Glossary term "${(term as { term?: string }).term ?? 'unknown'}" failed validation:\n` +
                        result.error.errors
                            .map(e => `  ${e.path.join('.')}: ${e.message}`)
                            .join('\n')
                );
            }
        }
    });
});
