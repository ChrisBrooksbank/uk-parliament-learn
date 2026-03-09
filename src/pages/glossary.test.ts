import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderGlossaryPage } from './glossary';
import type { GlossaryTerm } from '../types/index';

const mockTerms: GlossaryTerm[] = [
    {
        term: 'Parliament',
        definition_simple: 'The UK law-making body.',
        definition_full: 'The UK Parliament is the supreme legislative body of the United Kingdom.',
    },
    {
        term: 'Act of Parliament',
        definition_simple: 'A law passed by Parliament.',
        definition_full:
            'A formal piece of primary legislation passed by both Houses of Parliament.',
    },
    {
        term: 'Bill',
        definition_simple: 'A proposed law.',
        definition_full:
            'A Bill is a proposed piece of legislation presented to Parliament for debate.',
    },
    {
        term: 'Democracy',
        definition_simple: 'Government by the people.',
        definition_full: 'A system of government where citizens vote for their representatives.',
    },
];

// Build a Map<string, GlossaryTerm> keyed by lowercase term
function buildMap(terms: GlossaryTerm[]): Map<string, GlossaryTerm> {
    const map = new Map<string, GlossaryTerm>();
    for (const t of terms) {
        map.set(t.term.toLowerCase(), t);
    }
    return map;
}

vi.mock('@api/index', () => ({
    getGlossary: vi.fn(() => buildMap(mockTerms)),
}));

describe('renderGlossaryPage', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    it('renders a heading', () => {
        renderGlossaryPage(container);
        const heading = container.querySelector('h2');
        expect(heading).not.toBeNull();
        expect(heading!.textContent).toContain('Glossary');
    });

    it('renders the term count', () => {
        renderGlossaryPage(container);
        expect(container.textContent).toContain('4 terms');
    });

    it('renders all terms', () => {
        renderGlossaryPage(container);
        const terms = container.querySelectorAll('.glossary-term');
        expect(terms.length).toBe(4);
    });

    it('renders terms alphabetically', () => {
        renderGlossaryPage(container);
        const terms = container.querySelectorAll('.glossary-term');
        const termTexts = [...terms].map(t => t.textContent!.trim());
        const sorted = [...termTexts].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        );
        expect(termTexts).toEqual(sorted);
    });

    it('renders definitions', () => {
        renderGlossaryPage(container);
        expect(container.textContent).toContain('The UK law-making body.');
        expect(container.textContent).toContain('A proposed law.');
    });

    it('renders alphabet navigation links', () => {
        renderGlossaryPage(container);
        const nav = container.querySelector('.glossary-nav');
        expect(nav).not.toBeNull();
        // Should have links for A, B, D, P
        const links = nav!.querySelectorAll('a');
        const linkTexts = [...links].map(l => l.textContent!.trim());
        expect(linkTexts).toContain('A');
        expect(linkTexts).toContain('B');
        expect(linkTexts).toContain('D');
        expect(linkTexts).toContain('P');
    });

    it('groups terms under letter sections', () => {
        renderGlossaryPage(container);
        const sections = container.querySelectorAll('.glossary-section');
        // A (Act of Parliament), B (Bill), D (Democracy), P (Parliament)
        expect(sections.length).toBe(4);
    });

    it('section headings have correct IDs for anchor navigation', () => {
        renderGlossaryPage(container);
        const heading = container.querySelector('#glossary-A');
        expect(heading).not.toBeNull();
        expect(heading!.textContent!.trim()).toBe('A');
    });

    it('renders term with an anchor id', () => {
        renderGlossaryPage(container);
        const termEl = container.querySelector('#term-parliament');
        expect(termEl).not.toBeNull();
    });

    it('has aria-label on glossary nav', () => {
        renderGlossaryPage(container);
        const nav = container.querySelector('.glossary-nav');
        expect(nav!.getAttribute('aria-label')).toBeTruthy();
    });

    it('renders empty state when no terms', async () => {
        const { getGlossary } = await import('@api/index');
        vi.mocked(getGlossary).mockReturnValueOnce(new Map());
        renderGlossaryPage(container);
        expect(container.querySelector('.glossary-empty')).not.toBeNull();
        expect(container.textContent).toContain('No glossary terms available.');
    });

    it('renders full definition when different from simple', () => {
        renderGlossaryPage(container);
        expect(container.textContent).toContain(
            'The UK Parliament is the supreme legislative body of the United Kingdom.'
        );
    });
});
