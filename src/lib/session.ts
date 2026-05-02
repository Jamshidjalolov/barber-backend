import { AuthSession } from "../types";

const SESSION_STORAGE_KEY = "barbershop-auth-session";
const BARBER_PASSWORDS_STORAGE_KEY = "barbershop-barber-passwords";

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw =
    window.localStorage.getItem(SESSION_STORAGE_KEY) ??
    window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: AuthSession | null, remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);

  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readStoredBarberPasswords(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(BARBER_PASSWORDS_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeStoredBarberPassword(barberId: string, password: string) {
  if (typeof window === "undefined" || !barberId || !password) {
    return;
  }

  const current = readStoredBarberPasswords();
  current[barberId] = password;
  window.localStorage.setItem(BARBER_PASSWORDS_STORAGE_KEY, JSON.stringify(current));
}

export function removeStoredBarberPassword(barberId: string) {
  if (typeof window === "undefined" || !barberId) {
    return;
  }

  const current = readStoredBarberPasswords();
  delete current[barberId];
  window.localStorage.setItem(BARBER_PASSWORDS_STORAGE_KEY, JSON.stringify(current));
}
