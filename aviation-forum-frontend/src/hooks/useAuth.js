// src/hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext'; // Importa el Context

export const useAuth = () => { // EXPORTA el hook aquí
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// NOTA: No hay 'export default' aquí si sólo exportas el hook.
// O si prefieres un default export:
// const useAuth = () => { ... }; export default useAuth;
// Pero el código actual usa una exportación nombrada (named export), lo cual está bien.