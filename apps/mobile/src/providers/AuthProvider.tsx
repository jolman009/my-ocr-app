import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken as setSecureAuthToken, clearAuthToken } from "../lib/authStorage";
import { setAuthToken, onUnauthorized } from "@receipt-ocr/shared/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
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

  const login = async (newToken: string) => {
    await setSecureAuthToken(newToken);
    setTokenState(newToken);
    setAuthToken(newToken);
  };

  const logout = async () => {
    await clearAuthToken();
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
