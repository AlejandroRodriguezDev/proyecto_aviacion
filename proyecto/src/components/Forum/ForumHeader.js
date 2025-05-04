// src/components/Forum/ForumHeader.js
import React from 'react';
import styles from './ForumHeader.module.css';
import SubscribeButton from './SubscribeButton';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button'; // For moderator actions if needed
import { FaEdit, FaBan } from 'react-icons/fa'; // Icons for mod actions

const ForumHeader = ({ forum, isSubscribed, onSubscriptionChange, onShowCreatePost }) => {
    const { user, isModerator } = useAuth();
    const canModerate = isModerator(forum.id);

    const bannerStyle = forum.bannerUrl ? { backgroundImage: `url(${forum.bannerUrl})` } : {};

    const ForumIcon = () => (
        <div className={`${styles.forumIcon} avatar-placeholder`}>
            {forum.name ? forum.name.charAt(0).toUpperCase() : '?'}
        </div>
    );

    const handleEditRules = () => {
        // TODO: Implement modal or inline editing for rules
        alert("Funcionalidad de editar reglas no implementada.");
    }
    const handleBanUser = () => {
         // TODO: Implement modal to input username and ban
         alert("Funcionalidad de banear usuario no implementada.");
    }


    return (
        <header className={`${styles.forumHeader} card`}>
            <div className={`${styles.banner} img-placeholder`} style={bannerStyle}>
                {!forum.bannerUrl && <span>Banner del Foro (Opcional)</span>}
            </div>
            <div className={styles.headerContent}>
                <div className={styles.headerInfo}>
                    <ForumIcon />
                    <div className={styles.forumMeta}>
                        <h1 className={styles.forumName}>#{forum.name}</h1>
                        <p className={styles.forumDescription}>{forum.description}</p>
                        <div className={styles.forumStats}>
                            <span>{forum.memberCount?.toLocaleString() ?? 0} Miembros</span>
                            {forum.creator && <span>Creado por @{mockUsers[forum.creator]?.username || 'Desconocido'}</span>}
                        </div>
                         {/* Display Tags */}
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
                    <Button variant="primary" onClick={onShowCreatePost} size="medium">
                        Crear Post
                    </Button>
                    <SubscribeButton
                        forumId={forum.id}
                        isInitiallySubscribed={isSubscribed}
                        onSubscriptionChange={onSubscriptionChange}
                    />
                    {/* Moderator Actions */}
                    {canModerate && (
                        <div className={styles.moderatorActions}>
                            <Button onClick={handleEditRules} variant="secondary" size="small" title="Editar Reglas">
                                <FaEdit /> <span className={styles.modActionText}>Reglas</span>
                            </Button>
                            <Button onClick={handleBanUser} variant="danger" size="small" title="Banear Usuario del Foro">
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