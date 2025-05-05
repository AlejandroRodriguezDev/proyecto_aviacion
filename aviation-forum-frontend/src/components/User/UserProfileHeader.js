// src/components/User/UserProfileHeader.js
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './UserProfileHeader.module.css';
import Button from '../Common/Button';
import AddFriendButton from './AddFriendButton';
import { FaCog, FaMedal, FaUsers, FaPlane, FaCalendarAlt } from 'react-icons/fa'; // Iconos
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/helpers'; // Helper de tiempo

const UserProfileHeader = ({ profileUser }) => {
    const { user: loggedInUser } = useAuth(); // Usuario logueado actualmente
    const navigate = useNavigate(); // Para navegar (ej: a settings)

    // Comprueba si este es el perfil del usuario logueado
    const isOwnProfile = useMemo(() => loggedInUser?.id === profileUser?.id, [loggedInUser, profileUser]);

    // Determina el estado inicial de amistad (puede ser mejorado si loggedInUser.friends está siempre actualizado)
    const initialIsFriend = useMemo(() => {
       // Primero verifica la lista de amigos del usuario logueado (más fiable si está actualizada)
       if (Array.isArray(loggedInUser?.friends) && loggedInUser.friends.includes(profileUser?.id)) {
           return true;
       }
        // Opcional: si tu API devuelve la lista de amigos en profileUser, podrías chequear bidireccionalmente
        // if (Array.isArray(profileUser?.friends) && profileUser.friends.some(f => f.id === loggedInUser?.id)) {
        //     return true;
        // }
        return false; // Por defecto no son amigos
    }, [loggedInUser?.friends, profileUser?.id]);

    // --- Extrae datos y estadísticas del perfil ---
    const username = profileUser?.username ?? 'Usuario Desconocido';
    // Usa los campos que tu api.js provee (ej: 'friends', 'subscribedForums' son arrays de IDs o de objetos?)
    // Asumiendo que `friends` y `subscribedForums` en tu getUserProfile son arrays de objetos detallados:
     const friendsCount = Array.isArray(profileUser?.friends) ? profileUser.friends.length : 0;
     const forumsCount = Array.isArray(profileUser?.subscribedForums) ? profileUser.subscribedForums.length : 0;
    // Usa `likesCount` si existe, si no, calcula sumando likes de posts/comentarios (menos eficiente)
     const likesCount = profileUser?.likesCount ?? 0; // Tu API parece tener este campo
    const joinDate = profileUser?.createdAt; // Fecha de creación

     // Texto de la Biografía
     const bioText = profileUser?.bio || (isOwnProfile ? 'Añade una biografía para presentarte.' : 'Este usuario aún no ha añadido una biografía.');

     // URL del avatar o null
     const avatarUrl = profileUser?.avatarUrl;

     // Renderiza placeholder si no hay datos
     if (!profileUser || !profileUser.id) {
        return <header className={`${styles.profileHeader} ${styles.loading} card`}>Cargando perfil...</header>;
     }

    return (
        <header className={`${styles.profileHeader} card`}> {/* Usa .card como base */}
             {/* Banner (Opcional, si tienes banner de usuario) */}
             {/* <div className={styles.bannerPlaceholder} style={profileUser.bannerUrl ? {backgroundImage: `url(${profileUser.bannerUrl})`} : {}}></div> */}

             {/* Contenedor principal del contenido */}
             <div className={styles.headerContent}>
                {/* Avatar Grande */}
                <div className={styles.avatarSection}>
                    <div className={`${styles.avatarLarge} avatar-placeholder`}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={`${username}'s avatar`} />
                    ) : (
                         <span>{username.charAt(0).toUpperCase()}</span>
                    )}
                    </div>
                </div>

                 {/* Información y Acciones */}
                <div className={styles.infoAndActions}>
                    <div className={styles.nameActionsRow}>
                        <h1 className={styles.username}>@{username}</h1>
                         {/* Botones: Editar (propio perfil) o Añadir Amigo */}
                         <div className={styles.actions}>
                        {isOwnProfile ? (
                            <Button variant="secondary" size="small" onClick={() => navigate('/settings')} title="Editar tu perfil">
                                <FaCog aria-hidden="true" /> Editar Perfil
                            </Button>
                        ) : (
                            // Pasar ID y username necesarios para API de amigos
                            <AddFriendButton
                                targetUserId={profileUser.id}
                                 targetUsername={profileUser.username} // Crucial si tu API lo necesita
                                initialIsFriend={initialIsFriend}
                            />
                        )}
                        </div>
                    </div>

                    {/* Biografía */}
                    <p className={styles.bio}>{bioText}</p>

                     {/* Estadísticas */}
                     <div className={styles.stats}>
                        {/* Likes */}
                        <span className={styles.statItem} title="Likes totales recibidos">
                            <FaMedal aria-hidden="true" /> {likesCount.toLocaleString()} Likes
                        </span>
                         {/* Amigos */}
                        <span className={styles.statItem} title="Número de amigos">
                            <FaUsers aria-hidden="true" /> {friendsCount.toLocaleString()} Amigos
                        </span>
                         {/* Foros Suscritos */}
                         <span className={styles.statItem} title="Foros suscritos">
                            <FaPlane aria-hidden="true" /> {forumsCount.toLocaleString()} Foros
                        </span>
                         {/* Fecha de Unión */}
                        {joinDate && (
                            <span className={styles.statItem} title={`Miembro desde ${new Date(joinDate).toLocaleDateString()}`}>
                                 <FaCalendarAlt aria-hidden="true" /> Miembro desde {timeAgo(joinDate)}
                            </span>
                        )}
                     </div>
                </div> {/* Fin .infoAndActions */}
             </div> {/* Fin .headerContent */}
        </header>
    );
};

export default UserProfileHeader;