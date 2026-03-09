import { getCategories, getTopics } from '@api/index';
import { navigate } from '@core/router';
import type { Category } from '../types/index';

/**
 * Render the Home page: 8 category cards with name, description, and topic count.
 */
export function renderHomePage(container: HTMLElement): void {
    const categories = getCategories()
        .slice()
        .sort((a, b) => a.order - b.order);
    const topics = getTopics();

    // Count topics per category
    const topicCountByCategory = new Map<string, number>();
    for (const topic of topics) {
        const cat = topic.metadata.category;
        topicCountByCategory.set(cat, (topicCountByCategory.get(cat) ?? 0) + 1);
    }

    container.innerHTML = `
        <section class="home-hero" aria-labelledby="home-heading">
            <h2 id="home-heading" class="home-title">Explore UK Parliament</h2>
            <p class="home-subtitle">Learn about Parliament, democracy, and political systems at your own level.</p>
        </section>
        <section aria-labelledby="categories-heading">
            <h3 id="categories-heading" class="section-heading">Browse Categories</h3>
            <ul class="category-grid" role="list">
                ${categories.map(cat => renderCategoryCard(cat, topicCountByCategory.get(cat.id) ?? 0)).join('')}
            </ul>
        </section>
    `;

    // Attach click handlers to cards (handles keyboard + mouse)
    const cards = container.querySelectorAll<HTMLElement>('[data-category-id]');
    for (const card of cards) {
        const categoryId = card.dataset['categoryId'];
        if (!categoryId) continue;

        card.addEventListener('click', () => {
            navigate(`/category/${categoryId}`);
        });
        card.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/category/${categoryId}`);
            }
        });
    }
}

function renderCategoryCard(category: Category, topicCount: number): string {
    const topicLabel = topicCount === 1 ? '1 topic' : `${topicCount} topics`;
    return `
        <li>
            <article
                class="category-card"
                data-category-id="${escapeHtml(category.id)}"
                role="button"
                tabindex="0"
                aria-label="${escapeHtml(category.title)} — ${topicLabel}"
            >
                <div class="category-card__icon" aria-hidden="true">${escapeHtml(category.icon)}</div>
                <div class="category-card__body">
                    <h4 class="category-card__title">${escapeHtml(category.title)}</h4>
                    <p class="category-card__description">${escapeHtml(category.description)}</p>
                    <span class="category-card__count" aria-label="${topicLabel}">${topicLabel}</span>
                </div>
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
