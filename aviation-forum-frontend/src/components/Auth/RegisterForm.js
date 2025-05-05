// src/components/Auth/RegisterForm.js
import React, { useState } from 'react';
import InputField from '../Common/InputField';
import Button from '../Common/Button';
import styles from './RegisterForm.module.css'; // Usa su propio CSS Module

// Acepta apiError para mostrar errores del backend (ej: usuario ya existe)
const RegisterForm = ({ onSubmit, loading, apiError }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Error de validación *del formulario*
  const [formError, setFormError] = useState('');

  // Función para validar todos los campos del formulario
  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      setFormError('Todos los campos son requeridos.');
      return false;
    }
    // Regex simple para validar formato de email
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Introduce un correo electrónico válido.');
      return false;
    }
    // Validación de longitud mínima de contraseña
    if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
        return false;
    }
    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return false;
    }
     // Validación de caracteres permitidos en username (ejemplo: alfanuméricos y _)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
         setFormError('El nombre de usuario solo puede contener letras, números y guión bajo (_).');
         return false;
    }
    if (username.length < 3 || username.length > 30) {
        setFormError('El nombre de usuario debe tener entre 3 y 30 caracteres.');
        return false;
    }


    return true; // Si pasa todas las validaciones
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError(''); // Limpia error anterior

    // Ejecuta la validación
    if (!validateForm()) {
      return; // Detiene el envío si no es válido
    }

    // Llama a la función onSubmit pasada desde RegisterPage
    onSubmit({ username: username.trim(), email: email.trim(), password }); // Envía datos limpios
  };

  // Limpia errores del form al escribir en cualquier campo
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormError('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* Muestra error API o del form */}
      {(apiError || formError) && (
        <p className={styles.formError} role="alert">
          {apiError || formError}
        </p>
      )}

      <InputField
        id="register-username"
        label="Nombre de Usuario"
        type="text"
        value={username}
        onChange={handleInputChange(setUsername)}
        placeholder="Elige un nombre único (letras, núm, _)"
        required
        disabled={loading}
        maxLength={30} // Coincide con validación
        minLength={3} // Coincide con validación
        autoComplete="username"
      />
      <InputField
        id="register-email"
        label="Correo Electrónico"
        type="email"
        value={email}
        onChange={handleInputChange(setEmail)}
        placeholder="tu@correo.com"
        required
        disabled={loading}
        autoComplete="email"
      />
      <InputField
        id="register-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={handleInputChange(setPassword)}
        placeholder="Mínimo 6 caracteres"
        required
        disabled={loading}
        minLength={6} // Ayuda al navegador
        autoComplete="new-password"
      />
       <InputField
        id="register-confirm-password"
        label="Confirmar Contraseña"
        type="password"
        value={confirmPassword}
        onChange={handleInputChange(setConfirmPassword)}
        placeholder="Repite tu contraseña"
        required
        disabled={loading}
        autoComplete="new-password"
      />
      <Button
        type="submit"
        variant="primary"
        size="large"
        disabled={loading}
        isLoading={loading}
        className={styles.submitButton}
      >
        Registrarse
      </Button>
    </form>
  );
};

export default RegisterForm;