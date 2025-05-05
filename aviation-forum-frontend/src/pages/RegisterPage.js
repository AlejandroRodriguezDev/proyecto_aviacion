// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react'; // Añadido useEffect
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Añadido useLocation
import RegisterForm from '../components/Auth/RegisterForm';
import OAuthButtons from '../components/Auth/OAuthbuttons'; // Opcional para registro OAuth
import { useAuth } from '../hooks/useAuth';
import styles from './PageStyles.module.css'; // Estilos comunes
import LoadingSpinner from '../components/Common/LoadingSpinner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle, loginWithFacebook, isAuthenticated, loading: authLoading } = useAuth();
  const [pageError, setPageError] = useState('');         // Error específico de la página/API
  const [actionLoading, setActionLoading] = useState(false); // Carga de la acción (registro/OAuth)
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // Estado de éxito

  // Redirigir si ya está logueado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
       const from = location.state?.from?.pathname || "/home";
       navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location.state]);

  // Manejador del formulario de registro
  const handleRegisterSubmit = async (userData) => {
    setPageError('');
    setActionLoading(true);
    setRegistrationSuccess(false); // Resetea éxito al intentar de nuevo

    try {
      const result = await register(userData); // Llama a la función del contexto
       if (result.success) {
           setRegistrationSuccess(true); // Muestra mensaje de éxito
            // No limpiamos el formulario, el mensaje de éxito lo reemplaza
            setActionLoading(false); // Para el loader, ya terminó la acción
            // Podrías redirigir a login después de un delay:
            // setTimeout(() => navigate('/login'), 3000);
       } else {
           // Si la API no lanza error pero devuelve success: false (menos común)
            setPageError('Ocurrió un error inesperado durante el registro.');
             setActionLoading(false);
       }
    } catch (err) {
      console.error("Registration failed:", err);
      setPageError(err.message || 'Error al crear la cuenta. Intenta con otro usuario o correo.');
       setActionLoading(false); // Para el loader en error
    }
  };

  // --- Manejadores OAuth (SIMULADOS - Necesitan integración real) ---
   const handleOAuthRegister = async (oauthFunction, providerName) => {
        setPageError('');
        setActionLoading(true);
        try {
             // Asume que la función OAuth también crea cuenta si no existe y loguea
            await oauthFunction();
            // Si tiene éxito, el useEffect detectará isAuthenticated y redirigirá
        } catch (err) {
             console.error(`OAuth Registration (${providerName}) failed:`, err);
             setPageError(`Error con ${providerName}: ${err.message || 'Intenta de nuevo.'}`);
              setActionLoading(false);
        }
   };


   // Renderizado condicional mientras carga el contexto
    if (authLoading) {
       return (
             <div className={styles.authContainer} style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner size="50px" />
             </div>
        );
    }

  return (
    <div className={styles.authContainer}>
      <h2>Crear Cuenta en AeroForum</h2>

       {/* Muestra mensaje de éxito o el formulario */}
      {registrationSuccess ? (
        <div className={styles.successMessage}>
            ¡Cuenta creada con éxito! 🎉<br />
            Ya puedes <Link to="/login">iniciar sesión</Link>.
        </div>
      ) : (
        <> {/* Fragmento para agrupar formulario y otros elementos */}
          <RegisterForm
             onSubmit={handleRegisterSubmit}
             loading={actionLoading}
             apiError={pageError}
           />

          {/* Separador y Opcional: OAuth */}
          {/* <hr className={styles.divider} /> */}
          {/* <p className={styles.textMuted}>O regístrate usando:</p> */} {/* Texto Guía Opcional */}
          {/* <OAuthButtons
               onGoogleLogin={() => handleOAuthRegister(loginWithGoogle, 'Google')}
               onFacebookLogin={() => handleOAuthRegister(loginWithFacebook, 'Facebook')}
               loading={actionLoading} // Reusa el estado de carga
           /> */}

            {/* Enlace a Login */}
          <p className={styles.switchAuth}>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default RegisterPage;