// src/components/Auth/LoginForm.js
import React, { useState } from 'react';
import InputField from '../Common/InputField';
import Button from '../Common/Button';
import styles from './LoginForm.module.css';
  
// Acepta apiError para mostrar errores que vienen del proceso de login
const LoginForm = ({ onSubmit, loading, apiError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Error de validación *del formulario* (ej: campos vacíos)
  const [formError, setFormError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError(''); // Limpia error del form anterior

    // Validaciones básicas del lado del cliente
    if (!email || !password) {
        setFormError('Email y contraseña son requeridos.');
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { // Simple check de formato de email
        setFormError('Introduce un correo electrónico válido.');
        return;
    }

    // Llama a la función onSubmit pasada desde LoginPage
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* Muestra el error de la API (prioridad) o el error del formulario */}
      {(apiError || formError) && (
        <p className={styles.formError} role="alert">
          {apiError || formError}
        </p>
      )}

      <InputField
        id="login-email"
        label="Correo Electrónico"
        type="email"
        value={email}
        // Limpia errores al escribir
        onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
        placeholder="tu@correo.com"
        required // Navegador marcará si está vacío (noValidate lo previene)
        disabled={loading} // Deshabilitado mientras carga
        autoComplete="email"
      />
      <InputField
        id="login-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
        placeholder="Tu contraseña"
        required
        disabled={loading}
        autoComplete="current-password"
      />
      <Button
        type="submit"
        variant="primary"
        size="large"
        disabled={loading} // Deshabilitado mientras carga
        isLoading={loading} // Muestra spinner si está cargando
        className={styles.submitButton}
      >
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;