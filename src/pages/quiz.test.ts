import { describe, it, expect, beforeEach } from 'vitest';
import type { QuizEntry } from '../types/index';
import {
    renderMultipleChoiceQuiz,
    attachMultipleChoiceHandlers,
    getMultipleChoiceQuestions,
    renderTrueFalseQuiz,
    attachTrueFalseHandlers,
    getTrueFalseQuestions,
} from './quiz';

const mcQuestion: QuizEntry = {
    question: 'What is Parliament?',
    type: 'multiple_choice',
    options: ['A legislative body', 'A type of cake', 'A football club'],
    correct_answer: 'A legislative body',
    explanation: 'Parliament is the supreme legislative body of the UK.',
};

const mcQuestion2: QuizEntry = {
    question: 'How many houses does Parliament have?',
    type: 'multiple_choice',
    options: ['Two', 'Three', 'One'],
    correct_answer: 'Two',
    explanation: 'Parliament has two houses: Commons and Lords.',
};

const tfQuestion: QuizEntry = {
    question: 'True or false: Parliament is in London.',
    type: 'true_false',
    correct_answer: 'True',
    explanation: 'Parliament sits at the Palace of Westminster in London.',
};

const tfQuestion2: QuizEntry = {
    question: 'True or false: The House of Lords is elected.',
    type: 'true_false',
    correct_answer: 'False',
    explanation: 'The House of Lords is not elected — members are appointed.',
};

describe('getTrueFalseQuestions', () => {
    it('returns true_false questions for the given level', () => {
        const quizzes = { adult: [mcQuestion, tfQuestion] };
        const result = getTrueFalseQuestions(quizzes, 'adult');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(tfQuestion);
    });

    it('returns empty array when quizzes is undefined', () => {
        expect(getTrueFalseQuestions(undefined, 'adult')).toEqual([]);
    });

    it('returns empty array when level has no quizzes', () => {
        const quizzes = { adult: [tfQuestion] };
        expect(getTrueFalseQuestions(quizzes, 'child')).toEqual([]);
    });

    it('returns empty array when level has no true_false questions', () => {
        const quizzes = { adult: [mcQuestion] };
        expect(getTrueFalseQuestions(quizzes, 'adult')).toEqual([]);
    });

    it('returns multiple true_false questions', () => {
        const quizzes = { adult: [tfQuestion, tfQuestion2] };
        expect(getTrueFalseQuestions(quizzes, 'adult')).toHaveLength(2);
    });
});

describe('renderTrueFalseQuiz', () => {
    it('returns empty string when no questions', () => {
        expect(renderTrueFalseQuiz([])).toBe('');
    });

    it('renders quiz section with heading', () => {
        const html = renderTrueFalseQuiz([tfQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.topic-page__quiz--true-false')).not.toBeNull();
        expect(div.querySelector('h3')!.textContent).toContain('True or False');
    });

    it('renders question text', () => {
        const html = renderTrueFalseQuiz([tfQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.quiz-question__text')!.textContent).toContain(
            'True or false: Parliament is in London.'
        );
    });

    it('renders True and False buttons', () => {
        const html = renderTrueFalseQuiz([tfQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const btns = div.querySelectorAll<HTMLButtonElement>('.quiz-option--tf');
        expect(btns).toHaveLength(2);
        const values = Array.from(btns).map(b => b.dataset['value']);
        expect(values).toContain('True');
        expect(values).toContain('False');
    });

    it('renders hidden feedback element', () => {
        const html = renderTrueFalseQuiz([tfQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const feedback = div.querySelector('.quiz-question__feedback') as HTMLElement;
        expect(feedback).not.toBeNull();
        expect(feedback.hidden).toBe(true);
    });

    it('renders multiple questions', () => {
        const html = renderTrueFalseQuiz([tfQuestion, tfQuestion2]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelectorAll('.quiz-question--true-false')).toHaveLength(2);
    });

    it('escapes HTML in question text', () => {
        const xssQ: QuizEntry = { ...tfQuestion, question: '<script>alert("xss")</script>' };
        const html = renderTrueFalseQuiz([xssQ]);
        expect(html).not.toContain('<script>');
    });

    it('has aria-label on quiz section', () => {
        const html = renderTrueFalseQuiz([tfQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const section = div.querySelector('.topic-page__quiz--true-false');
        expect(section!.getAttribute('aria-label')).toBe('True or False Quiz');
    });
});

describe('attachTrueFalseHandlers', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = renderTrueFalseQuiz([tfQuestion, tfQuestion2]);
        attachTrueFalseHandlers(container);
    });

    it('shows correct feedback when correct button clicked (True)', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--true-false')!;
        const trueBtn = Array.from(q.querySelectorAll<HTMLButtonElement>('.quiz-option--tf')).find(
            b => b.dataset['value'] === 'True'
        )!;
        trueBtn.click();
        const feedback = q.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain('Correct');
        expect(feedback.classList.contains('quiz-question__feedback--correct')).toBe(true);
    });

    it('shows incorrect feedback when wrong button clicked', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--true-false')!;
        const falseBtn = Array.from(q.querySelectorAll<HTMLButtonElement>('.quiz-option--tf')).find(
            b => b.dataset['value'] === 'False'
        )!;
        falseBtn.click();
        const feedback = q.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain('Incorrect');
        expect(feedback.classList.contains('quiz-question__feedback--incorrect')).toBe(true);
    });

    it('marks correct option with correct class after submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--true-false')!;
        const falseBtn = Array.from(q.querySelectorAll<HTMLButtonElement>('.quiz-option--tf')).find(
            b => b.dataset['value'] === 'False'
        )!;
        falseBtn.click();
        const trueBtn = Array.from(q.querySelectorAll<HTMLButtonElement>('.quiz-option--tf')).find(
            b => b.dataset['value'] === 'True'
        )!;
        expect(trueBtn.classList.contains('quiz-option--correct')).toBe(true);
    });

    it('marks selected wrong button with incorrect class after submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--true-false')!;
        const falseBtn = Array.from(q.querySelectorAll<HTMLButtonElement>('.quiz-option--tf')).find(
            b => b.dataset['value'] === 'False'
        )!;
        falseBtn.click();
        expect(falseBtn.classList.contains('quiz-option--incorrect')).toBe(true);
    });

    it('disables all buttons after submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--true-false')!;
        const btns = q.querySelectorAll<HTMLButtonElement>('.quiz-option--tf');
        btns[0]!.click();
        btns.forEach(b => expect(b.disabled).toBe(true));
    });

    it('handles multiple independent questions', () => {
        const questions = container.querySelectorAll<HTMLElement>('.quiz-question--true-false');
        expect(questions).toHaveLength(2);

        // Answer first question
        const q1 = questions[0]!;
        Array.from(q1.querySelectorAll<HTMLButtonElement>('.quiz-option--tf'))
            .find(b => b.dataset['value'] === 'True')!
            .click();
        expect(q1.querySelector<HTMLElement>('.quiz-question__feedback')!.textContent).toContain(
            'Correct'
        );

        // Second question unaffected
        const q2 = questions[1]!;
        expect(q2.querySelector<HTMLElement>('.quiz-question__feedback')!.hidden).toBe(true);
    });

    it('handles correct answer False correctly', () => {
        const questions = container.querySelectorAll<HTMLElement>('.quiz-question--true-false');
        const q2 = questions[1]!; // correct_answer: 'False'
        const falseBtn = Array.from(
            q2.querySelectorAll<HTMLButtonElement>('.quiz-option--tf')
        ).find(b => b.dataset['value'] === 'False')!;
        falseBtn.click();
        const feedback = q2.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.textContent).toContain('Correct');
    });
});

