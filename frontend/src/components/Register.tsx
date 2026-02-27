import { useState } from 'react';
import { register } from '../auth';
import { useLocale } from '../i18n';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }
    setLoading(true);
    const result = await register(email, name, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error);
    }
  };

  return (
    <section className="auth">
      <h2 className="auth__title">{t('auth.signUp')}</h2>
      <form className="auth__form" onSubmit={handleSubmit}>
        {error && <p className="auth__error">{error}</p>}
        <label className="auth__label">
          {t('auth.email')}
          <input
            type="email"
            className="auth__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.placeholderEmail')}
            autoComplete="email"
            required
          />
        </label>
        <label className="auth__label">
          {t('auth.displayName')}
          <input
            type="text"
            className="auth__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.placeholderName')}
            autoComplete="name"
            maxLength={50}
            required
          />
        </label>
        <label className="auth__label">
          {t('auth.password')}
          <input
            type="password"
            className="auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.placeholderPasswordHint')}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label className="auth__label">
          {t('auth.confirmPassword')}
          <input
            type="password"
            className="auth__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('auth.placeholderConfirm')}
            autoComplete="new-password"
            required
          />
        </label>
        <button type="submit" className="auth__submit" disabled={loading}>
          {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </button>
      </form>
      <p className="auth__switch">
        {t('auth.hasAccount')}{' '}
        <button type="button" className="auth__link" onClick={onSwitchToLogin}>
          {t('auth.logIn')}
        </button>
      </p>
    </section>
  );
}
