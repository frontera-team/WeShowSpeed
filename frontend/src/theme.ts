export type ThemeId = 'light' | 'dark' | 'system';

const THEME_KEY = 'weshowspeed-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyToDocument(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved);
}

export function getStoredTheme(): ThemeId {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark' || t === 'system') return t;
  } catch {
    // ignore
  }
  return 'system';
}

export function setStoredTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function getResolvedTheme(): 'light' | 'dark' {
  const stored = getStoredTheme();
  if (stored === 'system') return getSystemTheme();
  return stored;
}

export function applyTheme(theme?: ThemeId): void {
  const stored = theme ?? getStoredTheme();
  const resolved = stored === 'system' ? getSystemTheme() : stored;
  applyToDocument(resolved);
}

export function initTheme(): ThemeId {
  const stored = getStoredTheme();
  applyTheme(stored);
  if (stored === 'system' && typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      applyTheme('system');
    });
  }
  return stored;
}
