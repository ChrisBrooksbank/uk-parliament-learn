/**
 * Zod schemas for validating loaded content against _schema.yaml rules.
 */

import { z } from 'zod';

// --- Primitives ---

const AudienceLevelSchema = z.enum(['child', 'teenager', 'adult', 'researcher']);

const TopicStatusSchema = z.enum(['draft', 'review', 'published']);

const RelationshipTypeSchema = z.enum(['subtopic', 'prerequisite', 'see-also', 'contrast']);

const SourceTypeSchema = z.enum(['primary', 'secondary', 'official']);

const QuizTypeSchema = z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay']);

// --- Nested schemas ---

const SourceSchema = z.object({
    citation: z.string().min(1),
    url: z.string().url(),
    type: SourceTypeSchema,
});

const ExplanationLevelSchema = z.object({
    summary: z.string().min(1),
    body: z.string().min(1),
    reading_age: z.number().nullable().optional(),
    sources: z.array(SourceSchema).optional(),
});

const ExplanationsSchema = z.object({
    child: ExplanationLevelSchema,
    teenager: ExplanationLevelSchema,
    adult: ExplanationLevelSchema,
    researcher: ExplanationLevelSchema,
});

const GlossaryEntrySchema = z.object({
    term: z.string().min(1),
    definition_simple: z.string().min(1),
    definition_full: z.string().min(1),
});

const DidYouKnowEntrySchema = z.object({
    fact: z.string().min(1),
    level: z.array(AudienceLevelSchema).min(1),
});

const KeyDateEntrySchema = z.object({
    year: z.number().int(),
    event: z.string().min(1),
    significance: z.string().min(1),
    levels: z.array(AudienceLevelSchema).min(1),
});

const KeyFigureEntrySchema = z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    description: z.string().min(1),
    levels: z.array(AudienceLevelSchema).min(1),
});

const VideoLinkEntrySchema = z.object({
    title: z.string().min(1),
    url: z.string().url(),
    source: z.string().min(1),
    levels: z.array(AudienceLevelSchema).min(1),
    description: z.string().optional(),
});

const QuizEntrySchema = z
    .object({
        question: z.string().min(1),
        type: QuizTypeSchema,
        // YAML content uses 'answer'; schema spec says 'correct_answer' — accept both
        correct_answer: z.union([z.string(), z.boolean(), z.number()]).optional(),
        answer: z.union([z.string(), z.boolean(), z.number()]).optional(),
        explanation: z.string().min(1),
        options: z.array(z.string()).optional(),
    })
    .refine(data => data.correct_answer !== undefined || data.answer !== undefined, {
        message: "At least one of 'correct_answer' or 'answer' must be present",
    });

const QuizzesSchema = z
    .object({
        child: z.array(QuizEntrySchema).optional(),
        teenager: z.array(QuizEntrySchema).optional(),
        adult: z.array(QuizEntrySchema).optional(),
        researcher: z.array(QuizEntrySchema).optional(),
    })
    .optional();

const RelatedTopicSchema = z.object({
    id: z.string().min(1),
    relationship: RelationshipTypeSchema,
});

const TopicMetadataSchema = z.object({
    category: z.string().min(1),
    tags: z.array(z.string()),
    last_updated: z.union([z.string(), z.date()]).transform(v => String(v)),
    status: TopicStatusSchema,
    order: z.number().int().positive(),
});

// --- Top-level schemas ---

export const TopicSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1),
    metadata: TopicMetadataSchema,
    explanations: ExplanationsSchema,
    related_topics: z.array(RelatedTopicSchema).optional(),
    glossary: z.array(GlossaryEntrySchema).optional(),
    did_you_know: z.array(DidYouKnowEntrySchema).optional(),
    key_dates: z.array(KeyDateEntrySchema).optional(),
    key_figures: z.array(KeyFigureEntrySchema).optional(),
    video_links: z.array(VideoLinkEntrySchema).optional(),
    quizzes: QuizzesSchema,
});

export const CategorySchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().min(1),
    order: z.number().int().positive(),
    folder: z.string().min(1),
});

export const GlossaryTermSchema = z.object({
    term: z.string().min(1),
    definition_simple: z.string().min(1),
    definition_full: z.string().min(1),
    source_topics: z.array(z.string()).optional(),
});

// --- Exported inferred types (mirrors src/types/index.ts) ---

export type ValidatedTopic = z.infer<typeof TopicSchema>;
export type ValidatedCategory = z.infer<typeof CategorySchema>;
export type ValidatedGlossaryTerm = z.infer<typeof GlossaryTermSchema>;

// --- Validation helpers ---

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

/**
 * Validate a single topic object. Returns a typed result with error messages on failure.
 */
export function validateTopic(raw: unknown): ValidationResult<ValidatedTopic> {
    const result = TopicSchema.safeParse(raw);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
}

/**
 * Validate a single category object.
 */
export function validateCategory(raw: unknown): ValidationResult<ValidatedCategory> {
    const result = CategorySchema.safeParse(raw);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
}

/**
 * Validate a single glossary term.
 */
export function validateGlossaryTerm(raw: unknown): ValidationResult<ValidatedGlossaryTerm> {
    const result = GlossaryTermSchema.safeParse(raw);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
}
