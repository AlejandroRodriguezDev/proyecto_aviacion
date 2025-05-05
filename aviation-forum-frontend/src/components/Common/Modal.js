// src/components/Common/Modal.js
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';
import { FaTimes } from 'react-icons/fa';
import Button from './Button'; // Usamos nuestro botón estándar

const Modal = ({
    isOpen,             // Booleano para abrir/cerrar
    onClose,            // Función para cerrar
    title,              // Título opcional del modal
    children,           // Contenido principal del modal
    footerContent,      // Contenido opcional para el pie del modal (ej: botones)
    size = 'medium'     // Tamaño: 'small', 'medium', 'large'
}) => {
  const modalContentRef = useRef(null); // Ref para el contenido del modal (para enfocar)
  const modalRoot = document.getElementById('modal-root'); // El div en index.html

  // Efecto para manejar cierre con Escape y scroll del body
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Bloquea scroll del body
      document.addEventListener('keydown', handleKeyDown);
      // Enfoca el modal o el primer elemento enfocable dentro de él al abrir
      // setTimeout necesario para que el elemento exista en el DOM después del portal
      setTimeout(() => modalContentRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = 'auto'; // Restaura scroll
    }

    // Limpieza al desmontar o cuando cambia isOpen/onClose
    return () => {
      document.body.style.overflow = 'auto'; // Asegura restaurar scroll
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Cierre al hacer click en el fondo oscuro (overlay)
  const handleOverlayClick = (event) => {
    // Asegura que el click fue DIRECTAMENTE en el overlay y no en el contenido
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Si no está abierto o no existe el nodo raíz, no renderiza nada
  if (!isOpen || !modalRoot) {
    return null;
  }

  // Usa React Portal para renderizar el modal fuera de la jerarquía normal del DOM
  return ReactDOM.createPortal(
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick} // Cierra al clickear fuera
      role="dialog"              // Semántica: es un diálogo
      aria-modal="true"          // Indica que bloquea interacción con el resto
      aria-labelledby={title ? 'modal-title' : undefined} // Asocia título (si existe)
    >
      <div
        ref={modalContentRef}      // Ref para enfocar
        className={`${styles.modalContent} ${styles[size]}`} // Aplica clase de tamaño
        tabIndex={-1}             // Permite enfocar el div
      >
        {/* Encabezado del Modal */}
        <header className={styles.modalHeader}>
          {title && (
            <h2 id="modal-title" className={styles.modalTitle}>
              {title}
            </h2>
          )}
          <Button
            onClick={onClose}
            variant="link"      // Botón tipo link (más sutil)
            size="small"
            className={styles.closeButton}
            aria-label="Cerrar modal" // Accesibilidad
            title="Cerrar (Esc)"
          >
            <FaTimes aria-hidden="true"/> {/* Icono sin texto */}
          </Button>
        </header>

        {/* Cuerpo del Modal (contenido principal) */}
        <div className={styles.modalBody}>
          {children}
        </div>

        {/* Pie del Modal (opcional, para botones de acción) */}
        {footerContent && (
          <footer className={styles.modalFooter}>
            {footerContent}
          </footer>
        )}
      </div>
    </div>,
    modalRoot // El div de destino en index.html
  );
};

export default Modal;