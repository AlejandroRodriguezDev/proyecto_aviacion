// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api'; // Import the simulated API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object or null
  const [loading, setLoading] = useState(true); // Initial auth check

  // Function to check if user is logged in (e.g., on app load)
  const checkAuthState = useCallback(async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const userData = await api.verifyToken(storedToken); // Verify token with API
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem('authToken'); // Clean up invalid token
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]); // Run check on mount

  const login = async (email, password) => {
    try {
      const { user: userData, token } = await api.login(email, password);
      localStorage.setItem('authToken', token);
      setUser(userData);
      return userData; // Return user data on success
    } catch (error) {
      console.error("Login API call failed:", error);
      throw error; // Re-throw error to be handled by the calling component
    }
  };

  const register = async (userData) => {
     try {
        await api.register(userData);
        // Optionally auto-login after registration or just return success
        // For now, just registration, user needs to login separately
        return { success: true };
     } catch (error) {
         console.error("Register API call failed:", error);
         throw error;
     }
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem('authToken');
    setUser(null);
    // No API call needed for simple token removal, but could call an invalidate endpoint
  };

  // --- Placeholder OAuth Functions ---
  const loginWithGoogle = async () => {
      setLoading(true); // Simulate loading
      await new Promise(res => setTimeout(res, 1500)); // Simulate API call / SDK interaction
      console.warn("TODO: Implement real Google Login using SDK");
      // Simulate successful login with a mock Google user
      const mockGoogleUser = { id: 'googleUser123', username: 'GooglePilot', email: 'google@example.com', avatarUrl: null, /* other fields */ };
      const mockToken = `mockToken-${mockGoogleUser.id}`; // Simulate a token
      mockUsers[mockGoogleUser.id] = mockGoogleUser; // Add to mock users for consistency
      localStorage.setItem('authToken', mockToken);
      setUser(mockGoogleUser);
      setLoading(false);
      // Real implementation would involve Google SDK callbacks
      alert("Simulated Google Login Successful!");
      return mockGoogleUser;
  };

  const loginWithFacebook = async () => {
      setLoading(true);
      await new Promise(res => setTimeout(res, 1500));
      console.warn("TODO: Implement real Facebook Login using SDK");
      // Simulate successful login with a mock Facebook user
      const mockFbUser = { id: 'fbUser456', username: 'FacebookFlyer', email: 'fb@example.com', avatarUrl: null, /* other fields */ };
      const mockToken = `mockToken-${mockFbUser.id}`;
      mockUsers[mockFbUser.id] = mockFbUser;
      localStorage.setItem('authToken', mockToken);
      setUser(mockFbUser);
      setLoading(false);
      alert("Simulated Facebook Login Successful!");
      return mockFbUser;
  };
  // --- End Placeholder OAuth ---


  // Check if user is moderator of a specific forum (example helper)
  const isModerator = (forumId) => {
      if (!user || !forumId) return false;
      // Using the simplified logic where creator = moderator
      const forum = Object.values(mockForums).find(f => f.id === forumId);
      return forum?.creator === user.id;
      // // OR if using isModeratorOf field:
      // return user.isModeratorOf?.includes(forumId) ?? false;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    checkAuthState, // Expose if needed elsewhere
    isModerator,    // Expose moderator check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Show global loading overlay during OAuth simulation */}
      {loading && !user && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}> <LoadingSpinner /> </div> }
    </AuthContext.Provider>
  );
};

export default AuthContext;