describe('getMultipleChoiceQuestions', () => {
    it('returns multiple_choice questions for the given level', () => {
        const quizzes = {
            adult: [mcQuestion, tfQuestion],
        };
        const result = getMultipleChoiceQuestions(quizzes, 'adult');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(mcQuestion);
    });

    it('returns empty array when quizzes is undefined', () => {
        expect(getMultipleChoiceQuestions(undefined, 'adult')).toEqual([]);
    });

    it('returns empty array when level has no quizzes', () => {
        const quizzes = { adult: [mcQuestion] };
        expect(getMultipleChoiceQuestions(quizzes, 'child')).toEqual([]);
    });

    it('returns empty array when level has no multiple_choice questions', () => {
        const quizzes = { adult: [tfQuestion] };
        expect(getMultipleChoiceQuestions(quizzes, 'adult')).toEqual([]);
    });

    it('returns multiple questions when all are multiple_choice', () => {
        const quizzes = { adult: [mcQuestion, mcQuestion2] };
        const result = getMultipleChoiceQuestions(quizzes, 'adult');
        expect(result).toHaveLength(2);
    });
});

describe('renderMultipleChoiceQuiz', () => {
    it('returns empty string when no questions', () => {
        expect(renderMultipleChoiceQuiz([])).toBe('');
    });

    it('renders quiz section with heading', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.topic-page__quiz')).not.toBeNull();
        expect(div.querySelector('h3')!.textContent).toContain('Quiz');
    });

    it('renders question text', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.quiz-question__text')!.textContent).toContain(
            'What is Parliament?'
        );
    });

    it('renders all options as radio inputs', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const radios = div.querySelectorAll('input[type="radio"]');
        expect(radios).toHaveLength(3);
    });

    it('renders option text', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const optionTexts = div.querySelectorAll('.quiz-option__text');
        const texts = Array.from(optionTexts).map(el => el.textContent);
        expect(texts).toContain('A legislative body');
        expect(texts).toContain('A type of cake');
        expect(texts).toContain('A football club');
    });

    it('renders submit button', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.quiz-question__submit')).not.toBeNull();
    });

    it('renders hidden feedback element', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const feedback = div.querySelector('.quiz-question__feedback') as HTMLElement;
        expect(feedback).not.toBeNull();
        expect(feedback.hidden).toBe(true);
    });

    it('renders multiple questions', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion, mcQuestion2]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelectorAll('.quiz-question--multiple-choice')).toHaveLength(2);
    });

    it('escapes HTML in question text', () => {
        const xssQuestion: QuizEntry = {
            ...mcQuestion,
            question: '<script>alert("xss")</script>',
        };
        const html = renderMultipleChoiceQuiz([xssQuestion]);
        expect(html).not.toContain('<script>');
    });

    it('escapes HTML in options', () => {
        const xssQuestion: QuizEntry = {
            ...mcQuestion,
            options: ['<b>bold</b>', 'normal'],
        };
        const html = renderMultipleChoiceQuiz([xssQuestion]);
        expect(html).not.toContain('<b>');
    });

    it('has aria-label on quiz section', () => {
        const html = renderMultipleChoiceQuiz([mcQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const section = div.querySelector('.topic-page__quiz');
        expect(section!.getAttribute('aria-label')).toBe('Quiz');
    });
});

