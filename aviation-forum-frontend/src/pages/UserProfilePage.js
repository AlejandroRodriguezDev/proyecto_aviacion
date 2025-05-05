// src/pages/UserProfilePage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate para volver
import UserProfileHeader from '../components/User/UserProfileHeader'; // Cabecera perfil
import UserCard from '../components/User/UserCard';         // Para lista de amigos
// PostCard podría ser demasiado pesado, crearemos un componente más simple o usaremos divs
// import PostCard from '../components/Post/PostCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button'; // Para botón volver
import { api } from '../services/api';              // Tu API
import styles from './UserProfilePage.module.css'; // Estilos
import { useAuth } from '../hooks/useAuth';
import { timeAgo } from '../utils/helpers';      // Helper tiempo
import { FaUserFriends, FaListAlt, FaComments, FaPlane, FaArrowLeft } from 'react-icons/fa'; // Iconos

const UserProfilePage = () => {
  const { username } = useParams();      // Username de la URL
  const { user: loggedInUser } = useAuth(); // Usuario logueado
  const navigate = useNavigate();          // Para botón "Volver"

  // Estados
  const [profileUser, setProfileUser] = useState(null); // Datos del perfil cargado
  const [loading, setLoading] = useState(true);       // Estado de carga
  const [error, setError] = useState('');           // Mensaje de error
  const [activeTab, setActiveTab] = useState('posts'); // Tab activa por defecto ('posts', 'comments', 'friends', 'forums')

  // Carga los datos del perfil cuando cambia el username en la URL
  useEffect(() => {
    let isMounted = true;
    const fetchUserProfile = async () => {
      if (!username || !api.getUserProfile) return; // Verifica que haya username y función API
      setLoading(true);
      setError('');
      setProfileUser(null); // Resetea al cambiar de perfil
      setActiveTab('posts'); // Vuelve a la tab de posts

      try {
        const userData = await api.getUserProfile(username);
         // Tu api.js ya devuelve posts, comments, friends (con detalles), subscribedForums (con detalles)
         if (isMounted) setProfileUser(userData);
      } catch (err) {
         if (isMounted) {
             console.error(`Error fetching profile for ${username}:`, err);
             setError(err.message === 'User not found' ? `No se encontró el usuario @${username}.` : 'Error al cargar el perfil.');
             if (err.message === 'User not found') { /* Opcional: navigate('/404'); */ }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();
    return () => { isMounted = false; }; // Limpieza
  }, [username]); // Dependencia: Recargar si el username de la URL cambia

   // Determina si el perfil mostrado es el del usuario logueado
   const isOwnProfile = useMemo(() => loggedInUser?.username === username, [loggedInUser, username]);


   // Función para renderizar el contenido de la tab activa
   const renderActiveTabContent = () => {
     if (!profileUser) return null; // No renderizar si no hay datos

      // Extrae las listas del objeto profileUser para mayor claridad
       const { posts = [], comments = [], friends = [], subscribedForums = [] } = profileUser;

       switch (activeTab) {
         // Tab de Posts del Usuario
         case 'posts':
            return (
               <div className={`${styles.tabContent} ${styles.postsList}`}>
                {posts.length > 0 ? (
                     posts.map(post => (
                       // Usamos una tarjeta simplificada aquí, no el PostCard completo
                       <div key={post.id} className={`${styles.contentItem} card-lite`}>
                          {/* Link al post completo */}
                          <Link to={`/post/${post.id}`} className={styles.itemTitleLink}>{post.title}</Link>
                           {/* Meta: Foro y Fecha */}
                          <div className={styles.itemMeta}>
                            En{' '}
                             {post.forum?.slug || post.forum?.id ? (
                                 <Link to={`/forum/${post.forum.slug || post.forum.id}`}>#{post.forum.name || 'Foro Desconocido'}</Link>
                             ) : (
                                  <span>#{post.forum?.name || 'Foro Desconocido'}</span>
                             )}
                             {' • '} {timeAgo(post.createdAt)}
                            {/* Opcional: mostrar votos netos */}
                            {/* <span className={styles.netVotes}>({(post.likes || 0) - (post.dislikes || 0)})</span> */}
                          </div>
                       </div>
                     ))
                  ) : <p className={styles.noContentMessage}>Este usuario aún no ha publicado nada.</p>}
               </div>
            );

          // Tab de Comentarios del Usuario
         case 'comments':
            return (
               <div className={`${styles.tabContent} ${styles.commentsList}`}>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                           <div key={comment.id} className={`${styles.contentItem} card-lite`}>
                              {/* Muestra un snippet del comentario */}
                             <blockquote className={styles.commentSnippet}>
                                  "{comment.text?.substring(0, 150)}{comment.text?.length > 150 ? '...' : ''}"
                              </blockquote>
                              <div className={styles.itemMeta}>
                                En respuesta a{' '}
                                 {/* Link al post donde se hizo el comentario */}
                                <Link to={`/post/${comment.post?.id || comment.postId}`}>
                                     {comment.post?.title || 'un post'}
                                </Link>
                                 {' • '} {timeAgo(comment.createdAt)}
                                 {/* Opcional: votos del comentario */}
                                  {/* <span className={styles.netVotes}>({(comment.likes || 0) - (comment.dislikes || 0)})</span> */}
                              </div>
                           </div>
                        ))
                     ) : <p className={styles.noContentMessage}>Este usuario aún no ha comentado.</p>}
               </div>
            );

         // Tab de Amigos
         case 'friends':
            return (
                // Usar grid para mostrar UserCards
                <div className={`${styles.tabContent} ${styles.friendsGrid}`}>
                    {friends.length > 0 ? (
                         friends.map(friend => (
                             // Reutiliza UserCard (ya tiene botón amigo interno)
                            <UserCard key={friend.id} user={friend} />
                         ))
                     ) : <p className={styles.noContentMessage}>{isOwnProfile ? 'Aún no has agregado amigos.' : 'Este usuario no tiene amigos.'}</p>}
                </div>
             );

         // Tab de Foros Suscritos
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
                                     {/* Podrías mostrar la descripción del foro si la API la incluye */}
                                      {/* {forum.description && <p className={styles.forumDescSnippet}>{forum.description}</p>} */}
                                </div>
                            </div>
                         ))
                     ) : <p className={styles.noContentMessage}>{isOwnProfile ? 'No estás suscrito a ningún foro.' : 'Este usuario no sigue ningún foro.'}</p>}
                </div>
            );
         default:
            return null; // Caso por defecto (no debería ocurrir)
       }
   }; // Fin renderActiveTabContent


   // --- Renderizado Principal ---
   if (loading) return <LoadingSpinner center={true} size="60px"/>;
   if (error) return <p className={styles.errorMessage}>{error}</p>;
   if (!profileUser) return <p className={styles.errorMessage}>No se pudo cargar el perfil.</p>;


  return (
    <div className={styles.profileContainer}>
       {/* Botón Volver */}
      <Button onClick={() => navigate(-1)} variant="secondary" size="small" className={styles.backButton}>
          <FaArrowLeft/> Volver
      </Button>

      {/* Cabecera del Perfil */}
      <UserProfileHeader profileUser={profileUser} />

      {/* Navegación por Tabs */}
      <nav className={styles.profileTabs} role="tablist" aria-label="Secciones del perfil">
        {/* Botón Tab Posts */}
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
         {/* Botón Tab Comentarios */}
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
        {/* Botón Tab Amigos */}
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
         {/* Botón Tab Foros */}
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

      {/* Panel de Contenido Activo */}
      {/* Usamos key para forzar re-renderizado si cambia el user Y la tab,
         asegurando limpieza de estados hijos si fuera necesario, aunque aquí
         el contenido se renderiza condicionalmente basado en activeTab. */}
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