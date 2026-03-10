import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Topic } from '../types/index';
import { renderTopicPage } from './topic';

const mockTopic: Topic = {
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
        child: {
            summary: 'Simple explanation for kids',
            body: 'Parliament is where laws are made.',
        },
        teenager: {
            summary: 'Teen summary',
            body: 'Parliament makes laws and scrutinises the government.',
        },
        adult: {
            summary: 'Adult summary',
            body: 'Parliament is the supreme legislative body of the United Kingdom.\n\nIt consists of the House of Commons, the House of Lords, and the Monarch.',
        },
        researcher: {
            summary: 'Researcher summary',
            body: 'Detailed analysis.',
            sources: [
                { citation: 'UK Parliament', url: 'https://parliament.uk', type: 'official' },
            ],
        },
    },
    did_you_know: [
        { fact: 'Fun fact for all', level: ['child', 'teenager', 'adult', 'researcher'] },
        { fact: 'Child-only fact', level: ['child'] },
        { fact: 'Researcher-only fact', level: ['researcher'] },
    ],
    key_dates: [
        {
            year: 1265,
            event: 'First Parliament',
            significance: 'Historic milestone',
            levels: ['adult', 'researcher'],
        },
        {
            year: 1215,
            event: 'Magna Carta',
            significance: 'Rights established',
            levels: ['child', 'teenager', 'adult', 'researcher'],
        },
    ],
    key_figures: [
        {
            name: 'Simon de Montfort',
            role: 'Earl',
            description: 'Called first parliament',
            levels: ['researcher'],
        },
        {
            name: 'The Speaker',
            role: 'Chair',
            description: 'Chairs debates',
            levels: ['child', 'teenager', 'adult', 'researcher'],
        },
    ],
};

vi.mock('@api/index', () => ({
    getTopic: vi.fn((id: string) => {
        if (id === 'what-is-parliament') return mockTopic;
        return undefined;
    }),
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
}));

