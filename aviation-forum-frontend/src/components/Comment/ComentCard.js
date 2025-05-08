
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './CommentCard.module.css';
import LikeDislikeButtons from '../Post/LikeDislikeButtons'; // Ruta correcta?
import CommentForm from './CommentForm';                  
import Button from '../Common/Button';                     
import LoadingSpinner from '../Common/LoadingSpinner';     
import { FaReply, FaTrash, FaSpinner, FaUserCircle } from 'react-icons/fa'; // Añadido UserCircle para fallback
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { timeAgo } from '../../utils/helpers';

const CommentCard = ({
  comment,
  postId,
  forumId,      
  postOwnerId,  
  onCommentDeleted,
  onReplyAdded,
  
  nestedLevel = 0
}) => {
  const { user, isAuthenticated, isModerator } = useAuth(); 

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment?.replies || []); // Asumiendo 
  const [isLoadingReplies, setIsLoadingReplies] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false); // 

  // ESTADOS LOCALES DEL VOTO DEL COMENTARIO-----------------------------------
  const [currentLikes, setCurrentLikes] = useState(comment?.likesCount ?? 0);
  const [currentDislikes, setCurrentDislikes] = useState(comment?.dislikesCount ?? 0);
  const [currentUserVote, setCurrentUserVote] = useState(null); // Voto del user para este comentario

  // --- OBTENER VOTO INICIAL DEL COMENTARIO -----------------------
   useEffect(() => {
      let isMounted = true;
      const fetchInitialCommentVote = async () => {
          // Solo si hay user, comment y API
          if (user && comment?.id && api.getUserVote && isMounted) {

             try {
                 const voteData = await api.getUserVote(user.id, comment.id, 'comment');
                  if (isMounted) {
                     setCurrentUserVote(voteData?.voteType);
                  }
              } catch (err) {
                 if (isMounted) console.warn("Failed to get initial comment vote", err);
              }
          } else if (isMounted) {
             setCurrentUserVote(null);
          }
      };
      fetchInitialCommentVote();
      return () => { isMounted = false; };
   }, [user, comment?.id]); 



    const loadReplies = useCallback(async () => {
     
        console.warn("loadReplies function not implemented.");
 
    }, [comment?.id]);

    // --- DETERMINAR SI SE PUEDE BORRAR -----------------------------------------------
    const canDelete = useMemo(() => {
        if (!user || !comment || !comment.user_id) return false;
        const isOwner = comment.user_id === user.id;
        const isPostOwnerCheck = postOwnerId === user.id;
        const isMod = forumId ? isModerator(forumId) : false; 
         return isOwner || isPostOwnerCheck || isMod;
    }, [user, comment?.user_id, postOwnerId, forumId, isModerator]); // Dependencias correctas

  // --- MANEJADOR DE VOTO  -------------------------
  const handleVote = useCallback(async (voteType) => {

     if (voteLoading || !user || !comment?.id || !api.voteComment) return;

     setVoteLoading(true);


     const originalLikes = currentLikes;
     const originalDislikes = currentDislikes;
     const originalUserVote = currentUserVote;

  
     let optimisticVote = null;
     let optimisticLikes = originalLikes;
     let optimisticDislikes = originalDislikes;
    
     if (voteType === 'like') {
         if (originalUserVote === 'like') { optimisticLikes--; optimisticVote = null; }
         else { optimisticLikes++; if (originalUserVote === 'dislike') optimisticDislikes--; optimisticVote = 'like'; }
     } else {
         if (originalUserVote === 'dislike') { optimisticDislikes--; optimisticVote = null; }
         else { optimisticDislikes++; if (originalUserVote === 'like') optimisticLikes--; optimisticVote = 'dislike'; }
     }


     setCurrentLikes(optimisticLikes);
     setCurrentDislikes(optimisticDislikes);
     setCurrentUserVote(optimisticVote);

     try {
    
        const result = await api.voteComment(comment.id, user.id, voteType);

      
        setCurrentLikes(result.likes);
        setCurrentDislikes(result.dislikes);
        setCurrentUserVote(result.userVote); 

     } catch (error) {
        console.error(`Error voting ${voteType} on comment ${comment.id}:`, error);
  
        setCurrentLikes(originalLikes);
        setCurrentDislikes(originalDislikes);
        setCurrentUserVote(originalUserVote);
        alert(`Error al votar comentario: ${error.message || 'Intenta de nuevo.'}`);
     } finally {
        setVoteLoading(false);
     }
  }, [voteLoading, user, comment?.id, currentLikes, currentDislikes, currentUserVote]);

  // --- BORRAR COMENTARIO -------------------------
  const handleDelete = useCallback(async () => {
      if (!canDelete || isDeleting || !api.deleteComment) return;
   
       if (window.confirm("¿Eliminar este comentario?")) {
            setIsDeleting(true);
           try {
               await api.deleteComment(comment.id, user.id); 
               if (onCommentDeleted) {
                   onCommentDeleted(comment.id); 
               }
               
           } catch (error) {
               console.error("Error deleting comment:", error);
               alert(`Error al eliminar comentario: ${error.message}`);
               setIsDeleting(false); 
           }
       }
  }, [canDelete, isDeleting, comment?.id, user?.id, onCommentDeleted]);

    // ---------------------------------------------- ENVIAR RESPUESTA --------------------------------
  const handleReplySubmit = useCallback(async (replyText) => {
  
       if (!user || !comment?.id || !postId || !onReplyAdded || !api.createComment) {
            throw new Error("No se puede responder ahora."); 
        }

        const replyData = {
             postId: postId,
             userId: user.id,
             text: replyText.trim(),
             parentId: comment.id 
        };

        try {
            const newReply = await api.createComment(replyData);
        
             onReplyAdded(newReply); a
             setShowReplyForm(false); 
    
             

        } catch (error) {
            console.error("Error submitting reply:", error);
            alert(`Error al responder: ${error.message}`);
             throw error;
        }
   }, [user, comment?.id, postId, onReplyAdded, api]);




  if (!comment || !comment.user) { 
    return (
       <div className={`${styles.commentCard} ${styles.loadingPlaceholder}`} style={{ '--nested-level': nestedLevel }}>
            Cargando comentario...
       </div>
     );
  }

  const { user: commentUser, text, createdAt } = comment; 

  return (
      <div className={styles.commentCard} style={{ '--nested-level': nestedLevel }}>
         <div className={styles.commentHeader}>
             {/* Avatar del comentador */}
            <Link to={`/user/${commentUser.username}`} className={styles.userLink} title={commentUser.username}>
                <div className={`${styles.avatarPlaceholder} avatar-placeholder`}>
                 {commentUser.avatarUrl ? (
                    <img src={commentUser.avatarUrl} alt="" loading="lazy"/>
                 ) : commentUser.username ? (
                     commentUser.username.charAt(0).toUpperCase()
                 ) : (
                     <FaUserCircle /> 
                  )}
               </div>
                <span className={styles.username}>{commentUser.username || 'Anónimo'}</span>
            </Link>
             <span className={styles.separator}>•</span>
             <time dateTime={createdAt} className={styles.commentTime} title={new Date(createdAt).toLocaleString()}>
               {timeAgo(createdAt)}
             </time>
        </div>

         <div className={styles.commentBody}>
            {/* Podrías renderizar markdown si lo soportas */}
             <p>{text}</p>
         </div>

         <div className={styles.commentFooter}>
            <LikeDislikeButtons
               likes={currentLikes}
               dislikes={currentDislikes}
               onLike={() => handleVote('like')}
               onDislike={() => handleVote('dislike')}
               userVote={currentUserVote} 
               disabled={!isAuthenticated}
               isLoading={voteLoading}
            />
             {isAuthenticated && (
                 <Button variant="link" size="small" onClick={() => setShowReplyForm(prev => !prev)} className={styles.actionButton} aria-expanded={showReplyForm}>
                     <FaReply/> Responder
                 </Button>
             )}
            {canDelete && (
                <Button variant="link" size="small" onClick={handleDelete} disabled={isDeleting} className={`${styles.actionButton} ${styles.deleteButton}`}>
                   {isDeleting ? <FaSpinner className={styles.spinnerIcon} /> : <FaTrash/>}
                   <span className="visually-hidden">Eliminar</span>
                 </Button>
            )}
         </div>

         {/* Formulario de Respuesta Condicional */}
         {showReplyForm && (
            <div className={styles.replyFormContainer}>
                <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    onSubmit={handleReplySubmit}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder={`Respondiendo a @${commentUser.username}...`}
                    isReply={true}
                 />
            </div>
         )}

          {/* Contenedor para mostrar Respuestas (si se cargan dinámicamente o ya vienen anidadas) */}
          {(isLoadingReplies || replies.length > 0) && (
             <div className={styles.repliesContainer}>
                {isLoadingReplies ? <LoadingSpinner size="20px"/> : replies.map(reply => (
                   <CommentCard
                       key={reply.id}
                       comment={reply}
                       postId={postId}
                       forumId={forumId}
                       postOwnerId={postOwnerId}
                       onCommentDeleted={onCommentDeleted} 
                       onReplyAdded={onReplyAdded}
                       nestedLevel={nestedLevel + 1} 
                   />
               ))}
            </div>
          )}
      </div>
  );
};

export default CommentCard;