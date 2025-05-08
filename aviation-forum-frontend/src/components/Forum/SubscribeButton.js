import React, { useState, useEffect, useCallback } from 'react';
import Button from '../Common/Button';
import styles from './SubscribeButton.module.css';
import { FaCheckCircle, FaPlusCircle, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const SubscribeButton = ({ forumId, isInitiallySubscribed, onSubscriptionChange }) => {
  const { user, isAuthenticated, checkAuthState } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSubscribed(isInitiallySubscribed);
  }, [isInitiallySubscribed]);

  const handleClick = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (isLoading || !user || !forumId || !api.subscribeToForum || !api.unsubscribeFromForum) {
        console.warn("Subscribe action prevented:", { isLoading, user, forumId });
        return;
    }

    setIsLoading(true);
    const wasSubscribed = isSubscribed;
    const targetState = !wasSubscribed;
    const action = targetState ? api.subscribeToForum : api.unsubscribeFromForum;

    try {
      setIsSubscribed(targetState);
      if (onSubscriptionChange) {
        onSubscriptionChange(targetState);
      }

      await action(user.id, forumId);
    } catch (error) {
      console.error("Subscription toggle failed:", error);
      setIsSubscribed(wasSubscribed);
      if (onSubscriptionChange) {
        onSubscriptionChange(wasSubscribed);
      }
      alert(`Error al ${targetState ? 'suscribirse' : 'desuscribirse'}: ${error.message || 'Inténtalo de nuevo.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [
      isAuthenticated, isLoading, user, forumId, isSubscribed,
      onSubscriptionChange, navigate, location.pathname, checkAuthState
  ]);

  if (!isAuthenticated) {
     return (
        <Button
          onClick={handleClick}
          variant="primary"
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

  const variant = isSubscribed ? 'secondary' : 'primary';
  const Icon = isSubscribed ? FaCheckCircle : FaPlusCircle;
  const text = isSubscribed ? 'Suscrito' : 'Suscribirse';
  const title = isSubscribed ? 'Dejar de seguir este foro' : 'Seguir este foro';
  const ariaLabel = `${isSubscribed ? 'Desuscribirse de' : 'Suscribirse a'} este foro`;

  return (
    <Button
      onClick={handleClick}
      isLoading={isLoading}
      disabled={isLoading}
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
