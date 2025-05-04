// src/components/Post/CreatePostForm.js
import React, { useState } from 'react';
import InputField from '../Common/InputField';
import Button from '../Common/Button';
import styles from './CreatePostForm.module.css';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const CreatePostForm = ({ forumId, forumName, onPostCreated, onCancel }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!description.trim()) {
        setError('La descripción es obligatoria.');
        return;
    }

    setIsLoading(true);
    try {
      const postData = {
        title: title.trim(),
        description: description.trim(),
        forumId: forumId,
        userId: user.id, // Get user ID from auth context
      };
      // --- SIMULATED API Call ---
      const newPost = await api.createPost(postData);
      console.log("Post created (simulated):", newPost);
      setTitle(''); // Clear form
      setDescription('');
      if (onPostCreated) {
        onPostCreated(newPost); // Pass the new post back to the parent
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      setError('Error al crear el post. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.createPostContainer} card`}>
      <h3 className={styles.formTitle}>Crear un nuevo post en #{forumName}</h3>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.formError}>{error}</p>}
        <InputField
          id="post-title"
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Un título interesante para tu post"
          required
          maxLength={300} // Example length limit
          disabled={isLoading}
        />
        <div className={styles.formGroup}> {/* Using InputField styles for structure */}
            <label htmlFor="post-description" className={styles.label}>Descripción (soporta Markdown básico)</label>
            <textarea
                id="post-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe aquí el contenido de tu post..."
                required
                rows={8} // Start with a decent height
                className={`${styles.textarea} ${error && description.trim() === '' ? styles.errorInput : ''}`} // Reuse input styles
                disabled={isLoading}
                aria-describedby={error && description.trim() === '' ? 'description-error' : undefined}
            />
             {error && description.trim() === '' && <p id="description-error" className={styles.errorMessage}>{error}</p>}
         </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            Publicar Post
          </Button>
        </div>
      </form>
    </div>
  );
};

// Re-export InputField styles for convenience in this component's CSS
export { inputStyles } from '../Common/InputField.module.css';
export default CreatePostForm;