import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * useAuth hook
 * Provides access to authentication context
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * const { isAuthenticated, user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
