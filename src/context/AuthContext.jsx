import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getToken, setToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((data) => setDirector(data.director))
      .catch(() => {
        setToken(null);
        setDirector(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      director,
      loading,
      login(token, user) {
        setToken(token);
        setDirector(user);
      },
      logout() {
        setToken(null);
        setDirector(null);
      },
      setDirector,
    }),
    [director, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
