import { useLocation, useNavigate } from 'react-router-dom';
import { TypingTest } from '../components/TypingTest';
import { useCompetition } from '../contexts/CompetitionContext';
import { useLocale } from '../i18n';

export function CompetitionTestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startData, submitResult } = useCompetition();
  const { t } = useLocale();
  const state = location.state as {
    text?: string;
    durationSec?: number;
    languageId?: string;
  } | null;
  const text = state?.text ?? startData?.text ?? '';
  const durationSec = state?.durationSec ?? startData?.durationSec ?? 60;
  const languageId = (state?.languageId ?? startData?.languageId ?? 'en') as
    | 'en'
    | 'ru'
    | 'de'
    | 'es'
    | 'fr'
    | 'uk'
    | 'ar'
    | 'it'
    | 'pt';

  if (!text) {
    navigate('/competition', { replace: true });
    return null;
  }

  const handleFinish = (result: {
    wpm: number;
    accuracy: number;
    correctChars: number;
    totalChars: number;
    timeSeconds: number;
  }) => {
    submitResult(result);
  };

  return (
    <section className='competition-test'>
      <p className='competition-test__label'>
        {t('compTest.label')}
      </p>
      <TypingTest
        languageId={languageId}
        durationSec={durationSec}
        onFinish={handleFinish}
        initialText={text}
      />
      <p className='competition-test__wait'>
        {t('compTest.wait')}
      </p>
    </section>
  );
}
