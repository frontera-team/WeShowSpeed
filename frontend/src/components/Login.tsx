import { useState } from 'react';
import { login } from '../auth';
import { useLocale } from '../i18n';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error);
    }
  };

  return (
    <section className="auth">
      <h2 className="auth__title">{t('auth.logIn')}</h2>
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
          {t('auth.password')}
          <input
            type="password"
            className="auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.placeholderPassword')}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" className="auth__submit" disabled={loading}>
          {loading ? t('auth.loggingIn') : t('auth.logIn')}
        </button>
      </form>
      <p className="auth__switch">
        {t('auth.noAccount')}{' '}
        <button type="button" className="auth__link" onClick={onSwitchToRegister}>
          {t('auth.signUp')}
        </button>
      </p>
    </section>
  );
}
