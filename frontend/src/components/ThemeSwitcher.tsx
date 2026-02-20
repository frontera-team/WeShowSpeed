import { applyTheme, setStoredTheme, type ThemeId } from '../theme';

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

interface ThemeSwitcherProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  const handleChange = (theme: ThemeId) => {
    setStoredTheme(theme);
    applyTheme(theme);
    onChange(theme);
  };

  return (
    <div className="theme-switcher">
      <div className="theme-switcher__buttons">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`theme-switcher__btn ${value === t.id ? 'theme-switcher__btn--active' : ''}`}
            onClick={() => handleChange(t.id)}
            title={t.id === 'system' ? 'Follow device setting' : t.label}
          >
            {t.label}
          </button>
        ))}
      </div>
      <select
        className="theme-switcher__select"
        value={value}
        onChange={(e) => handleChange(e.target.value as ThemeId)}
        aria-label="Theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
