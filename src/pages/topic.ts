import { getTopic, getCategory } from '@api/index';
import type {
    AudienceLevel,
    DidYouKnowEntry,
    KeyDateEntry,
    KeyFigureEntry,
    Source,
} from '../types/index';
import {
    renderMultipleChoiceQuiz,
    attachMultipleChoiceHandlers,
    getMultipleChoiceQuestions,
} from './quiz';

/**
 * Render the Topic page: title, breadcrumb, introduction (summary), explanation body,
 * and supplementary content (did_you_know, key_dates, key_figures) filtered by level.
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

    // Filter supplementary content by current audience level
    const didYouKnow = (topic.did_you_know ?? []).filter(e => e.level.includes(level));
    const keyDates = (topic.key_dates ?? []).filter(e => e.levels.includes(level));
    const keyFigures = (topic.key_figures ?? []).filter(e => e.levels.includes(level));

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
            ${renderDidYouKnow(didYouKnow)}
            ${renderKeyDates(keyDates)}
            ${renderKeyFigures(keyFigures)}
            ${level === 'researcher' ? renderSources(explanation.sources ?? []) : ''}
            ${renderMultipleChoiceQuiz(getMultipleChoiceQuestions(topic.quizzes, level))}
        </article>
    `;

    attachMultipleChoiceHandlers(container);
}

function renderDidYouKnow(entries: DidYouKnowEntry[]): string {
    if (entries.length === 0) return '';
    return `
        <section class="topic-page__did-you-know" aria-label="Did you know?">
            <h3>Did you know?</h3>
            <ul>
                ${entries.map(e => `<li>${escapeHtml(e.fact)}</li>`).join('\n')}
            </ul>
        </section>
    `;
}

function renderKeyDates(entries: KeyDateEntry[]): string {
    if (entries.length === 0) return '';
    return `
        <section class="topic-page__key-dates" aria-label="Key dates">
            <h3>Key Dates</h3>
            <dl>
                ${entries
                    .map(
                        e => `
                    <dt>${escapeHtml(String(e.year))}</dt>
                    <dd>${escapeHtml(e.event)}${e.significance ? ` — ${escapeHtml(e.significance)}` : ''}</dd>
                `
                    )
                    .join('\n')}
            </dl>
        </section>
    `;
}

function renderKeyFigures(entries: KeyFigureEntry[]): string {
    if (entries.length === 0) return '';
    return `
        <section class="topic-page__key-figures" aria-label="Key figures">
            <h3>Key Figures</h3>
            <ul>
                ${entries
                    .map(
                        e => `
                    <li>
                        <strong>${escapeHtml(e.name)}</strong> — ${escapeHtml(e.role)}
                        <p>${escapeHtml(e.description)}</p>
                    </li>
                `
                    )
                    .join('\n')}
            </ul>
        </section>
    `;
}

function renderSources(sources: Source[]): string {
    if (sources.length === 0) return '';
    return `
        <section class="topic-page__sources" aria-label="Sources">
            <h3>Sources</h3>
            <ul>
                ${sources
                    .map(
                        s => `
                    <li>
                        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.citation)}</a>
                        ${s.type ? `<span class="source-type">(${escapeHtml(s.type)})</span>` : ''}
                    </li>
                `
                    )
                    .join('\n')}
            </ul>
        </section>
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