describe('renderTopicPage', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        vi.clearAllMocks();
    });

    it('renders topic title', () => {
        renderTopicPage(container, 'what-is-parliament');
        expect(container.textContent).toContain('What is Parliament?');
    });

    it('renders adult explanation by default', () => {
        renderTopicPage(container, 'what-is-parliament');
        expect(container.textContent).toContain('Adult summary');
        expect(container.textContent).toContain('Parliament is the supreme legislative body');
    });

    it('renders child explanation when level is child', () => {
        renderTopicPage(container, 'what-is-parliament', 'child');
        expect(container.textContent).toContain('Simple explanation for kids');
        expect(container.textContent).toContain('Parliament is where laws are made');
    });

    it('renders teenager explanation when level is teenager', () => {
        renderTopicPage(container, 'what-is-parliament', 'teenager');
        expect(container.textContent).toContain('Teen summary');
        expect(container.textContent).toContain('scrutinises the government');
    });

    it('renders researcher explanation when level is researcher', () => {
        renderTopicPage(container, 'what-is-parliament', 'researcher');
        expect(container.textContent).toContain('Researcher summary');
        expect(container.textContent).toContain('Detailed analysis');
    });

    it('wraps multi-paragraph body in <p> tags', () => {
        renderTopicPage(container, 'what-is-parliament');
        const paragraphs = container.querySelectorAll('.topic-page__content p');
        expect(paragraphs.length).toBe(2);
    });

    it('renders breadcrumb with home link', () => {
        renderTopicPage(container, 'what-is-parliament');
        const homeLink = container.querySelector('a[href="#/"]');
        expect(homeLink).not.toBeNull();
        expect(homeLink!.textContent).toContain('Home');
    });

    it('renders breadcrumb category link', () => {
        renderTopicPage(container, 'what-is-parliament');
        const catLink = container.querySelector('a[href="#/category/parliament-basics"]');
        expect(catLink).not.toBeNull();
        expect(catLink!.textContent).toContain('Parliament Basics');
    });

    it('marks current page in breadcrumb', () => {
        renderTopicPage(container, 'what-is-parliament');
        const current = container.querySelector('[aria-current="page"]');
        expect(current).not.toBeNull();
        expect(current!.textContent).toContain('What is Parliament?');
    });

    it('renders article with aria-labelledby', () => {
        renderTopicPage(container, 'what-is-parliament');
        const article = container.querySelector('article.topic-page');
        expect(article).not.toBeNull();
        expect(article!.getAttribute('aria-labelledby')).toBe('topic-heading');
    });

    it('renders heading with correct id', () => {
        renderTopicPage(container, 'what-is-parliament');
        const heading = container.querySelector('#topic-heading');
        expect(heading).not.toBeNull();
        expect(heading!.textContent).toContain('What is Parliament?');
    });

    it('renders error state for unknown topic', () => {
        renderTopicPage(container, 'nonexistent-topic');
        const alert = container.querySelector('[role="alert"]');
        expect(alert).not.toBeNull();
        expect(alert!.textContent).toContain('Topic not found');
    });

    it('escapes HTML in topic title', async () => {
        const { getTopic } = await import('@api/index');
        vi.mocked(getTopic).mockReturnValueOnce({
            ...mockTopic,
            title: '<script>alert("xss")</script>',
            metadata: { ...mockTopic.metadata, status: 'published' as const },
            explanations: {
                ...mockTopic.explanations,
                researcher: {
                    summary: 'Researcher summary',
                    body: 'Detailed analysis.',
                    sources: [
                        {
                            citation: 'UK Parliament',
                            url: 'https://parliament.uk',
                            type: 'official' as const,
                        },
                    ],
                },
            },
        });
        renderTopicPage(container, 'what-is-parliament');
        expect(container.innerHTML).not.toContain('<script>');
        expect(container.textContent).toContain('<script>alert("xss")</script>');
    });

    describe('did_you_know filtering', () => {
        it('shows facts matching the current level', () => {
            renderTopicPage(container, 'what-is-parliament', 'adult');
            const section = container.querySelector('.topic-page__did-you-know');
            expect(section).not.toBeNull();
            expect(section!.textContent).toContain('Fun fact for all');
        });

        it('shows child-only fact for child level', () => {
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__did-you-know');
            expect(section!.textContent).toContain('Child-only fact');
            expect(section!.textContent).not.toContain('Researcher-only fact');
        });

        it('shows researcher-only fact for researcher level', () => {
            renderTopicPage(container, 'what-is-parliament', 'researcher');
            const section = container.querySelector('.topic-page__did-you-know');
            expect(section!.textContent).toContain('Researcher-only fact');
        });

        it('hides researcher-only fact for child level', () => {
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__did-you-know');
            expect(section!.textContent).not.toContain('Researcher-only fact');
        });

        it('omits did_you_know section when no facts match level', async () => {
            const { getTopic } = await import('@api/index');
            vi.mocked(getTopic).mockReturnValueOnce({
                ...mockTopic,
                did_you_know: [
                    {
                        fact: 'Researcher fact',
                        level: ['researcher'] as ('child' | 'teenager' | 'adult' | 'researcher')[],
                    },
                ],
            });
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__did-you-know');
            expect(section).toBeNull();
        });
    });

    describe('key_dates filtering', () => {
        it('shows dates matching the current level', () => {
            renderTopicPage(container, 'what-is-parliament', 'adult');
            const section = container.querySelector('.topic-page__key-dates');
            expect(section).not.toBeNull();
            expect(section!.textContent).toContain('First Parliament');
            expect(section!.textContent).toContain('Magna Carta');
        });

        it('excludes adult-only dates for child level', () => {
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__key-dates');
            expect(section).not.toBeNull();
            expect(section!.textContent).not.toContain('First Parliament');
            expect(section!.textContent).toContain('Magna Carta');
        });

        it('omits key_dates section when no dates match level', async () => {
            const { getTopic } = await import('@api/index');
            vi.mocked(getTopic).mockReturnValueOnce({
                ...mockTopic,
                key_dates: [
                    {
                        year: 1265,
                        event: 'First Parliament',
                        significance: 'Historic',
                        levels: ['researcher'] as ('child' | 'teenager' | 'adult' | 'researcher')[],
                    },
                ],
            });
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__key-dates');
            expect(section).toBeNull();
        });
    });

    describe('sources section', () => {
        it('shows sources section for researcher level', () => {
            renderTopicPage(container, 'what-is-parliament', 'researcher');
            const section = container.querySelector('.topic-page__sources');
            expect(section).not.toBeNull();
            expect(section!.textContent).toContain('UK Parliament');
        });

        it('renders source as a clickable link', () => {
            renderTopicPage(container, 'what-is-parliament', 'researcher');
            const link = container.querySelector('.topic-page__sources a');
            expect(link).not.toBeNull();
            expect(link!.getAttribute('href')).toBe('https://parliament.uk');
            expect(link!.textContent).toContain('UK Parliament');
        });

        it('does not show sources section for adult level', () => {
            renderTopicPage(container, 'what-is-parliament', 'adult');
            const section = container.querySelector('.topic-page__sources');
            expect(section).toBeNull();
        });

        it('does not show sources section for child level', () => {
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__sources');
            expect(section).toBeNull();
        });

        it('does not show sources section for teenager level', () => {
            renderTopicPage(container, 'what-is-parliament', 'teenager');
            const section = container.querySelector('.topic-page__sources');
            expect(section).toBeNull();
        });

        it('omits sources section when researcher level has no sources', async () => {
            const { getTopic } = await import('@api/index');
            vi.mocked(getTopic).mockReturnValueOnce({
                ...mockTopic,
                explanations: {
                    ...mockTopic.explanations,
                    researcher: {
                        summary: 'Researcher summary',
                        body: 'Detailed analysis.',
                        sources: [],
                    },
                },
            });
            renderTopicPage(container, 'what-is-parliament', 'researcher');
            const section = container.querySelector('.topic-page__sources');
            expect(section).toBeNull();
        });
    });

    describe('key_figures filtering', () => {
        it('shows figures matching the current level', () => {
            renderTopicPage(container, 'what-is-parliament', 'adult');
            const section = container.querySelector('.topic-page__key-figures');
            expect(section).not.toBeNull();
            expect(section!.textContent).toContain('The Speaker');
        });

        it('excludes researcher-only figures for child level', () => {
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__key-figures');
            expect(section!.textContent).not.toContain('Simon de Montfort');
            expect(section!.textContent).toContain('The Speaker');
        });

        it('shows researcher-only figures for researcher level', () => {
            renderTopicPage(container, 'what-is-parliament', 'researcher');
            const section = container.querySelector('.topic-page__key-figures');
            expect(section!.textContent).toContain('Simon de Montfort');
        });

        it('omits key_figures section when no figures match level', async () => {
            const { getTopic } = await import('@api/index');
            vi.mocked(getTopic).mockReturnValueOnce({
                ...mockTopic,
                key_figures: [
                    {
                        name: 'Expert',
                        role: 'Scholar',
                        description: 'Academic',
                        levels: ['researcher'] as ('child' | 'teenager' | 'adult' | 'researcher')[],
                    },
                ],
            });
            renderTopicPage(container, 'what-is-parliament', 'child');
            const section = container.querySelector('.topic-page__key-figures');
            expect(section).toBeNull();
        });
    });
});
