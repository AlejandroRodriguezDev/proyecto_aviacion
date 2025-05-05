// src/components/Comment/CommentCard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Importado useMemo
import { Link } from 'react-router-dom';
import styles from './CommentCard.module.css';
import LikeDislikeButtons from '../Post/LikeDislikeButtons';
import CommentForm from './CommentForm';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaReply, FaTrash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth'; // Importa useAuth
import { api } from '../../services/api';
import { timeAgo } from '../../utils/helpers';

const CommentCard = ({
  comment,
  postId,
  forumId,
  postOwnerId,
  onCommentDeleted,
  onReplyAdded,
  getVoteStatus,
  nestedLevel = 0
}) => {
    // CORRECTO: Extrae user, isAuthenticated y isModerator
    const { user, isAuthenticated, isModerator } = useAuth();

    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replies, setReplies] = useState(comment?.replies || []);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(comment?.likes ?? 0);
    const [currentDislikes, setCurrentDislikes] = useState(comment?.dislikes ?? 0);
    const [currentUserVote, setCurrentUserVote] = useState(null);

    // ... (useEffect para fetchVote - sin cambios) ...
    useEffect(() => {
      let isMounted = true;
      const fetchVote = async () => { /* ... código ... */ };
      fetchVote();
      return () => { isMounted = false; };
    }, [comment?.id, user, getVoteStatus]);

    // ... (useCallback para loadReplies - sin cambios) ...
    const loadReplies = useCallback(async () => { /* ... código ... */ }, [comment?.id, postId, replies.length]);

    // ... (useMemo para canDelete - SIN CAMBIOS, usa isModerator correctamente) ...
    const canDelete = useMemo(() => {
        if (!user || !comment) return false;
        const isOwner = comment.user?.id === user.id || comment.userId === user.id;
        const isPostOwner = postOwnerId === user.id;
         const isMod = forumId ? isModerator(forumId) : false; // isModerator ya viene del hook
         return isOwner || isPostOwner || isMod;
    }, [user, comment, postOwnerId, forumId, isModerator]); // isModerator SÍ debe estar en dependencias

    // ... (handleVote - sin cambios) ...
    const handleVote = async (voteType) => { /* ... código ... */ };

    // ... (handleDelete - sin cambios) ...
    const handleDelete = async () => { /* ... código ... */ };

    // ... (handleReplySubmit - sin cambios) ...
    const handleReplySubmit = async (replyText) => { /* ... código ... */ };


    // --- Renderizado ---
    if (!comment || !comment.user || !comment.user.username) { /* ... placeholder ... */ }

    const { user: commentUser } = comment;

    return (
      <div className={styles.commentCard} style={{ '--nested-level': nestedLevel }}>
        {/* Cabecera */}
        <div className={styles.commentHeader}>
           {/* ... jsx cabecera ... */}
        </div>
        {/* Cuerpo */}
        <div className={styles.commentBody}>
           {/* ... jsx cuerpo ... */}
        </div>
        {/* Pie */}
        <div className={styles.commentFooter}>
           <LikeDislikeButtons
              // ... props ...
              disabled={!user} // Usa solo 'user' para saber si deshabilitar (más simple)
              isLoading={voteLoading}
           />
           {/* Botón Responder: USA isAuthenticated directamente */}
           {isAuthenticated && ( // <--- CORRECTO: ahora isAuthenticated está definida
             <Button
                variant="link" size="small"
                onClick={() => setShowReplyForm(prev => !prev)}
                className={styles.actionButton}
                aria-expanded={showReplyForm}
             >
               <FaReply aria-hidden="true"/> Responder
             </Button>
           )}
           {/* Botón Eliminar */}
           {canDelete && (
             <Button variant="link" /* ... etc ... */ >
               {isDeleting ? <FaSpinner className={styles.spinnerIcon} /> : <FaTrash aria-hidden="true"/>}
                <span className="visually-hidden">Eliminar</span>
             </Button>
           )}
        </div>

        {/* Formulario Respuesta */}
        {showReplyForm && (
           <div className={styles.replyFormContainer}>
                <CommentForm
                  /* ... props ... */
                  // Este form internamente también revisa isAuthenticated
                />
            </div>
        )}

        {/* Sección Respuestas */}
        {(replies.length > 0 || isLoadingReplies) && ( // Ajuste condición
             <div className={styles.repliesContainer}>
                  {isLoadingReplies ? ( <LoadingSpinner size="20px" /> )
                     : (
                         replies.map(reply => (
                             <CommentCard
                               key={reply.id}
                               comment={reply}
                               postId={postId}
                               forumId={forumId}
                               postOwnerId={postOwnerId}
                               onCommentDeleted={onCommentDeleted}
                               onReplyAdded={onReplyAdded}
                               getVoteStatus={getVoteStatus}
                               nestedLevel={nestedLevel + 1}
                              />
                          ))
                     )}
             </div>
         )}

      </div> // Fin .commentCard
    );
  };

export default CommentCard; // Export default al final