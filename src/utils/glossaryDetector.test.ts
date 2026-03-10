import { describe, it, expect } from 'vitest';
import { wrapGlossaryTerms } from './glossaryDetector';
import type { GlossaryTerm } from '../types/index';

function makeGlossary(
    terms: { term: string; definition_simple: string }[]
): Map<string, GlossaryTerm> {
    const map = new Map<string, GlossaryTerm>();
    for (const t of terms) {
        map.set(t.term.toLowerCase(), {
            term: t.term,
            definition_simple: t.definition_simple,
            definition_full: t.definition_simple,
        });
    }
    return map;
}

describe('wrapGlossaryTerms', () => {
    it('returns escaped plain text when glossary is empty', () => {
        const result = wrapGlossaryTerms('Hello <world>', new Map());
        expect(result).toBe('Hello &lt;world&gt;');
    });

    it('wraps a matched term with an abbr element', () => {
        const glossary = makeGlossary([
            { term: 'Parliament', definition_simple: 'The legislature' },
        ]);
        const result = wrapGlossaryTerms('Parliament makes laws.', glossary);
        expect(result).toContain('<abbr class="glossary-term"');
        expect(result).toContain('data-term="Parliament"');
        expect(result).toContain('title="The legislature"');
        expect(result).toContain('Parliament</abbr>');
    });

    it('matches terms case-insensitively', () => {
        const glossary = makeGlossary([
            { term: 'Parliament', definition_simple: 'The legislature' },
        ]);
        const result = wrapGlossaryTerms('parliament makes laws.', glossary);
        expect(result).toContain('class="glossary-term"');
        expect(result).toContain('data-term="Parliament"');
        // The displayed text preserves original casing from the source
        expect(result).toContain('parliament</abbr>');
    });

    it('does not match partial words', () => {
        const glossary = makeGlossary([{ term: 'Act', definition_simple: 'A law' }]);
        const result = wrapGlossaryTerms('Enacted legislation.', glossary);
        expect(result).not.toContain('class="glossary-term"');
        expect(result).toContain('Enacted');
    });

    it('wraps all occurrences of a term', () => {
        const glossary = makeGlossary([
            { term: 'Parliament', definition_simple: 'The legislature' },
        ]);
        const result = wrapGlossaryTerms('Parliament and Parliament again.', glossary);
        const matches = result.match(/class="glossary-term"/g) ?? [];
        expect(matches.length).toBe(2);
    });

    it('escapes HTML in surrounding text', () => {
        const glossary = makeGlossary([{ term: 'Act', definition_simple: 'A law' }]);
        const result = wrapGlossaryTerms('The <Act> of 1689.', glossary);
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
    });

    it('escapes HTML in term definition', () => {
        const glossary = makeGlossary([{ term: 'Act', definition_simple: '<b>A law</b>' }]);
        const result = wrapGlossaryTerms('The Act of 1689.', glossary);
        expect(result).toContain('title="&lt;b&gt;A law&lt;/b&gt;"');
    });

    it('prefers longer terms over shorter overlapping ones', () => {
        const glossary = makeGlossary([
            { term: 'House of Commons', definition_simple: 'Lower chamber' },
            { term: 'House', definition_simple: 'A chamber' },
        ]);
        const result = wrapGlossaryTerms('The House of Commons debates bills.', glossary);
        expect(result).toContain('data-term="House of Commons"');
        // "House" alone should not be separately wrapped within "House of Commons"
        expect(result).not.toContain('data-term="House"');
    });

    it('wraps multiple different terms in one text', () => {
        const glossary = makeGlossary([
            { term: 'Parliament', definition_simple: 'The legislature' },
            { term: 'Lords', definition_simple: 'Upper chamber members' },
        ]);
        const result = wrapGlossaryTerms('Parliament and the Lords debate bills.', glossary);
        expect(result).toContain('data-term="Parliament"');
        expect(result).toContain('data-term="Lords"');
    });

    it('returns plain escaped text when no terms match', () => {
        const glossary = makeGlossary([
            { term: 'Parliament', definition_simple: 'The legislature' },
        ]);
        const result = wrapGlossaryTerms('The government governs.', glossary);
        expect(result).toBe('The government governs.');
        expect(result).not.toContain('abbr');
    });

    it('handles empty text', () => {
        const glossary = makeGlossary([
            { term: 'Parliament', definition_simple: 'The legislature' },
        ]);
        const result = wrapGlossaryTerms('', glossary);
        expect(result).toBe('');
    });
});
