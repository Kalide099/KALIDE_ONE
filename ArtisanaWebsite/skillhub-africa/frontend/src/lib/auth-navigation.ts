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
  return Boolean(localStorage.getItem('access_token'));
}
