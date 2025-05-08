import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import LikeDislikeButtons from './LikeDislikeButtons';
import CommentList from '../Comment/CommentList';
import CommentForm from '../Comment/CommentForm';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import styles from './PostDetail.module.css';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { timeAgo } from '../../utils/helpers';
import { FaTrash, FaComments, FaShareAlt, FaBookmark, FaArrowLeft, FaUserCircle } from 'react-icons/fa';

const PostDetail = () => {
  const { postId } = useParams();
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteLoading, setVoteLoading] = useState(false);
  const [postUserVote, setPostUserVote] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPostData = async () => {
      if (!postId || !api.getPostDetails) return;
      setLoading(true); setError('');
      setPost(null); setComments([]); setPostUserVote(null);

      try {
        const postData = await api.getPostDetails(postId);
        if (isMounted) {
            const fetchedComments = postData.comments || [];
            const sortedComments = [...fetchedComments].sort((a, b) =>
                ((b.likesCount || 0) - (b.dislikesCount || 0)) - ((a.likesCount || 0) - (a.dislikesCount || 0))
            );
            setPost(postData);
            setComments(sortedComments);
        }
      } catch (err) {
        if (isMounted) {
           console.error(`Error fetching post ${postId}:`, err);
           setError(err.message || 'No se pudo cargar el post.');
           if (err.message === 'Post no encontrado') { navigate('/404', { replace: true }); }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPostData();
    return () => { isMounted = false; };
  }, [postId, navigate]);

  useEffect(() => {
      let isMounted = true;
      const fetchInitialVote = async () => {
           if (user && post?.id && api.getUserVote && isMounted) {
               try {
                   const voteData = await api.getUserVote(user.id, post.id, 'post');
                   if (isMounted) setPostUserVote(voteData?.voteType);
               } catch (err) {
                   if (isMounted) console.warn("Failed to get initial post vote status", err);
               }
           } else if (isMounted) {
                setPostUserVote(null);
            }
      };
      fetchInitialVote();
       return () => { isMounted = false };
  }, [user, post?.id]);

  const handlePostVote = useCallback(async (voteType) => {
    if (voteLoading || !user || !post?.id || !api.votePost) return;
    setVoteLoading(true);
    const originalLikes = post.likesCount;
    const originalDislikes = post.dislikesCount;
    const originalUserVote = postUserVote;

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
    setPost(prev => prev ? { ...prev, likesCount: optimisticLikes, dislikesCount: optimisticDislikes } : null);
    setPostUserVote(optimisticVote);

    try {
        const result = await api.votePost(post.id, user.id, voteType);
        setPost(prev => prev ? { ...prev, likesCount: result.likes, dislikesCount: result.dislikes } : null);
        if (result.userVote !== undefined) setPostUserVote(result.userVote);
    } catch (error) {
       console.error("Error voting on post:", error);
       setPost(prev => prev ? {...prev, likesCount: originalLikes, dislikesCount: originalDislikes } : null);
       setPostUserVote(originalUserVote);
       alert(`Error al votar: ${error.message || 'Intenta de nuevo.'}`);
    } finally {
        setVoteLoading(false);
    }
  }, [voteLoading, user, post, postUserVote]);


  const canDelete = useMemo(() => {
     if (!user || !post || !post.user_id) return false;
     const isOwner = post.user_id === user.id;
     const isMod = post.forum?.id ? isModerator(post.forum.id) : false;
     return isOwner || isMod;
  }, [user, post?.user_id, post?.forum?.id, isModerator]);


  const handleDeletePost = useCallback(async () => {
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
     }
  }, [canDelete, isDeleting, post, user, navigate, api]);


  const handleCommentSubmit = useCallback(async (text) => {
     if (!user || !post?.id || !api.createComment) throw new Error("No se puede comentar ahora.");
     const commentData = { postId: post.id, userId: user.id, text: text.trim(), parentId: null };
     try {
       const newComment = await api.createComment(commentData);
       setComments(prev => [newComment, ...prev]);
       setPost(prev => prev ? ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }) : null);
     } catch (error) {
        console.error("Error submitting comment:", error);
        alert(`Error al comentar: ${error.message}`);
        throw error;
     }
   }, [user, post?.id, api]);

  const handleCommentDeleted = useCallback((deletedCommentId) => {
    setComments(prev => prev.filter(c => c.id !== deletedCommentId));
    setPost(prev => prev ? ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) }) : null);
  }, []);

  const handleReplyAdded = useCallback((newReply) => {
     setComments(prev => [...prev, newReply]);
     setPost(prev => prev ? ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }) : null);
   }, []);

   const getCommentVoteStatus = useCallback(async (commentId) => {
       if (user && api.getUserVote) {
           try { const voteData = await api.getUserVote(user.id, commentId, 'comment'); return voteData?.voteType; }
           catch (error) { return null; }
       } return null;
   }, [user]);

   const handleGoBack = () => {
       if (location.state?.from) { navigate(location.state.from); }
       else if (post?.forum?.id) { navigate(`/forum/${post.forum.slug || post.forum.id}`); }
       else { navigate('/home'); }
   };

   if (loading) {
       return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}><LoadingSpinner size="60px"/></div>;
   }
   if (error) return <p className={styles.errorMessage}>{error}</p>;
   if (!post) return <p className={styles.errorMessage}>Post no encontrado.</p>;

   const { title, description, createdAt, likesCount, dislikesCount, commentCount } = post;
   const postUser = post.user || { username: 'Desconocido', avatarUrl: null };
   const postForum = post.forum || { name: 'Desconocido', slug: null, id: null };

  return (
    <div className={styles.postDetailContainer}>
       <Button onClick={handleGoBack} variant="secondary" size="small" className={styles.backButton}>
         <FaArrowLeft aria-hidden="true" /> Volver
       </Button>

       <article className={`${styles.postArticle} card`}>
            <header className={styles.postHeader}>
                {postForum.id && <Link to={`/forum/${postForum.slug || postForum.id}`} className={styles.forumLink}>#{postForum.name}</Link>}
                {postForum.id && <span className={styles.separator}>•</span>}
                {postUser.username !== 'Desconocido' && (
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
                {postUser.username !== 'Desconocido' && <span className={styles.separator}>•</span>}
                <time dateTime={createdAt} className={styles.postTime} title={new Date(createdAt).toLocaleString()}>{timeAgo(createdAt)}</time>
            </header>
            <h1 className={styles.postTitle}>{title}</h1>
            <div className={styles.postDescription}>
                {(description || '').split('\n').map((p, i) => <p key={i}>{p || '\u00A0'}</p>)}
            </div>
            <footer className={styles.postFooter}>
                <LikeDislikeButtons
                    likes={likesCount} dislikes={dislikesCount}
                    onLike={() => handlePostVote('like')} onDislike={() => handlePostVote('dislike')}
                    userVote={postUserVote} disabled={!user} isLoading={voteLoading}
                />
                <span className={styles.commentCount}><FaComments/> {commentCount ?? 0}</span>

                {canDelete && (
                    <Button onClick={handleDeletePost} variant="link" size="small" isLoading={isDeleting} disabled={isDeleting} className={`${styles.actionButton} ${styles.deleteButton}`}>
                        <FaTrash/> <span className={styles.actionLabel}>Eliminar</span>
                    </Button>
                )}
            </footer>
       </article>

        <section className={styles.addCommentSection} aria-labelledby="add-comment-title">
            <h2 id="add-comment-title" className={styles.commentSectionTitle}>Añadir un comentario</h2>
            {user ? (
                <CommentForm postId={postId} onSubmit={handleCommentSubmit} />
            ) : ( <p className={styles.loginPrompt}><Link to="/login" state={{ from: location }}>Inicia sesión</Link> para comentar.</p> )}
        </section>

       <section aria-labelledby="comment-list-title">
            <CommentList
                comments={comments} postId={postId} forumId={postForum?.id}
                postOwnerId={postUser?.id} isLoading={false}
                onCommentDeleted={handleCommentDeleted} onReplyAdded={handleReplyAdded}
                getVoteStatus={getCommentVoteStatus}
            />
       </section>
    </div>
  );
};

export default PostDetail;