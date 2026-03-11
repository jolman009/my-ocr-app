import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken, onUnauthorized } from "@receipt-ocr/shared/api";

const TOKEN_KEY = "my_ocr_app_auth_token";

interface AuthContextValue {
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setTokenState(storedToken);
      setAuthToken(storedToken);
    }
    setIsHydrating(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      localStorage.removeItem(TOKEN_KEY);
      setTokenState(null);
      setAuthToken(null);
    });
    return unsubscribe;
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
    setAuthToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isHydrating,
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
