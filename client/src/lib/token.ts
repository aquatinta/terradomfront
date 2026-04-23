/**
 * Token storage utilities for Terradom API JWT authentication.
 *
 * Security model:
 * - accessToken: stored in memory only (module-level variable).
 *   Never persisted to localStorage to reduce XSS attack surface.
 * - refreshToken: stored in localStorage.
 *   Needed to survive page reloads and restore sessions.
 *
 * The access token lives in memory and is injected into every request
 * by the axios request interceptor in api.ts.
 */

const REFRESH_TOKEN_KEY = "terradom_refresh_token";
const USER_KEY = "terradom_user";

// In-memory access token — not persisted
let _accessToken: string | null = null;

// ---------------------------------------------------------------------------
// Access token (in-memory only)
// ---------------------------------------------------------------------------

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function clearAccessToken(): void {
  _accessToken = null;
}

// ---------------------------------------------------------------------------
// Refresh token (localStorage)
// ---------------------------------------------------------------------------

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // localStorage unavailable (e.g. private mode with storage blocked)
    console.warn("[terradom] Could not persist refresh token to localStorage");
  }
}

export function clearRefreshToken(): void {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Cached user profile (localStorage) — avoids extra /api/user/me on reload
// ---------------------------------------------------------------------------

export function getCachedUser(): import("./api.types").User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as import("./api.types").User) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: import("./api.types").User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearCachedUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Clear everything (logout)
// ---------------------------------------------------------------------------

export function clearAllTokens(): void {
  clearAccessToken();
  clearRefreshToken();
  clearCachedUser();
}
