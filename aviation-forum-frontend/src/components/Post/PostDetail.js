// src/components/Post/PostDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { api } from 'your-api-service';
import styles from './PostDetail.module.css';
import LikeDislikeButtons from './LikeDislikeButtons';
import LoadingSpinner from './LoadingSpinner';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [postUserVote, setPostUserVote] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPostDetail = async () => {
      if (isMounted && post?.id) {
        try {
          const postData = await api.getPost(post.id);
          setPost(postData);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      }
    };

    fetchPostDetail();
    return () => { isMounted = false };
  }, [post?.id]);

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

  const handlePostVote = async (voteType) => {
    if (voteLoading || !user || !post || !api.votePost) {
      return;
    }

    setVoteLoading(true);

    const originalLikes = post.likesCount;
    const originalDislikes = post.dislikesCount;
    const originalUserVote = postUserVote;

    let optimisticVote = null;
    let optimisticLikes = originalLikes;
    let optimisticDislikes = originalDislikes;

    if (voteType === 'like') {
      if (originalUserVote === 'like') {
        optimisticLikes--;
        optimisticVote = null;
      } else {
        optimisticLikes++;
        if (originalUserVote === 'dislike') optimisticDislikes--;
        optimisticVote = 'like';
      }
    } else {
      if (originalUserVote === 'dislike') {
        optimisticDislikes--;
        optimisticVote = null;
      } else {
        optimisticDislikes++;
        if (originalUserVote === 'like') optimisticLikes--;
        optimisticVote = 'dislike';
      }
    }

    setPost(prev => prev ? { ...prev, likesCount: optimisticLikes, dislikesCount: optimisticDislikes } : null);
    setPostUserVote(optimisticVote);

    try {
      const result = await api.votePost(post.id, user.id, voteType);
      setPost(prev => prev ? { ...prev, likesCount: result.likes, dislikesCount: result.dislikes } : null);
      setPostUserVote(result.userVote);
    } catch (error) {
      setPost(prev => prev ? { ...prev, likesCount: originalLikes, dislikesCount: originalDislikes } : null);
      setPostUserVote(originalUserVote);
      alert(`Error al votar: ${error.message || 'Inténtalo de nuevo.'}`);
    } finally {
      setVoteLoading(false);
    }
  };

  const getCommentVoteStatus = useCallback(async (commentId) => {
    if (user && api.getUserVote) {
      try {
        const voteData = await api.getUserVote(user.id, commentId, 'comment');
        return voteData?.voteType;
      } catch (error) { return null; }
    }
    return null;
  }, [user]);

  if (loading) return <LoadingSpinner center={true} size="60px"/>;
  if (!post) return <p className={styles.errorMessage}>Post no encontrado.</p>;

  const { likesCount, dislikesCount } = post;

  return (
    <div className={styles.postDetailContainer}>
      <article className={`${styles.postArticle} card`}>
        <footer className={styles.postFooter}>
          <LikeDislikeButtons
            likes={likesCount}
            dislikes={dislikesCount}
            onLike={() => handlePostVote('like')}
            onDislike={() => handlePostVote('dislike')}
            userVote={postUserVote}
            disabled={!user}
            isLoading={voteLoading}
          />
        </footer>
      </article>
    </div>
  );
};

export default PostDetail;
