import { test, expect } from '@playwright/test';

test.describe('Core interactions', () => {
    test('page loads and is interactive', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify the page has a title
        await expect(page).toHaveTitle(/.+/);

        // Verify main content is visible
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('navigation links work', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Find all navigation links and verify they respond to clicks
        const navLinks = page.locator('nav a, header a');
        const linkCount = await navLinks.count();

        if (linkCount > 0) {
            // Click first nav link and verify navigation occurs
            const firstLink = navLinks.first();
            const href = await firstLink.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                await firstLink.click();
                await page.waitForLoadState('networkidle');
                // Verify we navigated (URL changed or content loaded)
                await expect(page.locator('body')).toBeVisible();
            }
        }
    });

    test('buttons are clickable and respond', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const buttons = page.locator('button:visible');
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
            // Verify first visible button is enabled and clickable
            const firstButton = buttons.first();
            await expect(firstButton).toBeEnabled();
        }
    });

    test('no console errors on page load', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        expect(errors).toEqual([]);
    });

    test('keyboard navigation works if interactive elements exist', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check if there are any focusable elements on the page
        const focusableElements = page.locator(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const count = await focusableElements.count();

        if (count > 0) {
            // Verify keyboard navigation works - Tab through interactive elements
            await page.keyboard.press('Tab');
            const focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();
        }
    });
});

test.describe('Quiz completion', () => {
    test('complete a multiple choice quiz and verify score display', async ({ page }) => {
        // Navigate to a topic with quizzes and switch to child level (2 MC questions)
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        // Switch to child level which has 2 multiple_choice questions
        await page.locator('[data-level="child"]').click();
        await page.waitForLoadState('networkidle');

        // Verify the quiz section is visible
        const quizSection = page.locator('.topic-page__quiz').first();
        await expect(quizSection).toBeVisible();

        // Score summary should not be visible yet
        await expect(quizSection.locator('.quiz-score-summary')).toBeHidden();

        // Answer each multiple choice question by selecting the first option and submitting
        const questions = quizSection.locator('.quiz-question--multiple-choice');
        const questionCount = await questions.count();
        expect(questionCount).toBeGreaterThan(0);

        for (let i = 0; i < questionCount; i++) {
            const question = questions.nth(i);
            // Select the first radio option
            const firstOption = question.locator('input[type="radio"]').first();
            await firstOption.check();
            // Click the submit button
            await question.locator('.quiz-question__submit').click();
            // Feedback should appear
            await expect(question.locator('.quiz-question__feedback')).toBeVisible();
        }

        // After all questions answered, score summary should appear
        await expect(quizSection.locator('.quiz-score-summary')).toBeVisible();

        // Score summary should show "You scored X out of Y"
        const summaryText = await quizSection.locator('.quiz-score-summary').textContent();
        expect(summaryText).toMatch(/You scored \d+ out of \d+/);
    });

    test('submitting without selecting an answer shows warning', async ({ page }) => {
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        await page.locator('[data-level="child"]').click();
        await page.waitForLoadState('networkidle');

        const quizSection = page.locator('.topic-page__quiz').first();
        const firstQuestion = quizSection.locator('.quiz-question--multiple-choice').first();

        // Submit without selecting an answer
        await firstQuestion.locator('.quiz-question__submit').click();

        // Warning feedback should appear
        const feedback = firstQuestion.locator('.quiz-question__feedback');
        await expect(feedback).toBeVisible();
        await expect(feedback).toHaveClass(/warning/);
    });
});

test.describe('Audience level switching', () => {
    test('switching to researcher level shows sources section without page reload', async ({
        page,
    }) => {
        // Navigate directly to a topic page
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        // Record the initial URL
        const initialUrl = page.url();

        // Verify the topic page loaded and sources section is absent (adult is default)
        await expect(page.locator('.topic-page')).toBeVisible();
        await expect(page.locator('.topic-page__sources')).toHaveCount(0);

        // Click the Researcher level button
        const researcherBtn = page.locator('[data-level="researcher"]');
        await expect(researcherBtn).toBeVisible();
        await researcherBtn.click();

        // Verify the URL has not changed (no page reload)
        expect(page.url()).toBe(initialUrl);

        // Verify the sources section now appears
        await expect(page.locator('.topic-page__sources')).toBeVisible();
    });

    test('switching levels updates content without page reload', async ({ page }) => {
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        const initialUrl = page.url();

        // Default is adult — capture the current summary text
        const topicBody = page.locator('.topic-page__body');
        await expect(topicBody).toBeVisible();
        const adultContent = await topicBody.textContent();

        // Switch to child level
        await page.locator('[data-level="child"]').click();

        // URL unchanged (no page reload)
        expect(page.url()).toBe(initialUrl);

        // Content should have changed
        const childContent = await topicBody.textContent();
        expect(childContent).not.toBe(adultContent);
    });

    test('researcher level button gets active class after click', async ({ page }) => {
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        const researcherBtn = page.locator('[data-level="researcher"]');
        await expect(researcherBtn).not.toHaveClass(/level-btn--active/);

        await researcherBtn.click();

        await expect(researcherBtn).toHaveClass(/level-btn--active/);
    });

    test('switching away from researcher hides sources section', async ({ page }) => {
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        // Enable researcher level to show sources
        await page.locator('[data-level="researcher"]').click();
        await expect(page.locator('.topic-page__sources')).toBeVisible();

        // Switch back to adult — sources should disappear
        await page.locator('[data-level="adult"]').click();
        await expect(page.locator('.topic-page__sources')).toHaveCount(0);
    });

    test('level preference persists after navigating between pages', async ({ page }) => {
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        // Set to researcher level
        await page.locator('[data-level="researcher"]').click();
        await expect(page.locator('.topic-page__sources')).toBeVisible();

        // Navigate to home and back to the same topic
        await page.goto('/#/');
        await page.waitForLoadState('networkidle');
        await page.goto('/#/topic/what-is-parliament');
        await page.waitForLoadState('networkidle');

        // Sources should still be visible (level persisted)
        await expect(page.locator('.topic-page__sources')).toBeVisible();
    });
});
