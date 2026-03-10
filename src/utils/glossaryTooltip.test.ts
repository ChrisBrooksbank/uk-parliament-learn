import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { attachGlossaryTooltips, _resetTooltipForTest } from './glossaryTooltip';

function createTerm(definition: string, termName = 'Parliament'): HTMLElement {
    const abbr = document.createElement('abbr');
    abbr.className = 'glossary-term';
    abbr.setAttribute('data-term', termName);
    abbr.setAttribute('title', definition);
    abbr.textContent = termName;
    return abbr;
}

describe('attachGlossaryTooltips', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        _resetTooltipForTest();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        _resetTooltipForTest();
    });

    it('creates a tooltip element in document.body on first mouseenter', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip).not.toBeNull();
        expect(tooltip!.textContent).toBe('The legislature');
    });

    it('shows tooltip with visible class on mouseenter', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.classList.contains('glossary-tooltip--visible')).toBe(true);
    });

    it('hides tooltip on mouseleave', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        term.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.classList.contains('glossary-tooltip--visible')).toBe(false);
    });

    it('shows tooltip on click (mobile tap)', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('click', { bubbles: false }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.classList.contains('glossary-tooltip--visible')).toBe(true);
        expect(tooltip!.textContent).toBe('The legislature');
    });

    it('toggles off tooltip on second click on same term', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('click', { bubbles: false }));
        term.dispatchEvent(new MouseEvent('click', { bubbles: false }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.classList.contains('glossary-tooltip--visible')).toBe(false);
    });

    it('hides tooltip on Escape key', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.classList.contains('glossary-tooltip--visible')).toBe(false);
    });

    it('hides tooltip on outside document click', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        // Simulate clicking elsewhere in the document
        const outside = document.createElement('div');
        document.body.appendChild(outside);
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        outside.remove();

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.classList.contains('glossary-tooltip--visible')).toBe(false);
    });

    it('does not show tooltip when title attribute is empty', () => {
        const term = createTerm('');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip?.classList.contains('glossary-tooltip--visible') ?? false).toBe(false);
    });

    it('updates tooltip content when hovering different terms', () => {
        const term1 = createTerm('First definition', 'Parliament');
        const term2 = createTerm('Second definition', 'Lords');
        container.appendChild(term1);
        container.appendChild(term2);
        attachGlossaryTooltips(container);

        term1.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        let tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.textContent).toBe('First definition');

        term1.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        term2.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.textContent).toBe('Second definition');
    });

    it('reuses the same singleton tooltip element', () => {
        const term1 = createTerm('Definition 1', 'Parliament');
        const term2 = createTerm('Definition 2', 'Lords');
        container.appendChild(term1);
        container.appendChild(term2);
        attachGlossaryTooltips(container);

        term1.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        term2.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const tooltips = document.querySelectorAll('.glossary-tooltip');
        expect(tooltips.length).toBe(1);
    });

    it('sets role="tooltip" on the tooltip element', () => {
        const term = createTerm('The legislature');
        container.appendChild(term);
        attachGlossaryTooltips(container);

        term.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip!.getAttribute('role')).toBe('tooltip');
    });

    it('ignores elements that are not abbr.glossary-term', () => {
        const span = document.createElement('span');
        span.setAttribute('title', 'Some definition');
        container.appendChild(span);
        attachGlossaryTooltips(container);

        span.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        const tooltip = document.querySelector('.glossary-tooltip');
        expect(tooltip?.classList.contains('glossary-tooltip--visible') ?? false).toBe(false);
    });
});
