// src/pages/UserProfilePage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserProfileHeader from '../components/User/UserProfileHeader';
import UserCard from '../components/User/UserCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { api } from '../services/api';
import styles from './UserProfilePage.module.css';
import { useAuth } from '../hooks/useAuth';
import { timeAgo } from '../utils/helpers';
import { FaUserFriends, FaListAlt, FaComments, FaPlane, FaArrowLeft } from 'react-icons/fa';

const UserProfilePage = () => {
  const { username } = useParams();
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    let isMounted = true;
    const fetchUserProfile = async () => {
      if (!username || !api.getUserProfile) return;
      setLoading(true);
      setError('');
      setProfileUser(null);
      setActiveTab('posts');

      try {
        const userData = await api.getUserProfile(username);
        if (isMounted) setProfileUser(userData);
      } catch (err) {
        if (isMounted) {
          console.error(`Error fetching profile for ${username}:`, err);
          setError(err.message === 'User not found' ? `No se encontró el usuario @${username}.` : 'Error al cargar el perfil.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();
    return () => { isMounted = false; };
  }, [username]);

  const isOwnProfile = useMemo(() => loggedInUser?.username === username, [loggedInUser, username]);

  const renderActiveTabContent = () => {
    if (!profileUser) return null;

    const { posts = [], comments = [], friends = [], subscribedForums = [] } = profileUser;

    switch (activeTab) {
      case 'posts':
        return (
          <div className={`${styles.tabContent} ${styles.postsList}`}>
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} className={`${styles.contentItem} card-lite`}>
                  <Link to={`/post/${post.id}`} className={styles.itemTitleLink}>{post.title}</Link>
                  <div className={styles.itemMeta}>
                    En{' '}
                    {post.forum?.slug || post.forum?.id ? (
                      <Link to={`/forum/${post.forum.slug || post.forum.id}`}>#{post.forum.name || 'Foro Desconocido'}</Link>
                    ) : (
                      <span>#{post.forum?.name || 'Foro Desconocido'}</span>
                    )}
                    {' • '} {timeAgo(post.createdAt)}
                  </div>
                </div>
              ))
            ) : <p className={styles.noContentMessage}>Este usuario aún no ha publicado nada.</p>}
          </div>
        );

      case 'comments':
        return (
          <div className={`${styles.tabContent} ${styles.commentsList}`}>
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className={`${styles.contentItem} card-lite`}>
                  <blockquote className={styles.commentSnippet}>
                    "{comment.text?.substring(0, 150)}{comment.text?.length > 150 ? '...' : ''}"
                  </blockquote>
                  <div className={styles.itemMeta}>
                    En respuesta a{' '}
                    <Link to={`/post/${comment.post?.id || comment.postId}`}>
                      {comment.post?.title || 'un post'}
                    </Link>
                    {' • '} {timeAgo(comment.createdAt)}
                  </div>
                </div>
              ))
            ) : <p className={styles.noContentMessage}>Este usuario aún no ha comentado.</p>}
          </div>
        );

      case 'friends':
        return (
          <div className={`${styles.tabContent} ${styles.friendsGrid}`}>
            {friends.length > 0 ? (
              friends.map(friend => (
                <UserCard key={friend.id} user={friend} />
              ))
            ) : <p className={styles.noContentMessage}>{isOwnProfile ? 'Aún no has agregado amigos.' : 'Este usuario no tiene amigos.'}</p>}
          </div>
        );

      case 'forums':
        return (
          <div className={`${styles.tabContent} ${styles.forumsList}`}>
            {subscribedForums.length > 0 ? (
              subscribedForums.map(forum => (
                <div key={forum.id} className={`${styles.contentItem} card-lite`}>
                  <Link to={`/forum/${forum.slug || forum.id}`} className={styles.itemTitleLink}>
                    #{forum.name}
                  </Link>
                  <div className={styles.itemMeta}>
                    {forum.memberCount?.toLocaleString()} miembros
                  </div>
                </div>
              ))
            ) : <p className={styles.noContentMessage}>{isOwnProfile ? 'No estás suscrito a ningún foro.' : 'Este usuario no sigue ningún foro.'}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner center={true} size="60px"/>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!profileUser) return <p className={styles.errorMessage}>No se pudo cargar el perfil.</p>;

  return (
    <div className={styles.profileContainer}>
      <Button onClick={() => navigate(-1)} variant="secondary" size="small" className={styles.backButton}>
        <FaArrowLeft/> Volver
      </Button>

      <UserProfileHeader profileUser={profileUser} />

      <nav className={styles.profileTabs} role="tablist" aria-label="Secciones del perfil">
        <button
          role="tab"
          aria-selected={activeTab === 'posts'}
          aria-controls="tabpanel-posts"
          id="tab-posts"
          onClick={() => setActiveTab('posts')}
          className={`${styles.tabButton} ${activeTab === 'posts' ? styles.active : ''}`}
        >
          <FaListAlt /> Posts ({profileUser.posts?.length ?? 0})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'comments'}
          aria-controls="tabpanel-comments"
          id="tab-comments"
          onClick={() => setActiveTab('comments')}
          className={`${styles.tabButton} ${activeTab === 'comments' ? styles.active : ''}`}
        >
          <FaComments /> Comentarios ({profileUser.comments?.length ?? 0})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'friends'}
          aria-controls="tabpanel-friends"
          id="tab-friends"
          onClick={() => setActiveTab('friends')}
          className={`${styles.tabButton} ${activeTab === 'friends' ? styles.active : ''}`}
        >
          <FaUserFriends /> Amigos ({profileUser.friends?.length ?? 0})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'forums'}
          aria-controls="tabpanel-forums"
          id="tab-forums"
          onClick={() => setActiveTab('forums')}
          className={`${styles.tabButton} ${activeTab === 'forums' ? styles.active : ''}`}
        >
          <FaPlane /> Foros ({profileUser.subscribedForums?.length ?? 0})
        </button>
      </nav>

      <div
        key={`${profileUser.id}-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        id={`tabpanel-${activeTab}`}
      >
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default UserProfilePage;
