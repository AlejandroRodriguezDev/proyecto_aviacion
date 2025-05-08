import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ForumHeader.module.css';
import SubscribeButton from './SubscribeButton';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import { FaShieldAlt, FaBan, FaPlus, FaUsers } from 'react-icons/fa';
import { timeAgo } from '../../utils/helpers';

const ForumHeader = ({
  forum,
  isSubscribed,
  onSubscriptionChange,
  onShowCreatePost,
  onShowRulesModal,
  onShowBanModal
}) => {
    const { user } = useAuth();

    const canModerate = useMemo(() => {
        return !!user && !!forum && forum.creator === user.id;
    }, [user, forum]);

    const bannerStyle = forum?.bannerUrl ? { backgroundImage: `url(${forum.bannerUrl})` } : {};

    const ForumIcon = React.memo(() => (
        <div className={`${styles.forumIcon} avatar-placeholder`}>
        {forum?.name ? forum.name.charAt(0).toUpperCase() : '?'}
        </div>
    ));

    const creatorUsername = forum?.moderator?.username;

    if (!forum) {
       return <header className={`${styles.forumHeader} ${styles.loading} card`}>Cargando...</header>;
     }

    return (
        <header className={`${styles.forumHeader} card`}>
        <div className={`${styles.banner} img-placeholder`} style={bannerStyle}>
             {!forum.bannerUrl && <span className={styles.bannerText}>#{forum.name}</span>}
        </div>

        <div className={styles.headerContent}>
             <div className={styles.headerInfo}>
             <div className={styles.iconContainer}>
                 <ForumIcon />
             </div>
             <div className={styles.forumMeta}>
                 <h1 className={styles.forumName}>#{forum.name}</h1>
                 <p className={styles.forumDescription}>{forum.description}</p>
                 <div className={styles.forumStats}>
                    <span><FaUsers aria-hidden="true" /> {forum.memberCount?.toLocaleString() ?? 0} Miembros</span>
                     {creatorUsername && (
                        <span>
                            Mod: <Link to={`/user/${creatorUsername}`} title={`Moderado por @${creatorUsername}`}>@{creatorUsername}</Link>
                        </span>
                    )}
                     {forum.createdAt && <span>Creado {timeAgo(forum.createdAt)}</span>}
                 </div>
                  {forum.tags && forum.tags.length > 0 && (
                    <div className={styles.tagsContainer}>
                         {forum.tags.map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                         ))}
                    </div>
                 )}
             </div>
             </div>

             <div className={styles.headerActions}>
             <div className={styles.mainActions}>
                  {user && (
                    <Button variant="primary" onClick={onShowCreatePost} size="medium" title="Crear nuevo post en este foro">
                         <FaPlus aria-hidden="true" /> Crear Post
                     </Button>
                 )}
                 <SubscribeButton
                    forumId={forum.id}
                    isInitiallySubscribed={isSubscribed}
                    onSubscriptionChange={onSubscriptionChange}
                 />
             </div>

             {canModerate && (
                 <div className={styles.moderatorActions}>
                    <Button onClick={onShowRulesModal} variant="secondary" size="small" title="Editar reglas">
                         <FaShieldAlt /> <span className={styles.modActionText}>Reglas</span>
                    </Button>
                    <Button onClick={onShowBanModal} variant="danger" size="small" title="Banear usuario del foro">
                         <FaBan /> <span className={styles.modActionText}>Banear</span>
                    </Button>
                 </div>
             )}
             </div>
        </div>
        </header>
    );
};

export default ForumHeader;
