import React, { useState, useEffect, useCallback } from 'react';
import Button from '../Common/Button';
import styles from './AddFriendButton.module.css';
import { FaUserPlus, FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const FRIEND_STATUS = {
  NOT_FRIEND: 'not_friend',
  FRIEND: 'friend',
  SELF: 'self',
};

const AddFriendButton = ({ targetUserId, targetUsername, initialIsFriend }) => {
  const { user, isAuthenticated, checkAuthState } = useAuth();

  const getInitialStatus = () => {
    if (!isAuthenticated || !user) return FRIEND_STATUS.NOT_FRIEND;
    if (user.id === targetUserId) return FRIEND_STATUS.SELF;
    if (typeof initialIsFriend === 'boolean') {
        return initialIsFriend ? FRIEND_STATUS.FRIEND : FRIEND_STATUS.NOT_FRIEND;
    }
    return user.friends?.includes(targetUserId) ? FRIEND_STATUS.FRIEND : FRIEND_STATUS.NOT_FRIEND;
  };

  const [friendStatus, setFriendStatus] = useState(getInitialStatus);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFriendStatus(getInitialStatus());
  }, [isAuthenticated, user, targetUserId, initialIsFriend]);

  const handleClick = useCallback(async () => {
     if (!isAuthenticated || isLoading || friendStatus === FRIEND_STATUS.SELF || !user || !targetUserId || (!targetUsername && friendStatus !== FRIEND_STATUS.FRIEND)) {
       console.warn("AddFriend action prevented:", {isAuthenticated, isLoading, friendStatus, targetUserId, targetUsername});
       if(!targetUsername && friendStatus !== FRIEND_STATUS.FRIEND) alert("Error: Falta nombre de usuario para agregar.");
       return;
     }

     setIsLoading(true);
     let success = false;
     let nextStatus = friendStatus;

     try {
       if (friendStatus === FRIEND_STATUS.NOT_FRIEND && api.addFriend) {
         await api.addFriend(user.id, targetUsername);
         nextStatus = FRIEND_STATUS.FRIEND;
         success = true;
       } else if (friendStatus === FRIEND_STATUS.FRIEND && api.removeFriend) {
         await api.removeFriend(user.id, targetUsername);
         nextStatus = FRIEND_STATUS.NOT_FRIEND;
         success = true;
       }

       if (success) {
          setFriendStatus(nextStatus);
           if (checkAuthState) { checkAuthState(); }
       }

     } catch (error) {
       console.error("Friend action failed:", error);
       alert(`Error: ${error.message || 'No se pudo completar la acción.'}`);
     } finally {
       setIsLoading(false);
     }
  }, [isAuthenticated, isLoading, friendStatus, user, targetUserId, targetUsername, checkAuthState]);

  if (friendStatus === FRIEND_STATUS.SELF) {
    return null;
  }

   if (!isAuthenticated) {
       return null;
   }

   let buttonText, ButtonIcon, buttonVariant, buttonTitle, showRemoveIcon = false;

   switch (friendStatus) {
      case FRIEND_STATUS.FRIEND:
          buttonText = 'Amigos';
          ButtonIcon = FaUserCheck;
          buttonVariant = 'secondary';
          buttonTitle = 'Quitar amigo';
          showRemoveIcon = true;
          break;
       case FRIEND_STATUS.PENDING_SENT:
          buttonText = 'Enviada';
          ButtonIcon = FaUserClock;
          buttonVariant = 'secondary';
          buttonTitle = 'Cancelar solicitud';
          break;
       case FRIEND_STATUS.NOT_FRIEND:
       default:
          buttonText = 'Agregar';
          ButtonIcon = FaUserPlus;
          buttonVariant = 'primary';
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
        className={`${styles.friendButton} ${showRemoveIcon ? styles.hasHoverRemove : ''}`}
        title={buttonTitle}
        aria-label={buttonTitle}
      >
          <span className={styles.defaultIconWrapper}><ButtonIcon aria-hidden="true"/></span>
           {showRemoveIcon && <span className={styles.removeIconWrapper}><FaUserTimes aria-hidden="true"/></span>}
          <span className={styles.buttonText}>{buttonText}</span>
      </Button>
    );
};

export default AddFriendButton;
