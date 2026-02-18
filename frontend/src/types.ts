export type LanguageId = 'ru' | 'en' | 'de' | 'es' | 'fr' | 'uk' | 'ar' | 'it' | 'pt';

export interface Language {
  id: LanguageId;
  name: string;
  flag: string;
}

export interface TypingResult {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  timeSeconds: number;
  durationSec?: number; /* selected test duration */
  languageId: LanguageId;
  timestamp: number;
}
