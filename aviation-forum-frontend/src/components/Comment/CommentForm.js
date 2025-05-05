// src/components/Comment/CommentForm.js
import React, { useState } from 'react';
import Button from '../Common/Button';
import styles from './CommentForm.module.css';
import { useAuth } from '../../hooks/useAuth'; // Para verificar si está logueado

// Recibe postId, parentId (si es respuesta), onSubmit (callback), onCancel (opcional), placeholder, isReply (booleano)
const CommentForm = ({
  postId,                // ID del post al que pertenece
  parentId = null,       // ID del comentario padre (si es una respuesta)
  onSubmit,              // Función a llamar al enviar (devuelve una Promise)
  onCancel,              // Función a llamar al cancelar (solo visible si esReply)
  placeholder = "Escribe tu comentario...", // Texto del placeholder
  isReply = false          // Indica si es un formulario de respuesta
}) => {
  const { user, isAuthenticated } = useAuth(); // Hook para datos de usuario
  const [text, setText] = useState('');         // Estado del texto del textarea
  const [isLoading, setIsLoading] = useState(false); // Estado de carga del envío
  const [error, setError] = useState('');         // Estado de error del formulario

  // Manejador de envío
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevenir recarga

    // Validación: no vacío y autenticado
    if (!text.trim()) {
      setError('El comentario no puede estar vacío.');
      return;
    }
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para comentar.');
      // Idealmente, este formulario no se muestra si no está autenticado
      return;
    }

    setIsLoading(true); // Inicia carga
    setError('');     // Limpia error

    try {
      // Llama al callback onSubmit (que contendrá la llamada a api.createComment)
      // Pasamos solo el texto, el padre (PostDetail o CommentCard) tiene los IDs
      await onSubmit(text.trim());
      setText(''); // Limpia el textarea si el envío fue exitoso

      // Opcional: si es una respuesta y onCancel existe, llamarlo para cerrar el form
      // if (isReply && onCancel) {
      //   onCancel();
      // }
      // Es mejor que el padre controle el cierre (ej: setShowReplyForm(false))

    } catch (err) {
      // Si onSubmit falla (la llamada a la API), muestra el error
      console.error("Comment submission failed in form:", err);
      setError(err.message || 'Error al enviar. Inténtalo de nuevo.');
      // No limpiamos el texto en caso de error
    } finally {
      setIsLoading(false); // Termina carga
    }
  };

  // Renderiza diferente si el usuario no está autenticado (para el form principal)
  if (!isAuthenticated && !isReply) {
      return <p className={styles.loginPrompt}>Debes <a href="/login">iniciar sesión</a> para comentar.</p>;
  }
  // No renderizar el form de *respuesta* si no está autenticado
  if (!isAuthenticated && isReply) {
      return null;
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.commentForm} ${isReply ? styles.replyForm : ''}`} noValidate>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <textarea
        value={text}
        onChange={(e) => {setText(e.target.value); setError('');}} // Limpia error al escribir
        placeholder={placeholder}
        required
        rows={isReply ? 3 : 4} // Más pequeño si es respuesta
        className={styles.textarea}
        disabled={isLoading}
        aria-label={isReply ? "Escribir respuesta" : "Escribir comentario"}
        aria-describedby={error ? "comment-form-error" : undefined}
      />
      {/* Solo para SR si hay error */}
       {error && <span id="comment-form-error" className="visually-hidden">Error: {error}</span>}

      <div className={styles.formActions}>
         {/* Muestra Cancelar solo si es una respuesta y onCancel se proporcionó */}
         {isReply && typeof onCancel === 'function' && (
            <Button type="button" variant="secondary" size="small" onClick={onCancel} disabled={isLoading}>
                Cancelar
            </Button>
         )}
        {/* Botón de Envío */}
        <Button type="submit" variant="primary" size="small" isLoading={isLoading} disabled={isLoading || !text.trim()}>
          {isReply ? 'Responder' : 'Comentar'}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm; // <-- Exportación Default