describe('attachMultipleChoiceHandlers', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = renderMultipleChoiceQuiz([mcQuestion, mcQuestion2]);
        attachMultipleChoiceHandlers(container);
    });

    it('shows warning when submit clicked with no selection', () => {
        const submitBtn = container.querySelector<HTMLButtonElement>('.quiz-question__submit')!;
        submitBtn.click();
        const feedback = container.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain('Please select an answer');
    });

    it('shows correct feedback when correct option selected', () => {
        const firstQuestion = container.querySelector<HTMLElement>(
            '.quiz-question--multiple-choice'
        )!;
        const radios = firstQuestion.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        // Select the correct answer
        radios.forEach(r => {
            if (r.value === 'A legislative body') r.checked = true;
        });
        firstQuestion.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const feedback = firstQuestion.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain('Correct');
        expect(feedback.classList.contains('quiz-question__feedback--correct')).toBe(true);
    });

    it('shows incorrect feedback when wrong option selected', () => {
        const firstQuestion = container.querySelector<HTMLElement>(
            '.quiz-question--multiple-choice'
        )!;
        const radios = firstQuestion.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        // Select a wrong answer
        radios.forEach(r => {
            if (r.value === 'A type of cake') r.checked = true;
        });
        firstQuestion.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const feedback = firstQuestion.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain('Incorrect');
        expect(feedback.classList.contains('quiz-question__feedback--incorrect')).toBe(true);
    });

    it('marks correct option with correct class after submit', () => {
        const firstQuestion = container.querySelector<HTMLElement>(
            '.quiz-question--multiple-choice'
        )!;
        const radios = firstQuestion.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios.forEach(r => {
            if (r.value === 'A type of cake') r.checked = true;
        });
        firstQuestion.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();

        const correctLabel = Array.from(
            firstQuestion.querySelectorAll<HTMLElement>('.quiz-option')
        ).find(label => {
            const input = label.querySelector<HTMLInputElement>('input');
            return input?.value === 'A legislative body';
        });
        expect(correctLabel!.classList.contains('quiz-option--correct')).toBe(true);
    });

    it('marks selected wrong option with incorrect class after submit', () => {
        const firstQuestion = container.querySelector<HTMLElement>(
            '.quiz-question--multiple-choice'
        )!;
        const radios = firstQuestion.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios.forEach(r => {
            if (r.value === 'A type of cake') r.checked = true;
        });
        firstQuestion.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();

        const wrongLabel = Array.from(
            firstQuestion.querySelectorAll<HTMLElement>('.quiz-option')
        ).find(label => {
            const input = label.querySelector<HTMLInputElement>('input');
            return input?.value === 'A type of cake';
        });
        expect(wrongLabel!.classList.contains('quiz-option--incorrect')).toBe(true);
    });

    it('disables all inputs after submit', () => {
        const firstQuestion = container.querySelector<HTMLElement>(
            '.quiz-question--multiple-choice'
        )!;
        const radios = firstQuestion.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios.forEach(r => {
            if (r.value === 'A legislative body') r.checked = true;
        });
        firstQuestion.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();

        radios.forEach(r => expect(r.disabled).toBe(true));
    });

    it('disables submit button after submit', () => {
        const firstQuestion = container.querySelector<HTMLElement>(
            '.quiz-question--multiple-choice'
        )!;
        const radios = firstQuestion.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios.forEach(r => {
            if (r.value === 'A legislative body') r.checked = true;
        });
        const submitBtn = firstQuestion.querySelector<HTMLButtonElement>('.quiz-question__submit')!;
        submitBtn.click();
        expect(submitBtn.disabled).toBe(true);
    });

    it('handles multiple independent questions', () => {
        const questions = container.querySelectorAll<HTMLElement>(
            '.quiz-question--multiple-choice'
        );
        expect(questions).toHaveLength(2);

        // Answer first question correctly
        const q1 = questions[0]!;
        q1.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(r => {
            if (r.value === 'A legislative body') r.checked = true;
        });
        q1.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        expect(q1.querySelector<HTMLElement>('.quiz-question__feedback')!.textContent).toContain(
            'Correct'
        );

        // Second question unaffected
        const q2 = questions[1]!;
        const q2Feedback = q2.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(q2Feedback.hidden).toBe(true);
    });
});
