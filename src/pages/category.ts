import { getCategory, getTopics } from '@api/index';
import { navigate } from '@core/router';
import type { Topic } from '../types/index';

/**
 * Render the Category page: header with category info, list of topics with links.
 */
export function renderCategoryPage(container: HTMLElement, categoryId: string): void {
    const category = getCategory(categoryId);

    if (!category) {
        container.innerHTML = `
            <div class="error-state" role="alert">
                <strong>Category not found:</strong> ${escapeHtml(categoryId)}
                <p><a href="#/">Back to home</a></p>
            </div>
        `;
        return;
    }

    const topics = getTopics()
        .filter(t => t.metadata.category === categoryId)
        .sort((a, b) => a.metadata.order - b.metadata.order);

    container.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
                <li><a href="#/">Home</a></li>
                <li aria-current="page">${escapeHtml(category.title)}</li>
            </ol>
        </nav>
        <section class="category-hero" aria-labelledby="category-heading">
            <div class="category-hero__icon" aria-hidden="true">${escapeHtml(category.icon)}</div>
            <h2 id="category-heading" class="category-hero__title">${escapeHtml(category.title)}</h2>
            <p class="category-hero__description">${escapeHtml(category.description)}</p>
        </section>
        <section aria-labelledby="topics-heading">
            <h3 id="topics-heading" class="section-heading">Topics</h3>
            <ul class="topic-list" role="list">
                ${topics.map(t => renderTopicItem(t)).join('')}
            </ul>
        </section>
    `;

    // Attach click handlers to topic items
    const items = container.querySelectorAll<HTMLElement>('[data-topic-id]');
    for (const item of items) {
        const topicId = item.dataset['topicId'];
        if (!topicId) continue;

        item.addEventListener('click', () => {
            navigate(`/topic/${topicId}`);
        });
        item.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/topic/${topicId}`);
            }
        });
    }
}

function renderTopicItem(topic: Topic): string {
    const summary = topic.explanations.adult.summary;
    return `
        <li>
            <article
                class="topic-item"
                data-topic-id="${escapeHtml(topic.id)}"
                role="button"
                tabindex="0"
                aria-label="${escapeHtml(topic.title)}"
            >
                <h4 class="topic-item__title">${escapeHtml(topic.title)}</h4>
                ${summary ? `<p class="topic-item__summary">${escapeHtml(summary)}</p>` : ''}
            </article>
        </li>
    `;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
