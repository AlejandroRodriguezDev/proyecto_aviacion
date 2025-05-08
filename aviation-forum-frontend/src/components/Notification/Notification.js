// src/components/Notification/NotificationDropdown.js
import React from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import styles from './NotificationDropdown.module.css';

const NotificationDropdown = ({ notifications, onClose, onMarkRead, isLoading }) => {
  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <h4>Notificaciones</h4>
        {/* <Button variant="link" size="small" onClick={/* Marcar todas leídas}>Marcar todas</Button> */}
        <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar notificaciones">×</button>
      </div>
      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <p className={styles.noNotifications}>No tienes notificaciones nuevas.</p>
        ) : (
          <ul className={styles.list}>
            {notifications.map(notif => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onClick={() => {
                     if (!notif.read) onMarkRead(notif.id);
                     onClose(); // Cierra el dropdown al hacer click
                     // Navegar al link (hecho por NotificationItem)
                }}
              />
            ))}
          </ul>
        )}
      </div>
       <div className={styles.footer}>
          {/* <Link to="/notifications" onClick={onClose}>Ver todas</Link> */}
          {/* Funcionalidad "Ver Todas" no implementada */}
      </div>
    </div>
  );
};

export default NotificationDropdown;