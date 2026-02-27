import { useState, useEffect } from 'react';
import { useCompetition } from '../contexts/CompetitionContext';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLocale } from '../i18n';
import type { LanguageId } from '../types';

const DURATION_OPTIONS = [15, 30, 60, 90, 120, 180] as const;

export function CompetitionPage() {
  const {
    roomId,
    roomState,
    players,
    secondConfirmDeadline,
    countdownSec,
    createRoom,
    joinRoom,
    confirm,
    reset,
    error,
  } = useCompetition();

  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [languageId, setLanguageId] = useState<LanguageId>('en');
  const [durationSec, setDurationSec] = useState(60);
  const [joinCode, setJoinCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (secondConfirmDeadline == null) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((secondConfirmDeadline - Date.now()) / 1000),
      );
      setSecondsLeft(left);
    };
    tick();
    const t = setInterval(tick, 200);
    return () => clearInterval(t);
  }, [secondConfirmDeadline]);

  if (roomState === 'waiting' && roomId) {
    return (
      <section className='competition'>
        <h2 className='competition__title'>{t('comp.title')}</h2>
        <p className='competition__code'>
          {t('comp.roomCode')} <strong>{roomId}</strong>
        </p>
        <p className='competition__hint'>
          {t('comp.waitingHint')}
        </p>
        <ul className='competition__players'>
          {players.map((p, i) => (
            <li key={i} className='competition__player'>
              {p.name} {p.confirmed ? '✓' : ''}
            </li>
          ))}
        </ul>
        <button
          type='button'
          className='competition__btn competition__btn--secondary'
          onClick={reset}
        >
          {t('comp.cancel')}
        </button>
      </section>
    );
  }

  if (roomState === 'confirming' && roomId) {
    const allConfirmed =
      players.length >= 2 && players.every((p) => p.confirmed);
    return (
      <section className='competition'>
        <h2 className='competition__title'>{t('comp.confirmReady')}</h2>
        <ul className='competition__players'>
          {players.map((p, i) => (
            <li key={i} className='competition__player'>
              {p.name} {p.confirmed ? t('comp.ready') : '—'}
            </li>
          ))}
        </ul>
        {secondConfirmDeadline != null && !allConfirmed && (
          <p className='competition__timer'>
            {t('comp.opponentConfirm')}{' '}
            <strong>{secondsLeft ?? 30}s</strong>.
          </p>
        )}
        {!allConfirmed && (
          <button type='button' className='competition__btn' onClick={confirm}>
            {t('comp.imReady')}
          </button>
        )}
        {allConfirmed && (
          <p className='competition__hint'>{t('comp.bothReady')}</p>
        )}
      </section>
    );
  }

  if (roomState === 'countdown' && countdownSec != null) {
    return (
      <section className='competition'>
        <h2 className='competition__countdown'>
          {countdownSec > 0 ? countdownSec : t('comp.go')}
        </h2>
      </section>
    );
  }

  if (mode === 'create') {
    return (
      <section className='competition'>
        <h2 className='competition__title'>{t('comp.createTitle')}</h2>
        {error && <p className='competition__error'>{error}</p>}
        <label className='competition__label'>
          {t('comp.yourName')}
          <input
            type='text'
            className='competition__input'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('comp.placeholderName')}
          />
        </label>
        <LanguageSelect value={languageId} onChange={setLanguageId} />
        <div className='competition__duration'>
          <span className='competition__duration-label'>{t('comp.duration')}</span>
          <div className='competition__duration-options'>
            {DURATION_OPTIONS.map((sec) => (
              <button
                key={sec}
                type='button'
                className={`competition__duration-btn ${durationSec === sec ? 'competition__duration-btn--active' : ''}`}
                onClick={() => setDurationSec(sec)}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
        <button
          type='button'
          className='competition__btn'
          onClick={() => createRoom(name || 'Player', languageId, durationSec)}
          disabled={!name.trim()}
        >
          {t('comp.createRoom')}
        </button>
        <button
          type='button'
          className='competition__btn competition__btn--secondary'
          onClick={() => setMode('choose')}
        >
          {t('comp.back')}
        </button>
      </section>
    );
  }

  if (mode === 'join') {
    return (
      <section className='competition'>
        <h2 className='competition__title'>{t('comp.joinTitle')}</h2>
        {error && <p className='competition__error'>{error}</p>}
        <label className='competition__label'>
          {t('comp.yourName')}
          <input
            type='text'
            className='competition__input'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('comp.placeholderName')}
          />
        </label>
        <label className='competition__label'>
          {t('comp.roomCodeLabel')}
          <input
            type='text'
            className='competition__input competition__input--code'
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={t('comp.placeholderCode')}
            maxLength={6}
          />
        </label>
        <button
          type='button'
          className='competition__btn'
          onClick={() => joinRoom(joinCode.trim(), name || 'Player')}
          disabled={!name.trim() || joinCode.trim().length < 4}
        >
          {t('comp.join')}
        </button>
        <button
          type='button'
          className='competition__btn competition__btn--secondary'
          onClick={() => setMode('choose')}
        >
          {t('comp.back')}
        </button>
      </section>
    );
  }

  return (
    <section className='competition'>
      <h2 className='competition__title'>{t('comp.playVs')}</h2>
      <p className='competition__hint'>
        {t('comp.playVsHint')}
      </p>
      <div className='competition__actions'>
        <button
          type='button'
          className='competition__btn'
          onClick={() => setMode('create')}
        >
          {t('comp.createRoom')}
        </button>
        <button
          type='button'
          className='competition__btn competition__btn--outline'
          onClick={() => setMode('join')}
        >
          {t('comp.joinWithCode')}
        </button>
      </div>
    </section>
  );
}
