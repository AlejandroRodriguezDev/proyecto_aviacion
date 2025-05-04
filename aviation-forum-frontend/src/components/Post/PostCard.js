// src/components/Post/PostCard.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeDislikeButtons from './LikeDislikeButtons';
import styles from './PostCard.module.css';
import { useAuth } from '../../hooks/useAuth'; // Para verificar propietario/mod
import { api } from '../../services/api'; // Para simular votos
import { FaCommentAlt, FaTrash } from 'react-icons/fa'; // Icons
import Button from '../Common/Button'; // Para el botón de borrar

// Funcion auxiliar para formatear fechas (simple)
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `hace ${interval} año${interval > 1 ? 's' : ''}`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `hace ${interval} mes${interval > 1 ? 'es' : ''}`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `hace ${interval} día${interval > 1 ? 's' : ''}`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `hace ${interval} hora${interval > 1 ? 's' : ''}`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `hace ${interval} minuto${interval > 1 ? 's' : ''}`;
    return `hace ${Math.floor(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
}

const PostCard = ({ post, onPostDelete }) => {
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();

  // Estado local para simular votos y estado de voto del usuario
  // En una app real, esto vendría del API o de un estado global más complejo
  const [currentLikes, setCurrentLikes] = useState(post.likes);
  const [currentDislikes, setCurrentDislikes] = useState(post.dislikes);
  const [currentUserVote, setCurrentUserVote] = useState(null); // 'like', 'dislike', or null
  const [isDeleting, setIsDeleting] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  // Determinar si el usuario actual puede eliminar el post
  const canDelete = user && (post.user?.username === user.username || isModerator(post.forum?.id));

  const handleVote = async (itemId, itemType, voteType) => {
      if (voteLoading) return; // Prevent multiple clicks
      setVoteLoading(true);
      console.log(`Voting ${voteType} on ${itemType} ${itemId}`);
      try {
          // --- SIMULATED API Call ---
          const result = await api.votePost(itemId, user.id, voteType); // Assuming votePost exists in api.js
          setCurrentLikes(result.likes);
          setCurrentDislikes(result.dislikes);
          // Actualizar el estado de voto local (simplificado)
          if (voteType === 'like') {
              setCurrentUserVote(currentUserVote === 'like' ? null : 'like');
          } else if (voteType === 'dislike') {
              setCurrentUserVote(currentUserVote === 'dislike' ? null : 'dislike');
          }
      } catch (error) {
          console.error(`Failed to ${voteType} post:`, error);
          // TODO: Show error message to user
      } finally {
          setVoteLoading(false);
      }
  };

  const handleDelete = async (e) => {
      e.stopPropagation(); // Prevent card click navigation
      e.preventDefault();
      if (!canDelete || isDeleting) return;

      // TODO: Implementar un Modal de confirmación aquí
      const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.");
      if (confirmDelete) {
          setIsDeleting(true);
          try {
              // --- SIMULATED API Call ---
              await api.deletePost(post.id, user.id);
              console.log("Post deleted successfully (simulated)");
              if (onPostDelete) {
                  onPostDelete(post.id); // Notificar al componente padre (HomePage, ForumPage) para quitarlo de la lista
              } else {
                  // Si no hay callback, quizá navegar a otro sitio
                  navigate(`/forum/${post.forum.slug || post.forum.id}`);
              }
          } catch (error) {
              console.error("Failed to delete post:", error);
              alert("Error al eliminar el post. Inténtalo de nuevo."); // Simple alert
              setIsDeleting(false);
          }
          // No necesitamos setIsDeleting(false) si la eliminación tiene éxito y el componente se desmonta/navega
      }
  };

  // Evita errores si faltan datos (puede pasar durante la carga o si hay datos corruptos)
   if (!post || !post.user || !post.forum) {
    // Podrías mostrar un esqueleto de carga o un mensaje de error
    return <div className={`${styles.postCard} card ${styles.loadingState}`}>Cargando post...</div>;
   }

  return (
    <article className={`${styles.postCard} card`}>
      {/* Votos en el lateral (estilo Reddit clásico opcional) */}
      {/* <div className={styles.voteSidebar}> ... </div> */}

      <div className={styles.postContent}>
        <header className={styles.postHeader}>
          {post.forum && (
            <Link to={`/forum/${post.forum.slug || post.forum.id}`} className={styles.forumLink}>
              #{post.forum.name}
            </Link>
          )}
           <span className={styles.separator}>•</span>
          <span className={styles.userInfo}>
            Publicado por{' '}
            <Link to={`/user/${post.user.username}`} className={styles.userLink}>
              @{post.user.username}
            </Link>
          </span>
          <span className={styles.separator}>•</span>
          <time dateTime={post.createdAt} className={styles.postTime}>
            {timeAgo(post.createdAt)}
          </time>
        </header>

        <Link to={`/post/${post.id}`} className={styles.titleLink}>
          <h3 className={styles.postTitle}>{post.title}</h3>
        </Link>

        {/* Solo mostrar descripción en la tarjeta si es relevante para la vista de lista */}
        {/* <p className={styles.postDescription}>{post.description}</p> */}

        <footer className={styles.postFooter}>
          <LikeDislikeButtons
            likes={currentLikes}
            dislikes={currentDislikes}
            onLike={() => handleVote(post.id, 'post', 'like')}
            onDislike={() => handleVote(post.id, 'post', 'dislike')}
            userVote={currentUserVote} // TODO: Pasar el voto real del usuario
            itemId={post.id}
            itemType="post"
            disabled={voteLoading || !user} // Deshabilitar si no está logueado o cargando
          />
          <Link to={`/post/${post.id}#comments`} className={styles.commentsLink}>
            <FaCommentAlt />
            <span className={styles.commentText}>{post.commentCount ?? 0} Comentarios</span>
          </Link>

          {/* Botón de eliminar (condicional) */}
          {canDelete && (
            <Button
                onClick={handleDelete}
                variant="danger"
                size="small"
                isLoading={isDeleting}
                disabled={isDeleting}
                className={styles.deleteButton}
                title="Eliminar post"
            >
                 <FaTrash /> <span className={styles.deleteText}>Eliminar</span>
            </Button>
          )}
        </footer>
      </div>
    </article>
  );
};

export default PostCard;