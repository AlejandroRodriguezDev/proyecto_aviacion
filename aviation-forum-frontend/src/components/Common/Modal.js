// src/components/Common/Modal.js
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';
import { FaTimes } from 'react-icons/fa';
import Button from './Button'; 

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footerContent,
    size = 'medium'
}) => {
  const modalContentRef = useRef(null);
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalContentRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !modalRoot) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalContentRef}
        className={`${styles.modalContent} ${styles[size]}`}
        tabIndex={-1}
      >
        <header className={styles.modalHeader}>
          {title && (
            <h2 id="modal-title" className={styles.modalTitle}>
              {title}
            </h2>
          )}
          <Button
            onClick={onClose}
            variant="link"
            size="small"
            className={styles.closeButton}
            aria-label="Cerrar modal"
            title="Cerrar (Esc)"
          >
            <FaTimes aria-hidden="true"/>
          </Button>
        </header>

        <div className={styles.modalBody}>
          {children}
        </div>

        {footerContent && (
          <footer className={styles.modalFooter}>
            {footerContent}
          </footer>
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
