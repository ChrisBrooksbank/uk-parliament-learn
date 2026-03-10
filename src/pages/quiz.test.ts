import { describe, it, expect, beforeEach } from 'vitest';
import type { QuizEntry } from '../types/index';
import {
    renderMultipleChoiceQuiz,
    attachMultipleChoiceHandlers,
    getMultipleChoiceQuestions,
    renderTrueFalseQuiz,
    attachTrueFalseHandlers,
    getTrueFalseQuestions,
    renderShortAnswerQuiz,
    attachShortAnswerHandlers,
    getShortAnswerQuestions,
    renderEssayQuiz,
    attachEssayHandlers,
    getEssayQuestions,
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

const saQuestion: QuizEntry = {
    question: 'What is the role of the Speaker in the House of Commons?',
    type: 'short_answer',
    correct_answer: 'The Speaker chairs debates and maintains order in the House of Commons.',
    explanation: 'The Speaker is an elected MP who presides over debates.',
};

const saQuestion2: QuizEntry = {
    question: 'Name one power of the House of Lords.',
    type: 'short_answer',
    correct_answer: 'The Lords can delay legislation by up to one year.',
    explanation: 'The House of Lords acts as a revising chamber.',
};

const essayQuestion: QuizEntry = {
    question: 'Discuss the role of Parliament in a democratic society.',
    type: 'essay',
    correct_answer: '',
    explanation:
        'Consider how Parliament makes laws, scrutinises the government, and represents citizens.',
};

const essayQuestion2: QuizEntry = {
    question: 'How does the House of Lords complement the House of Commons?',
    type: 'essay',
    correct_answer: '',
    explanation:
        'Think about revision of legislation, expertise, and the checks and balances involved.',
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

describe('getShortAnswerQuestions', () => {
    it('returns short_answer questions for the given level', () => {
        const quizzes = { adult: [mcQuestion, saQuestion] };
        const result = getShortAnswerQuestions(quizzes, 'adult');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(saQuestion);
    });

    it('returns empty array when quizzes is undefined', () => {
        expect(getShortAnswerQuestions(undefined, 'adult')).toEqual([]);
    });

    it('returns empty array when level has no quizzes', () => {
        const quizzes = { adult: [saQuestion] };
        expect(getShortAnswerQuestions(quizzes, 'child')).toEqual([]);
    });

    it('returns empty array when level has no short_answer questions', () => {
        const quizzes = { adult: [mcQuestion] };
        expect(getShortAnswerQuestions(quizzes, 'adult')).toEqual([]);
    });

    it('returns multiple short_answer questions', () => {
        const quizzes = { adult: [saQuestion, saQuestion2] };
        expect(getShortAnswerQuestions(quizzes, 'adult')).toHaveLength(2);
    });
});

describe('renderShortAnswerQuiz', () => {
    it('returns empty string when no questions', () => {
        expect(renderShortAnswerQuiz([])).toBe('');
    });

    it('renders quiz section with heading', () => {
        const html = renderShortAnswerQuiz([saQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.topic-page__quiz--short-answer')).not.toBeNull();
        expect(div.querySelector('h3')!.textContent).toContain('Short Answer');
    });

    it('renders question text', () => {
        const html = renderShortAnswerQuiz([saQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.quiz-question__text')!.textContent).toContain(
            'What is the role of the Speaker'
        );
    });

    it('renders a textarea input', () => {
        const html = renderShortAnswerQuiz([saQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('textarea.quiz-question__textarea')).not.toBeNull();
    });

    it('renders a submit button', () => {
        const html = renderShortAnswerQuiz([saQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.quiz-question__submit')).not.toBeNull();
    });

    it('renders hidden feedback element', () => {
        const html = renderShortAnswerQuiz([saQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const feedback = div.querySelector('.quiz-question__feedback') as HTMLElement;
        expect(feedback).not.toBeNull();
        expect(feedback.hidden).toBe(true);
    });

    it('renders multiple questions', () => {
        const html = renderShortAnswerQuiz([saQuestion, saQuestion2]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelectorAll('.quiz-question--short-answer')).toHaveLength(2);
    });

    it('escapes HTML in question text', () => {
        const xssQ: QuizEntry = { ...saQuestion, question: '<script>alert("xss")</script>' };
        const html = renderShortAnswerQuiz([xssQ]);
        expect(html).not.toContain('<script>');
    });

    it('escapes HTML in model answer stored in data attribute', () => {
        const xssQ: QuizEntry = { ...saQuestion, correct_answer: '<script>bad</script>' };
        const html = renderShortAnswerQuiz([xssQ]);
        expect(html).not.toContain('<script>');
    });

    it('has aria-label on quiz section', () => {
        const html = renderShortAnswerQuiz([saQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const section = div.querySelector('.topic-page__quiz--short-answer');
        expect(section!.getAttribute('aria-label')).toBe('Short Answer Quiz');
    });
});

describe('attachShortAnswerHandlers', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = renderShortAnswerQuiz([saQuestion, saQuestion2]);
        attachShortAnswerHandlers(container);
    });

    it('reveals model answer in feedback on submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--short-answer')!;
        q.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const feedback = q.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain(
            'The Speaker chairs debates and maintains order in the House of Commons.'
        );
    });

    it('shows feedback with reveal class', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--short-answer')!;
        q.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const feedback = q.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.classList.contains('quiz-question__feedback--reveal')).toBe(true);
    });

    it('disables textarea after submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--short-answer')!;
        q.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const textarea = q.querySelector<HTMLTextAreaElement>('.quiz-question__textarea')!;
        expect(textarea.disabled).toBe(true);
    });

    it('disables submit button after submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--short-answer')!;
        const btn = q.querySelector<HTMLButtonElement>('.quiz-question__submit')!;
        btn.click();
        expect(btn.disabled).toBe(true);
    });

    it('handles multiple independent questions', () => {
        const questions = container.querySelectorAll<HTMLElement>('.quiz-question--short-answer');
        expect(questions).toHaveLength(2);

        questions[0]!.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        expect(questions[0]!.querySelector<HTMLElement>('.quiz-question__feedback')!.hidden).toBe(
            false
        );

        // Second question unaffected
        expect(questions[1]!.querySelector<HTMLElement>('.quiz-question__feedback')!.hidden).toBe(
            true
        );
    });
});

describe('getEssayQuestions', () => {
    it('returns essay questions for the given level', () => {
        const quizzes = { adult: [mcQuestion, essayQuestion] };
        const result = getEssayQuestions(quizzes, 'adult');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(essayQuestion);
    });

    it('returns empty array when quizzes is undefined', () => {
        expect(getEssayQuestions(undefined, 'adult')).toEqual([]);
    });

    it('returns empty array when level has no quizzes', () => {
        const quizzes = { adult: [essayQuestion] };
        expect(getEssayQuestions(quizzes, 'child')).toEqual([]);
    });

    it('returns empty array when level has no essay questions', () => {
        const quizzes = { adult: [mcQuestion] };
        expect(getEssayQuestions(quizzes, 'adult')).toEqual([]);
    });

    it('returns multiple essay questions', () => {
        const quizzes = { adult: [essayQuestion, essayQuestion2] };
        expect(getEssayQuestions(quizzes, 'adult')).toHaveLength(2);
    });
});

describe('renderEssayQuiz', () => {
    it('returns empty string when no questions', () => {
        expect(renderEssayQuiz([])).toBe('');
    });

    it('renders quiz section with heading', () => {
        const html = renderEssayQuiz([essayQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.topic-page__quiz--essay')).not.toBeNull();
        expect(div.querySelector('h3')!.textContent).toContain('Essay');
    });

    it('renders question text', () => {
        const html = renderEssayQuiz([essayQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('.quiz-question__text')!.textContent).toContain(
            'Discuss the role of Parliament'
        );
    });

    it('renders a textarea input', () => {
        const html = renderEssayQuiz([essayQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelector('textarea.quiz-question__textarea')).not.toBeNull();
    });

    it('renders a show guidance button', () => {
        const html = renderEssayQuiz([essayQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const btn = div.querySelector<HTMLButtonElement>('.quiz-question__submit');
        expect(btn).not.toBeNull();
        expect(btn!.textContent).toContain('guidance');
    });

    it('renders hidden feedback element', () => {
        const html = renderEssayQuiz([essayQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const feedback = div.querySelector('.quiz-question__feedback') as HTMLElement;
        expect(feedback).not.toBeNull();
        expect(feedback.hidden).toBe(true);
    });

    it('renders multiple questions', () => {
        const html = renderEssayQuiz([essayQuestion, essayQuestion2]);
        const div = document.createElement('div');
        div.innerHTML = html;
        expect(div.querySelectorAll('.quiz-question--essay')).toHaveLength(2);
    });

    it('escapes HTML in question text', () => {
        const xssQ: QuizEntry = { ...essayQuestion, question: '<script>alert("xss")</script>' };
        const html = renderEssayQuiz([xssQ]);
        expect(html).not.toContain('<script>');
    });

    it('escapes HTML in guidance stored in data attribute', () => {
        const xssQ: QuizEntry = { ...essayQuestion, explanation: '<script>bad</script>' };
        const html = renderEssayQuiz([xssQ]);
        expect(html).not.toContain('<script>');
    });

    it('has aria-label on quiz section', () => {
        const html = renderEssayQuiz([essayQuestion]);
        const div = document.createElement('div');
        div.innerHTML = html;
        const section = div.querySelector('.topic-page__quiz--essay');
        expect(section!.getAttribute('aria-label')).toBe('Essay Quiz');
    });
});

describe('attachEssayHandlers', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.innerHTML = renderEssayQuiz([essayQuestion, essayQuestion2]);
        attachEssayHandlers(container);
    });

    it('reveals guidance in feedback on submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--essay')!;
        q.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const feedback = q.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toContain(
            'Consider how Parliament makes laws, scrutinises the government'
        );
    });

    it('shows feedback with reveal class', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--essay')!;
        q.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const feedback = q.querySelector<HTMLElement>('.quiz-question__feedback')!;
        expect(feedback.classList.contains('quiz-question__feedback--reveal')).toBe(true);
    });

    it('disables submit button after submit', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--essay')!;
        const btn = q.querySelector<HTMLButtonElement>('.quiz-question__submit')!;
        btn.click();
        expect(btn.disabled).toBe(true);
    });

    it('textarea remains enabled after submit (essay allows continued writing)', () => {
        const q = container.querySelector<HTMLElement>('.quiz-question--essay')!;
        q.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        const textarea = q.querySelector<HTMLTextAreaElement>('.quiz-question__textarea')!;
        expect(textarea.disabled).toBe(false);
    });

    it('handles multiple independent questions', () => {
        const questions = container.querySelectorAll<HTMLElement>('.quiz-question--essay');
        expect(questions).toHaveLength(2);

        questions[0]!.querySelector<HTMLButtonElement>('.quiz-question__submit')!.click();
        expect(questions[0]!.querySelector<HTMLElement>('.quiz-question__feedback')!.hidden).toBe(
            false
        );

        // Second question unaffected
        expect(questions[1]!.querySelector<HTMLElement>('.quiz-question__feedback')!.hidden).toBe(
            true
        );
    });
});
