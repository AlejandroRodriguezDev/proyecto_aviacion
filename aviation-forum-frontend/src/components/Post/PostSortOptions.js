// src/components/Post/PostSortOptions.js
import React from 'react';
import styles from './PostSortOptions.module.css';
// Iconos para diferentes tipos de ordenación
import { FaSortAmountDown, FaThumbsUp, FaClock, FaFire, FaCommentDots } from 'react-icons/fa';

// availableSorts: un array de strings con las claves de las opciones disponibles (ej: ['newest', 'likes'])
const PostSortOptions = ({ currentSort, onSortChange, availableSorts = ['newest', 'likes'] }) => {

  // Mapeo de claves de ordenación a etiquetas e iconos para UI
  const sortOptionsConfig = {
    // Clave : { Etiqueta, Icono }
     'hot': { label: 'Populares', icon: <FaFire /> }, // Orden "Hot" (algoritmo tipo Reddit)
    'newest': { label: 'Más Nuevos', icon: <FaClock /> }, // Por fecha descendente
    'likes': { label: 'Más Votados', icon: <FaThumbsUp /> }, // Por (likes - dislikes) descendente
     // 'comments': { label: 'Más Comentados', icon: <FaCommentDots /> }, // Opcional: por número de comentarios
     // 'oldest': { label: 'Más Antiguos', icon: <FaClock transform="scale(-1, 1)"/> }, // Opcional
  };

   // Filtra las opciones de configuración basadas en las claves disponibles pasadas por props
  const optionsToRender = availableSorts
    .map(key => ({ value: key, ...sortOptionsConfig[key] })) // Combina clave con config
    .filter(option => option.label); // Asegura que solo se rendericen las que tienen configuración válida

   // No renderizar nada si no hay opciones válidas
   if (optionsToRender.length === 0) {
       return null;
   }

  return (
    // Contenedor principal de las opciones de ordenación
    <div className={styles.sortContainer} role="toolbar" aria-label="Opciones para ordenar posts">
       <FaSortAmountDown className={styles.sortIcon} aria-hidden="true" /> {/* Icono general de ordenación */}

       {/* Wrapper para los botones de opción */}
        <div className={styles.optionsWrapper}>
          {optionsToRender.map(option => (
            // Cada opción es un botón
            <button
              key={option.value}
              // Role "tab" es una alternativa semántica si se ve como pestañas
              // role="tab" aria-selected={currentSort === option.value}
               // O mantenerlo simple sin role complejo si es solo botones
               onClick={() => currentSort !== option.value && onSortChange(option.value)} // Llama a onSortChange solo si el valor es diferente
              className={`${styles.sortButton} ${currentSort === option.value ? styles.active : ''}`} // Clase activa
              aria-pressed={currentSort === option.value} // Indica cuál está presionado
              title={`Ordenar por ${option.label}`} // Tooltip
              disabled={currentSort === option.value} // Deshabilita el botón activo
            >
               {/* Renderiza el icono y la etiqueta */}
              {option.icon}
              <span className={styles.buttonLabel}>{option.label}</span>
            </button>
          ))}
        </div>
    </div>
  );
};

export default PostSortOptions;