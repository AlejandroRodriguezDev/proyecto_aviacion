// src/components/Post/PostDetail.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // ok
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'; // ok
// Revisar estas importaciones:
import LikeDislikeButtons from './LikeDislikeButtons'; // SIN llaves {}
import CommentList from '../Comment/CommentList';     // SIN llaves {}, path correcto? (../Comment/)
import CommentForm from '../Comment/CommentForm';     // SIN llaves {}, path correcto? (../Comment/)
import LoadingSpinner from '../Common/LoadingSpinner';// SIN llaves {}, path correcto? (../Common/)
import Button from '../Common/Button';                // SIN llaves {}, path correcto? (../Common/)
import styles from './PostDetail.module.css';        // ok
import { useAuth } from '../../hooks/useAuth';          // ok (export nombrado)
import { api } from '../../services/api';               // ok (export nombrado)
import { timeAgo } from '../../utils/helpers';          // ok (export nombrado)
import { FaTrash, FaComments, /* FaShareAlt, FaBookmark,*/ FaArrowLeft } from 'react-icons/fa'; // ok (exports nombrados)
// Opcional: Para renderizar Markdown de forma segura
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm'; // Plugin para tablas, etc.

const PostDetail = () => {
  const { postId } = useParams(); // Obtiene el ID del post de la URL
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Para el botón "Volver"

  // Estados para los datos del post y comentarios
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); // Almacena los comentarios cargados
  // Estados de carga y error
  const [loading, setLoading] = useState(true); // Carga combinada de post y comentarios
  const [error, setError] = useState('');
  // Estados de acciones del post
  const [voteLoading, setVoteLoading] = useState(false); // Voto del post principal
  const [postUserVote, setPostUserVote] = useState(null); // Voto del user en el post
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);


  // Carga inicial del post y sus comentarios
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones en componente desmontado
    const fetchPostData = async () => {
      if (!postId || !api.getPostDetails) return;
      setLoading(true);
      setError('');
      setPost(null); // Resetear estados al cambiar postId
      setComments([]);
      setPostUserVote(null);
      setIsBookmarked(false);

      try {
        // Tu api.getPostDetails debe devolver el post y sus comentarios asociados
        const postData = await api.getPostDetails(postId);

         if (isMounted) {
            // Ordenar comentarios al recibirlos (ej: por 'best' = likes - dislikes)
             const sortedComments = (postData.comments || []).sort((a, b) =>
                 (b.likes - b.dislikes) - (a.likes - a.dislikes)
             );

            setPost(postData);
            setComments(sortedComments);

            // TODO: Obtener el voto y bookmark del usuario para ESTE post
            // Esto requiere llamadas API adicionales o que getPostDetails incluya esta info
             if (user && api.getUserVote) { // Placeholder para función API
                 try {
                     const voteData = await api.getUserVote(user.id, postId, 'post');
                     if(isMounted) setPostUserVote(voteData?.voteType);
                } catch (voteError) { console.warn("Could not get post vote status", voteError); }
             }
             // if (user && api.isBookmarked) { ... } // Similar para bookmark
         }

      } catch (err) {
        console.error(`Error fetching post ${postId}:`, err);
         if (isMounted) {
            setError(err.message || 'No se pudo cargar el post.');
             // Opcional: Redirigir si es 404
             if (err.message === 'Post not found') { /* navigate('/404'); */ }
        }
      } finally {
        if (isMounted) setLoading(false); // Termina la carga
      }
    };

    fetchPostData();

     // Función de limpieza para cancelar fetches si el componente se desmonta
    return () => { isMounted = false; };

  }, [postId, user]); // Depende del postId y del usuario logueado


  // --- Callbacks y Handlers ---

  // Manejador para Votar en el Post Principal
  const handlePostVote = async (voteType) => {
     if (voteLoading || !user || !post || !api.votePost) return;
     setVoteLoading(true);
      const originalPostState = { likes: post.likes, dislikes: post.dislikes };
     const originalVote = postUserVote;

     // Actualización Optimista
      let newVoteStatus = null;
     const updatedPostData = { ...post };
      if (voteType === 'like') {
          if (originalVote === 'like') { updatedPostData.likes--; newVoteStatus = null; }
          else { updatedPostData.likes++; if (originalVote === 'dislike') updatedPostData.dislikes--; newVoteStatus = 'like'; }
      } else {
          if (originalVote === 'dislike') { updatedPostData.dislikes--; newVoteStatus = null; }
          else { updatedPostData.dislikes++; if (originalVote === 'like') updatedPostData.likes--; newVoteStatus = 'dislike'; }
      }
      setPost(updatedPostData); // Actualiza post local
      setPostUserVote(newVoteStatus); // Actualiza voto local


     try {
        const result = await api.votePost(post.id, user.id, voteType);
        // Sobrescribe con datos de API (más seguro)
         setPost(prev => prev ? { ...prev, likes: result.likes, dislikes: result.dislikes } : null);
         // Nota: La API debe devolver el estado final del voto del usuario idealmente
     } catch (error) {
        console.error("Error voting on post:", error);
         // Rollback
        setPost(prev => prev ? { ...prev, ...originalPostState } : null);
         setPostUserVote(originalVote);
         alert(`Error al votar: ${error.message}`);
     } finally {
        setVoteLoading(false);
     }
  };

   // Eliminar el Post
  const handleDeletePost = async () => {
    if (!canDelete || isDeleting || !post || !api.deletePost) return;
     if (window.confirm("¿Seguro que quieres eliminar este post y sus comentarios?")) {
       setIsDeleting(true);
       try {
          await api.deletePost(post.id, user.id);
          navigate(`/forum/${post.forum?.slug || post.forum?.id || ''}`, { replace: true });
       } catch (error) {
           console.error("Error deleting post:", error);
           alert(`Error al eliminar: ${error.message}`);
           setIsDeleting(false);
       }
       // No setIsDeleting(false) en éxito
     }
  };

  // Enviar un nuevo Comentario (nivel superior)
  const handleCommentSubmit = useCallback(async (text) => {
    if (!user || !post || !api.createComment) throw new Error("No se puede comentar ahora.");
     const commentData = { postId: post.id, userId: user.id, text: text.trim(), parentId: null };
     try {
       const newComment = await api.createComment(commentData);
       // Añade el nuevo comentario al inicio de la lista local y reordena
       setComments(prev => [newComment, ...prev].sort((a,b) => (b.likes - b.dislikes) - (a.likes - a.dislikes)));
       // Opcional: actualizar contador en el objeto 'post' visualmente
       setPost(prev => prev ? ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }) : null);
     } catch (error) {
        console.error("Error submitting comment:", error);
        alert(`Error al comentar: ${error.message}`);
        throw error; // Propaga error para que el form sepa
     }
   }, [user, post, api]); // Dependencias para useCallback


  // Callback cuando un comentario (o respuesta) es eliminado desde CommentList/Card
  const handleCommentDeleted = useCallback((deletedCommentId) => {
    setComments(prev => prev.filter(c => c.id !== deletedCommentId));
     // Opcional: actualizar contador
     setPost(prev => prev ? ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) }) : null);
  }, []);

  // Callback cuando se añade una respuesta desde CommentList/Card
   const handleReplyAdded = useCallback((newReply) => {
     // Añadimos la respuesta a la lista plana; CommentList la anidará visualmente
      setComments(prev => [...prev, newReply].sort((a,b) => (b.likes - b.dislikes) - (a.likes - a.dislikes)));
       // Opcional: actualizar contador
       setPost(prev => prev ? ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }) : null);
   }, []);


   // Función para pasar a CommentList/Card para saber el voto de cada comentario
   // Esto evita que cada CommentCard haga su propia llamada inicial
   const getCommentVoteStatus = useCallback(async (commentId) => {
        if (user && api.getUserVote) { // Necesita tu API simulada
            try {
                const voteData = await api.getUserVote(user.id, commentId, 'comment');
                return voteData?.voteType;
            } catch (error) {
                // console.warn(`Failed to get vote status for comment ${commentId}`);
                return null;
            }
        }
        return null;
   }, [user]); // Depende del usuario logueado


  // Lógica del botón Volver
   const handleGoBack = () => {
      if (location.state?.from) {
         navigate(location.state.from); // Vuelve a la ruta anterior si existe en state
      } else if (post?.forum) {
          navigate(`/forum/${post.forum.slug || post.forum.id}`); // Vuelve al foro
      } else {
          navigate('/home'); // Fallback a home
      }
  };

   // Calcula si se puede borrar
   const canDelete = useMemo(() => {
     if (!user || !post) return false;
     const isOwner = post.userId === user.id;
     const isMod = post.forum?.id ? isModerator(post.forum.id) : false;
     return isOwner || isMod;
  }, [user, post, isModerator]);


  // --- Renderizado ---
   if (loading) return <LoadingSpinner center={true} size="60px"/>;
   if (error) return <p className={styles.errorMessage}>{error}</p>;
   if (!post) return <p className={styles.errorMessage}>Post no encontrado.</p>;

  // Destructura datos del post para facilitar acceso
  const { user: postUser, forum: postForum, title, description, createdAt, likes, dislikes } = post;

  return (
    <div className={styles.postDetailContainer}>
       {/* Botón Volver */}
       <Button onClick={handleGoBack} variant="secondary" size="small" className={styles.backButton}>
         <FaArrowLeft aria-hidden="true" /> Volver
       </Button>

       {/* Contenido del Post */}
       <article className={`${styles.postArticle} card`}>
         <header className={styles.postHeader}>
            {/* Link al Foro */}
           {postForum && (
             <Link to={`/forum/${postForum.slug || postForum.id}`} className={styles.forumLink}>
               #{postForum.name}
             </Link>
           )}
           {postForum && <span className={styles.separator}>•</span>}
            {/* Info del Usuario */}
           {postUser && (
              <span className={styles.userInfo}>
                por{' '}
                <Link to={`/user/${postUser.username}`} className={styles.userLink}>
                 <div className={`${styles.avatarSmall} avatar-placeholder`}>
                     {postUser.avatarUrl ? <img src={postUser.avatarUrl} alt="" /> : postUser.username?.charAt(0).toUpperCase()}
                 </div>
                 @{postUser.username}
               </Link>
              </span>
            )}
            {postUser && <span className={styles.separator}>•</span>}
             {/* Tiempo */}
            <time dateTime={createdAt} className={styles.postTime} title={new Date(createdAt).toLocaleString()}>
             {timeAgo(createdAt)}
           </time>
         </header>

          {/* Título */}
         <h1 className={styles.postTitle}>{title}</h1>

          {/* Descripción (Renderizado simple, considerar Markdown) */}
         <div className={styles.postDescription}>
            {description?.split('\n').map((paragraph, index) => (
                 <p key={index}>{paragraph}</p>
             ))}
             {/* Ejemplo con ReactMarkdown: */}
             {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown> */}
        </div>

          {/* Pie de página del Post (Acciones) */}
         <footer className={styles.postFooter}>
            <LikeDislikeButtons
             likes={likes}
             dislikes={dislikes}
             onLike={() => handlePostVote('like')}
             onDislike={() => handlePostVote('dislike')}
             userVote={postUserVote}
             disabled={!user}
             isLoading={voteLoading}
           />
            {/* Contador de Comentarios */}
           <span className={styles.commentCount} aria-label={`${comments?.length ?? 0} comentarios`}>
              <FaComments aria-hidden="true"/> {comments?.length ?? 0}
           </span>
            {/* Compartir (simplificado) */}
            {/* <Button variant="link" size="small" onClick={handleShare} className={styles.actionButton} title="Compartir">...</Button> */}
            {/* Guardar (simplificado) */}
             {/* {user && <Button variant="link" size="small" onClick={handleBookmark} className={styles.actionButton} title="Guardar">...</Button>} */}

            {/* Botón Eliminar */}
           {canDelete && (
             <Button
                 onClick={handleDeletePost}
                 variant="link"
                 size="small"
                 isLoading={isDeleting}
                 disabled={isDeleting}
                 className={`${styles.actionButton} ${styles.deleteButton}`}
                 title="Eliminar post"
              >
                <FaTrash /> <span className={styles.actionLabel}>Eliminar</span>
             </Button>
           )}
         </footer>
       </article>

       {/* Sección para Añadir Comentario */}
       <section className={styles.addCommentSection} aria-labelledby="add-comment-title">
          <h2 id="add-comment-title" className={styles.commentSectionTitle}>Añadir un comentario</h2>
         {user ? (
           <CommentForm
             postId={postId}
             onSubmit={handleCommentSubmit}
             // El form maneja su propio loading/error interno ahora
           />
          ) : (
             <p className={styles.loginPrompt}>
               <Link to="/login" state={{ from: location }}>Inicia sesión</Link> para dejar un comentario.
             </p>
          )}
       </section>

       {/* Lista de Comentarios */}
       <section aria-labelledby="comment-list-title">
          {/* <h2 id="comment-list-title" className="visually-hidden">Comentarios</h2> */} {/* Título oculto opcional */}
           <CommentList
              // Pasa los comentarios cargados
              comments={comments}
              postId={postId}
               forumId={postForum?.id} // Necesario para permisos en CommentCard
               postOwnerId={postUser?.id} // Necesario para permisos en CommentCard
               // isLoading ya no se necesita aquí si se maneja globalmente arriba
               isLoading={false}
               // Callbacks para interactividad
               onCommentDeleted={handleCommentDeleted}
               onReplyAdded={handleReplyAdded}
               getVoteStatus={getCommentVoteStatus} // Pasar función para obtener votos
            />
       </section>
    </div>
  );
};

export default PostDetail;