// src/App.js
import React from 'react'; // Importante tener React aquí
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
// CORRECTO: Importa AuthProvider desde contexts
import { AuthProvider } from './contexts/AuthContext';
// CORRECTO: Importa useAuth desde hooks
import { useAuth } from './hooks/useAuth';
// Resto de imports...
import Navbar from './components/Common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForumPage from './pages/ForumPage';
import PostPage from './pages/PostPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
// import SearchResultsPage from './pages/SearchResultsPage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './styles/global.css';

// --- Componente para Rutas Protegidas ---
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth(); // <--- Usa el hook importado
  const location = useLocation();

  if (loading) { // Cargando estado de autenticación
    return <LoadingSpinner />; // Mostrar spinner mientras carga
  }

  if (!isAuthenticated) { 
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// --- Componente para Rutas de Autenticación ---
function AuthRoute({ children }) {
    const { isAuthenticated, loading } = useAuth(); // <--- Usa el hook importado
    const location = useLocation();

    if (loading) { // Cargando estado de autenticación
        return <LoadingSpinner />;
    }

    if (isAuthenticated) { // Si ya está autenticado, redirige a la página principal
        return <Navigate to={location.state?.from || '/home'} replace />;
    }

    return children;
}

// --- Contenido Principal de la App ---
function AppContent() {
  // CORRECTO: Llama a useAuth al inicio del componente, no condicionalmente
  const { loading: authLoading, isAuthenticated } = useAuth(); // Obtiene estado auth
  const location = useLocation(); // Necesario para ocultar Navbar opcionalmente

  if (authLoading) { // Loader principal mientras carga el estado de Auth inicial
    return <LoadingSpinner />;
  }

  // Opcional: Ocultar navbar en login/register
  const showNavbar = location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <>
      {showNavbar && <Navbar />} {/* Muestra Navbar condicionalmente */}
      {/* Usa la variable CSS para el padding top */}
      <main className="main-content-area container" style={{ paddingTop: showNavbar ? undefined : '1rem' }}>
        <Routes>
          {/* Ruta Raíz: Usa isAuthenticated obtenido arriba */}
          <Route path="/" element={<Navigate replace to={isAuthenticated ? "/home" : "/login"} />} />

          {/* Resto de rutas (usando AuthRoute y ProtectedRoute que ya tienen useAuth interno) */}
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/forum/:forumSlug" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
          <Route path="/user/:username" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          {/* <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} /> */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

// --- Componente Principal App ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
