// src/components/Forum/SubscribeButton.js
import React, { useState, useEffect } from 'react';
import Button from '../Common/Button';
import styles from './SubscribeButton.module.css';
import { FaCheckCircle, FaPlusCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const SubscribeButton = ({ forumId, isInitiallySubscribed, onSubscriptionChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(isInitiallySubscribed);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state if the initial prop changes (e.g., after parent component re-fetches data)
  useEffect(() => {
    setIsSubscribed(isInitiallySubscribed);
  }, [isInitiallySubscribed]);

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent potential parent link navigation
    e.stopPropagation();

    if (!isAuthenticated || isLoading) return;

    setIsLoading(true);
    try {
      if (isSubscribed) {
        // --- SIMULATED API Call ---
        await api.unsubscribeFromForum(user.id, forumId);
        setIsSubscribed(false);
        if (onSubscriptionChange) onSubscriptionChange(false); // Notify parent
      } else {
        // --- SIMULATED API Call ---
        await api.subscribeToForum(user.id, forumId);
        setIsSubscribed(true);
        if (onSubscriptionChange) onSubscriptionChange(true); // Notify parent
      }
    } catch (error) {
      console.error("Subscription toggle failed:", error);
      // TODO: Show error to user
      alert(`Error al ${isSubscribed ? 'desuscribirse' : 'suscribirse'}. Inténtalo de nuevo.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    // Optionally show a disabled button or hide it completely for non-logged-in users
    return null; // Or a disabled button: <Button disabled>Suscribirse</Button>
  }

  return (
    <Button
      onClick={handleClick}
      isLoading={isLoading}
      disabled={isLoading}
      variant={isSubscribed ? 'secondary' : 'primary'}
      size="small"
      className={styles.subButton}
      title={isSubscribed ? 'Dejar de seguir este foro' : 'Seguir este foro'}
    >
      {isSubscribed ? <FaCheckCircle /> : <FaPlusCircle />}
      <span className={styles.buttonText}>{isSubscribed ? 'Suscrito' : 'Suscribirse'}</span>
    </Button>
  );
};

export default SubscribeButton;