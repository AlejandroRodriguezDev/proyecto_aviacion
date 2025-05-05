// src/components/Forum/ForumCard.js
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForumCard.module.css';
import SubscribeButton from './SubscribeButton';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button'; // Para el botón "Visitar" alternativo

const ForumCard = ({ forum, variant = 'default' /* 'default' o 'recommendation' */ }) => {
  const { user, isAuthenticated } = useAuth();

  // Determina si el usuario actual está suscrito
  const isSubscribed = useMemo(() => {
    // Comprueba si el usuario está autenticado y si su lista de foros suscritos incluye el ID de este foro
    return isAuthenticated && Array.isArray(user?.subscribedForums) && user.subscribedForums.includes(forum?.id);
  }, [user?.subscribedForums, forum?.id, isAuthenticated]); // Dependencias correctas

  // Renderiza nada si los datos del foro son inválidos o faltan
  if (!forum || !forum.id || !forum.name) {
    console.warn("ForumCard rendered with invalid forum data:", forum);
    return <div className={`${styles.forumCard} ${styles.placeholder}`}>Foro inválido</div>; // Placeholder de error
  }

  // Estilo para el banner (si existe URL)
  const bannerStyle = forum.bannerUrl ? { backgroundImage: `url(${forum.bannerUrl})` } : {};

  // Componente memoizado para el icono del foro
  const ForumIcon = React.memo(() => (
    <div className={`${styles.forumIcon} avatar-placeholder`}>
      {/* Muestra inicial o '?' */}
      {forum.name ? forum.name.charAt(0).toUpperCase() : '?'}
    </div>
  ));

  return (
    <div className={`${styles.forumCard} ${styles[variant]} card`}> {/* Aplica variante como clase */}

      {/* Banner (solo en vista 'default') */}
      {variant === 'default' && (
        <Link to={`/forum/${forum.slug || forum.id}`} className={styles.bannerLink} aria-label={`Ir al foro ${forum.name}`}>
          <div className={`${styles.bannerPlaceholder} img-placeholder`} style={bannerStyle}>
             {/* Muestra nombre si no hay banner */}
            {!forum.bannerUrl && <span className={styles.bannerText}>{forum.name}</span>}
          </div>
        </Link>
      )}

      {/* Información del Foro */}
      <div className={styles.forumInfo}>
        <Link to={`/forum/${forum.slug || forum.id}`} className={styles.iconLink} aria-label={`Ir al foro ${forum.name}`}>
          <ForumIcon />
        </Link>

        <div className={styles.forumDetails}>
          <Link to={`/forum/${forum.slug || forum.id}`} className={styles.forumNameLink}>
            <h4 className={styles.forumName}>#{forum.name}</h4>
          </Link>
          <p className={styles.forumDescription}>{forum.description}</p>
          {/* Contador de Miembros (solo en vista 'default') */}
          {variant === 'default' && (
            <span className={styles.memberCount}>
              {forum.memberCount?.toLocaleString() ?? 0} Miembros
            </span>
          )}
        </div>

        {/* Contenedor de Acciones (Suscribirse o Visitar) */}
        <div className={styles.actionButtonContainer}>
          {variant === 'recommendation' ? (
            // Botón 'Visitar' para recomendaciones
            <Link to={`/forum/${forum.slug || forum.id}`}>
              <Button variant="secondary" size="small" className={styles.viewButton}>
                  Visitar
              </Button>
            </Link>
          ) : (
            // Botón 'Suscribirse' (solo si está logueado)
             // En variant='default', mostrar SubscribeButton si logueado
             // Opcionalmente, podrías mostrar 'Visitar' si no está logueado
            isAuthenticated && forum.id && ( // Asegura que forum.id exista
               <SubscribeButton
                 forumId={forum.id}
                 isInitiallySubscribed={isSubscribed}
                // No necesitamos callback aquí normalmente
              />
            )
            // {!isAuthenticated && (
            //    <Link to={`/forum/${forum.slug || forum.id}`}>
            //       <Button variant="secondary" size="small" className={styles.viewButton}>Visitar</Button>
            //    </Link>
            // )}
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumCard;