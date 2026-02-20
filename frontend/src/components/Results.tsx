import type { TypingResult } from '../types';
import { LANGUAGES } from '../data/languages';

interface ResultsProps {
  result: TypingResult;
  onRestart: () => void;
}

export function Results({ result, onRestart }: ResultsProps) {
  const lang = LANGUAGES.find((l) => l.id === result.languageId);

  return (
    <section className='results'>
      <h2 className='results__title'>Result</h2>
      <div className='results__stats'>
        <div className='results__stat'>
          <span className='results__value'>{result.wpm}</span>
          <span className='results__label'>WPM</span>
        </div>
        <div className='results__stat'>
          <span className='results__value'>{result.accuracy}%</span>
          <span className='results__label'>accuracy</span>
        </div>
        <div className='results__stat results__stat--meta'>
          <span className='results__value'>
            {result.correctChars}/{result.totalChars}
          </span>
          <span className='results__label'>chars</span>
        </div>
        <div className='results__stat results__stat--meta'>
          <span className='results__value'>{result.timeSeconds}s</span>
          <span className='results__label'>time</span>
        </div>
        <div className='results__stat results__stat--meta'>
          <span className='results__value'>{result.durationSec ?? '—'}s</span>
          <span className='results__label'>duration</span>
        </div>
      </div>
      {lang && (
        <p className='results__lang'>
          {lang.flag} {lang.name}
        </p>
      )}
      <button type='button' className='results__again' onClick={onRestart}>
        Try again
      </button>
    </section>
  );
}
