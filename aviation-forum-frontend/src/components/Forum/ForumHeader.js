// src/components/Forum/ForumHeader.js
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForumHeader.module.css';
import SubscribeButton from './SubscribeButton'; // Asegúrate que este path sea correcto
import { useAuth } from '../../hooks/useAuth';  // Asegúrate que este path sea correcto
import Button from '../Common/Button';
// Verifica esta línea de importación de iconos:
import { FaShieldAlt, FaBan, FaPlus, FaUsers } from 'react-icons/fa'; // <-- ASEGÚRATE QUE FaUsers ESTÉ AQUÍ
import { timeAgo } from '../../utils/helpers'; // Asegúrate que este path sea correcto

const ForumHeader = ({
  forum,                // Datos del foro
  isSubscribed,         // Booleano si el user actual está suscrito
  onSubscriptionChange, // Callback al suscribirse/desuscribirse
  onShowCreatePost,     // Callback para mostrar form/modal de crear post
  onShowRulesModal,     // Callback para mostrar modal de editar reglas (moderador)
  onShowBanModal        // Callback para mostrar modal de banear (moderador)
}) => {
    const { user } = useAuth();

    // Determina si el usuario puede moderar este foro
    const canModerate = useMemo(() => {
        // Lógica basada en tu API: el creador es el moderador
        return !!user && !!forum && forum.creator === user.id;
        // O si tu API retorna isModerator directamente:
        // return !!user && !!forum && forum.isModerator; // Necesitarías que la API enriquezca 'forum'
    }, [user, forum]);

    // Estilo para el banner
    const bannerStyle = forum?.bannerUrl ? { backgroundImage: `url(${forum.bannerUrl})` } : {};

    // Componente para el icono
    const ForumIcon = React.memo(() => (
        <div className={`${styles.forumIcon} avatar-placeholder`}>
        {forum?.name ? forum.name.charAt(0).toUpperCase() : '?'}
        </div>
    ));

    // Nombre de usuario del creador/moderador (viene de tu api.getForumDetails)
    const creatorUsername = forum?.moderator?.username;

    // Renderiza un loader o null si no hay datos del foro aún
     if (!forum) {
       // Podría mostrar un esqueleto de carga
       return <header className={`${styles.forumHeader} ${styles.loading} card`}>Cargando...</header>;
     }

    return (
        <header className={`${styles.forumHeader} card`}> {/* Usa clase base 'card' */}
        {/* Banner */}
        <div className={`${styles.banner} img-placeholder`} style={bannerStyle}>
             {/* Texto fallback si no hay imagen */}
             {!forum.bannerUrl && <span className={styles.bannerText}>#{forum.name}</span>}
        </div>

        {/* Contenido Principal */}
        <div className={styles.headerContent}>
             {/* Sección de Icono y Metadatos */}
             <div className={styles.headerInfo}>
             <div className={styles.iconContainer}> {/* Contenedor extra para el icono */}
                 <ForumIcon />
             </div>
             <div className={styles.forumMeta}>
                 <h1 className={styles.forumName}>#{forum.name}</h1>
                 <p className={styles.forumDescription}>{forum.description}</p>
                  {/* Estadísticas */}
                 <div className={styles.forumStats}>
                    <span><FaUsers aria-hidden="true" /> {forum.memberCount?.toLocaleString() ?? 0} Miembros</span>
                     {creatorUsername && (
                        <span>
                            Mod: <Link to={`/user/${creatorUsername}`} title={`Moderado por @${creatorUsername}`}>@{creatorUsername}</Link>
                        </span>
                    )}
                     {forum.createdAt && <span>Creado {timeAgo(forum.createdAt)}</span>}
                 </div>
                  {/* Tags */}
                  {forum.tags && forum.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                         {forum.tags.map(tag => (
                            // TODO: Convertir tag en link a /search?tag=tagname
                            <span key={tag} className={styles.tag}>#{tag}</span>
                         ))}
                    </div>
                 )}
             </div>
             </div> {/* Fin .headerInfo */}

             {/* Sección de Acciones */}
             <div className={styles.headerActions}>
             {/* Acciones Principales (Crear post, Suscribirse) */}
             <div className={styles.mainActions}>
                  {/* Botón Crear Post (solo si logueado) */}
                  {user && (
                    <Button variant="primary" onClick={onShowCreatePost} size="medium" title="Crear nuevo post en este foro">
                         <FaPlus aria-hidden="true" /> Crear Post
                     </Button>
                 )}
                  {/* Botón Suscripción (Renderizado siempre, gestiona estado interno) */}
                 <SubscribeButton
                    forumId={forum.id}
                    isInitiallySubscribed={isSubscribed}
                    onSubscriptionChange={onSubscriptionChange}
                 />
             </div>

              {/* Acciones de Moderador (si aplica) */}
             {canModerate && (
                 <div className={styles.moderatorActions}>
                    {/* Botón Editar Reglas */}
                    <Button onClick={onShowRulesModal} variant="secondary" size="small" title="Editar reglas">
                         <FaShieldAlt /> <span className={styles.modActionText}>Reglas</span>
                    </Button>
                     {/* Botón Banear Usuario */}
                    <Button onClick={onShowBanModal} variant="danger" size="small" title="Banear usuario del foro">
                         <FaBan /> <span className={styles.modActionText}>Banear</span>
                    </Button>
                 </div>
             )}
             </div> {/* Fin .headerActions */}
        </div> {/* Fin .headerContent */}
        </header>
    );
};

export default ForumHeader;