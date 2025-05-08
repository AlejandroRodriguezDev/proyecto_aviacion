import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './UserCard.module.css';
import AddFriendButton from './AddFriendButton';
import { useAuth } from '../../hooks/useAuth';

const UserCard = ({ user: profileUser }) => {
  const { user: loggedInUser } = useAuth();

  const isFriend = useMemo(() => {
    return loggedInUser?.friends?.includes(profileUser?.id);
  }, [loggedInUser?.friends, profileUser?.id]);

  if (!profileUser || !profileUser.id || !profileUser.username) {
    return <div className={`${styles.userCard} ${styles.loading} card`}>Cargando...</div>;
  }

  const showAddFriendButton = loggedInUser?.id !== profileUser.id;

  return (
    <div className={`${styles.userCard} card-lite`}>
      <Link to={`/user/${profileUser.username}`} className={styles.profileLink}>
        <div className={`${styles.avatarPlaceholder} avatar-placeholder`}>
          {profileUser.avatarUrl ? (
            <img src={profileUser.avatarUrl} alt="" loading="lazy"/>
          ) : (
            <span>{profileUser.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className={styles.userInfo}>
          <h4 className={styles.username}>@{profileUser.username}</h4>
          {profileUser.bio && <p className={styles.bio}>{profileUser.bio}</p>}
        </div>
      </Link>

      {showAddFriendButton && (
        <div className={styles.actionContainer}>
          <AddFriendButton
            targetUserId={profileUser.id}
            targetUsername={profileUser.username}
            initialIsFriend={isFriend}
          />
        </div>
      )}
    </div>
  );
};

export default UserCard;
