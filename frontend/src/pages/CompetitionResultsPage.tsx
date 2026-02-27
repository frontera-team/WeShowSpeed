import { useLocation, useNavigate } from 'react-router-dom';
import { useCompetition } from '../contexts/CompetitionContext';
import { useLocale } from '../i18n';

interface ResultRow {
  name: string;
  result: { wpm: number; accuracy: number };
}

export function CompetitionResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results: ctxResults, reset } = useCompetition();
  const { t } = useLocale();
  const stateResults = (location.state as { results?: ResultRow[] } | null)
    ?.results;
  const results = stateResults ?? ctxResults ?? [];

  if (results.length === 0) {
    navigate('/competition', { replace: true });
    return null;
  }

  const sorted = [...results].sort(
    (a, b) => (b.result?.wpm ?? 0) - (a.result?.wpm ?? 0),
  );
  const winner = sorted[0];

  return (
    <section className='competition-results'>
      <h2 className='competition-results__title'>{t('compResults.title')}</h2>
      <div className='competition-results__table-wrap'>
        <table className='competition-results__table'>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('compResults.name')}</th>
              <th>WPM</th>
              <th>{t('compResults.accuracy')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={i}
                className={
                  i === 0
                    ? 'competition-results__row competition-results__row--winner'
                    : 'competition-results__row'
                }
              >
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>{row.result?.wpm ?? '—'}</td>
                <td>{row.result?.accuracy ?? '—'}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='competition-results__winner'>{winner?.name} {t('compResults.wins')}</p>
      <button
        type='button'
        className='competition-results__btn'
        onClick={() => {
          reset();
          navigate('/competition');
        }}
      >
        {t('compResults.playAgain')}
      </button>
    </section>
  );
}
