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
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setTitleError('');
    setDescriptionError('');
    setFormError('');

    if (!title.trim()) {
      setTitleError('El título es obligatorio.');
      isValid = false;
    } else if (title.trim().length > 250) {
        setTitleError('El título no puede exceder los 250 caracteres.');
        isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError('La descripción es obligatoria.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

     if (!user || !user.id || !api.createPost) {
         setFormError('No se pudo enviar el post. Intenta recargar.');
         return;
     }

    setIsLoading(true);
    setFormError('');

    try {
      const postData = {
        title: title.trim(),
        description: description.trim(),
        forumId: forumId,
        userId: user.id,
      };

      const newPost = await api.createPost(postData);

      setTitle('');
      setDescription('');
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      console.error("Error al crear el post:", err);
      setFormError(err.message || 'Error inesperado al crear el post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e) => { setTitle(e.target.value); setTitleError(''); };
  const handleDescriptionChange = (e) => { setDescription(e.target.value); setDescriptionError(''); };

  return (
    <div className={styles.createPostContainer}>
       {formError && <p className={styles.formErrorOverall}>{formError}</p>}

       <form onSubmit={handleSubmit} noValidate>

            <InputField
                id="post-title"
                label="Título"
                value={title}
                onChange={handleTitleChange}
                placeholder="Un título claro y conciso"
                required
                maxLength={250}
                disabled={isLoading}
                error={titleError}
                aria-describedby={titleError ? 'title-error-msg' : undefined}
            />

            <div className={styles.formGroup}>
                <label htmlFor="post-description" className={styles.label}>
                    Descripción
                     <span className={styles.requiredMarker}> *</span>
                </label>
                <textarea
                    id="post-description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Detalla tu publicación aquí..."
                    required
                    rows={10}
                    className={`${styles.textarea} ${descriptionError ? styles.errorInput : ''}`}
                    disabled={isLoading}
                    aria-invalid={!!descriptionError}
                    aria-describedby={descriptionError ? 'description-error-msg' : undefined}
                />
                {descriptionError && (
                     <p id="description-error-msg" className={styles.errorMessage}>
                       {descriptionError}
                    </p>
                 )}
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

export default CreatePostForm;
