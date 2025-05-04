// src/hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Check for undefined, as null is a valid initial state
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};