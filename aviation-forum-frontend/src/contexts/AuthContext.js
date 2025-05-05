// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api'; // Importa TU api.js simulado
// Ya NO importamos LoadingSpinner aquí, se usa en App.js/ProtectedRoute

const AuthContext = createContext(null); // Crea el Context

export const AuthProvider = ({ children }) => { // EXPORTA el Provider
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = useCallback(async () => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && api.verifyToken) {
      try {
        const userData = await api.verifyToken(storedToken);
        const normalizedUser = { // Normaliza datos
          ...userData,
          friends: Array.isArray(userData.friends) ? userData.friends : [],
          subscribedForums: Array.isArray(userData.subscribedForums) ? userData.subscribedForums : [],
        };
        if (JSON.stringify(user) !== JSON.stringify(normalizedUser)) {
           setUser(normalizedUser);
        }
      } catch (error) {
        if (user !== null) setUser(null);
        localStorage.removeItem('authToken');
      }
    } else {
      if (user !== null) setUser(null);
    }
    if (loading) setLoading(false); // Solo cambia loading en el check inicial

  }, [user, loading]); // Dependencia 'loading' para controlar cuándo setearlo a false

  // Efecto inicial
  useEffect(() => {
     console.log("AuthProvider mounted. Running initial auth check.");
     setLoading(true); // Marca cargando al inicio
     checkAuthState(); // Ejecuta el chequeo
     // setLoading(false) se maneja dentro de checkAuthState la primera vez
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Se ejecuta solo al montar


  const login = async (email, password) => { /* ... (código sin cambios) ... */
    if (!api.login) throw new Error("Login function not found in API");
    try {
      const { user: userData, token } = await api.login(email, password);
      localStorage.setItem('authToken', token);
      const normalizedUser = { /* ... (normalización) ... */
        ...userData,
        friends: Array.isArray(userData.friends) ? userData.friends : [],
        subscribedForums: Array.isArray(userData.subscribedForums) ? userData.subscribedForums : [],
      };
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error("Login API call failed:", error);
      throw error;
    }
  };

  const register = async (userData) => { /* ... (código sin cambios) ... */
    if (!api.register) throw new Error("Register function not found in API");
    try {
      const result = await api.register(userData);
      console.log("Registration successful for:", result.user?.username || 'unknown');
      return { success: true, user: result.user };
    } catch (error) {
       console.error("Register API call failed:", error);
       throw error;
    }
  };

  const logout = useCallback(() => { /* ... (código sin cambios) ... */
    console.log("Logging out user...");
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  const loginWithOAuth = useCallback(async (provider) => { /* ... (código sin cambios) ... */
    console.warn(`TODO: Implement real ${provider} Login`);
    alert(`Simulated ${provider} Login! Needs backend integration.`);
    const mockOAuthUser = { id: `${provider}User${Date.now()}`, username: `${provider}Flyer`, email: `${provider.toLowerCase()}@example.com`, friends: [], subscribedForums: [] };
    const mockToken = `mockToken-${mockOAuthUser.id}`;
    localStorage.setItem('authToken', mockToken);
    setUser(mockOAuthUser);
    return mockOAuthUser;
  }, []);
  const loginWithGoogle = useCallback(() => loginWithOAuth('Google'), [loginWithOAuth]);
  const loginWithFacebook = useCallback(() => loginWithOAuth('Facebook'), [loginWithOAuth]);

  const isModerator = useCallback((forumId) => { /* ... (código sin cambios) ... */
    if (!user || !forumId || !api.mockForums) return false;
     const forum = api.mockForums[forumId];
     return !!forum && forum.creator === user.id;
  }, [user]);

  const value = useMemo(() => ({ /* ... (código sin cambios) ... */
    user, isAuthenticated: !!user, loading, login, register, logout,
    loginWithGoogle, loginWithFacebook, checkAuthState, isModerator,
  }), [user, loading, logout, loginWithGoogle, loginWithFacebook, checkAuthState, isModerator]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exporta el Context por defecto para poder usar useContext(AuthContext) si se necesita
export default AuthContext;

// NO exportamos useAuth desde aquí
// // export const useAuth = () => useContext(AuthContext); // INCORRECTO