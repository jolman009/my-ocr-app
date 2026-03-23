import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken, onUnauthorized } from "@receipt-ocr/shared/api";

const TOKEN_KEY = "my_ocr_app_auth_token";
const USER_KEY = "my_ocr_app_auth_user";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

interface AuthContextValue {
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (token: string, user?: AuthUser | null) => void;
  logout: () => void;
  token: string | null;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken) {
      setTokenState(storedToken);
      setAuthToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsHydrating(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setTokenState(null);
      setUser(null);
      setAuthToken(null);
    });
    return unsubscribe;
  }, []);

  const login = (newToken: string, nextUser?: AuthUser | null) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
    setAuthToken(newToken);
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isHydrating,
        login,
        logout,
        token,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
