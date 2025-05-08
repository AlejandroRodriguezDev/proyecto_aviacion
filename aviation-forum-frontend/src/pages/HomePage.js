import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/Post/PostCard';
import ForumCard from '../components/Forum/ForumCard';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import styles from './HomePage.module.css';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';

const HomePage = () => {
  const { user } = useAuth();
  const [feedPosts, setFeedPosts] = useState([]);
  const [recommendedForums, setRecommendedForums] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = useCallback(async () => {
    if (user && api.getHomeFeed) {
      setLoadingFeed(true);
      setError('');
      try {
        const posts = await api.getHomeFeed(user.id);
        setFeedPosts(posts || []);
      } catch (err) {
        console.error("Error fetching home feed:", err);
        setError('No se pudo cargar tu feed. Inténtalo de nuevo.');
        setFeedPosts([]);
      } finally {
        setLoadingFeed(false);
      }
    } else {
      setFeedPosts([]);
      setLoadingFeed(false);
    }
  }, [user]);

  const fetchRecommendations = useCallback(async () => {
    if (api.getRecommendedForums) {
      setLoadingRecs(true);
      try {
        const forums = await api.getRecommendedForums(user?.id);
        setRecommendedForums(forums || []);
      } catch (err) {
        console.error("Error fetching recommended forums:", err);
        setRecommendedForums([]);
      } finally {
        setLoadingRecs(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFeed();
    fetchRecommendations();
  }, [fetchFeed, fetchRecommendations]);

  const handlePostDeleted = useCallback((deletedPostId) => {
    setFeedPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  }, []);

  const getVoteStatusCallback = useCallback(async (itemId, itemType) => {
    if (user && api.getUserVote) {
      try {
        const voteData = await api.getUserVote(user.id, itemId, itemType);
        return voteData?.voteType;
      } catch { return null; }
    }
    return null;
  }, [user]);

  if (loadingFeed && feedPosts.length === 0 && !error) {
    return <LoadingSpinner center={true} size="60px" />;
  }

  return (
    <div className={styles.homeLayout}>
      <div className={styles.feedContainer}>
        <h2>Tu Feed Principal</h2>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {loadingFeed && feedPosts.length > 0 && <LoadingSpinner />}

        {!loadingFeed && feedPosts.length === 0 && !error && (
          <div className={styles.emptyFeedMessage}>
            <p>Tu feed está algo vacío...</p>
            <p>Explora <Link to="/forums">nuevos foros</Link> o busca <Link to="/search">usuarios</Link> para seguir.</p>
          </div>
        )}

        {feedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onPostDelete={handlePostDeleted}
            getVoteStatus={getVoteStatusCallback}
          />
        ))}
      </div>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <h2>Foros Recomendados</h2>
           {loadingRecs ? (
              <LoadingSpinner />
           ) : recommendedForums.length > 0 ? (
             recommendedForums.map(forum => (
                <ForumCard key={forum.id} forum={forum} variant="recommendation" />
              ))
           ) : (
             <p className={styles.noRecommendations}>No hay recomendaciones por ahora.</p>
           )}
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
