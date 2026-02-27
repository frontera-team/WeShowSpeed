import { useLocale, LOCALE_NAMES, type LocaleId } from '../i18n';

const LOCALES: LocaleId[] = ['en', 'ru'];

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="locale-switcher" title={t('locale.aria')}>
      <select
        className="locale-switcher__select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleId)}
        aria-label={t('locale.aria')}
      >
        {LOCALES.map((id) => (
          <option key={id} value={id}>
            {LOCALE_NAMES[id]}
          </option>
        ))}
      </select>
    </div>
  );
}
