import { getTopics, getGlossary } from '@api/index';
import { buildSearchIndex, search } from '@utils/searchIndex';
import type { SearchIndex } from '@utils/searchIndex';

let cachedIndex: SearchIndex | null = null;

function getSearchIndex(): SearchIndex {
    if (!cachedIndex) {
        cachedIndex = buildSearchIndex(getTopics(), getGlossary());
    }
    return cachedIndex;
}

/** Extract the `q` query parameter from the current hash, e.g. `#/search?q=parliament` */
export function getQueryFromHash(hash: string): string {
    const qIndex = hash.indexOf('?q=');
    if (qIndex === -1) return '';
    return decodeURIComponent(hash.slice(qIndex + 3));
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildResultsHtml(query: string): string {
    if (!query.trim()) {
        return '<p class="search-hint">Enter a search term above to find topics and glossary entries.</p>';
    }

    const index = getSearchIndex();
    const results = search(query, index);

    if (results.length === 0) {
        return `<p class="search-no-results">No results found for "<strong>${escapeHtml(query)}</strong>".</p>`;
    }

    const items = results
        .map(result => {
            const isGlossary = result.type === 'glossary';
            const href = isGlossary ? '#/glossary' : `#/topic/${escapeHtml(result.id)}`;
            const badge = isGlossary
                ? '<span class="search-result__badge search-result__badge--glossary">Glossary</span>'
                : '<span class="search-result__badge search-result__badge--topic">Topic</span>';

            return `
            <li class="search-result">
                <article>
                    <header class="search-result__header">
                        ${badge}
                        <a class="search-result__title" href="${href}">${escapeHtml(result.title)}</a>
                    </header>
                    <p class="search-result__snippet">${escapeHtml(result.snippet)}</p>
                </article>
            </li>`;
        })
        .join('');

    return `
        <p class="search-count">${results.length} result${results.length === 1 ? '' : 's'} for "<strong>${escapeHtml(query)}</strong>"</p>
        <ol class="search-results-list" aria-label="Search results">
            ${items}
        </ol>`;
}

/**
 * Render the Search page: a search form and results list.
 */
export function renderSearchPage(container: HTMLElement): void {
    const query = getQueryFromHash(window.location.hash);
    const resultsHtml = buildResultsHtml(query);

    container.innerHTML = `
        <article class="search-page" aria-labelledby="search-heading">
            <header class="search-page__header">
                <h2 id="search-heading" class="search-page__title">Search</h2>
            </header>
            <form class="search-page__form" role="search" aria-label="Site search" id="search-page-form">
                <label class="sr-only" for="search-page-input">Search topics and glossary</label>
                <div class="search-page__input-row">
                    <input
                        class="search-page__input"
                        type="search"
                        id="search-page-input"
                        name="q"
                        placeholder="Search topics and glossary…"
                        value="${escapeHtml(query)}"
                        autocomplete="off"
                        autofocus
                        aria-label="Search topics and glossary"
                    />
                    <button class="search-page__btn" type="submit">Search</button>
                </div>
            </form>
            <section class="search-page__results" aria-live="polite" aria-label="Search results">
                ${resultsHtml}
            </section>
        </article>
    `;

    const form = container.querySelector<HTMLFormElement>('#search-page-form');
    const input = container.querySelector<HTMLInputElement>('#search-page-input');
    if (form && input) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const q = input.value.trim();
            window.location.hash = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
        });
    }
}
