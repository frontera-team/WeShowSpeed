import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomWords } from '../data/texts';
import type { LanguageId } from '../types';
import type { TypingResult } from '../types';

interface TypingTestProps {
  languageId: LanguageId;
  durationSec: number;
  onFinish: (result: TypingResult) => void;
  initialText?: string;
}

export function TypingTest({
  languageId,
  durationSec,
  onFinish,
  initialText,
}: TypingTestProps) {
  const minWords = Math.ceil(80 * (durationSec / 60));
  const [text] = useState(() => initialText ?? getRandomWords(languageId, minWords));
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const finishedRef = useRef(false);

  const [userEnded, setUserEnded] = useState(false);
  const timeUp = startTime !== null && elapsed >= durationSec;
  const textCompleted = input.length > 0 && input.length >= text.length;
  const isFinished = timeUp || textCompleted || userEnded;

  const isRtl = languageId === 'ar';

  useEffect(() => {
    if (!input && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (startTime === null || isFinished) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(t);
  }, [startTime, isFinished]);

  useEffect(() => {
    if (!isFinished || finishedRef.current) return;
    finishedRef.current = true;
    const typed = input;
    const totalChars = typed.length;
    let correctChars = 0;
    const len = Math.min(typed.length, text.length);
    for (let i = 0; i < len; i++) {
      if (typed[i] === text[i]) correctChars++;
    }
    const actualTimeSec = Math.max(1, elapsed);
    const wpm =
      totalChars > 0
        ? Math.round((correctChars / 5) * (60 / actualTimeSec))
        : 0;
    const accuracy =
      totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    onFinish({
      wpm,
      accuracy,
      correctChars,
      totalChars,
      timeSeconds: actualTimeSec,
      durationSec,
      languageId,
      timestamp: Date.now(),
    });
  }, [isFinished, input, text, languageId, elapsed, durationSec, onFinish]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (startTime === null && input.length === 0 && e.key.length === 1) {
        setStartTime(Date.now());
        setElapsed(0);
      }
    },
    [startTime, input.length],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isFinished) return;
      const value = e.target.value;
      if (value.length <= text.length) {
        setInput(value);
      }
    },
    [text.length, isFinished],
  );

  const remaining = Math.max(0, durationSec - Math.min(elapsed, durationSec));

  return (
    <section className='typing-test'>
      <div className='typing-test__timer' data-active={startTime !== null}>
        {remaining > 0 ? (
          <span className='typing-test__time'>{remaining}</span>
        ) : (
          <span className='typing-test__time typing-test__time--done'>0</span>
        )}
        <span className='typing-test__timer-label'>sec</span>
      </div>

      <div className='typing-test__prompt' dir={isRtl ? 'rtl' : 'ltr'}>
        {text.split('').map((char, i) => {
          const typedChar = input[i];
          const correct = typedChar === undefined ? null : typedChar === char;
          return (
            <span
              key={i}
              className={
                typedChar === undefined
                  ? 'char char--pending'
                  : correct
                    ? 'char char--correct'
                    : 'char char--wrong'
              }
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>

      <textarea
        ref={inputRef}
        className='typing-test__input'
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        placeholder='Start typing...'
        spellCheck={false}
        autoComplete='off'
        readOnly={isFinished}
        rows={3}
        dir={isRtl ? 'rtl' : 'ltr'}
      />

      {!startTime && (
        <p className='typing-test__hint'>Press any key to start the timer</p>
      )}
      {startTime && !isFinished && (
        <button
          type='button'
          className='typing-test__end-btn'
          onClick={() => setUserEnded(true)}
        >
          End test
        </button>
      )}
      {textCompleted && (
        <p className='typing-test__hint typing-test__hint--success'>
          Done! Well done.
        </p>
      )}
    </section>
  );
}
