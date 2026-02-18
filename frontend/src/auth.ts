const USERS_KEY = 'weshowspeed-users';
const CURRENT_USER_ID_KEY = 'weshowspeed-currentUserId';

/** Emails that get staff role on register/login (bootstrap). */
const STAFF_EMAILS = ['admin@weshowspeed.test'];

export type UserRole = 'user' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  role: UserRole;
}

interface StoredUser extends User {
  passwordHash: string;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_ID_KEY);
  } catch {
    return null;
  }
}

function normalizeRole(r: unknown): UserRole {
  return r === 'staff' ? 'staff' : 'user';
}

export function getCurrentUser(): User | null {
  const id = getCurrentUserId();
  if (!id) return null;
  const users = getStoredUsers();
  const u = users.find((x) => x.id === id);
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    role: normalizeRole(u.role),
  };
}

export function setCurrentUserId(id: string | null): void {
  if (id === null) {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_ID_KEY, id);
  }
}

export async function register(
  email: string,
  name: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim().slice(0, 50);
  if (!trimmedEmail) return { ok: false, error: 'Email is required' };
  if (!trimmedName) return { ok: false, error: 'Name is required' };
  if (!password || password.length < 6)
    return { ok: false, error: 'Password must be at least 6 characters' };

  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return { ok: false, error: 'This email is already registered' };
  }

  const passwordHash = await hashPassword(password);
  const role: UserRole = STAFF_EMAILS.some(
    (e) => e.toLowerCase() === trimmedEmail,
  )
    ? 'staff'
    : 'user';
  const user: StoredUser = {
    id: generateId(),
    email: trimmedEmail,
    name: trimmedName,
    passwordHash,
    createdAt: Date.now(),
    role,
  };
  users.push(user);
  saveUsers(users);
  setCurrentUserId(user.id);
  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      role,
    },
  };
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password)
    return { ok: false, error: 'Email and password are required' };

  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (!user) return { ok: false, error: 'Invalid email or password' };

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash)
    return { ok: false, error: 'Invalid email or password' };

  const role: UserRole = STAFF_EMAILS.some(
    (e) => e.toLowerCase() === trimmedEmail,
  )
    ? 'staff'
    : normalizeRole(user.role);
  if (role === 'staff' && user.role !== 'staff') {
    user.role = 'staff';
    saveUsers(users);
  }

  setCurrentUserId(user.id);
  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      role,
    },
  };
}

export function getAllUsers(): User[] {
  const users = getStoredUsers();
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    role: normalizeRole(u.role),
  }));
}

export function logout(): void {
  setCurrentUserId(null);
}
