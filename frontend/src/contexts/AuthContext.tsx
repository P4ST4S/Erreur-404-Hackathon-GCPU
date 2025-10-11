import { createContext, useState, useEffect, type ReactNode } from "react";

/**
 * Authentication context value interface
 */
interface AuthContextValue {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current user information */
  user: User | null;
  /** Login function */
  login: (email: string, password: string) => Promise<void>;
  /** Logout function */
  logout: () => void;
  /** Loading state */
  isLoading: boolean;
}

/**
 * User interface
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "auditor";
}

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * AuthProvider component props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Manages user authentication state across the application
 *
 * In production, this should integrate with your backend authentication API
 * Currently using mock authentication for development
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual API call to check session
        const savedAuth = localStorage.getItem("auth");
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          setUser(authData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * TODO: Replace with actual API call
   */
  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "1",
        email,
        name: "Dr. Sarah Johnson",
        role: "user",
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem("auth", JSON.stringify({ user: mockUser }));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth");
  };

  const value: AuthContextValue = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
