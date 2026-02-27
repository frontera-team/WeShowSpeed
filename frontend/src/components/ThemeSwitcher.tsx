import { applyTheme, setStoredTheme, type ThemeId } from '../theme';
import { useLocale } from '../i18n';

interface ThemeSwitcherProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  const { t } = useLocale();
  const THEMES = [
    { id: 'light' as const, label: t('theme.light') },
    { id: 'dark' as const, label: t('theme.dark') },
    { id: 'system' as const, label: t('theme.system') },
  ];
  const handleChange = (theme: ThemeId) => {
    setStoredTheme(theme);
    applyTheme(theme);
    onChange(theme);
  };

  return (
    <div className="theme-switcher">
      <div className="theme-switcher__buttons">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-switcher__btn ${value === theme.id ? 'theme-switcher__btn--active' : ''}`}
            onClick={() => handleChange(theme.id)}
            title={theme.id === 'system' ? t('theme.followDevice') : theme.label}
          >
            {theme.label}
          </button>
        ))}
      </div>
      <select
        className="theme-switcher__select"
        value={value}
        onChange={(e) => handleChange(e.target.value as ThemeId)}
        aria-label={t('theme.aria')}
      >
        {THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}
