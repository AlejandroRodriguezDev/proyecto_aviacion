// src/pages/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Para links
import PostCard from '../components/Post/PostCard'; // Componente Post
import ForumCard from '../components/Forum/ForumCard'; // Componente Forum
import { api } from '../services/api'; // Tu API simulada
import { useAuth } from '../hooks/useAuth'; // Para obtener datos del usuario
import styles from './HomePage.module.css'; // Estilos específicos
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Indicador de carga
import Button from '../components/Common/Button'; // Opcional: para Crear Post

const HomePage = () => {
  const { user } = useAuth(); // Obtiene el usuario logueado
  const [feedPosts, setFeedPosts] = useState([]); // Estado para los posts del feed
  const [recommendedForums, setRecommendedForums] = useState([]); // Estado para foros recomendados
  const [loadingFeed, setLoadingFeed] = useState(true); // Estado de carga para el feed
  const [loadingRecs, setLoadingRecs] = useState(true); // Estado de carga para recomendaciones
  const [error, setError] = useState(''); // Estado para mensajes de error

  // Función para cargar el feed principal
  const fetchFeed = useCallback(async () => {
    if (user && api.getHomeFeed) { // Solo carga si está logueado y la función API existe
      setLoadingFeed(true);
      setError('');
      try {
        const posts = await api.getHomeFeed(user.id); // Llama a tu API con el userId
        setFeedPosts(posts || []); // Asegura que sea un array
      } catch (err) {
        console.error("Error fetching home feed:", err);
        setError('No se pudo cargar tu feed. Inténtalo de nuevo.');
        setFeedPosts([]); // Limpia posts en caso de error
      } finally {
        setLoadingFeed(false);
      }
    } else {
      setFeedPosts([]); // Limpia el feed si no está logueado
      setLoadingFeed(false); // No está cargando si no hay usuario
    }
  }, [user]); // Depende del usuario

  // Función para cargar los foros recomendados
  const fetchRecommendations = useCallback(async () => {
    if (api.getRecommendedForums) { // Llama siempre (o basado en 'user' si quieres recs personalizadas)
      setLoadingRecs(true);
      try {
        const forums = await api.getRecommendedForums(user?.id); // Pasa userId opcionalmente
        setRecommendedForums(forums || []);
      } catch (err) {
        console.error("Error fetching recommended forums:", err);
        // No mostrar error crítico si solo fallan las recomendaciones
        setRecommendedForums([]);
      } finally {
        setLoadingRecs(false);
      }
    }
  }, [user?.id]); // Depende opcionalmente del usuario

  // Ejecuta las cargas iniciales
  useEffect(() => {
    fetchFeed();
    fetchRecommendations();
  }, [fetchFeed, fetchRecommendations]); // Ejecuta cuando las funciones cambian (o al montar)

  // Callback para eliminar un post de la lista localmente
  const handlePostDeleted = useCallback((deletedPostId) => {
    setFeedPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  }, []);

   // Función placeholder para obtener el estado de voto inicial (podría ser más compleja)
   const getVoteStatusCallback = useCallback(async (itemId, itemType) => {
        if (user && api.getUserVote) { // Asumiendo que existe api.getUserVote
            try {
                const voteData = await api.getUserVote(user.id, itemId, itemType);
                return voteData?.voteType; // Devuelve 'like', 'dislike' o null
            } catch { return null; }
        }
       return null;
   }, [user]);


  // --- Renderizado ---

  // Estado de carga principal (solo al inicio)
   if (loadingFeed && feedPosts.length === 0 && !error) {
       return <LoadingSpinner center={true} size="60px" />;
   }

  return (
    <div className={styles.homeLayout}>
      {/* Columna Principal: Feed */}
      <div className={styles.feedContainer}>
        {/* Opcional: Botón rápido para crear post */}
        {/* {user && (
            <div className={styles.quickPostCreator}>
                <Link to="/submit"> <Button>Crear Post</Button> </Link>
            </div>
         )} */}

        <h2>Tu Feed Principal</h2>

         {/* Muestra error si ocurrió al cargar el feed */}
         {error && <p className={styles.errorMessage}>{error}</p>}

          {/* Muestra loader si está recargando y ya había posts */}
          {loadingFeed && feedPosts.length > 0 && <LoadingSpinner />}

         {/* Mensaje si el feed está vacío y no está cargando ni hubo error */}
         {!loadingFeed && feedPosts.length === 0 && !error && (
           <div className={styles.emptyFeedMessage}>
              <p>Tu feed está algo vacío...</p>
              <p>Explora <Link to="/forums">nuevos foros</Link> o busca <Link to="/search">usuarios</Link> para seguir.</p>
           </div>
         )}

          {/* Lista de Posts */}
          {feedPosts.map(post => (
            <PostCard
               key={post.id}
               post={post}
               onPostDelete={handlePostDeleted} // Pasar callback de borrado
               getVoteStatus={getVoteStatusCallback} // Pasar función para obtener voto
             />
          ))}
      </div>

      {/* Barra Lateral: Recomendaciones */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <h2>Foros Recomendados</h2>
           {loadingRecs ? (
              <LoadingSpinner />
           ) : recommendedForums.length > 0 ? (
             recommendedForums.map(forum => (
                // Usa la variante 'recommendation' de ForumCard
                <ForumCard key={forum.id} forum={forum} variant="recommendation" />
              ))
           ) : (
             <p className={styles.noRecommendations}>No hay recomendaciones por ahora.</p>
           )}
        </div>
        {/* Otras secciones posibles: Usuarios activos, posts populares, etc. */}
      </aside>
    </div>
  );
};

export default HomePage;