import { getTopic, getCategory } from '@api/index';
import type { AudienceLevel } from '../types/index';

/**
 * Render the Topic page: title, breadcrumb, introduction (summary), and explanation body
 * for the given audience level (defaults to "adult").
 */
export function renderTopicPage(
    container: HTMLElement,
    topicId: string,
    level: AudienceLevel = 'adult'
): void {
    const topic = getTopic(topicId);

    if (!topic) {
        container.innerHTML = `
            <div class="error-state" role="alert">
                <strong>Topic not found:</strong> ${escapeHtml(topicId)}
                <p><a href="#/">Back to home</a></p>
            </div>
        `;
        return;
    }

    const category = getCategory(topic.metadata.category);
    const explanation = topic.explanations[level];

    container.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
                <li><a href="#/">Home</a></li>
                ${category ? `<li><a href="#/category/${escapeHtml(category.id)}">${escapeHtml(category.title)}</a></li>` : ''}
                <li aria-current="page">${escapeHtml(topic.title)}</li>
            </ol>
        </nav>
        <article class="topic-page" aria-labelledby="topic-heading">
            <header class="topic-page__header">
                <h2 id="topic-heading" class="topic-page__title">${escapeHtml(topic.title)}</h2>
                ${explanation.summary ? `<p class="topic-page__summary">${escapeHtml(explanation.summary)}</p>` : ''}
            </header>
            <section class="topic-page__body" aria-label="Explanation">
                ${
                    explanation.body
                        ? `<div class="topic-page__content">${renderBody(explanation.body)}</div>`
                        : '<p class="topic-page__empty">No content available for this level.</p>'
                }
            </section>
        </article>
    `;
}

/**
 * Convert plain text body to paragraphs. Each blank-line-separated block becomes a <p>.
 */
function renderBody(body: string): string {
    return body
        .split(/\n\s*\n/)
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .map(para => `<p>${escapeHtml(para.replace(/\n/g, ' '))}</p>`)
        .join('\n');
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
