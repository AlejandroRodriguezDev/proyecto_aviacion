// src/components/Post/LikeDislikeButtons.js
import React from 'react';
import styles from './LikeDislikeButtons.module.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const LikeDislikeButtons = ({
  likes,
  dislikes,
  onLike,
  onDislike,
  userVote = null, // 'like', 'dislike', or null
  itemId, // ID of the post or comment
  itemType = 'post', // 'post' or 'comment'
  disabled = false
}) => {

  const handleLikeClick = (e) => {
    e.preventDefault(); // Prevent link navigation if buttons are inside links
    e.stopPropagation();
    if (!disabled) onLike(itemId, itemType);
  };

  const handleDislikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) onDislike(itemId, itemType);
  };

  return (
    <div className={styles.voteContainer}>
      <button
        onClick={handleLikeClick}
        className={`${styles.voteButton} ${styles.likeButton} ${userVote === 'like' ? styles.active : ''}`}
        aria-pressed={userVote === 'like'}
        aria-label={`Like (${likes})`}
        title={`Like (${likes})`}
        disabled={disabled}
      >
        <FaArrowUp />
      </button>
      <span className={styles.voteCount} title="Puntuación neta">
        {likes - dislikes}
      </span>
      <button
        onClick={handleDislikeClick}
        className={`${styles.voteButton} ${styles.dislikeButton} ${userVote === 'dislike' ? styles.active : ''}`}
        aria-pressed={userVote === 'dislike'}
        aria-label={`Dislike (${dislikes})`}
        title={`Dislike (${dislikes})`}
        disabled={disabled}
      >
        <FaArrowDown />
      </button>
    </div>
  );
};

export default LikeDislikeButtons;