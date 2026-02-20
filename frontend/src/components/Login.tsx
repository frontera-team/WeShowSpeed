import { useState } from 'react';
import { login } from '../auth';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <h2 className="auth__title">Log in</h2>
      <form className="auth__form" onSubmit={handleSubmit}>
        {error && <p className="auth__error">{error}</p>}
        <label className="auth__label">
          Email
          <input
            type="email"
            className="auth__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label className="auth__label">
          Password
          <input
            type="password"
            className="auth__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" className="auth__submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="auth__switch">
        Don&apos;t have an account?{' '}
        <button type="button" className="auth__link" onClick={onSwitchToRegister}>
          Sign up
        </button>
      </p>
    </section>
  );
}
