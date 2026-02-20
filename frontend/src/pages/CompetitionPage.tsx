import { useState, useEffect } from 'react';
import { useCompetition } from '../contexts/CompetitionContext';
import { LanguageSelect } from '../components/LanguageSelect';
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
        <h2 className='competition__title'>Competition</h2>
        <p className='competition__code'>
          Room code: <strong>{roomId}</strong>
        </p>
        <p className='competition__hint'>
          Share this code with your opponent. Waiting for opponent to join...
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
          Cancel
        </button>
      </section>
    );
  }

  if (roomState === 'confirming' && roomId) {
    const allConfirmed =
      players.length >= 2 && players.every((p) => p.confirmed);
    return (
      <section className='competition'>
        <h2 className='competition__title'>Confirm ready</h2>
        <ul className='competition__players'>
          {players.map((p, i) => (
            <li key={i} className='competition__player'>
              {p.name} {p.confirmed ? '✓ Ready' : '—'}
            </li>
          ))}
        </ul>
        {secondConfirmDeadline != null && !allConfirmed && (
          <p className='competition__timer'>
            Opponent confirmed. Confirm within{' '}
            <strong>{secondsLeft ?? 30}s</strong>.
          </p>
        )}
        {!allConfirmed && (
          <button type='button' className='competition__btn' onClick={confirm}>
            I&apos;m ready
          </button>
        )}
        {allConfirmed && (
          <p className='competition__hint'>Both ready! Starting in 3...</p>
        )}
      </section>
    );
  }

  if (roomState === 'countdown' && countdownSec != null) {
    return (
      <section className='competition'>
        <h2 className='competition__countdown'>
          {countdownSec > 0 ? countdownSec : 'Go!'}
        </h2>
      </section>
    );
  }

  if (mode === 'create') {
    return (
      <section className='competition'>
        <h2 className='competition__title'>Create competition</h2>
        {error && <p className='competition__error'>{error}</p>}
        <label className='competition__label'>
          Your name
          <input
            type='text'
            className='competition__input'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Name'
          />
        </label>
        <LanguageSelect value={languageId} onChange={setLanguageId} />
        <div className='competition__duration'>
          <span className='competition__duration-label'>Duration:</span>
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
          Create room
        </button>
        <button
          type='button'
          className='competition__btn competition__btn--secondary'
          onClick={() => setMode('choose')}
        >
          Back
        </button>
      </section>
    );
  }

  if (mode === 'join') {
    return (
      <section className='competition'>
        <h2 className='competition__title'>Join competition</h2>
        {error && <p className='competition__error'>{error}</p>}
        <label className='competition__label'>
          Your name
          <input
            type='text'
            className='competition__input'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Name'
          />
        </label>
        <label className='competition__label'>
          Room code
          <input
            type='text'
            className='competition__input competition__input--code'
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder='ABC123'
            maxLength={6}
          />
        </label>
        <button
          type='button'
          className='competition__btn'
          onClick={() => joinRoom(joinCode.trim(), name || 'Player')}
          disabled={!name.trim() || joinCode.trim().length < 4}
        >
          Join
        </button>
        <button
          type='button'
          className='competition__btn competition__btn--secondary'
          onClick={() => setMode('choose')}
        >
          Back
        </button>
      </section>
    );
  }

  return (
    <section className='competition'>
      <h2 className='competition__title'>Play vs opponent</h2>
      <p className='competition__hint'>
        Create a room and share the code, or join with a code.
      </p>
      <div className='competition__actions'>
        <button
          type='button'
          className='competition__btn'
          onClick={() => setMode('create')}
        >
          Create room
        </button>
        <button
          type='button'
          className='competition__btn competition__btn--outline'
          onClick={() => setMode('join')}
        >
          Join with code
        </button>
      </div>
    </section>
  );
}
