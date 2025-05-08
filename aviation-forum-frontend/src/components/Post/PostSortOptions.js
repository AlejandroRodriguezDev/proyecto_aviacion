// src/components/Post/PostSortOptions.js
import React from 'react';
import styles from './PostSortOptions.module.css';
import { FaSortAmountDown, FaThumbsUp, FaClock, FaFire, FaCommentDots } from 'react-icons/fa';

const PostSortOptions = ({ currentSort, onSortChange, availableSorts = ['newest', 'likes'] }) => {

  const sortOptionsConfig = {
    'hot': { label: 'Populares', icon: <FaFire /> },
    'newest': { label: 'Más Nuevos', icon: <FaClock /> },
    'likes': { label: 'Más Votados', icon: <FaThumbsUp /> },
  };

  const optionsToRender = availableSorts
    .map(key => ({ value: key, ...sortOptionsConfig[key] }))
    .filter(option => option.label);

  if (optionsToRender.length === 0) {
       return null;
   }

  return (
    <div className={styles.sortContainer} role="toolbar" aria-label="Opciones para ordenar posts">
       <FaSortAmountDown className={styles.sortIcon} aria-hidden="true" />

        <div className={styles.optionsWrapper}>
          {optionsToRender.map(option => (
            <button
              key={option.value}
              onClick={() => currentSort !== option.value && onSortChange(option.value)}
              className={`${styles.sortButton} ${currentSort === option.value ? styles.active : ''}`}
              aria-pressed={currentSort === option.value}
              title={`Ordenar por ${option.label}`}
              disabled={currentSort === option.value}
            >
              {option.icon}
              <span className={styles.buttonLabel}>{option.label}</span>
            </button>
          ))}
        </div>
    </div>
  );
};

export default PostSortOptions;
