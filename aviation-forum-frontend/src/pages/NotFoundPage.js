// src/pages/NotFoundPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Hook para navegar
import styles from './NotFoundPage.module.css';
import { FaPlaneSlash, FaArrowLeft, FaHome } from 'react-icons/fa'; // Icono más específico
import Button from '../components/Common/Button'; // Usar nuestro botón

const NotFoundPage = () => {
  const navigate = useNavigate(); // Hook para la navegación programática

  return (
    <div className={styles.notFoundContainer}>
       {/* Icono temático */}
      <FaPlaneSlash className={styles.icon} aria-hidden="true" />

       {/* Título principal */}
      <h1 className={styles.title}>404 - Ruta Perdida</h1>

       {/* Mensaje descriptivo */}
      <p className={styles.message}>
        ¡Vaya! Parece que esta ruta de vuelo no existe en nuestros registros.
        Puede que te hayas desviado o la página se haya trasladado.
      </p>

       {/* Contenedor de botones de acción */}
      <div className={styles.actionsContainer}>
         {/* Botón para volver atrás (usa historial del navegador) */}
        <Button onClick={() => navigate(-1)} variant="secondary" size="medium">
           <FaArrowLeft aria-hidden="true" /> Volver Atrás
        </Button>
        {/* Botón para ir a la página principal */}
        <Link to="/home">
            <Button variant="primary" size="medium">
                <FaHome aria-hidden="true"/> Ir a Inicio
            </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;