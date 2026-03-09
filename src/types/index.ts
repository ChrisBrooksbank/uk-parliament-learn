/**
 * Centralized Type Definitions
 */

// Re-export config types for convenience
export type { AppConfig } from '@config/schema';

// Log levels
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogLevels {
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
}

// Content types — matching content/_schema.yaml v1.0

export type AudienceLevel = 'child' | 'teenager' | 'adult' | 'researcher';

export type TopicStatus = 'draft' | 'review' | 'published';

export type RelationshipType = 'subtopic' | 'prerequisite' | 'see-also' | 'contrast';

export type SourceType = 'primary' | 'secondary' | 'official';

export type QuizType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface Source {
    citation: string;
    url: string;
    type: SourceType;
}

export interface ExplanationLevel {
    summary: string;
    body: string;
    reading_age?: number | null;
    sources?: Source[];
}

export interface Explanations {
    child: ExplanationLevel;
    teenager: ExplanationLevel;
    adult: ExplanationLevel;
    researcher: ExplanationLevel;
}

export interface GlossaryEntry {
    term: string;
    definition_simple: string;
    definition_full: string;
}

export interface DidYouKnowEntry {
    fact: string;
    level: AudienceLevel[];
}

export interface KeyDateEntry {
    year: number;
    event: string;
    significance: string;
    levels: AudienceLevel[];
}

export interface KeyFigureEntry {
    name: string;
    role: string;
    description: string;
    levels: AudienceLevel[];
}

export interface VideoLinkEntry {
    title: string;
    url: string;
    source: string;
    levels: AudienceLevel[];
    description?: string;
}

export interface QuizEntry {
    question: string;
    type: QuizType;
    correct_answer: string;
    explanation: string;
    options?: string[];
}

export type Quizzes = Partial<Record<AudienceLevel, QuizEntry[]>>;

export interface RelatedTopic {
    id: string;
    relationship: RelationshipType;
}

export interface TopicMetadata {
    category: string;
    tags: string[];
    last_updated: string;
    status: TopicStatus;
    order: number;
}

export interface Topic {
    id: string;
    title: string;
    slug: string;
    metadata: TopicMetadata;
    explanations: Explanations;
    related_topics?: RelatedTopic[];
    glossary?: GlossaryEntry[];
    did_you_know?: DidYouKnowEntry[];
    key_dates?: KeyDateEntry[];
    key_figures?: KeyFigureEntry[];
    video_links?: VideoLinkEntry[];
    quizzes?: Quizzes;
}

export interface Category {
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
    folder: string;
}

export interface GlossaryTerm {
    term: string;
    definition_simple: string;
    definition_full: string;
    source_topics?: string[];
}
