import type { TypingResult } from '../types';
import { LANGUAGES } from '../data/languages';
import { useLocale } from '../i18n';

interface ResultsProps {
  result: TypingResult;
  onRestart: () => void;
}

export function Results({ result, onRestart }: ResultsProps) {
  const lang = LANGUAGES.find((l) => l.id === result.languageId);
  const { t } = useLocale();

  return (
    <section className='results'>
      <h2 className='results__title'>{t('results.title')}</h2>
      <div className='results__stats'>
        <div className='results__stat'>
          <span className='results__value'>{result.wpm}</span>
          <span className='results__label'>{t('results.wpm')}</span>
        </div>
        <div className='results__stat'>
          <span className='results__value'>{result.accuracy}%</span>
          <span className='results__label'>{t('results.accuracy')}</span>
        </div>
        <div className='results__stat results__stat--meta'>
          <span className='results__value'>
            {result.correctChars}/{result.totalChars}
          </span>
          <span className='results__label'>{t('results.chars')}</span>
        </div>
        <div className='results__stat results__stat--meta'>
          <span className='results__value'>{result.timeSeconds}s</span>
          <span className='results__label'>{t('results.time')}</span>
        </div>
        <div className='results__stat results__stat--meta'>
          <span className='results__value'>{result.durationSec ?? '—'}s</span>
          <span className='results__label'>{t('results.duration')}</span>
        </div>
      </div>
      {lang && (
        <p className='results__lang'>
          {lang.flag} {lang.name}
        </p>
      )}
      <button type='button' className='results__again' onClick={onRestart}>
        {t('results.tryAgain')}
      </button>
    </section>
  );
}
