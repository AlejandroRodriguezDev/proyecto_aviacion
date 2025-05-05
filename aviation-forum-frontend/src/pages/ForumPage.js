// src/pages/ForumPage.js
import { FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Hooks de React Router
import ForumHeader from '../components/Forum/ForumHeader'; // Cabecera del foro
import ForumRules from '../components/Forum/ForumRules';   // Reglas (en sidebar)
import PostCard from '../components/Post/PostCard';       // Tarjeta de post
import PostSortOptions from '../components/Post/PostSortOptions'; // Opciones de ordenación
import CreatePostForm from '../components/Post/CreatePostForm';   // Formulario crear post
import Modal from '../components/Common/Modal';               // Ventana Modal
import InputField from '../components/Common/InputField';       // Campo Input (para modales mod)
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Indicador Carga
import Button from '../components/Common/Button';             // Botón
import { api } from '../services/api';                    // Tu API simulada
import { useAuth } from '../hooks/useAuth';               // Hook Auth
import styles from './ForumPage.module.css';              // Estilos página
import { timeAgo } from '../utils/helpers';            // Helper tiempo

const ForumPage = () => {
  const { forumSlug } = useParams(); // Obtiene 'forumSlug' de la URL
  const { user, checkAuthState } = useAuth(); // Hook Auth (check para refrescar suscripción global)
  const navigate = useNavigate();

  // --- Estados del Componente ---
  const [forum, setForum] = useState(null);               // Datos del foro actual
  const [posts, setPosts] = useState([]);                // Posts del foro
  const [loadingForum, setLoadingForum] = useState(true);  // Cargando datos del foro
  const [loadingPosts, setLoadingPosts] = useState(true);  // Cargando posts
  const [error, setError] = useState('');                  // Mensajes de error
  const [sortOrder, setSortOrder] = useState('newest');    // Orden actual ('newest', 'likes')
  const [isSubscribed, setIsSubscribed] = useState(false);   // ¿Usuario suscrito?
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); // Visibilidad modal crear post

  // Estados para modales de moderador
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesToEdit, setRulesToEdit] = useState(''); // Guardar reglas como string multilínea
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUsername, setBanUsername] = useState('');
  const [modalLoading, setModalLoading] = useState(false); // Carga dentro de los modales mod
  const [modalError, setModalError] = useState('');     // Errores dentro de los modales mod

  // --- Efectos para Cargar Datos ---

  // Cargar Detalles del Foro
  useEffect(() => {
    let isMounted = true; // Flag para evitar setear estado si el componente se desmonta
    const fetchForum = async () => {
      if (!forumSlug || !api.getForumDetails) return;
      setLoadingForum(true);
      setError('');
      try {
        const forumData = await api.getForumDetails(forumSlug);
        if (isMounted) {
           setForum(forumData);
            // Convertir array de reglas a string multilínea para textarea
           setRulesToEdit(Array.isArray(forumData.rules) ? forumData.rules.join('\n') : '');
           // Verificar suscripción basada en el contexto actual del usuario
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
    return () => { isMounted = false; }; // Limpieza
  }, [forumSlug, user, navigate]); // Dependencias: cambia slug, cambia usuario


  // Cargar Posts del Foro (depende de 'forum' y 'sortOrder')
  useEffect(() => {
    let isMounted = true;
    if (!forum?.id || !api.getForumPosts) {
        setLoadingPosts(false); // No cargar si no hay ID de foro
        return;
    }

    const fetchP = async () => {
      setLoadingPosts(true);
      try {
        const postData = await api.getForumPosts(forum.id, sortOrder);
        if (isMounted) {
           setPosts(postData || []); // Asegurar array
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
  }, [forum?.id, sortOrder]); // Dependencias: ID del foro y ordenación

  // --- Callbacks y Handlers ---

  // Cambiar Ordenación
  const handleSortChange = useCallback((newSortOrder) => {
    if (newSortOrder !== sortOrder) {
       setSortOrder(newSortOrder);
       // Opcional: podrías setPosts([]) aquí para limpiar visualmente, pero setLoadingPosts lo hace
    }
  }, [sortOrder]);

  // Cambio de Suscripción (desde SubscribeButton)
  const handleSubscriptionChange = useCallback((newSubStatus) => {
    setIsSubscribed(newSubStatus);
    // Actualiza contador visualmente (la API mock ya lo haría)
    setForum(prev => prev ? { ...prev, memberCount: prev.memberCount + (newSubStatus ? 1 : -1) } : null);
    // Refresca contexto de Auth para actualizar lista global `subscribedForums`
    if (checkAuthState) checkAuthState();
  }, [checkAuthState]);

  // Post Creado (desde CreatePostForm en Modal)
  const handlePostCreated = useCallback((newPost) => {
    if (sortOrder === 'newest') { // Añade al principio si está ordenado por nuevo
        setPosts(prev => [newPost, ...prev]);
    } else {
         // Podrías añadirlo al final, o forzar reordenar a 'newest'
         // setPosts(prev => [...prev, newPost]); // Menos intuitivo si no es 'newest'
         handleSortChange('newest'); // Cambia a 'newest' para verlo arriba
         setPosts(prev => [newPost, ...prev]); // Añade de todas formas
    }
     setShowCreatePostModal(false); // Cierra el modal
  }, [sortOrder, handleSortChange]); // Depende de sortOrder y del handler de cambio

  // Post Eliminado (desde PostCard)
  const handlePostDeleted = useCallback((deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  }, []);

  // Obtener estado de voto para posts (se pasa a PostCard)
   const getVoteStatusCallback = useCallback(async (itemId, itemType = 'post') => {
      if (user && api.getUserVote) {
         try {
             const voteData = await api.getUserVote(user.id, itemId, itemType);
             return voteData?.voteType;
        } catch { return null; }
     }
      return null;
   }, [user]);


  // --- Handlers de Acciones de Moderador ---

  // Guardar Reglas Editadas
  const handleSaveRules = async (e) => {
    e.preventDefault();
    if (!user || !forum || !api.setForumRules) return;
    setModalLoading(true); setModalError('');
    try {
       // Convierte el string multilínea del textarea a array de reglas
       const updatedRules = rulesToEdit.split('\n').map(rule => rule.trim()).filter(Boolean);
       const result = await api.setForumRules(user.id, forum.id, updatedRules);
       // Actualiza el estado local del foro con las nuevas reglas
       setForum(prev => prev ? ({ ...prev, rules: result.rules }) : null);
       setShowRulesModal(false); // Cierra modal
    } catch (err) {
       setModalError(err.message || "Error al guardar.");
    } finally {
       setModalLoading(false);
    }
  };

   // Ejecutar Baneo
   const handleBanUserSubmit = async (e) => {
    e.preventDefault();
    const usernameToBan = banUsername.trim().replace(/^@/, ''); // Limpia y quita @ inicial
    if (!user || !forum || !usernameToBan || !api.banUserFromForum) return;
    setModalLoading(true); setModalError('');
    try {
       await api.banUserFromForum(user.id, forum.id, usernameToBan);
       alert(`Usuario @${usernameToBan} baneado (simulado).`);
       setBanUsername(''); setShowBanModal(false); // Limpia y cierra
    } catch (err) {
       setModalError(err.message || "Error al banear.");
    } finally {
       setModalLoading(false);
    }
  };


  // --- Renderizado ---
  if (loadingForum) return <LoadingSpinner center={true} size="60px" />;
   // Error crítico si el foro no carga
  if (error && !forum) return <p className={styles.errorMessage}>{error}</p>;
   // Fallback por si acaso
  if (!forum) return <p className={styles.errorMessage}>Foro no disponible.</p>;

  return (
    <div className={styles.forumLayout}>
        {/* Contenido Principal */}
        <div className={styles.mainContent}>
            {/* Cabecera del Foro */}
            <ForumHeader
                forum={forum}
                isSubscribed={isSubscribed}
                onSubscriptionChange={handleSubscriptionChange}
                onShowCreatePost={() => setShowCreatePostModal(true)}
                onShowRulesModal={() => { setModalError(''); setShowRulesModal(true); }}
                onShowBanModal={() => { setModalError(''); setBanUsername(''); setShowBanModal(true); }}
             />

             {/* Opciones de Ordenación */}
             <PostSortOptions currentSort={sortOrder} onSortChange={handleSortChange} />

             {/* Lista de Posts */}
             <div className={styles.postList}>
                 {loadingPosts ? (
                     <LoadingSpinner center={posts.length === 0} /> /* Centrado solo si no hay posts */
                 ) : posts.length === 0 ? (
                     <p className={styles.noPosts}>¡Este foro aún no tiene posts! Sé el primero.</p>
                 ) : (
                     posts.map(post => (
                         <PostCard
                            key={post.id}
                            post={post}
                            onPostDelete={handlePostDeleted}
                            getVoteStatus={getVoteStatusCallback} // Pasar callback
                         />
                     ))
                 )}
             </div>
              {/* Mostrar error de carga de posts si ocurrió */}
             {error && forum && !error.includes("foro") && <p className={styles.errorMessage}>{error}</p>}

        </div> {/* Fin .mainContent */}

        {/* Barra Lateral */}
        <aside className={styles.sidebar}>
             {/* Reglas del Foro */}
             <ForumRules rules={forum.rules} forumName={forum.name} />

              {/* Info Adicional */}
              <div className={`${styles.forumMetaCard} card`}>
                 <h4>Acerca de #{forum.name}</h4>
                 {forum.createdAt && <p><FaCalendarAlt/> Creado {timeAgo(forum.createdAt)}</p>}
                 {forum.moderator?.username && (
                     <p>Mod: <Link to={`/user/${forum.moderator.username}`}>@{forum.moderator.username}</Link></p>
                 )}
                  {user && ( // Botón Crear Post también en sidebar
                    <Button variant='secondary' size='small' onClick={() => setShowCreatePostModal(true)} className={styles.sidebarCreateButton}>
                         Crear Post
                     </Button>
                  )}
              </div>
             {/* Otros widgets posibles: Foros relacionados, etc. */}
        </aside>

         {/* --- Modales --- */}

         {/* Modal Crear Post */}
         <Modal
             isOpen={showCreatePostModal}
             onClose={() => setShowCreatePostModal(false)}
             title={`Nuevo Post en #${forum.name}`}
             size="large" // Modal más grande para el form
         >
             <CreatePostForm
                 forumId={forum.id}
                 forumName={forum.name}
                 onPostCreated={handlePostCreated} // Callback éxito
                 onCancel={() => setShowCreatePostModal(false)} // Callback cancelar
             />
             {/* CreatePostForm ahora incluye sus propios botones */}
         </Modal>

         {/* Modal Editar Reglas */}
         <Modal
             isOpen={showRulesModal}
             onClose={() => setShowRulesModal(false)}
             title="Editar Reglas"
         >
             <form onSubmit={handleSaveRules} className={styles.modalForm}>
                  <p className={styles.modalDescription}>Introduce una regla por línea.</p>
                 {modalError && <p className={styles.modalError}>{modalError}</p>}
                 <textarea
                     value={rulesToEdit} // String multilínea
                     onChange={(e) => setRulesToEdit(e.target.value)}
                     rows={10}
                     placeholder="Regla 1
Regla 2
Regla 3..." 
 //es salto de línea en placeholder
                     className={styles.rulesTextarea}
                     disabled={modalLoading}
                     aria-label="Reglas del foro (una por línea)"
                 />
                  {/* Footer manual del modal */}
                  <div className={styles.modalFooter}>
                      <Button type="button" variant="secondary" onClick={() => setShowRulesModal(false)} disabled={modalLoading}>Cancelar</Button>
                      <Button type="submit" variant="primary" isLoading={modalLoading}>Guardar</Button>
                  </div>
              </form>
         </Modal>

         {/* Modal Banear Usuario */}
         <Modal
             isOpen={showBanModal}
             onClose={() => setShowBanModal(false)}
             title="Banear Usuario"
             size="small" // Modal más pequeño
         >
             <form onSubmit={handleBanUserSubmit} className={styles.modalForm}>
                 <p className={styles.modalDescription}>El usuario baneado no podrá ver ni participar en este foro.</p>
                 {modalError && <p className={styles.modalError}>{modalError}</p>}
                 <InputField
                     id="ban-username-input"
                     label="Nombre de usuario"
                     value={banUsername}
                     onChange={(e) => setBanUsername(e.target.value)}
                     placeholder="@usuario_a_banear"
                     required
                     disabled={modalLoading}
                     autoCapitalize="none" // No capitalizar usernames
                 />
                 {/* Footer manual del modal */}
                 <div className={styles.modalFooter}>
                     <Button type="button" variant="secondary" onClick={() => setShowBanModal(false)} disabled={modalLoading}>Cancelar</Button>
                     <Button type="submit" variant="danger" isLoading={modalLoading}>Banear</Button>
                 </div>
             </form>
         </Modal>

    </div> // Fin .forumLayout
  );
};

export default ForumPage;