// src/components/Auth/OAuthButtons.js
import React from 'react';
import Button from '../Common/Button';
import styles from './OAuthButtons.module.css';
import { FaGoogle, FaFacebook } from 'react-icons/fa'; // Example icons

const OAuthButtons = ({ onGoogleLogin, onFacebookLogin, loading }) => {
  return (
    <div className={styles.oauthContainer}>
      <Button
        onClick={onGoogleLogin}
        variant="secondary"
        disabled={loading}
        className={styles.oauthButton}
      >
        <FaGoogle className={styles.icon} /> Continuar con Google
      </Button>
      <Button
        onClick={onFacebookLogin}
        variant="secondary"
        disabled={loading}
        className={`${styles.oauthButton} ${styles.facebook}`} // Specific style if needed
      >
        <FaFacebook className={styles.icon} /> Continuar con Facebook
      </Button>
    </div>
  );
};

export default OAuthButtons;