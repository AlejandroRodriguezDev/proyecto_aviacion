import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForumCard.module.css';
import SubscribeButton from './SubscribeButton';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';

const ForumCard = ({ forum, variant = 'default' }) => {
  const { user, isAuthenticated } = useAuth();

  const isSubscribed = useMemo(() => {
    return isAuthenticated && Array.isArray(user?.subscribedForums) && user.subscribedForums.includes(forum?.id);
  }, [user?.subscribedForums, forum?.id, isAuthenticated]);

  if (!forum || !forum.id || !forum.name) {
    console.warn("ForumCard rendered with invalid forum data:", forum);
    return <div className={`${styles.forumCard} ${styles.placeholder}`}>Foro inválido</div>;
  }

  const bannerStyle = forum.bannerUrl ? { backgroundImage: `url(${forum.bannerUrl})` } : {};

  const ForumIcon = React.memo(() => (
    <div className={`${styles.forumIcon} avatar-placeholder`}>
      {forum.name ? forum.name.charAt(0).toUpperCase() : '?'}
    </div>
  ));

  return (
    <div className={`${styles.forumCard} ${styles[variant]} card`}>
      {variant === 'default' && (
        <Link to={`/forum/${forum.slug || forum.id}`} className={styles.bannerLink} aria-label={`Ir al foro ${forum.name}`}>
          <div className={`${styles.bannerPlaceholder} img-placeholder`} style={bannerStyle}>
            {!forum.bannerUrl && <span className={styles.bannerText}>{forum.name}</span>}
          </div>
        </Link>
      )}

      <div className={styles.forumInfo}>
        <Link to={`/forum/${forum.slug || forum.id}`} className={styles.iconLink} aria-label={`Ir al foro ${forum.name}`}>
          <ForumIcon />
        </Link>

        <div className={styles.forumDetails}>
          <Link to={`/forum/${forum.slug || forum.id}`} className={styles.forumNameLink}>
            <h4 className={styles.forumName}>#{forum.name}</h4>
          </Link>
          <p className={styles.forumDescription}>{forum.description}</p>
          {variant === 'default' && (
            <span className={styles.memberCount}>
              {forum.memberCount?.toLocaleString() ?? 0} Miembros
            </span>
          )}
        </div>

        <div className={styles.actionButtonContainer}>
          {variant === 'recommendation' ? (
            <Link to={`/forum/${forum.slug || forum.id}`}>
              <Button variant="secondary" size="small" className={styles.viewButton}>
                Visitar
              </Button>
            </Link>
          ) : (
            isAuthenticated && forum.id && (
              <SubscribeButton
                forumId={forum.id}
                isInitiallySubscribed={isSubscribed}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumCard;
