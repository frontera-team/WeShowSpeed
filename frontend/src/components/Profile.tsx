import { useState, useEffect } from 'react';
import {
  getStoredResults,
  getStoredUserName,
  getStoredUserNameForUser,
  saveUserName,
  clearResults,
} from '../storage';
import { getAchievements, getUserAchievements } from '../achievements';
import { LANGUAGES } from '../data/languages';
import type { TypingResult } from '../types';
import type { LanguageId } from '../types';
import type { User } from '../auth';

interface ProfileProps {
  user: User | null;
  onBack?: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Profile({ user }: ProfileProps) {
  const [results, setResults] = useState<TypingResult[]>([]);
  const [editName, setEditName] = useState('');

  const userId = user?.id ?? null;

  useEffect(() => {
    setResults(getStoredResults(userId));
    const name = user
      ? getStoredUserNameForUser(user.id) || user.name
      : getStoredUserName();
    setEditName(name);
  }, [user, userId]);

  const totalTests = results.length;
  const bestWpm = totalTests > 0 ? Math.max(...results.map((r) => r.wpm)) : 0;
  const avgWpm =
    totalTests > 0
      ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / totalTests)
      : 0;
  const avgAccuracy =
    totalTests > 0
      ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalTests)
      : 0;
  const totalChars = results.reduce((s, r) => s + r.correctChars, 0);

  const allAchievements = getAchievements();
  const earnedIds = userId ? getUserAchievements(userId) : [];
  const earnedAchievements = allAchievements.filter((a) => earnedIds.includes(a.id));

  const byLanguage = (LANGUAGES as { id: LanguageId }[])
    .map((lang) => {
      const langResults = results.filter((r) => r.languageId === lang.id);
      const count = langResults.length;
      const best = count > 0 ? Math.max(...langResults.map((r) => r.wpm)) : 0;
      return { lang, count, best };
    })
    .filter((x) => x.count > 0);

  const handleSaveName = () => {
    const name = editName.trim();
    saveUserName(name, userId);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all typing history? This cannot be undone.')) {
      clearResults(userId);
      setResults([]);
    }
  };

  return (
    <section className='profile'>
      <div className='profile__name-section'>
        <label className='profile__label'>Display name</label>
        <div className='profile__name-row'>
          <input
            type='text'
            className='profile__input'
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            placeholder='Your name'
            maxLength={50}
          />
        </div>
        <p className='profile__name-hint'>Saved automatically</p>
      </div>

      {!user && (
        <p className='profile__guest-hint'>
          Log in to save your statistics across devices.
        </p>
      )}

      {earnedAchievements.length > 0 && (
        <div className='profile__achievements'>
          <h2 className='profile__title'>Achievements</h2>
          <ul className='profile__achievements-list'>
            {earnedAchievements.map((a) => (
              <li key={a.id} className='profile__achievement'>
                <span className='profile__achievement-icon'>{a.icon}</span>
                <div className='profile__achievement-body'>
                  <span className='profile__achievement-name'>{a.name}</span>
                  {a.description && (
                    <span className='profile__achievement-desc'>{a.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className='profile__title'>Statistics</h2>

      {totalTests === 0 ? (
        <p className='profile__empty'>
          No tests yet. Complete a typing test to see your stats here.
        </p>
      ) : (
        <>
          <div className='profile__stats'>
            <div className='profile__stat profile__stat--highlight'>
              <span className='profile__stat-value'>{bestWpm}</span>
              <span className='profile__stat-label'>Best WPM</span>
            </div>
            <div className='profile__stat'>
              <span className='profile__stat-value'>{avgWpm}</span>
              <span className='profile__stat-label'>Average WPM</span>
            </div>
            <div className='profile__stat'>
              <span className='profile__stat-value'>{avgAccuracy}%</span>
              <span className='profile__stat-label'>Average accuracy</span>
            </div>
            <div className='profile__stat'>
              <span className='profile__stat-value'>{totalTests}</span>
              <span className='profile__stat-label'>Tests completed</span>
            </div>
            <div className='profile__stat'>
              <span className='profile__stat-value'>
                {totalChars.toLocaleString()}
              </span>
              <span className='profile__stat-label'>Correct chars total</span>
            </div>
          </div>

          {byLanguage.length > 0 && (
            <div className='profile__by-lang'>
              <h3 className='profile__subtitle'>By language</h3>
              <ul className='profile__lang-list'>
                {byLanguage.map(({ lang, count, best }) => {
                  const l = LANGUAGES.find((x) => x.id === lang.id);
                  return (
                    <li key={lang.id} className='profile__lang-item'>
                      <span className='profile__lang-flag'>{l?.flag}</span>
                      <span className='profile__lang-name'>
                        {l?.name ?? lang.id}
                      </span>
                      <span className='profile__lang-best'>{best} WPM</span>
                      <span className='profile__lang-count'>{count} tests</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className='profile__recent'>
            <h3 className='profile__subtitle'>Recent results</h3>
            <ul className='profile__recent-list'>
              {results.slice(0, 10).map((r, i) => {
                const l = LANGUAGES.find((x) => x.id === r.languageId);
                const duration =
                  'durationSec' in r && r.durationSec != null
                    ? `${r.durationSec}s`
                    : '—';
                return (
                  <li
                    key={`${r.timestamp}-${i}`}
                    className='profile__recent-item'
                  >
                    <span className='profile__recent-wpm'>{r.wpm} WPM</span>
                    <span className='profile__recent-acc'>{r.accuracy}%</span>
                    <span
                      className='profile__recent-duration'
                      title='Test duration'
                    >
                      {duration}
                    </span>
                    <span className='profile__recent-lang'>
                      {l?.flag} {l?.name ?? r.languageId}
                    </span>
                    <span className='profile__recent-date'>
                      {formatDate(r.timestamp)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type='button'
            className='profile__clear'
            onClick={handleClearHistory}
          >
            Clear history
          </button>
        </>
      )}
    </section>
  );
}
