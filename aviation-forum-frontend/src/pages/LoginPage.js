// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react'; // Añadido useState, useEffect
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import OAuthButtons from '../components/Auth/OAuthbuttons';
import { useAuth } from '../hooks/useAuth';
import styles from './PageStyles.module.css'; // Estilos comunes Auth
import LoadingSpinner from '../components/Common/LoadingSpinner';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Obtén funciones y estado del contexto de autenticación
    const { login, loginWithGoogle, loginWithFacebook, isAuthenticated, loading: authLoading } = useAuth();
    // Estado local para errores de esta página y carga de la acción
    const [pageError, setPageError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Redirige si ya está autenticado (después de que el contexto termine de cargar)
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const from = location.state?.from?.pathname || "/home"; // Redirige a donde iba o a home
             console.log(`Already authenticated, redirecting to ${from}`);
             navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location.state]);

    // Manejador para el formulario de login
    const handleLoginSubmit = async (credentials) => {
        setPageError('');   // Limpia errores anteriores
        setActionLoading(true); // Inicia estado de carga de la acción
        try {
            await login(credentials.email, credentials.password);
             // La redirección ocurrirá en el useEffect cuando isAuthenticated cambie
             // navigate('/home'); // No redirigir aquí directamente
        } catch (err) {
             console.error("Login failed:", err);
             // Establece el error de la página para pasarlo al LoginForm
             setPageError(err.message || 'Error de inicio de sesión. Verifica credenciales.');
             setActionLoading(false); // Detiene la carga solo si hay error
        }
         // No setActionLoading(false) en caso de éxito, dejamos que useEffect maneje el flujo
    };

    // Manejador genérico para OAuth (Google, Facebook)
    const handleOAuthLogin = async (oauthFunction, providerName) => {
        setPageError('');
        setActionLoading(true);
        try {
             await oauthFunction();
             // Redirección manejada por useEffect
        } catch(err) {
            console.error(`OAuth Login (${providerName}) failed:`, err);
            setPageError(`Error con ${providerName}: ${err.message || 'Intenta de nuevo.'}`);
            setActionLoading(false); // Detiene carga en error
        }
    };

    // --- Renderizado ---

    // Muestra loader si el contexto de autenticación aún está cargando
    if (authLoading) {
        return (
             <div className={styles.authContainer} style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <LoadingSpinner size="50px" />
             </div>
         );
    }

    // Muestra el formulario de login si el contexto ya cargó
    return (
        <div className={styles.authContainer}>
            <h2>Iniciar Sesión en AeroForum</h2>
            {/* Pasa la función de submit, el estado de carga de acción, y el error */}
            <LoginForm
                onSubmit={handleLoginSubmit}
                loading={actionLoading}
                apiError={pageError}
             />
             {/* Separador */}
             <hr className={styles.divider} />
              {/* Botones OAuth */}
             <OAuthButtons
                 onGoogleLogin={() => handleOAuthLogin(loginWithGoogle, 'Google')}
                 onFacebookLogin={() => handleOAuthLogin(loginWithFacebook, 'Facebook')}
                 loading={actionLoading} // Deshabilitados mientras carga login normal o OAuth
             />
              {/* Enlace a Registro */}
             <p className={styles.switchAuth}>
                ¿Nuevo en AeroForum? <Link to="/register">Crea una cuenta aquí</Link>
             </p>
        </div>
    );
};

export default LoginPage;