// src/components/User/AddFriendButton.js
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../Common/Button';
import styles from './AddFriendButton.module.css';
import { FaUserPlus, FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa'; // Añadido UserTimes
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api'; // Tu API

// Estados de Amistad
const FRIEND_STATUS = {
  NOT_FRIEND: 'not_friend',
  FRIEND: 'friend',
  // PENDING_SENT: 'pending_sent', // Descomentar si implementas solicitudes
  SELF: 'self',
};

// Recibe ID del usuario objetivo y estado inicial de amistad (si se conoce)
const AddFriendButton = ({ targetUserId, targetUsername, initialIsFriend }) => {
  const { user, isAuthenticated, checkAuthState } = useAuth();

  // Estado inicial basado en si es el propio perfil o la prop inicial
  const getInitialStatus = () => {
    if (!isAuthenticated || !user) return FRIEND_STATUS.NOT_FRIEND;
    if (user.id === targetUserId) return FRIEND_STATUS.SELF;
    // Usar initialIsFriend si se proporciona y es booleano
    if (typeof initialIsFriend === 'boolean') {
        return initialIsFriend ? FRIEND_STATUS.FRIEND : FRIEND_STATUS.NOT_FRIEND;
    }
    // Fallback: revisar la lista de amigos del contexto (puede no estar 100% actualizada)
    return user.friends?.includes(targetUserId) ? FRIEND_STATUS.FRIEND : FRIEND_STATUS.NOT_FRIEND;
     // TODO: añadir lógica para PENDING si aplica
  };

  const [friendStatus, setFriendStatus] = useState(getInitialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Re-calcula el estado si cambian las props o el usuario logueado
  useEffect(() => {
    setFriendStatus(getInitialStatus());
  }, [isAuthenticated, user, targetUserId, initialIsFriend]);


  // Manejador del click
  const handleClick = useCallback(async () => {
     // No hacer nada si: no logueado, cargando, propio perfil, falta API, falta ID/Username
     if (!isAuthenticated || isLoading || friendStatus === FRIEND_STATUS.SELF || !user || !targetUserId || (!targetUsername && friendStatus !== FRIEND_STATUS.FRIEND) /* Username necesario si NO son amigos */ ) {
       console.warn("AddFriend action prevented:", {isAuthenticated, isLoading, friendStatus, targetUserId, targetUsername});
       if(!targetUsername && friendStatus !== FRIEND_STATUS.FRIEND) alert("Error: Falta nombre de usuario para agregar."); // Feedback
       return;
     }

     setIsLoading(true);
     let success = false;
     let nextStatus = friendStatus; // Estado esperado después de la acción

     try {
       if (friendStatus === FRIEND_STATUS.NOT_FRIEND && api.addFriend) {
         // Tu API necesita targetUsername para añadir
         await api.addFriend(user.id, targetUsername);
         nextStatus = FRIEND_STATUS.FRIEND; // O PENDING
         success = true;

       } else if (friendStatus === FRIEND_STATUS.FRIEND && api.removeFriend) {
          // Tu API necesita targetUsername para quitar
         await api.removeFriend(user.id, targetUsername);
         nextStatus = FRIEND_STATUS.NOT_FRIEND;
         success = true;
       }
        // TODO: Lógica para cancelar PENDING si existe

       if (success) {
          setFriendStatus(nextStatus); // Actualiza UI local
           // Refresca el estado del usuario en AuthContext para actualizar lista global de amigos
           if (checkAuthState) { checkAuthState(); }
       }

     } catch (error) {
       console.error("Friend action failed:", error);
       alert(`Error: ${error.message || 'No se pudo completar la acción.'}`);
        // Podrías querer revertir el estado visual aquí si falla, pero
        // checkAuthState() debería corregirlo eventualmente si se re-ejecuta.
     } finally {
       setIsLoading(false);
     }
  }, [isAuthenticated, isLoading, friendStatus, user, targetUserId, targetUsername, checkAuthState]);


  // --- Renderizado del Botón ---
  if (friendStatus === FRIEND_STATUS.SELF) {
    return null; // No mostrar en el propio perfil
  }
  // No mostrar si no está logueado? O mostrar un botón deshabilitado?
  // La lógica actual maneja esto en handleClick (redirige a login si no isAuthenticated)
  // Decidimos NO RENDERIZAR si no está logueado, para simplificar.
   if (!isAuthenticated) {
       // Podría ser un botón que lleve a login
       // return <Button size="small" onClick={() => navigate('/login')}>Ver Perfil</Button>;
       return null;
   }


   let buttonText, ButtonIcon, buttonVariant, buttonTitle, showRemoveIcon = false;

   switch (friendStatus) {
      case FRIEND_STATUS.FRIEND:
          buttonText = 'Amigos';
          ButtonIcon = FaUserCheck;
          buttonVariant = 'secondary'; // Ya son amigos -> botón secundario
          buttonTitle = 'Quitar amigo';
          showRemoveIcon = true; // Mostrar icono de quitar en hover
          break;
       case FRIEND_STATUS.PENDING_SENT: // Si implementas solicitudes
          buttonText = 'Enviada';
          ButtonIcon = FaUserClock;
          buttonVariant = 'secondary';
          buttonTitle = 'Cancelar solicitud';
          // Podrías deshabilitarlo si no implementas cancelación: disabled={true}
          break;
       case FRIEND_STATUS.NOT_FRIEND:
       default:
          buttonText = 'Agregar';
          ButtonIcon = FaUserPlus;
          buttonVariant = 'primary'; // Llamada a la acción primaria
          buttonTitle = 'Agregar amigo';
          break;
   }

  return (
      <Button
        onClick={handleClick}
        isLoading={isLoading}
        disabled={isLoading}
        variant={buttonVariant}
        size="small"
        className={`${styles.friendButton} ${showRemoveIcon ? styles.hasHoverRemove : ''}`} // Clase extra para hover
        title={buttonTitle}
        aria-label={buttonTitle} // Accesibilidad
      >
          <span className={styles.defaultIconWrapper}><ButtonIcon aria-hidden="true"/></span>
           {/* Icono 'Quitar' (se muestra en hover si showRemoveIcon es true) */}
           {showRemoveIcon && <span className={styles.removeIconWrapper}><FaUserTimes aria-hidden="true"/></span>}
          <span className={styles.buttonText}>{buttonText}</span>
      </Button>
    );
};

export default AddFriendButton;