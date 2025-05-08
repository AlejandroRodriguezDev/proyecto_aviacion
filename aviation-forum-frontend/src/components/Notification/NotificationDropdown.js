// src/components/Notification/NotificationDropdown.js
import React from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import styles from './NotificationDropdown.module.css';

const NotificationDropdown = ({ notifications = [], onClose, onMarkRead, isLoading = false }) => {

  const handleDropdownClick = (e) => {
      e.stopPropagation();
  };

  return (
    <div className={styles.dropdown} onClick={handleDropdownClick}>
      <div className={styles.header}>
        <h4>Notificaciones</h4>
        <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar notificaciones">×</button>
      </div>

      <div className={styles.content}>
        {isLoading ? (
           <div className={styles.loadingContainer}>
                <LoadingSpinner size="30px" />
           </div>
        ) : notifications.length === 0 ? (
          <p className={styles.noNotifications}>No tienes notificaciones.</p>
        ) : (
           <ul className={styles.list}>
            {notifications.map(notif => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                 onClick={() => {
                    if (typeof onMarkRead === 'function' && !notif.read) {
                        onMarkRead(notif.id);
                    }
                    onClose();
                 }}
              />
            ))}
          </ul>
        )}
      </div>

       {notifications.length > 0 && (
            <div className={styles.footer}>
                {/* <Link to="/notifications" onClick={onClose}>Ver todas</Link> */}
            </div>
       )}
    </div>
  );
};

export default NotificationDropdown;