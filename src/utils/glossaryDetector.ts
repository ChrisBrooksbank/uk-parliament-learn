import type { GlossaryTerm } from '../types/index';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Detect glossary terms in plain text and wrap each match with an
 * `<abbr class="glossary-term">` element containing the term definition.
 *
 * - Matching is case-insensitive and requires whole-word boundaries.
 * - Longer terms are matched first to avoid partial matches.
 * - Returns an HTML string safe for insertion into the DOM.
 *
 * @param text     Raw plain text (not yet HTML-escaped).
 * @param glossary Keyed glossary map (keys are lowercase term names).
 */
export function wrapGlossaryTerms(text: string, glossary: Map<string, GlossaryTerm>): string {
    if (glossary.size === 0) return escapeHtml(text);

    // Sort terms longest-first so "House of Commons" beats "House"
    const terms = [...glossary.values()].sort((a, b) => b.term.length - a.term.length);

    const escapedTermPatterns = terms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedTermPatterns.join('|')})\\b`, 'gi');

    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        // Escaped text before the match
        result += escapeHtml(text.slice(lastIndex, match.index));

        const matchedText = match[0];
        const term = glossary.get(matchedText.toLowerCase());

        if (term) {
            result += `<abbr class="glossary-term" data-term="${escapeHtml(term.term)}" title="${escapeHtml(term.definition_simple)}">${escapeHtml(matchedText)}</abbr>`;
        } else {
            result += escapeHtml(matchedText);
        }

        lastIndex = regex.lastIndex;
    }

    result += escapeHtml(text.slice(lastIndex));
    return result;
}
