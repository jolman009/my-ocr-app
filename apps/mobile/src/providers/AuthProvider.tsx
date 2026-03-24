import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken as setSecureAuthToken, clearAuthToken } from "../lib/authStorage";
import { setAuthToken, onUnauthorized } from "@receipt-ocr/shared/api";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isHydrating: boolean;
  user: AuthUser | null;
  login: (token: string, user?: AuthUser | null) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    getAuthToken()
      .then((storedToken) => {
        if (storedToken) {
          setTokenState(storedToken);
          setAuthToken(storedToken); // Automatically bind the token format to shared client APIs
        }
      })
      .finally(() => {
        setIsHydrating(false);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      // Intentionally don't await because this can be called async from anywhere
      void clearAuthToken();
      setTokenState(null);
      setAuthToken(null);
    });
    return unsubscribe;
  }, []);

  const login = async (newToken: string, nextUser?: AuthUser | null) => {
    await setSecureAuthToken(newToken);
    setTokenState(newToken);
    setAuthToken(newToken);
    setUser(nextUser ?? null);
  };

  const logout = async () => {
    await clearAuthToken();
    setTokenState(null);
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isHydrating,
        user,
        login,
        logout,
        token
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
