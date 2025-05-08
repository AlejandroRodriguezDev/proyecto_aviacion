import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import OAuthButtons from '../components/Auth/OAuthbuttons';
import { useAuth } from '../hooks/useAuth';
import styles from './PageStyles.module.css';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle, loginWithFacebook, isAuthenticated, loading: authLoading } = useAuth();
    const [pageError, setPageError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const from = location.state?.from?.pathname || "/home";
            console.log(`Already authenticated, redirecting to ${from}`);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location.state]);

    const handleLoginSubmit = async (credentials) => {
        setPageError('');
        setActionLoading(true);
        try {
            await login(credentials.email, credentials.password);
        } catch (err) {
            console.error("Login failed:", err);
            setPageError(err.message || 'Error de inicio de sesión. Verifica credenciales.');
            setActionLoading(false);
        }
    };

    const handleOAuthLogin = async (oauthFunction, providerName) => {
        setPageError('');
        setActionLoading(true);
        try {
            await oauthFunction();
        } catch(err) {
            console.error(`OAuth Login (${providerName}) failed:`, err);
            setPageError(`Error con ${providerName}: ${err.message || 'Intenta de nuevo.'}`);
            setActionLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.authContainer} style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner size="50px" />
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <h2>Iniciar Sesión en AeroForum</h2>
            <LoginForm
                onSubmit={handleLoginSubmit}
                loading={actionLoading}
                apiError={pageError}
            />
            <hr className={styles.divider} />
            <OAuthButtons
                onGoogleLogin={() => handleOAuthLogin(loginWithGoogle, 'Google')}
                onFacebookLogin={() => handleOAuthLogin(loginWithFacebook, 'Facebook')}
                loading={actionLoading}
            />
            <p className={styles.switchAuth}>
                ¿Nuevo en AeroForum? <Link to="/register">Crea una cuenta aquí</Link>
            </p>
        </div>
    );
};

export default LoginPage;
