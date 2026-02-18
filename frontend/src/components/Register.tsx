import { useState } from 'react';
import { register } from '../auth';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      <h2 className="auth__title">Sign up</h2>
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
          Display name
          <input
            type="text"
            className="auth__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={50}
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label className="auth__label">
          Confirm password
          <input
            type="password"
            className="auth__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            required
          />
        </label>
        <button type="submit" className="auth__submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth__switch">
        Already have an account?{' '}
        <button type="button" className="auth__link" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </section>
  );
}
