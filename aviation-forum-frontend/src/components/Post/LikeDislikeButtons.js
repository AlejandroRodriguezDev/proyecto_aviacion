// src/components/Post/LikeDislikeButtons.js
import React from 'react';
import styles from './LikeDislikeButtons.module.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Button from '../Common/Button'; // Podríamos usar Button si queremos consistencia total

const LikeDislikeButtons = ({
  likes = 0,
  dislikes = 0,
  // Callbacks que serán llamados por el componente padre (PostCard, CommentCard)
  onLike,
  onDislike,
  userVote = null,   // Estado actual del voto del usuario: 'like', 'dislike', o null
  disabled = false,  // Si los botones deben estar deshabilitados (ej: no logueado)
  isLoading = false, // Si la acción de votar está en progreso
}) => {
  const netScore = likes - dislikes; // Calcula puntuación neta

  // Determina si los botones deben deshabilitarse
  const isDisabled = disabled || isLoading;

  // Manejadores de click que llaman a las props onLike/onDislike
  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Evita activar otros clicks (ej: Link del PostCard)
    if (!isDisabled && typeof onLike === 'function') {
      onLike(); // El padre se encarga de llamar a la API
    }
  };

  const handleDislikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled && typeof onDislike === 'function') {
      onDislike(); // El padre llama a la API
    }
  };

  return (
    <div className={styles.voteContainer} role="group" aria-label="Controles de votación">
      {/* Botón Like */}
      <button
        type="button"
        onClick={handleLikeClick}
         // Aplica clase 'active' si el voto es 'like'
        className={`${styles.voteButton} ${styles.likeButton} ${userVote === 'like' ? styles.active : ''} ${isLoading && userVote !== 'dislike' ? styles.loading : ''}`}
        disabled={isDisabled}
        aria-pressed={userVote === 'like'} // Accesibilidad: indica si está presionado
        aria-label={`Like (${likes.toLocaleString()})`} // Texto descriptivo
        title={`Like (${likes.toLocaleString()})`}    // Tooltip
      >
        {/* Mostrar spinner sólo si estamos cargando ESTE voto */}
        {isLoading && userVote !== 'dislike' ? <span className={styles.miniSpinner}></span> : <FaArrowUp aria-hidden="true"/>}
      </button>

      {/* Contador de Votos */}
      <span
         // Clases para colorear según puntuación
        className={`${styles.voteCount} ${netScore > 0 ? styles.positive : ''} ${netScore < 0 ? styles.negative : ''}`}
        title={`Puntuación: ${netScore.toLocaleString()}`} // Tooltip
        aria-live="polite" // Anuncia cambios en lectores de pantalla
      >
         {/* No mostrar spinner aquí, botones individuales lo indican */}
         {netScore.toLocaleString()}
      </span>

      {/* Botón Dislike */}
      <button
        type="button"
        onClick={handleDislikeClick}
        className={`${styles.voteButton} ${styles.dislikeButton} ${userVote === 'dislike' ? styles.active : ''} ${isLoading && userVote !== 'like' ? styles.loading : ''}`}
        disabled={isDisabled}
        aria-pressed={userVote === 'dislike'}
        aria-label={`Dislike (${dislikes.toLocaleString()})`}
        title={`Dislike (${dislikes.toLocaleString()})`}
      >
        {isLoading && userVote !== 'like' ? <span className={styles.miniSpinner}></span> : <FaArrowDown aria-hidden="true"/>}
      </button>
    </div>
  );
};

export default LikeDislikeButtons;