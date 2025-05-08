import { FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ForumHeader from '../components/Forum/ForumHeader';
import ForumRules from '../components/Forum/ForumRules';
import PostCard from '../components/Post/PostCard';
import PostSortOptions from '../components/Post/PostSortOptions';
import CreatePostForm from '../components/Post/CreatePostForm';
import Modal from '../components/Common/Modal';
import InputField from '../components/Common/InputField';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import styles from './ForumPage.module.css';
import { timeAgo } from '../utils/helpers';

const ForumPage = () => {
  const { forumSlug } = useParams();
  const { user, checkAuthState } = useAuth();
  const navigate = useNavigate();

  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingForum, setLoadingForum] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesToEdit, setRulesToEdit] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUsername, setBanUsername] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchForum = async () => {
      if (!forumSlug || !api.getForumDetails) return;
      setLoadingForum(true);
      setError('');
      try {
        const forumData = await api.getForumDetails(forumSlug);
        if (isMounted) {
           setForum(forumData);
           setRulesToEdit(Array.isArray(forumData.rules) ? forumData.rules.join('\n') : '');
           setIsSubscribed(user?.subscribedForums?.includes(forumData.id) || false);
        }
      } catch (err) {
        if (isMounted) {
           console.error(`Error fetching forum ${forumSlug}:`, err);
           setError(err.message === 'Forum not found' ? 'Foro no encontrado.' : 'Error al cargar el foro.');
           if (err.message === 'Forum not found') navigate('/404', { replace: true });
        }
      } finally {
        if (isMounted) setLoadingForum(false);
      }
    };
    fetchForum();
    return () => { isMounted = false; };
  }, [forumSlug, user, navigate]);

  useEffect(() => {
    let isMounted = true;
    if (!forum?.id || !api.getForumPosts) {
        setLoadingPosts(false);
        return;
    }

    const fetchP = async () => {
      setLoadingPosts(true);
      try {
        const postData = await api.getForumPosts(forum.id, sortOrder);
        if (isMounted) {
           setPosts(postData || []);
        }
      } catch (err) {
        if (isMounted) {
            console.error(`Error fetching posts for ${forum.id}:`, err);
            setError(prev => prev ? `${prev}\nError cargando posts.` : 'Error al cargar posts.');
        }
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    };
    fetchP();
    return () => { isMounted = false; };
  }, [forum?.id, sortOrder]);

  const handleSortChange = useCallback((newSortOrder) => {
    if (newSortOrder !== sortOrder) {
       setSortOrder(newSortOrder);
    }
  }, [sortOrder]);

  const handleSubscriptionChange = useCallback((newSubStatus) => {
    setIsSubscribed(newSubStatus);
    setForum(prev => prev ? { ...prev, memberCount: prev.memberCount + (newSubStatus ? 1 : -1) } : null);
    if (checkAuthState) checkAuthState();
  }, [checkAuthState]);

  const handlePostCreated = useCallback((newPost) => {
    if (sortOrder === 'newest') {
        setPosts(prev => [newPost, ...prev]);
    } else {
         handleSortChange('newest');
         setPosts(prev => [newPost, ...prev]);
    }
     setShowCreatePostModal(false);
  }, [sortOrder, handleSortChange]);

  const handlePostDeleted = useCallback((deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  }, []);

  const getVoteStatusCallback = useCallback(async (itemId, itemType = 'post') => {
      if (user && api.getUserVote) {
         try {
             const voteData = await api.getUserVote(user.id, itemId, itemType);
             return voteData?.voteType;
        } catch { return null; }
     }
      return null;
   }, [user]);

  const handleSaveRules = async (e) => {
    e.preventDefault();
    if (!user || !forum || !api.setForumRules) return;
    setModalLoading(true); setModalError('');
    try {
       const updatedRules = rulesToEdit.split('\n').map(rule => rule.trim()).filter(Boolean);
       const result = await api.setForumRules(user.id, forum.id, updatedRules);
       setForum(prev => prev ? ({ ...prev, rules: result.rules }) : null);
       setShowRulesModal(false);
    } catch (err) {
       setModalError(err.message || "Error al guardar.");
    } finally {
       setModalLoading(false);
    }
  };

  const handleBanUserSubmit = async (e) => {
    e.preventDefault();
    const usernameToBan = banUsername.trim().replace(/^@/, '');
    if (!user || !forum || !usernameToBan || !api.banUserFromForum) return;
    setModalLoading(true); setModalError('');
    try {
       await api.banUserFromForum(user.id, forum.id, usernameToBan);
       alert(`Usuario @${usernameToBan} baneado (simulado).`);
       setBanUsername(''); setShowBanModal(false);
    } catch (err) {
       setModalError(err.message || "Error al banear.");
    } finally {
       setModalLoading(false);
    }
  };

  if (loadingForum) return <LoadingSpinner center={true} size="60px" />;
  if (error && !forum) return <p className={styles.errorMessage}>{error}</p>;
  if (!forum) return <p className={styles.errorMessage}>Foro no disponible.</p>;

  return (
    <div className={styles.forumLayout}>
        <div className={styles.mainContent}>
            <ForumHeader
                forum={forum}
                isSubscribed={isSubscribed}
                onSubscriptionChange={handleSubscriptionChange}
                onShowCreatePost={() => setShowCreatePostModal(true)}
                onShowRulesModal={() => { setModalError(''); setShowRulesModal(true); }}
                onShowBanModal={() => { setModalError(''); setBanUsername(''); setShowBanModal(true); }}
             />

             <PostSortOptions currentSort={sortOrder} onSortChange={handleSortChange} />

             <div className={styles.postList}>
                 {loadingPosts ? (
                     <LoadingSpinner center={posts.length === 0} />
                 ) : posts.length === 0 ? (
                     <p className={styles.noPosts}>¡Este foro aún no tiene posts! Sé el primero.</p>
                 ) : (
                     posts.map(post => (
                         <PostCard
                            key={post.id}
                            post={post}
                            onPostDelete={handlePostDeleted}
                            getVoteStatus={getVoteStatusCallback}
                         />
                     ))
                 )}
             </div>
             {error && forum && !error.includes("foro") && <p className={styles.errorMessage}>{error}</p>}

        </div>

        <aside className={styles.sidebar}>
             <ForumRules rules={forum.rules} forumName={forum.name} />

              <div className={`${styles.forumMetaCard} card`}>
                 <h4>Acerca de #{forum.name}</h4>
                 {forum.createdAt && <p><FaCalendarAlt/> Creado {timeAgo(forum.createdAt)}</p>}
                 {forum.moderator?.username && (
                     <p>Mod: <Link to={`/user/${forum.moderator.username}`}>@{forum.moderator.username}</Link></p>
                 )}
                  {user && (
                    <Button variant='secondary' size='small' onClick={() => setShowCreatePostModal(true)} className={styles.sidebarCreateButton}>
                         Crear Post
                     </Button>
                  )}
              </div>
        </aside>

         <Modal
             isOpen={showCreatePostModal}
             onClose={() => setShowCreatePostModal(false)}
             title={`Nuevo Post en #${forum.name}`}
             size="large"
         >
             <CreatePostForm
                 forumId={forum.id}
                 forumName={forum.name}
                 onPostCreated={handlePostCreated}
                 onCancel={() => setShowCreatePostModal(false)}
             />
         </Modal>

         <Modal
             isOpen={showRulesModal}
             onClose={() => setShowRulesModal(false)}
             title="Editar Reglas del Foro"
         >
             <form onSubmit={handleSaveRules}>
                 <InputField
                     label="Reglas"
                     value={rulesToEdit}
                     onChange={(e) => setRulesToEdit(e.target.value)}
                     multiline
                 />
                 <Button type="submit" variant="primary" disabled={modalLoading}>
                     {modalLoading ? 'Guardando...' : 'Guardar reglas'}
                 </Button>
                 {modalError && <p className={styles.errorMessage}>{modalError}</p>}
             </form>
         </Modal>

         <Modal
             isOpen={showBanModal}
             onClose={() => setShowBanModal(false)}
             title="Bannear Usuario del Foro"
         >
             <form onSubmit={handleBanUserSubmit}>
                 <InputField
                     label="Nombre de usuario"
                     value={banUsername}
                     onChange={(e) => setBanUsername(e.target.value)}
                 />
                 <Button type="submit" variant="primary" disabled={modalLoading}>
                     {modalLoading ? 'Baneando...' : 'Bannear Usuario'}
                 </Button>
                 {modalError && <p className={styles.errorMessage}>{modalError}</p>}
             </form>
         </Modal>
    </div>
  );
};

export default ForumPage;
