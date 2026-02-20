const ACHIEVEMENTS_KEY = 'weshowspeed-achievements';
const USER_ACHIEVEMENTS_PREFIX = 'weshowspeed-userAchievements';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: number;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getStoredAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Achievement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAchievements(list: Achievement[]): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
}

export function getAchievements(): Achievement[] {
  return getStoredAchievements();
}

export function addAchievement(data: { name: string; description: string; icon: string }): Achievement {
  const list = getStoredAchievements();
  const achievement: Achievement = {
    id: generateId(),
    name: data.name.trim().slice(0, 80),
    description: data.description.trim().slice(0, 300),
    icon: (data.icon.trim() || '🏆').slice(0, 10),
    createdAt: Date.now(),
  };
  list.push(achievement);
  saveAchievements(list);
  return achievement;
}

export function updateAchievement(
  id: string,
  data: { name?: string; description?: string; icon?: string }
): Achievement | null {
  const list = getStoredAchievements();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  if (data.name !== undefined) list[idx].name = data.name.trim().slice(0, 80);
  if (data.description !== undefined) list[idx].description = data.description.trim().slice(0, 300);
  if (data.icon !== undefined) list[idx].icon = (data.icon.trim() || '🏆').slice(0, 10);
  saveAchievements(list);
  return list[idx];
}

export function removeAchievement(id: string): boolean {
  const all = getStoredAchievements();
  const list = all.filter((a) => a.id !== id);
  if (list.length === all.length) return false;
  saveAchievements(list);
  return true;
}

function userAchievementsKey(userId: string): string {
  return `${USER_ACHIEVEMENTS_PREFIX}-${userId}`;
}

export function getUserAchievements(userId: string): string[] {
  try {
    const raw = localStorage.getItem(userAchievementsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function grantAchievement(userId: string, achievementId: string): void {
  const ids = getUserAchievements(userId);
  if (ids.includes(achievementId)) return;
  ids.push(achievementId);
  localStorage.setItem(userAchievementsKey(userId), JSON.stringify(ids));
}

export function revokeAchievement(userId: string, achievementId: string): void {
  const ids = getUserAchievements(userId).filter((id) => id !== achievementId);
  localStorage.setItem(userAchievementsKey(userId), JSON.stringify(ids));
}