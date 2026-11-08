'use client';

import { useId, useState } from 'react';
import type { BlogQuizBlock } from '@banovit/api-client';
import { cx, faDigits, IconCheck, IconClose } from '@banovit/ui';

/** «آزمون چهارگزینه‌ای» from the old site: graded in the browser, nothing is sent anywhere. */
export function QuizBlock({ block }: { block: BlogQuizBlock }) {
  const { title, subtitle, button, result, incomplete, questions } = block.props;
  const id = useId();
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const [warn, setWarn] = useState(false);
  const correct = answers.filter((a, i) => a === questions[i]?.correct).length;

  return (
    <section className="my-8 rounded-lg bg-surface p-4 shadow-xs ring-1 ring-border sm:p-5" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="text-lg font-bold text-text">
        {title}
      </h2>
      {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
      <ol className="mt-4 space-y-5">
        {questions.map((q, qi) => (
          <li key={qi}>
            <fieldset>
              <legend className="mb-2 text-sm font-bold leading-7 text-text">
                {faDigits(qi + 1)}. {q.question}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const picked = answers[qi] === oi;
                  const state = checked ? (oi === q.correct ? 'right' : picked ? 'wrong' : null) : null;
                  return (
                    <label
                      key={oi}
                      className={cx(
                        'flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors focus-within:outline-2 focus-within:outline-focus',
                        state === 'right' && 'border-success bg-success-subtle text-success-on-subtle',
                        state === 'wrong' && 'border-danger bg-danger-subtle text-danger-on-subtle',
                        !state && (picked ? 'border-primary bg-primary-subtle text-primary-on-subtle' : 'border-border text-text hover:bg-surface-muted'),
                      )}
                    >
                      <input
                        type="radio"
                        name={`${id}-q${qi}`}
                        className="sr-only"
                        checked={picked}
                        disabled={checked}
                        onChange={() => {
                          setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
                          setWarn(false);
                        }}
                      />
                      <span className={cx('flex size-5 shrink-0 items-center justify-center rounded-full border', picked ? 'border-current' : 'border-border-strong')}>
                        {state === 'right' ? <IconCheck size={12} /> : state === 'wrong' ? <IconClose size={12} /> : picked ? <span className="size-2.5 rounded-full bg-current" /> : null}
                      </span>
                      {opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3" aria-live="polite">
        {!checked ? (
          <button
            type="button"
            className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-on hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => (answers.some((a) => a === null) ? setWarn(true) : setChecked(true))}
          >
            {button}
          </button>
        ) : (
          <p className="text-sm font-bold text-text">{faDigits(result.replace('{correct}', String(correct)).replace('{total}', String(questions.length)))}</p>
        )}
        {warn ? <p className="text-sm text-danger">{incomplete}</p> : null}
      </div>
    </section>
  );
}
