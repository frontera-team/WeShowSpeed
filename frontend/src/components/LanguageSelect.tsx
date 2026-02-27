import { LANGUAGES } from '../data/languages';
import type { LanguageId } from '../types';
import { useLocale } from '../i18n';

interface LanguageSelectProps {
  value: LanguageId;
  onChange: (id: LanguageId) => void;
  disabled?: boolean;
}

export function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  const { t } = useLocale();
  return (
    <div className="lang-select">
      <span className="lang-select__label">{t('lang.label')}</span>
      <div className="lang-select__options">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            type="button"
            className={`lang-select__btn ${value === lang.id ? 'lang-select__btn--active' : ''}`}
            onClick={() => onChange(lang.id)}
            disabled={disabled}
            title={lang.name}
          >
            <span className="lang-select__flag">{lang.flag}</span>
            <span className="lang-select__name">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
