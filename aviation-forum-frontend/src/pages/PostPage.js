// src/pages/PostPage.js
import React from 'react';
import PostDetail from '../components/Post/PostDetail'; // Importa el componente principal
import styles from './PostPage.module.css'; // Estilos específicos si los necesitas

const PostPage = () => {
  // El componente PostDetail se encargará de obtener el ID del post
  // de los parámetros de la URL y de cargar todos los datos necesarios.
  return (
    <div className={styles.postPageContainer}>
      <PostDetail />
    </div>
  );
};

export default PostPage;