// src/components/Common/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../Search/SearchBar';
import Button from './Button'; // Use the common Button
import styles from './Navbar.module.css';
import { FaPlaneDeparture, FaCog, FaSignOutAlt, FaUserPlus, FaSignInAlt } from 'react-icons/fa'; // Icons

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  const handleSearch = (searchTerm) => {
    // TODO: Implement proper search navigation
    console.log("Navbar Search:", searchTerm);
    if (searchTerm.startsWith('@')) {
         navigate(`/user/${searchTerm.substring(1)}`);
    } else if (searchTerm.startsWith('#')) {
        // Assuming forum name matches slug for simplicity here
        const slug = searchTerm.substring(1).toLowerCase().replace(/\s+/g, '-');
         navigate(`/forum/${slug}`);
    } else {
        // navigate(`/search?q=${encodeURIComponent(searchTerm)}`); // Navigate to a search results page
        alert(`Search results page not implemented. Searched for: ${searchTerm}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.navContainer} container`}> {/* Use global container */}
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
              <Link to={`/user/${user.username}`} className={styles.userLink} title={user.username}>
                <div className={`${styles.avatarPlaceholder} avatar-placeholder`}> {/* Use global class */}
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} /> : user.username.charAt(0).toUpperCase()}
                </div>
                <span className={styles.username}>{user.username}</span>
              </Link>
              <Button onClick={() => navigate('/settings')} variant="secondary" size="small" title="Configuración">
                 <FaCog />
              </Button>
              <Button onClick={handleLogout} variant="secondary" size="small" title="Cerrar Sesión">
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