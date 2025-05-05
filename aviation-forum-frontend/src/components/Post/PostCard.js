// src/components/Post/PostCard.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeDislikeButtons from './LikeDislikeButtons';
import styles from './PostCard.module.css';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api'; // TU API
import { FaCommentAlt, FaTrash, FaShareAlt, FaBookmark } from 'react-icons/fa'; // Iconos
import Button from '../Common/Button';
import { timeAgo } from '../../utils/helpers'; // Helper de tiempo

const PostCard = ({
    post,                  // Datos del post
    onPostDelete,          // Callback cuando se elimina el post
    // getVoteStatus       // Callback opcional para obtener voto inicial (si no se carga globalmente)
}) => {
  const { user, isModerator } = useAuth(); // Hook de autenticación
  const navigate = useNavigate();

  // Estados locales para reflejar interacciones UI
  const [currentLikes, setCurrentLikes] = useState(post?.likes ?? 0);
  const [currentDislikes, setCurrentDislikes] = useState(post?.dislikes ?? 0);
  const [currentUserVote, setCurrentUserVote] = useState(null); // 'like', 'dislike', null
  const [voteLoading, setVoteLoading] = useState(false); // Cargando voto
  const [isDeleting, setIsDeleting] = useState(false); // Cargando borrado
  const [isBookmarked, setIsBookmarked] = useState(false); // Estado de guardado

  // Obtener estado inicial del voto y bookmark (simulado/placeholder)
  useEffect(() => {
    // Simulación: en una app real, obtendrías esto de la API o estado global
    // Ejemplo con función opcional pasada como prop:
    // if (getVoteStatus && user && post) {
    //   getVoteStatus(post.id, 'post').then(status => setCurrentUserVote(status));
    // }
    // Simulación de carga de estado de bookmark (no implementado en tu API mock)
    // setIsBookmarked(checkIfBookmarked(post.id));
  }, [post?.id, user/*, getVoteStatus*/]); // Dependencias

  // Determina si el usuario puede borrar (Dueño o Moderador)
  const canDelete = useMemo(() => {
    if (!user || !post) return false;
    // Tu API usa `post.userId` y `forum.creator`
    const isOwner = post.userId === user.id;
    // isModerator viene de AuthContext y usa tu lógica de API
    const isMod = post.forum?.id ? isModerator(post.forum.id) : false;
    return isOwner || isMod;
  }, [user, post, isModerator]);


  // --- Manejadores de Acciones ---

  // Votar (Like o Dislike)
  const handleVote = async (voteType) => {
     if (voteLoading || !user || !post || !api.votePost) return;
     setVoteLoading(true);
     const previousVote = currentUserVote; // Guarda estado anterior

      // Actualización optimista (mejora percepción de velocidad)
      let optimisticVote = null;
      let optimisticLikes = currentLikes;
      let optimisticDislikes = currentDislikes;

      if (voteType === 'like') {
          if (previousVote === 'like') { // Quitar Like
              optimisticLikes--;
              optimisticVote = null;
          } else { // Dar Like (o cambiar de dislike a like)
              optimisticLikes++;
              if (previousVote === 'dislike') optimisticDislikes--;
              optimisticVote = 'like';
          }
      } else { // voteType === 'dislike'
          if (previousVote === 'dislike') { // Quitar Dislike
              optimisticDislikes--;
              optimisticVote = null;
          } else { // Dar Dislike (o cambiar de like a dislike)
              optimisticDislikes++;
              if (previousVote === 'like') optimisticLikes--;
              optimisticVote = 'dislike';
          }
      }
      setCurrentLikes(optimisticLikes);
      setCurrentDislikes(optimisticDislikes);
      setCurrentUserVote(optimisticVote);


     try {
       // Llama a tu API (postId, userId, voteType)
       const result = await api.votePost(post.id, user.id, voteType);
       // Actualiza con los datos definitivos de la API (más seguro)
       setCurrentLikes(result.likes);
       setCurrentDislikes(result.dislikes);
       // Podrías incluso obtener el voto del usuario desde la respuesta si la API lo soporta
     } catch (error) {
       console.error(`Error voting ${voteType} on post ${post.id}:`, error);
        // --- Rollback en caso de error ---
        setCurrentLikes(post.likes); // Revierte a los datos originales del post
        setCurrentDislikes(post.dislikes);
        setCurrentUserVote(previousVote);
        alert(`Error al votar: ${error.message || 'Intenta de nuevo.'}`);
     } finally {
       setVoteLoading(false); // Termina la carga
     }
  };

  // Borrar Post
  const handleDelete = async (e) => {
      e.preventDefault(); e.stopPropagation(); // Evita clicks accidentales
      if (!canDelete || isDeleting || !api.deletePost) return;
      const confirmMsg = "Eliminar este post es permanente y también borrará sus comentarios. ¿Continuar?";
      if (window.confirm(confirmMsg)) {
          setIsDeleting(true);
          try {
              await api.deletePost(post.id, user.id); // Tu API necesita postId y userId
               // Notifica al componente padre para que lo quite de la lista
               if (onPostDelete) onPostDelete(post.id);
                // No necesitamos setError(false) aquí, el componente desaparecerá
          } catch (error) {
               console.error(`Error deleting post ${post.id}:`, error);
               alert(`Error al eliminar: ${error.message || 'Intenta de nuevo.'}`);
               setIsDeleting(false); // Permite reintentar si falla
          }
      }
  };

  // Compartir Post (Simple: copia link o usa Web Share API)
  const handleShare = (e) => {
      e.preventDefault(); e.stopPropagation();
       const postUrl = `${window.location.origin}/post/${post.id}`;
       const postTitle = post.title || "Post de AeroForum";
      if (navigator.share) {
           navigator.share({ title: postTitle, text: `Echa un vistazo: ${postTitle}`, url: postUrl })
             .then(() => console.log('Compartido!'))
             .catch((error) => console.warn('Error al compartir:', error));
       } else { // Fallback: copiar al portapapeles
           navigator.clipboard.writeText(postUrl).then(() => {
                alert('¡Enlace copiado!');
           }, (err) => {
               console.error('Error al copiar enlace:', err);
               alert('No se pudo copiar el enlace.');
           });
      }
  };

  // Guardar/Quitar Bookmark (Simulado)
  const handleBookmark = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!user) { alert("Inicia sesión para guardar posts."); return; } // Requiere login
       // TODO: Implementar llamada a API (ej: api.toggleBookmark(post.id, user.id))
       setIsBookmarked(prev => !prev); // Actualización optimista
       console.log("Bookmark toggled (simulated)");
       alert(`Post ${!isBookmarked ? 'guardado' : 'quitado'} (simulado).`);
  };


  // --- Renderizado ---
   // Renderiza un placeholder si faltan datos esenciales
   if (!post || !post.id || !post.title || !post.user || !post.forum) {
     return <article className={`${styles.postCard} ${styles.loadingState} card`}>Cargando...</article>;
   }

   // Destructuración para facilitar lectura
   const { user: postUser, forum: postForum } = post;

   return (
     // Usa clase base 'card'
     <article className={`${styles.postCard} card`}>
       {/* Contenido Principal del Post */}
       <div className={styles.postContent}>
         {/* Cabecera: Foro, Usuario, Tiempo */}
         <header className={styles.postHeader}>
           {postForum.name && ( // Muestra foro si existe
              <Link to={`/forum/${postForum.slug || postForum.id}`} className={styles.forumLink}>
                 #{postForum.name}
             </Link>
            )}
           {postForum.name && <span className={styles.separator}>•</span>} {/* Separador */}

            {postUser.username && ( // Muestra usuario si existe
               <span className={styles.userInfo}>
                por{' '}
                <Link to={`/user/${postUser.username}`} className={styles.userLink}>
                     {/* Avatar Pequeño */}
                     <span className={`${styles.avatarPostCard} avatar-placeholder`}>
                        {postUser.avatarUrl ? <img src={postUser.avatarUrl} alt="" /> : postUser.username.charAt(0).toUpperCase()}
                     </span>
                     @{postUser.username}
                 </Link>
               </span>
             )}
            {postUser.username && <span className={styles.separator}>•</span>}

             {/* Tiempo (Link al Post) */}
            <Link to={`/post/${post.id}`} className={styles.timeLink} title={new Date(post.createdAt).toLocaleString()}>
              <time dateTime={post.createdAt} className={styles.postTime}>
                {timeAgo(post.createdAt)}
              </time>
            </Link>
         </header>

         {/* Título (Link al Post) */}
         <Link to={`/post/${post.id}`} className={styles.titleLink}>
           <h3 className={styles.postTitle}>{post.title}</h3>
         </Link>

         {/* Opcional: Mostrar snippet de descripción
         <p className={styles.postDescription}>
            {post.description?.substring(0, 150)}{post.description?.length > 150 ? '...' : ''}
         </p>
         */}

         {/* Pie: Acciones */}
         <footer className={styles.postFooter}>
            {/* Votos */}
            <LikeDislikeButtons
                likes={currentLikes}
                dislikes={currentDislikes}
                onLike={() => handleVote('like')}
                onDislike={() => handleVote('dislike')}
                userVote={currentUserVote}
                disabled={!user} // Deshabilita si no está logueado
                isLoading={voteLoading}
            />

            {/* Link a Comentarios */}
            <Link to={`/post/${post.id}#comments`} className={`${styles.actionButton} ${styles.commentsLink}`} aria-label={`${post.commentCount ?? 0} comentarios`}>
               <FaCommentAlt aria-hidden="true"/>
                <span className={styles.actionText}>{post.commentCount ?? 0}</span>
               <span className={styles.actionLabel}>Comentarios</span>
            </Link>

             {/* Botón Compartir */}
             <Button onClick={handleShare} variant="link" size="small" className={styles.actionButton} title="Compartir post" aria-label="Compartir post">
                 <FaShareAlt aria-hidden="true"/>
                 <span className={styles.actionLabel}>Compartir</span>
             </Button>

             {/* Botón Guardar */}
             {user && ( // Solo mostrar si logueado
                <Button
                     onClick={handleBookmark}
                     variant="link"
                     size="small"
                     className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`}
                     title={isBookmarked ? 'Quitar guardado' : 'Guardar post'}
                     aria-pressed={isBookmarked}
                     aria-label={isBookmarked ? 'Quitar post de guardados' : 'Guardar post'}
                 >
                     <FaBookmark aria-hidden="true"/>
                      <span className={styles.actionLabel}>{isBookmarked ? 'Guardado' : 'Guardar'}</span>
                 </Button>
             )}

             {/* Botón Eliminar (si aplica) */}
             {canDelete && (
                <Button
                    onClick={handleDelete}
                    variant="link"
                    size="small"
                     className={`${styles.actionButton} ${styles.deleteButton}`}
                    isLoading={isDeleting}
                    disabled={isDeleting}
                     title="Eliminar post"
                    aria-label="Eliminar este post"
                 >
                     <FaTrash aria-hidden="true"/>
                      <span className={`${styles.actionLabel} ${styles.deleteText}`}>Eliminar</span>
                </Button>
             )}
         </footer>
       </div> {/* Fin .postContent */}
     </article>
   );
};

export default PostCard;