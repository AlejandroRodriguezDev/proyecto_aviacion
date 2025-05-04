// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForumPage from './pages/ForumPage';
import PostPage from './pages/PostPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './styles/global.css';

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a full-page loader while initially checking auth state
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Render the protected component
}

// Componente para rutas de autenticación (Login/Register)
// Redirige si el usuario ya está autenticado
function AuthRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/home"; // Where to redirect after login

    if (loading) {
       // Can show a minimal loader or nothing while checking
       return <div style={{ height: '100vh' }} />;
    }

    if (isAuthenticated) {
        // If user is already logged in, redirect them away from login/register
        return <Navigate to={from} replace />;
    }

    return children; // Render Login or Register page
}


function AppContent() {
  const { loading: authLoading } = useAuth(); // Use loading state from context

  // Render nothing or a minimal layout until initial auth check is done
  // This prevents flashes of content or incorrect redirects
  if (authLoading) {
       return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <LoadingSpinner />
          </div>
       );
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}> {/* Add padding */}
        <Routes>
          {/* Auth Routes */}
           <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
           <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={<ProtectedRoute><HomePage /></ProtectedRoute>}
          />
          <Route
            path="/home" // Alias
            element={<ProtectedRoute><HomePage /></ProtectedRoute>}
          />
          <Route
            path="/forum/:forumSlug" // Use slug for cleaner URLs
            element={<ProtectedRoute><ForumPage /></ProtectedRoute>}
          />
           <Route
            path="/post/:postId"
            element={<ProtectedRoute><PostPage /></ProtectedRoute>}
          />
          <Route
            path="/user/:username"
            element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>}
          />
           <Route
            path="/settings"
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
          />
          {/* TODO: Add Search Results Page */}
          {/* <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} /> */}

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
       {/* Optional Footer could go here */}
    </>
  );
}

function App() {
  return (
    // Wrap the entire application with AuthProvider
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;