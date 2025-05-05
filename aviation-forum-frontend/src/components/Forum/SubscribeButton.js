// src/components/Forum/SubscribeButton.js
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../Common/Button';
import styles from './SubscribeButton.module.css';
import { FaCheckCircle, FaPlusCircle, FaSignInAlt } from 'react-icons/fa'; // Íconos
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api'; // Tu API simulada
import { useNavigate, useLocation } from 'react-router-dom';

const SubscribeButton = ({ forumId, isInitiallySubscribed, onSubscriptionChange }) => {
  const { user, isAuthenticated, checkAuthState } = useAuth(); // Añade checkAuthState para refrescar
  // Estado local para reflejar el estado de suscripción actual
  const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
  // Estado de carga específico para este botón
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Para guardar la ruta al redirigir a login

  // Actualiza el estado local si la prop inicial cambia (útil si los datos del foro se recargan)
  useEffect(() => {
    setIsSubscribed(isInitiallySubscribed);
  }, [isInitiallySubscribed]);

  // Función para manejar el click, usando useCallback para optimizar
  const handleClick = useCallback(async (e) => {
    e.preventDefault(); // Evita acciones por defecto (ej: si está dentro de un Link)
    e.stopPropagation(); // Evita que el evento se propague a elementos padre

    // Si no está autenticado, redirige a login guardando la ruta actual
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Validaciones: no hacer nada si ya está cargando, falta usuario o forumId
    if (isLoading || !user || !forumId || !api.subscribeToForum || !api.unsubscribeFromForum) {
        console.warn("Subscribe action prevented:", { isLoading, user, forumId });
        return;
    }

    setIsLoading(true); // Empieza a cargar
    const wasSubscribed = isSubscribed; // Guarda estado anterior para posible rollback
    const targetState = !wasSubscribed; // Estado al que queremos llegar
    const action = targetState ? api.subscribeToForum : api.unsubscribeFromForum; // Función API a llamar

    try {
      // --- Actualización Optimista de UI ---
      setIsSubscribed(targetState); // Cambia el estado local inmediatamente
      if (onSubscriptionChange) {
        onSubscriptionChange(targetState); // Notifica al componente padre del cambio
      }

      // --- Llamada a la API ---
      await action(user.id, forumId); // Tu API necesita userId

      // --- Opcional: Refrescar datos del usuario globalmente ---
       // Si la suscripción afecta algo en el objeto 'user' global (lista subscribedForums),
       // podríamos querer refrescar ese contexto para consistencia en toda la app.
       // if (checkAuthState) { await checkAuthState(); }

    } catch (error) {
      console.error("Subscription toggle failed:", error);
      // --- Rollback de UI en caso de error ---
      setIsSubscribed(wasSubscribed); // Vuelve al estado anterior
      if (onSubscriptionChange) {
        onSubscriptionChange(wasSubscribed); // Notifica al padre del rollback
      }
      // Muestra mensaje de error al usuario
      alert(`Error al ${targetState ? 'suscribirse' : 'desuscribirse'}: ${error.message || 'Inténtalo de nuevo.'}`);
    } finally {
      setIsLoading(false); // Termina la carga (éxito o error)
    }
  }, [
      isAuthenticated, isLoading, user, forumId, isSubscribed,
      onSubscriptionChange, navigate, location.pathname, checkAuthState
  ]); // Dependencias de useCallback


  // Si no está autenticado, muestra un botón diferente que redirige a login
  if (!isAuthenticated) {
     return (
        <Button
          onClick={handleClick} // Al clickear, el callback redirigirá a login
          variant="primary"    // Quizá primario para incitar al login? O secundario
          size="small"
          className={styles.subButton}
          title="Inicia sesión para suscribirte"
          aria-label="Inicia sesión para suscribirte a este foro"
         >
            <FaSignInAlt />
            <span className={styles.buttonText}>Suscribirse</span>
         </Button>
     );
  }

  // --- Renderizado del botón normal (suscrito o no) ---
  const variant = isSubscribed ? 'secondary' : 'primary'; // Estilo diferente si ya suscrito
  const Icon = isSubscribed ? FaCheckCircle : FaPlusCircle;
  const text = isSubscribed ? 'Suscrito' : 'Suscribirse';
  const title = isSubscribed ? 'Dejar de seguir este foro' : 'Seguir este foro';
  const ariaLabel = `${isSubscribed ? 'Desuscribirse de' : 'Suscribirse a'} este foro`;

  return (
    <Button
      onClick={handleClick}
      isLoading={isLoading}     // Pasa estado de carga
      disabled={isLoading}    // Deshabilita si está cargando
      variant={variant}
      size="small"
      className={styles.subButton}
      title={title}
      aria-label={ariaLabel}
    >
      <Icon aria-hidden="true" />
      <span className={styles.buttonText}>{text}</span>
    </Button>
  );
};

export default SubscribeButton;