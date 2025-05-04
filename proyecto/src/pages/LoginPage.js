import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import OAuthButtons from '../components/Auth/OAuthButtons';
import { useAuth } from '../hooks/useAuth';
import styles from './PageStyles.module.css'; // Crear este archivo CSS

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithFacebook, isAuthenticated } = useAuth();
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    // Si ya está logueado, redirigir a home
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (credentials) => {
    setError(''); // Limpiar errores previos
    try {
      await login(credentials.email, credentials.password);
       navigate('/home'); // Redirige al home después del login exitoso
    } catch (err) {
      console.error("Login failed:", err);
      // TODO: Mostrar un mensaje de error más específico desde la API
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
        await loginWithGoogle();
        // La redirección se manejaría dentro del AuthContext o aquí si la función devuelve éxito
    } catch(err) {
        setError('Error al iniciar sesión con Google.');
    }
  };

  const handleFacebookLogin = async () => {
     try {
        await loginWithFacebook();
     } catch(err) {
        setError('Error al iniciar sesión con Facebook.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2>Iniciar Sesión - Foro de Aviación</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <LoginForm onSubmit={handleLogin} />
      <hr className={styles.divider} />
      <OAuthButtons
        onGoogleLogin={handleGoogleLogin}
        onFacebookLogin={handleFacebookLogin}
      />
      <p className={styles.switchAuth}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginPage;