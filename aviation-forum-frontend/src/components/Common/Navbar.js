// src/components/Common/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../Search/SearchBar';
import Button from './Button';
import NotificationDropdown from '../Notification/NotificationDropdown';
import styles from './Navbar.module.css';
import { FaPlaneDeparture, FaCog, FaSignOutAlt, FaUserPlus, FaSignInAlt, FaBell, FaEnvelope } from 'react-icons/fa';
import { api } from '../../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (isAuthenticated && user && api.getNotifications) {
        try {
          const fetchedNotifs = await api.getNotifications(user.id);
          if (isMounted) {
              setNotifications(fetchedNotifs || []);
              setUnreadCount((fetchedNotifs || []).filter(n => !n.read).length);
          }
        } catch (error) {
          console.error("Failed to fetch mock notifications:", error);
          if (isMounted) {
            setNotifications([]);
            setUnreadCount(0);
          }
        }
      } else if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
      }
    };

    fetchNotifications();

    return () => { isMounted = false; };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (searchTerm) => {
    console.log("Navbar Search:", searchTerm);
    if (searchTerm.startsWith('@')) {
      navigate(`/user/${searchTerm.substring(1)}`);
    } else if (searchTerm.startsWith('#')) {
      const slug = searchTerm.substring(1).toLowerCase().replace(/\s+/g, '-');
      navigate(`/forum/${slug}`);
    } else {
      alert(`Search results page not implemented. Searched for: ${searchTerm}`);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
       console.log("Marking notification as read (simulated):", notificationId);
       setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, read: true} : n));
       setUnreadCount(prev => Math.max(0, prev - 1));
   };

  useEffect(() => {
    const handleClickOutside = (event) => {};
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.navContainer} container`}>
        <Link to={isAuthenticated ? "/home" : "/login"} className={styles.logo}>
          <FaPlaneDeparture />
          <span className={styles.logoText}>AeroForum</span>
        </Link>

        {isAuthenticated && (
          <div className={styles.searchContainer}>
            <SearchBar onSearch={handleSearch} />
          </div>
        )}

        <div className={styles.navMenu}>
          {isAuthenticated && user ? (
            <div className={styles.userMenu}>
              <Button
                  onClick={() => navigate('/messages')}
                  variant="secondary"
                  size="small"
                  title="Mensajes Directos"
                  className={styles.iconButton}
                  aria-label="Mensajes Directos"
              >
                <FaEnvelope />
              </Button>

              <div className={styles.notificationsWrapper}>
                  <Button
                      onClick={() => setShowNotifications(prev => !prev)}
                      variant="secondary"
                      size="small"
                      title="Notificaciones"
                      className={`${styles.iconButton} ${unreadCount > 0 ? styles.hasUnread : ''}`}
                      aria-label={`Notificaciones (${unreadCount} no leídas)`}
                      aria-haspopup="true"
                      aria-expanded={showNotifications}
                  >
                       <FaBell />
                       {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </Button>
                  {showNotifications && (
                       <NotificationDropdown
                           notifications={notifications}
                           onClose={() => setShowNotifications(false)}
                           onMarkRead={handleMarkAsRead}
                           isLoading={false}
                       />
                  )}
              </div>

              <Link to={`/user/${user.username}`} className={styles.userLink} title={user.username}>
                <div className={`${styles.avatarPlaceholder} avatar-placeholder`}>
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
                </div>
                <span className={styles.username}>{user.username}</span>
              </Link>

              <Button onClick={() => navigate('/settings')} variant="secondary" size="small" title="Configuración" className={styles.iconButton}>
                 <FaCog />
              </Button>

              <Button onClick={handleLogout} variant="secondary" size="small" title="Cerrar Sesión" className={styles.iconButton}>
                <FaSignOutAlt />
              </Button>
            </div>
          ) : (
             <div className={styles.authButtons}>
                 <Button onClick={() => navigate('/login')} variant="secondary" size="small">
                     <FaSignInAlt /> Iniciar Sesión
                 </Button>
                 <Button onClick={() => navigate('/register')} variant="primary" size="small">
                     <FaUserPlus /> Registrarse
                 </Button>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
