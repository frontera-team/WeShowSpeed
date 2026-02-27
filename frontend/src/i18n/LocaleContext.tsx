import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type LocaleId,
  t as tFn,
  TRANSLATIONS,
  type TranslationKey,
} from './translations';

const STORAGE_KEY = 'weshowspeed-locale';

function getStoredLocale(): LocaleId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'ru' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

function getBrowserLocale(): LocaleId {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.toLowerCase();
  if (lang?.startsWith('ru')) return 'ru';
  return 'en';
}

interface LocaleContextValue {
  locale: LocaleId;
  setLocale: (id: LocaleId) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(() => {
    const stored = getStoredLocale();
    if (stored !== 'en') return stored;
    return getBrowserLocale();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((id: LocaleId) => {
    setLocaleState(id);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => tFn(key, locale),
    [locale],
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    t,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export { TRANSLATIONS };
export type { LocaleId, TranslationKey };
