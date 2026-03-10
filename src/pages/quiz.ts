import type { AudienceLevel, QuizEntry } from '../types/index';

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Render HTML for a multiple_choice quiz question.
 * Each question gets a data-question-index attribute for handler attachment.
 */
function renderMultipleChoiceQuestion(question: QuizEntry, index: number): string {
    const options = question.options ?? [];
    return `
        <div class="quiz-question quiz-question--multiple-choice" data-question-index="${index}" data-correct="${escapeHtml(question.correct_answer)}">
            <p class="quiz-question__text">${escapeHtml(question.question)}</p>
            <ul class="quiz-question__options" role="list">
                ${options
                    .map(
                        opt => `
                    <li>
                        <label class="quiz-option">
                            <input
                                type="radio"
                                name="quiz-q${index}"
                                value="${escapeHtml(opt)}"
                                aria-label="${escapeHtml(opt)}"
                            />
                            <span class="quiz-option__text">${escapeHtml(opt)}</span>
                        </label>
                    </li>
                `
                    )
                    .join('\n')}
            </ul>
            <button class="quiz-question__submit" type="button">Check answer</button>
            <div class="quiz-question__feedback" aria-live="polite" hidden></div>
        </div>
    `;
}

/**
 * Render the full quiz section for multiple_choice questions at a given level.
 * Returns an HTML string.
 */
export function renderMultipleChoiceQuiz(questions: QuizEntry[]): string {
    if (questions.length === 0) return '';
    return `
        <section class="topic-page__quiz" aria-label="Quiz">
            <h3>Quiz</h3>
            <div class="quiz-questions">
                ${questions.map((q, i) => renderMultipleChoiceQuestion(q, i)).join('\n')}
            </div>
        </section>
    `;
}

/**
 * Attach submit handlers to rendered multiple_choice questions inside a container.
 * Must be called after the HTML has been injected into the DOM.
 */
export function attachMultipleChoiceHandlers(container: HTMLElement): void {
    const questions = container.querySelectorAll<HTMLElement>('.quiz-question--multiple-choice');

    questions.forEach(questionEl => {
        const submitBtn = questionEl.querySelector<HTMLButtonElement>('.quiz-question__submit');
        if (!submitBtn) return;

        submitBtn.addEventListener('click', () => {
            const correct = questionEl.dataset['correct'] ?? '';
            const selected = questionEl.querySelector<HTMLInputElement>(
                'input[type="radio"]:checked'
            );

            const feedback = questionEl.querySelector<HTMLElement>('.quiz-question__feedback');
            if (!feedback) return;

            if (!selected) {
                feedback.textContent = 'Please select an answer.';
                feedback.hidden = false;
                feedback.className = 'quiz-question__feedback quiz-question__feedback--warning';
                return;
            }

            const isCorrect = selected.value === correct;

            // Mark all options
            const labels = questionEl.querySelectorAll<HTMLElement>('.quiz-option');
            labels.forEach(label => {
                const input = label.querySelector<HTMLInputElement>('input[type="radio"]');
                if (!input) return;
                if (input.value === correct) {
                    label.classList.add('quiz-option--correct');
                } else if (input.checked) {
                    label.classList.add('quiz-option--incorrect');
                }
                input.disabled = true;
            });

            feedback.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect.';
            feedback.hidden = false;
            feedback.className = `quiz-question__feedback ${
                isCorrect
                    ? 'quiz-question__feedback--correct'
                    : 'quiz-question__feedback--incorrect'
            }`;

            submitBtn.disabled = true;
        });
    });
}

/**
 * Get multiple_choice questions from a topic's quizzes for a given level.
 */
export function getMultipleChoiceQuestions(
    quizzes: Partial<Record<AudienceLevel, QuizEntry[]>> | undefined,
    level: AudienceLevel
): QuizEntry[] {
    const levelQuizzes = quizzes?.[level] ?? [];
    return levelQuizzes.filter(q => q.type === 'multiple_choice');
}

/**
 * Render HTML for a true_false quiz question.
 */
function renderTrueFalseQuestion(question: QuizEntry, index: number): string {
    return `
        <div class="quiz-question quiz-question--true-false" data-question-index="${index}" data-correct="${escapeHtml(question.correct_answer)}">
            <p class="quiz-question__text">${escapeHtml(question.question)}</p>
            <div class="quiz-question__options quiz-question__options--true-false" role="group" aria-label="True or false">
                <button class="quiz-option quiz-option--tf" type="button" data-value="True" aria-label="True">True</button>
                <button class="quiz-option quiz-option--tf" type="button" data-value="False" aria-label="False">False</button>
            </div>
            <div class="quiz-question__feedback" aria-live="polite" hidden></div>
        </div>
    `;
}

/**
 * Render the full quiz section for true_false questions.
 * Returns an HTML string.
 */
export function renderTrueFalseQuiz(questions: QuizEntry[]): string {
    if (questions.length === 0) return '';
    return `
        <section class="topic-page__quiz topic-page__quiz--true-false" aria-label="True or False Quiz">
            <h3>True or False</h3>
            <div class="quiz-questions">
                ${questions.map((q, i) => renderTrueFalseQuestion(q, i)).join('\n')}
            </div>
        </section>
    `;
}

/**
 * Attach click handlers to rendered true_false questions inside a container.
 * Must be called after the HTML has been injected into the DOM.
 */
export function attachTrueFalseHandlers(container: HTMLElement): void {
    const questions = container.querySelectorAll<HTMLElement>('.quiz-question--true-false');

    questions.forEach(questionEl => {
        const correct = questionEl.dataset['correct'] ?? '';
        const optionBtns = questionEl.querySelectorAll<HTMLButtonElement>('.quiz-option--tf');
        const feedback = questionEl.querySelector<HTMLElement>('.quiz-question__feedback');

        optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selected = btn.dataset['value'] ?? '';
                const isCorrect = selected === correct;

                // Mark buttons correct/incorrect
                optionBtns.forEach(b => {
                    if (b.dataset['value'] === correct) {
                        b.classList.add('quiz-option--correct');
                    } else if (b === btn) {
                        b.classList.add('quiz-option--incorrect');
                    }
                    b.disabled = true;
                });

                if (feedback) {
                    feedback.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect.';
                    feedback.hidden = false;
                    feedback.className = `quiz-question__feedback ${
                        isCorrect
                            ? 'quiz-question__feedback--correct'
                            : 'quiz-question__feedback--incorrect'
                    }`;
                }
            });
        });
    });
}

/**
 * Get true_false questions from a topic's quizzes for a given level.
 */
export function getTrueFalseQuestions(
    quizzes: Partial<Record<AudienceLevel, QuizEntry[]>> | undefined,
    level: AudienceLevel
): QuizEntry[] {
    const levelQuizzes = quizzes?.[level] ?? [];
    return levelQuizzes.filter(q => q.type === 'true_false');
}
