// src/components/Post/LikeDislikeButtons.js (SIN CAMBIOS)
import React from 'react';
import styles from './LikeDislikeButtons.module.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
// import Button from '../Common/Button'; // No lo usamos directamente aquí

const LikeDislikeButtons = ({
  likes = 0,
  dislikes = 0,
  onLike,
  onDislike,
  userVote = null,
  disabled = false,
  isLoading = false,
}) => {
  const netScore = likes - dislikes;
  const isDisabled = disabled || isLoading;

  const handleLikeClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isDisabled && typeof onLike === 'function') onLike();
  };

  const handleDislikeClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isDisabled && typeof onDislike === 'function') onDislike();
  };

  return (
    <div className={styles.voteContainer} role="group" aria-label="Controles de votación">
      <button
        type="button"
        onClick={handleLikeClick}
        className={`${styles.voteButton} ${styles.likeButton} ${userVote === 'like' ? styles.active : ''} ${isLoading && userVote !== 'dislike' ? styles.loading : ''}`}
        disabled={isDisabled}
        aria-pressed={userVote === 'like'}
        aria-label={`Like (${likes.toLocaleString()})`}
        title={`Like (${likes.toLocaleString()})`}
      >
        {isLoading && userVote !== 'dislike' ? <span className={styles.miniSpinner}></span> : <FaArrowUp aria-hidden="true"/>}
      </button>

      <span
        className={`${styles.voteCount} ${netScore > 0 ? styles.positive : ''} ${netScore < 0 ? styles.negative : ''}`}
        title={`Puntuación: ${netScore.toLocaleString()}`}
        aria-live="polite"
      >
        {isLoading ? <span className={styles.miniSpinner}></span> : netScore.toLocaleString()}
      </span>

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