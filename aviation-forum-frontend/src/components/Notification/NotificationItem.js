// src/components/Notification/NotificationItem.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotificationItem.module.css';
import { timeAgo } from '../../utils/helpers';
import { FaComment, FaHeart, FaUserPlus, FaExclamationCircle } from 'react-icons/fa'; // Iconos según tipo

const NotificationItem = ({ notification, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'new_comment': return <FaComment />;
      case 'post_like': return <FaHeart />;
      case 'new_reply': return <FaComment />;
      case 'friend_request': return <FaUserPlus />;
      default: return <FaExclamationCircle />;
    }
  };

   // Determinar a dónde debe llevar el link
  const getLink = () => {
      if(notification.link) return notification.link; // Usar link predefinido si existe
      // Lógica alternativa basada en tipo (simplificada)
      if(notification.postId) return `/post/${notification.postId}`;
      if(notification.userId) return `/user/${notification.userId}`;
      return '#'; // Fallback
  }

  return (
     // Envolvemos en un Link si hay URL de destino
      <li className={`${styles.item} ${!notification.read ? styles.unread : ''}`}>
         <Link to={getLink()} onClick={onClick} className={styles.linkWrapper}>
            <div className={styles.iconWrapper}>
               {getIcon(notification.type)}
            </div>
            <div className={styles.textWrapper}>
               <p className={styles.text}>{notification.text}</p>
               <span className={styles.time}>{timeAgo(notification.createdAt)}</span>
            </div>
             {/* Indicador visual "no leído" */}
            {!notification.read && <div className={styles.unreadDot} title="No leído"></div>}
         </Link>
      </li>
  );
};

export default NotificationItem;