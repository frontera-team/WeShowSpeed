import type { TypingResult } from './types';
import { getCurrentUserId } from './auth';

const RESULTS_PREFIX = 'weshowspeed-results';
const GUEST_RESULTS_KEY = 'weshowspeed-results';
const USER_NAME_KEY = 'weshowspeed-userName';

function resultsKey(userId: string | null): string {
  if (!userId) return GUEST_RESULTS_KEY;
  return `${RESULTS_PREFIX}-${userId}`;
}

export function getStoredResults(userId?: string | null): TypingResult[] {
  const id = userId !== undefined ? userId : getCurrentUserId();
  const key = resultsKey(id);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TypingResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResult(result: TypingResult, userId?: string | null): void {
  const id = userId !== undefined ? userId : getCurrentUserId();
  const key = resultsKey(id);
  const list = getStoredResults(id);
  list.unshift(result);
  const max = 500;
  const trimmed = list.slice(0, max);
  localStorage.setItem(key, JSON.stringify(trimmed));
}

export function clearResults(userId?: string | null): void {
  const id = userId !== undefined ? userId : getCurrentUserId();
  localStorage.removeItem(resultsKey(id));
}

export function getStoredUserName(): string {
  try {
    return localStorage.getItem(USER_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveUserName(name: string, userId?: string | null): void {
  const id = userId !== undefined ? userId : getCurrentUserId();
  if (!id) {
    try {
      localStorage.setItem(USER_NAME_KEY, name.trim().slice(0, 50));
    } catch {
      // ignore
    }
    return;
  }
  const key = `weshowspeed-userName-${id}`;
  try {
    localStorage.setItem(key, name.trim().slice(0, 50));
  } catch {
    // ignore
  }
}

export function getStoredUserNameForUser(userId: string): string {
  try {
    return localStorage.getItem(`weshowspeed-userName-${userId}`) ?? '';
  } catch {
    return '';
  }
}
