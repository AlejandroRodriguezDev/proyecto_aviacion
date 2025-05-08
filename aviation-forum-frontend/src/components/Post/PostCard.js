import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeDislikeButtons from './LikeDislikeButtons';
import styles from './PostCard.module.css';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { FaCommentAlt, FaTrash, FaShareAlt, FaBookmark } from 'react-icons/fa';
import Button from '../Common/Button';
import { timeAgo } from '../../utils/helpers';

const PostCard = ({ post, onPostDelete }) => {
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();

  const [currentLikes, setCurrentLikes] = useState(post?.likesCount ?? 0);
  const [currentDislikes, setCurrentDislikes] = useState(post?.dislikesCount ?? 0);
  const [currentUserVote, setCurrentUserVote] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
      let isMounted = true;
      const fetchInitialVote = async () => {
           if (user && post?.id && api.getUserVote && isMounted) {
               setVoteLoading(true);
                try {
                    const voteData = await api.getUserVote(user.id, post.id, 'post');
                     if (isMounted) {
                        setCurrentUserVote(voteData?.voteType);
                    }
                 } catch (err) {
                    if (isMounted) console.warn("Failed to get initial post vote for card", err);
                 } finally {
                    if (isMounted) setVoteLoading(false);
                }
           } else if (isMounted) {
               setCurrentUserVote(null);
           }
      };
     fetchInitialVote();
     return () => { isMounted = false };
  }, [user, post?.id]);

  const canDelete = useMemo(() => {
    if (!user || !post || !post.user_id) return false;
    const isOwner = post.user_id === user.id;
    const isMod = post.forum_id ? isModerator(post.forum_id) : false;
    return isOwner || isMod;
  }, [user, post?.user_id, post?.forum_id, isModerator]);

  const handleVote = useCallback(async (voteType) => {
     if (voteLoading || !user || !post?.id || !api.votePost) return;

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
        const result = await api.votePost(post.id, user.id, voteType);

        setCurrentLikes(result.likes);
        setCurrentDislikes(result.dislikes);
        setCurrentUserVote(result.userVote);

     } catch (error) {
        console.error(`Error voting ${voteType} on post ${post.id}:`, error);
        setCurrentLikes(originalLikes);
        setCurrentDislikes(originalDislikes);
        setCurrentUserVote(originalUserVote);
        alert(`Error al votar: ${error.message || 'Intenta de nuevo.'}`);
     } finally {
        setVoteLoading(false);
     }
  }, [voteLoading, user, post?.id, currentLikes, currentDislikes, currentUserVote]);

  const handleDelete = useCallback(async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!canDelete || isDeleting || !api.deletePost) return;
      if (window.confirm("¿Eliminar este post?")) {
          setIsDeleting(true);
          try {
              await api.deletePost(post.id, user.id);
              if (onPostDelete) onPostDelete(post.id);
          } catch (error) {
               console.error(`Error deleting post ${post.id}:`, error);
               alert(`Error al eliminar: ${error.message || 'Intenta de nuevo.'}`);
               setIsDeleting(false);
          }
      }
    }, [canDelete, isDeleting, post?.id, user?.id, onPostDelete]);

  const handleShare = (e) => {
    e.preventDefault(); e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const postTitle = post.title || "Post de AeroForum";
    if (navigator.share) { } else { }
  };

  const handleBookmark = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { alert("Inicia sesión para guardar."); return; }
    setIsBookmarked(prev => !prev);
    alert(`Post ${!isBookmarked ? 'guardado' : 'quitado'} (simulado).`);
  };

  if (!post || !post.id || !post.title) {
    return <article className={`${styles.postCard} ${styles.loadingState} card`}>Cargando...</article>;
  }

   const postUser = post.user || { username: '?', avatarUrl: null };
   const postForum = post.forum || { name: '?', slug: '#', id: '?' };
   const commentCount = post.commentCount ?? 0;

  return (
    <article className={`${styles.postCard} card`}>
      <div className={styles.postContent}>
        <header className={styles.postHeader}>
           <Link to={`/forum/${postForum.slug || postForum.id}`} className={styles.forumLink}>
               #{postForum.name}
           </Link>
            <span className={styles.separator}>•</span>
            <span className={styles.userInfo}>
              por{' '}
              <Link to={`/user/${postUser.username}`} className={styles.userLink}>
                 <span className={`${styles.avatarPostCard} avatar-placeholder`}>
                    {postUser.avatarUrl ? <img src={postUser.avatarUrl} alt="" /> : postUser.username?.charAt(0).toUpperCase()}
                 </span>
                 @{postUser.username}
             </Link>
           </span>
           <span className={styles.separator}>•</span>
           <Link to={`/post/${post.id}`} className={styles.timeLink} title={new Date(post.createdAt).toLocaleString()}>
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
           </Link>
        </header>

        <Link to={`/post/${post.id}`} className={styles.titleLink}>
           <h3 className={styles.postTitle}>{post.title}</h3>
        </Link>

        <footer className={styles.postFooter}>
           <LikeDislikeButtons
                likes={currentLikes}
                dislikes={currentDislikes}
                onLike={() => handleVote('like')}
                onDislike={() => handleVote('dislike')}
                userVote={currentUserVote}
                disabled={!user}
                isLoading={voteLoading}
           />
           <Link to={`/post/${post.id}#comments`} className={`${styles.actionButton} ${styles.commentsLink}`} aria-label={`${commentCount} comentarios`}>
               <FaCommentAlt aria-hidden="true"/>
               <span className={styles.actionText}>{commentCount}</span>
               <span className={styles.actionLabel}>Comentarios</span>
           </Link>
           <Button onClick={handleShare} variant="link" size="small" className={styles.actionButton} title="Compartir">
                 <FaShareAlt/> <span className={styles.actionLabel}>Compartir</span>
           </Button>
            {user && (
                <Button onClick={handleBookmark} variant="link" size="small" className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`} title={isBookmarked ? 'Quitar' : 'Guardar'}>
                   <FaBookmark/> <span className={styles.actionLabel}>{isBookmarked ? 'Guardado' : 'Guardar'}</span>
                </Button>
            )}
            {canDelete && (
                <Button onClick={handleDelete} variant="link" size="small" className={`${styles.actionButton} ${styles.deleteButton}`} isLoading={isDeleting} disabled={isDeleting} title="Eliminar">
                    <FaTrash/> <span className={styles.actionLabel}>Eliminar</span>
                </Button>
            )}
        </footer>
      </div>
    </article>
  );
};

export default PostCard;
