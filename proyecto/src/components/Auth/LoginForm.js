// src/components/Auth/LoginForm.js
import React, { useState } from 'react';
import InputField from '../Common/InputField';
import Button from '../Common/Button';
import styles from './LoginForm.module.css';

const LoginForm = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Local form validation error

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
        setError('Email y contraseña son requeridos.');
        return;
    }
    // Basic email format check (optional)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Introduce un correo electrónico válido.');
        return;
    }
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.formError}>{error}</p>}
      <InputField
        id="login-email"
        label="Correo Electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        required
        disabled={loading}
      />
      <InputField
        id="login-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Tu contraseña"
        required
        disabled={loading}
      />
      <Button type="submit" variant="primary" size="large" disabled={loading} isLoading={loading} className={styles.submitButton}>
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;