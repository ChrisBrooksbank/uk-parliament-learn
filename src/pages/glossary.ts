import { getGlossary } from '@api/index';
import type { GlossaryTerm } from '../types/index';

/**
 * Render the Glossary page: alphabetically sorted terms with definitions.
 */
export function renderGlossaryPage(container: HTMLElement): void {
    const glossaryMap = getGlossary();

    // Sort terms alphabetically (case-insensitive)
    const terms: GlossaryTerm[] = [...glossaryMap.values()].sort((a, b) =>
        a.term.localeCompare(b.term, undefined, { sensitivity: 'base' })
    );

    if (terms.length === 0) {
        container.innerHTML = `
            <div class="glossary-empty" role="status">
                <p>No glossary terms available.</p>
            </div>
        `;
        return;
    }

    // Group terms by first letter
    const grouped = new Map<string, GlossaryTerm[]>();
    for (const term of terms) {
        const letter = term.term[0]!.toUpperCase();
        if (!grouped.has(letter)) {
            grouped.set(letter, []);
        }
        grouped.get(letter)!.push(term);
    }

    const letters = [...grouped.keys()].sort();

    const letterNavHtml = letters
        .map(
            letter =>
                `<a class="glossary-nav__link" href="javascript:void(0)" data-letter="${escapeHtml(letter)}" role="button" aria-label="Jump to ${escapeHtml(letter)}">${escapeHtml(letter)}</a>`
        )
        .join('');

    const sectionsHtml = letters
        .map(letter => {
            const sectionTerms = grouped.get(letter)!;
            const termsHtml = sectionTerms
                .map(
                    term => `
                <dt class="glossary-term" id="term-${escapeHtml(term.term.toLowerCase().replace(/\s+/g, '-'))}">
                    ${escapeHtml(term.term)}
                </dt>
                <dd class="glossary-definition">
                    <p class="glossary-definition__simple">${escapeHtml(term.definition_simple)}</p>
                    ${
                        term.definition_full && term.definition_full !== term.definition_simple
                            ? `<p class="glossary-definition__full">${escapeHtml(term.definition_full)}</p>`
                            : ''
                    }
                </dd>
            `
                )
                .join('');

            return `
            <section class="glossary-section" aria-labelledby="glossary-${escapeHtml(letter)}">
                <h3 class="glossary-section__letter" id="glossary-${escapeHtml(letter)}">${escapeHtml(letter)}</h3>
                <dl class="glossary-list">
                    ${termsHtml}
                </dl>
            </section>
        `;
        })
        .join('');

    container.innerHTML = `
        <article class="glossary-page" aria-labelledby="glossary-heading">
            <header class="glossary-page__header">
                <h2 id="glossary-heading" class="glossary-page__title">Glossary</h2>
                <p class="glossary-page__subtitle">${terms.length} terms</p>
            </header>
            <nav class="glossary-nav" aria-label="Glossary alphabet navigation">
                ${letterNavHtml}
            </nav>
            <div class="glossary-sections">
                ${sectionsHtml}
            </div>
        </article>
    `;

    // Use scrollIntoView instead of hash anchors to avoid conflicting with the hash router
    container.querySelectorAll<HTMLAnchorElement>('.glossary-nav__link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const letter = (e.currentTarget as HTMLAnchorElement).dataset.letter;
            if (letter) {
                const target = document.getElementById(`glossary-${letter}`);
                target?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
