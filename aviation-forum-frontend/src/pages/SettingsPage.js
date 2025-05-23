// src/pages/SettingsPage.js
import React from 'react';
import styles from './SettingsPage.module.css';
import { useAuth } from '../hooks/useAuth';
import { FaUserCog, FaLock, FaPalette, FaBell } from 'react-icons/fa'; 
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner'; 

const SettingsPage = () => {
  const { user, loading } = useAuth(); 

  // Placeholder para futuras funcionalidades
  const handleAction = (action) => {
    alert(`Funcionalidad "${action}" no implementada todavía.`);
  };


  if (loading) {
     return <LoadingSpinner center={true} size="50px"/>;
  }


  if (!user) {
    return <p className={styles.notLoggedIn}>Debes iniciar sesión para acceder a la configuración.</p>;
  }


  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.pageTitle}>Configuración</h1>
      <p className={styles.welcomeMessage}>Gestiona tu perfil, cuenta y preferencias, @{user.username}.</p>

      {/* Grid para las secciones de configuración */}
      <div className={styles.settingsGrid}>

        {/* --- Sección Perfil --- */}
         <section className={`${styles.settingsSection} card`}>
             <h2 className={styles.sectionTitle}><FaUserCog aria-hidden="true" /> Editar Perfil</h2>
             <p>Actualiza tu foto de perfil, nombre de usuario visible y biografía.</p>
              
              <div className={styles.placeholderActions}>
                <Button onClick={() => handleAction('Editar Perfil')} disabled>Cambiar Avatar (Próx.)</Button>
                 <Button onClick={() => handleAction('Editar Bio')} disabled>Editar Biografía (Próx.)</Button>
              
                 <Button onClick={() => handleAction('Cambiar Usuario')} disabled>Cambiar Username (Próx.)</Button>
             </div>
         </section>

        
         <section className={`${styles.settingsSection} card`}>
             <h2 className={styles.sectionTitle}><FaLock aria-hidden="true" /> Cuenta y Seguridad</h2>
             <p>Modifica tu correo electrónico asociado y tu contraseña.</p>
              <div className={styles.placeholderActions}>
                 <Button onClick={() => handleAction('Cambiar Email')} disabled>Cambiar Email (Próx.)</Button>
                 <Button onClick={() => handleAction('Cambiar Contraseña')} disabled>Cambiar Contraseña (Próx.)</Button>
                
                
              </div>
         </section>

       
         <section className={`${styles.settingsSection} card`}>
             <h2 className={styles.sectionTitle}><FaPalette aria-hidden="true" /> Apariencia</h2>
             <p>Personaliza la interfaz (ej: tema claro/oscuro).</p>
              <div className={styles.placeholderActions}>
                 <Button onClick={() => handleAction('Cambiar Tema')} disabled>Seleccionar Tema (Próx.)</Button>
              </div>
         </section>

        
         <section className={`${styles.settingsSection} card`}>
             <h2 className={styles.sectionTitle}><FaBell aria-hidden="true" /> Notificaciones</h2>
             <p>Elige qué notificaciones quieres recibir por correo o en la web.</p>
              <div className={styles.placeholderActions}>
                 <Button onClick={() => handleAction('Gestionar Notificaciones')} disabled>Gestionar (Próx.)</Button>
              </div>
         </section>

      </div> {/* Fin .settingsGrid */}
    </div> /* Fin .settingsContainer */
  );
};

export default SettingsPage;