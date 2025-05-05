// src/components/User/UserCard.js
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './UserCard.module.css';
import AddFriendButton from './AddFriendButton'; // Botón de amigo
import { useAuth } from '../../hooks/useAuth';

const UserCard = ({ user: profileUser }) => { // Renombrar prop a 'user'
  const { user: loggedInUser } = useAuth();

  // Calcula estado de amistad (mejor usar datos del contexto del loggedInUser)
  const isFriend = useMemo(() => {
    // Si el profileUser está en la lista de amigos del usuario logueado
    return loggedInUser?.friends?.includes(profileUser?.id);
  }, [loggedInUser?.friends, profileUser?.id]);

  // Placeholder o null si falta información crucial
   if (!profileUser || !profileUser.id || !profileUser.username) {
     return <div className={`${styles.userCard} ${styles.loading} card`}>Cargando...</div>;
   }

  // Evitar renderizar botón de amigo si es el mismo usuario
  const showAddFriendButton = loggedInUser?.id !== profileUser.id;

  return (
    // Usar clase 'card-lite' para un estilo más ligero
    <div className={`${styles.userCard} card-lite`}>
       {/* Link a Perfil (Imagen y Nombre) */}
      <Link to={`/user/${profileUser.username}`} className={styles.profileLink}>
        {/* Avatar */}
        <div className={`${styles.avatarPlaceholder} avatar-placeholder`}>
          {profileUser.avatarUrl ? (
            <img src={profileUser.avatarUrl} alt="" loading="lazy"/> // Lazy load avatars en listas
          ) : (
            <span>{profileUser.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
         {/* Info de Usuario */}
        <div className={styles.userInfo}>
           <h4 className={styles.username}>@{profileUser.username}</h4>
           {/* Mostrar snippet de Bio si existe */}
           {profileUser.bio && <p className={styles.bio}>{profileUser.bio}</p>}
        </div>
      </Link>

       {/* Botón Añadir/Quitar Amigo (si no es el propio usuario) */}
       {showAddFriendButton && (
         <div className={styles.actionContainer}>
           <AddFriendButton
             targetUserId={profileUser.id}
             targetUsername={profileUser.username} // Pasa username necesario para API
             initialIsFriend={isFriend}           // Pasa estado inicial conocido
           />
         </div>
        )}
    </div>
  );
};

export default UserCard;