import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './UserProfileHeader.module.css';
import Button from '../Common/Button';
import AddFriendButton from './AddFriendButton';
import { FaCog, FaMedal, FaUsers, FaPlane, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers';

const UserProfileHeader = ({ profileUser }) => {
    const { user: loggedInUser } = useAuth();
    const navigate = useNavigate();

    const isOwnProfile = useMemo(() => loggedInUser?.id === profileUser?.id, [loggedInUser, profileUser]);

    const initialIsFriend = useMemo(() => {
        if (Array.isArray(loggedInUser?.friends) && loggedInUser.friends.includes(profileUser?.id)) {
            return true;
        }
        return false;
    }, [loggedInUser?.friends, profileUser?.id]);

    const username = profileUser?.username ?? 'Usuario Desconocido';
    const friendsCount = Array.isArray(profileUser?.friends) ? profileUser.friends.length : 0;
    const forumsCount = Array.isArray(profileUser?.subscribedForums) ? profileUser.subscribedForums.length : 0;
    const likesCount = profileUser?.likesCount ?? 0;
    const joinDate = profileUser?.createdAt;

    const bioText = profileUser?.bio || (isOwnProfile ? 'Añade una biografía para presentarte.' : 'Este usuario aún no ha añadido una biografía.');

    const avatarUrl = profileUser?.avatarUrl;

    if (!profileUser || !profileUser.id) {
        return <header className={`${styles.profileHeader} ${styles.loading} card`}>Cargando perfil...</header>;
    }

    return (
        <header className={`${styles.profileHeader} card`}>
            <div className={styles.headerContent}>
                <div className={styles.avatarSection}>
                    <div className={`${styles.avatarLarge} avatar-placeholder`}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={`${username}'s avatar`} />
                    ) : (
                         <span>{username.charAt(0).toUpperCase()}</span>
                    )}
                    </div>
                </div>

                <div className={styles.infoAndActions}>
                    <div className={styles.nameActionsRow}>
                        <h1 className={styles.username}>@{username}</h1>
                        <div className={styles.actions}>
                        {isOwnProfile ? (
                            <Button variant="secondary" size="small" onClick={() => navigate('/settings')} title="Editar tu perfil">
                                <FaCog aria-hidden="true" /> Editar Perfil
                            </Button>
                        ) : (
                            <AddFriendButton
                                targetUserId={profileUser.id}
                                 targetUsername={profileUser.username}
                                initialIsFriend={initialIsFriend}
                            />
                        )}
                        </div>
                    </div>

                    <p className={styles.bio}>{bioText}</p>

                     <div className={styles.stats}>
                        <span className={styles.statItem} title="Likes totales recibidos">
                            <FaMedal aria-hidden="true" /> {likesCount.toLocaleString()} Likes
                        </span>
                        <span className={styles.statItem} title="Número de amigos">
                            <FaUsers aria-hidden="true" /> {friendsCount.toLocaleString()} Amigos
                        </span>
                        <span className={styles.statItem} title="Foros suscritos">
                            <FaPlane aria-hidden="true" /> {forumsCount.toLocaleString()} Foros
                        </span>
                        {joinDate && (
                            <span className={styles.statItem} title={`Miembro desde ${new Date(joinDate).toLocaleDateString()}`}>
                                 <FaCalendarAlt aria-hidden="true" /> Miembro desde {timeAgo(joinDate)}
                            </span>
                        )}
                     </div>
                </div>
             </div>
        </header>
    );
};

export default UserProfileHeader;
