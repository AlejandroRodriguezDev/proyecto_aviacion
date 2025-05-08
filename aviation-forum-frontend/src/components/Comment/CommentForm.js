// src/components/Comment/CommentForm.js
import React, { useState } from 'react';
import Button from '../Common/Button';
import styles from './CommentForm.module.css';
import { useAuth } from '../../hooks/useAuth';

const CommentForm = ({
  postId,
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = "Escribe tu comentario...",
  isReply = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('El comentario no puede estar vacío.');
      return;
    }

    if (!isAuthenticated) {
      setError('Debes iniciar sesión para comentar.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit(text.trim());
      setText('');
    } catch (err) {
      console.error("Comment submission failed:", err);
      setError(err.message || 'Error al enviar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    if (isReply) return null;
    return (
      <p className={styles.loginPrompt}>
        Debes <a href="/login">iniciar sesión</a> para comentar.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.commentForm} ${isReply ? styles.replyForm : ''}`}
      noValidate
    >
      {error && (
        <>
          <p className={styles.formError} role="alert">{error}</p>
          <span id="comment-form-error" className="visually-hidden">Error: {error}</span>
        </>
      )}

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError('');
        }}
        placeholder={placeholder}
        required
        rows={isReply ? 3 : 4}
        className={styles.textarea}
        disabled={isLoading}
        aria-label={isReply ? "Escribir respuesta" : "Escribir comentario"}
        aria-describedby={error ? "comment-form-error" : undefined}
      />

      <div className={styles.formActions}>
        {isReply && typeof onCancel === 'function' && (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="small"
          isLoading={isLoading}
          disabled={isLoading || !text.trim()}
        >
          {isReply ? 'Responder' : 'Comentar'}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
