export type UserRole = 'admin' | 'client' | 'worker' | 'artisan' | 'team_leader' | string;

interface StoredUser {
  id?: number;
  role?: UserRole;
  [key: string]: unknown;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return null;
  }
}

export function getDashboardRoute(role?: UserRole): string {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'worker' || role === 'artisan' || role === 'team_leader') return '/dashboard/worker';
  return '/dashboard/client';
}

export function getAuthenticatedRouteFallback(): string {
  const user = getStoredUser();
  return getDashboardRoute(user?.role);
}

export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('access_token');
  if (!token) return false;

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return false;
    }

    const payload = JSON.parse(atob(tokenParts[1])) as { exp?: number };
    if (!payload?.exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowInSeconds) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return false;
  }
}
